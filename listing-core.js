/* ============================================================
   Listing 文案检查 · 规则内核
   纯前端、纯规则、不联网。挂 window.LISTING.analyze(input)
   ------------------------------------------------------------
   input: {
     title: string,
     bullets: [b1..b5],
     st: string,               // 后台 Search Terms（可选）
     kws: [string] | string,   // 目标关键词
     blacklist: [string]|string,// 自定义禁用词/竞品品牌
     site: 'CA'|'US'|'UK'|'DE'|'JP',
     titleLimit: number        // 标题字符上限
   }
   output: { total, grade, verdict, dims, issues, passed, kwRows,
             coverage, marks, stats }
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------------- 基础工具 ---------------- */
  const STOP = new Set(('the a an and or for with of to in on by from your you our is are be this that it at as all ' +
    'can will not no so up out if but than then into over more most very also just any each other such while has have ' +
    'was were been being do does did we they he she them their its').split(' '));

  // 允许出现的全大写缩写（其余 4 字母以上全大写都会被提示）
  const ALLOW_CAPS = new Set(('USB LED ABS BPA FDA EPA UV UPF TPU PVC EVA PETG TPR SBR HDPE LDPE PC PU PP PE XL XXL XXXL ' +
    'IPX8 IPX7 IPX6 IP68 IP67 CE ROHS FCC UL ASTM CPSC CPSIA SPF USA DIY RV SUV SUP MAH CM MM KG ML OZ LB LBS FT PSI BAR ' +
    'LCD OLED GPS HD AI PSI HTML PDF ASIN SKU UPC EAN').split(' '));

  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function uniq(arr) {
    const seen = new Set(), out = [];
    arr.forEach(x => {
      const k = x.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(x); }
    });
    return out;
  }

  function parseKws(v) {
    if (!v) return [];
    if (Array.isArray(v)) return uniq(v.map(x => String(x).trim()).filter(Boolean));
    return uniq(String(v).split(/[\n\r,;，、；]+/).map(x => x.trim()).filter(Boolean));
  }

  // 只留词，用于重复度/重合度判断
  function tokens(s) {
    return String(s || '').toLowerCase().split(/[^a-z0-9']+/)
      .filter(w => w.length > 2 && !STOP.has(w));
  }

  // 匹配用归一化文本：小写、连字符保形、去标点、压空格
  function normText(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014\u2212]/g, '-')
      .replace(/[^a-z0-9'\-\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  // 关键词 → 正则（容忍复数、连字符与空格差异）
  function kwRegex(kw) {
    const toks = String(kw).toLowerCase().split(/[\s\-]+/).filter(Boolean).map(t => {
      let e = escRe(t);
      if (!/s$/.test(t)) e += '(?:s|es)?';
      return e;
    });
    return new RegExp('\\b' + toks.join('\\s+') + '\\b', 'gi');
  }

  function matchAll(re, text) {
    const out = [];
    const r = new RegExp(re.source, re.flags.indexOf('g') >= 0 ? re.flags : re.flags + 'g');
    let m, guard = 0;
    while ((m = r.exec(text)) !== null) {
      out.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
      if (m.index === r.lastIndex) r.lastIndex++;
      if (++guard > 300) break;
    }
    return out;
  }

  const countIn = (re, text) => matchAll(re, text).length;

  function bytes(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    return unescape(encodeURIComponent(s)).length;
  }

  /* ---------------- 风险词库 ----------------
     level: high = 必须改（下架/投诉风险）；mid = 建议改；low = 提示
  ------------------------------------------- */
  const RISK = [
    { id: 'bestseller', level: 'high', tag: '排名宣称', re: /\b(best[\s-]*sellers?|bestselling)\b/gi,
      why: '“Best Seller” 是亚马逊官方榜单标识。',
      fix: '删掉，换成具体差异点：Designed for 180° panoramic view。' },
    { id: 'no1', level: 'high', tag: '排名宣称', re: /(#\s?1\b|\bno\.?\s?1\b|\bnumber\s+one\b|\b1st\s+(?:place|choice|rank))/gi,
      why: '排名类宣称必须有可核实的第三方证据，否则属误导。',
      fix: '删掉排名，改成能验证的事实：10,000+ units sold in 2025（有数据才写）。' },
    { id: 'amzchoice', level: 'high', tag: '平台标识', re: /\b(amazon'?s\s+choice|amazon\s+choice|amazon\s+best\s+seller|prime\s+choice)\b/gi,
      why: '这是亚马逊自动授予的标识，卖家不能自己写进文案。',
      fix: '整句删除。' },
    { id: 'toprated', level: 'mid', tag: '极限词', re: /\b(top[\s-]*rated|top[\s-]*ranked|top[\s-]*selling|award[\s-]*winning|award\s+winner|winner)\b/gi,
      why: '“Top rated / Award winning” 属主观排名表述，易被判夸大。',
      fix: '换成获奖事实或直接删：Red Dot Award 2024（真获奖才写）。' },
    { id: 'ultimate', level: 'mid', tag: '极限词', re: /\b(the\s+best|best\s+ever|ultimate|perfect|unbeatable|world'?s\s+(?:best|first|largest|strongest|leading|easiest|thinnest))\b/gi,
      why: '最高级表述无法举证，容易触发“夸大宣传”。',
      fix: '改成可量化的对比：up to 30% wider view than standard masks。' },
    { id: 'subjective', level: 'low', tag: '主观形容词', re: /\b(premium|professional|high[\s-]*quality|superior|finest|luxury|deluxe|amazing|incredible|wonderful)\b/gi,
      why: '空形容词不带来信息，AI 检索也抓不住。',
      fix: '换成参数：food-grade silicone、tempered glass lens、280 g。' },
    { id: 'newness', level: 'low', tag: '时效表述', re: /\b(new|newest|newly|upgraded|improved|latest|2024|2025|2026)\b/gi,
      why: '“New / 2025” 会随时间失效，且亚马逊不建议用时效性词。',
      fix: '删掉年份，用“第几代/什么升级”说清楚。' },
    { id: 'promo', level: 'high', tag: '促销信息', re: /\b(sale|on\s+sale|clearance|discount|hot\s+sale|deals?|promotion|coupon|bogo|save\s+\$?\d+|percent\s+off)\b/gi,
      why: 'Listing 禁止促销、折扣类信息（价格由后台控制）。',
      fix: '整句删除，促销走 Coupon / Deal 后台。' },
    { id: 'shipping', level: 'high', tag: '物流承诺', re: /\b(free\s+shipping|fast\s+shipping|free\s+delivery|ships?\s+(?:fast|free)|delivery\s+within|arrives?\s+in\s+\d+)\b/gi,
      why: '配送时效由亚马逊/FBA 决定，卖家不可承诺。',
      fix: '删除。' },
    { id: 'price', level: 'high', tag: '价格表述', re: /\b(cheap(?:est)?|lowest\s+price|best\s+price|price\s+match|affordable)\b/gi,
      why: '价格/性价比类表述属促销信息，且易与售价不符。',
      fix: '删除，用“value pack of 2”这类事实替代。' },
    { id: 'guarantee', level: 'high', tag: '保证承诺', re: /\b(guarantee[ds]?|money[\s-]*back|risk[\s-]*free|satisfaction\s+guaranteed|100\s*%\s*(?:satisfaction|money))\b/gi,
      why: '无条件退换/满意保证属承诺，出事即“与描述不符”。',
      fix: '删除。售后政策写在 Warranty & Support 字段。' },
    { id: 'warranty', level: 'mid', tag: '保修承诺', re: /\b(lifetime\s+warranty|\d+[\s-]*(?:year|month)s?\s+warranty|full\s+warranty|warranty)\b/gi,
      why: '保修期限需与后台保修字段一致，否则属误导。',
      fix: '写进后台 Warranty Description，正文只保留“contact support”类中性表述或不写。' },
    { id: 'cta', level: 'high', tag: '行动号召', re: /\b(limited\s+time|while\s+supplies\s+last|order\s+now|buy\s+now|shop\s+now|click\s+here|add\s+to\s+cart|act\s+fast)\b/gi,
      why: '引导下单的 CTA 属促销信息，Listing 不允许。',
      fix: '删除。' },
    { id: 'medical', level: 'high', tag: '医疗功效', re: /\b(cures?|curing|treats?|treating|treatment|heals?|healing|therapy|therapeutic|clinically\s+proven|doctor\s+recommended|medical[\s-]*grade|relieves?|pain\s+relief)\b/gi,
      why: '疾病治疗/缓解类声称属医疗器械或药品范畴。',
      fix: '改成使用体验描述：keeps water out of your nose，不要提治疗。' },
    { id: 'prevent', level: 'high', tag: '预防宣称', re: /\b(prevents?\s+(?:acne|rash|infection|irritation|allerg\w*|sunburn|disease|bacteria|germs|injury|injur\w*)|disease[\s-]*free)\b/gi,
      why: '“预防/治愈某症状”属医疗声称，普通个护用品不能写。',
      fix: '删掉症状名，只描述物理作用：keeps water out。' },
    { id: 'pesticide', level: 'high', tag: '抗菌宣称', re: /\b(antibacterial|anti[\s-]*bacterial|antimicrobial|anti[\s-]*microbial|disinfect\w*|sanitiz\w*|steriliz\w*|kills?\s+(?:99|100|germs|bacteria|mold)|germ[\s-]*free|mildew[\s-]*resistant|anti[\s-]*fungal|anti[\s-]*mold|mold[\s-]*proof)\b/gi,
      why: '抗菌/杀菌属 EPA 农药类宣称，无注册号即违规。',
      fix: '改成物理描述：quick-dry silicone，可机洗除味。' },
    { id: 'fda', level: 'high', tag: '认证机构', re: /\b(fda|epa|niaid|cdc)\b/gi,
      why: '引用政府机构名属受管制的认证宣称。',
      fix: '删除机构名；如确有注册，写进合规字段而不是文案。' },
    { id: 'certified', level: 'mid', tag: '认证宣称', re: /\b((?:ce|rohs|fcc|ul|cpsc|astm|cpsia)\s*(?:certified|approved|compliant)|certified\s+by)\b/gi,
      why: '认证需有证书支撑，且 CE 等标志不能当卖点滥用。',
      fix: '确认有证书再写；否则删掉，只描述材质与工艺。' },
    { id: 'eco', level: 'high', tag: '环保宣称', re: /\b(eco[\s-]*friendly|environmentally\s+friendly|biodegradable|compostable|sustainable|carbon\s+neutral|green\s+product)\b/gi,
      why: '环保声明需第三方认证（如 FSC、Carbonfree），否则涉“漂绿”。',
      fix: '改成可核实的事实：recyclable packaging（真的才算）。' },
    { id: 'safety', level: 'high', tag: '材质安全', re: /\b(non[\s-]*toxic|nontoxic|bpa[\s-]*free|food[\s-]*grade|100\s*%\s*(?:safe|natural|organic|pure|harmless)|hypoallergenic|chemical[\s-]*free)\b/gi,
      why: '材质安全声明需检测报告（FDA 食品级、BPA free 都要报告）。',
      fix: '改成材质本身：made of food-grade silicone 要报告；只说 100% silicone / silicone + PC frame。' },
    { id: 'patent', level: 'mid', tag: '专利宣称', re: /\b(patent(?:ed)?|patent\s+pending|proprietary)\b/gi,
      why: '专利表述需真实且有编号。',
      fix: '写具体专利号，或删掉改说结构差异。' },
    { id: 'counterfeit', level: 'high', tag: '侵权风险', re: /\b(replica|knock[\s-]*off|fake|inspired\s+by|same\s+as\s+the|looks?\s+like\s+the)\b/gi,
      why: '山寨/仿制类表述直接触发侵权投诉。',
      fix: '整句删除。' },
    { id: 'compatible', level: 'low', tag: '兼容表述', re: /\b(compatible\s+with|works?\s+with|replacement\s+for)\b/gi,
      why: '兼容性表述必须真实，且不得暗示官方授权。',
      fix: '保留但别加品牌 Logo，别写“official”。' },
    { id: 'email', level: 'high', tag: '联系方式', re: /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi,
      why: 'Listing 禁止邮箱、网址、电话等站外联系信息。',
      fix: '删除。' },
    { id: 'url', level: 'high', tag: '外链', re: /(https?:\/\/\S+|www\.\S+|\b\w+\.(?:com|ca|co\.uk|net|shop|store)\b)/gi,
      why: '文案中带网址会被判站外引流。',
      fix: '删除。' },
    { id: 'phone', level: 'mid', tag: '联系方式', re: /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
      why: '电话号码属站外联系信息。',
      fix: '删除。' },
    { id: 'contactCta', level: 'mid', tag: '站外引导', re: /\b(contact\s+us|call\s+us|email\s+us|visit\s+our\s+(?:website|store|shop|site)|follow\s+us|subscribe)\b/gi,
      why: '引导站外联系/关注属违规。',
      fix: '删除，售后入口用亚马逊站内。' },
    { id: 'emoji', level: 'high', tag: '符号表情', re: /[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu,
      why: '标题和五点禁止使用 emoji 与图形符号（含 ✓ ★ 等）。',
      fix: '全部删除，用文字或分隔符代替。' },
    { id: 'tmsymbol', level: 'mid', tag: '商标符号', re: /[\u2122\u00AE\u00A9]/g,
      why: '™ / ® / © 只能由权利人使用。',
      fix: '确认商标已注册且归你所有再保留，否则删掉。' },
    { id: 'waterproof', level: 'low', tag: '防水表述', re: /\b(waterproof|water[\s-]*resistant|ipx?\d+)\b/gi,
      why: '只写 waterproof 不给等级，容易被投诉“与描述不符”。',
      fix: '补具体等级或场景：IPX8 tested to 1.5 m for 30 min（有测试才写）。' },
    { id: 'uv', level: 'low', tag: '效果表述', re: /\b(uv[\s-]*protection|upf\s*\d*|blocks?\s+\d+\s*%\s*uv)\b/gi,
      why: '防紫外线效果需对应测试数据。',
      fix: '写 UPF 数值或测试标准，别只写 UV protection。' },
    { id: 'odor', level: 'low', tag: '效果表述', re: /\b(odor[\s-]*free|odour[\s-]*free|smell[\s-]*free)\b/gi,
      why: '除味声明属需要证明的效果宣称。',
      fix: '改成可验证的描述：quick-dry silicone that rinses clean。' }
  ];

  // 常见他人品牌（命中即提示确认授权；不是判定，是提醒）
  const BRANDS = ['cressi', 'mares', 'scubapro', 'aqua lung', 'aqualung', 'seavenger', 'u.s. divers', 'us divers',
    'tusa', 'dolfino', 'wildhorn', 'speedo', 'tyr', 'zoggs', 'omer', 'beuchat', 'hollis', 'atomic aquatics',
    'apple', 'iphone', 'ipad', 'airpods', 'macbook', 'samsung', 'sony', 'playstation', 'xbox', 'nintendo',
    'gopro', 'dji', 'anker', 'jbl', 'bose', 'beats', 'dyson', 'yeti', 'hydro flask', 'thermos',
    'nike', 'adidas', 'puma', 'under armour', 'columbia', 'north face', 'patagonia', 'crocs', 'lululemon',
    'coach', 'gucci', 'chanel', 'louis vuitton', 'rolex', 'disney', 'marvel', 'pixar', 'star wars',
    'pokemon', 'hello kitty', 'sanrio', 'barbie', 'lego', 'harry potter', 'intex', 'coleman', 'igloo',
    'ozark trail', 'rtic', 'pelican', 'decathlon', 'nabaiji', 'swimways'];

  const BRAND_RE = new RegExp('\\b(?:' + BRANDS
    .map(b => escRe(b).replace(/\\?\s+/g, '\\s+'))
    .join('|') + ')\\b', 'gi');

  /* ---------------- 主分析 ---------------- */
  function analyze(input) {
    const inp = input || {};
    const site = inp.site || 'CA';
    const titleLimit = Number(inp.titleLimit) || 200;
    const title = String(inp.title || '').trim();
    const bullets = (inp.bullets || []).slice(0, 5).map(b => String(b || '').trim());
    while (bullets.length < 5) bullets.push('');
    const st = String(inp.st || '').trim();
    const kws = parseKws(inp.kws);
    const blacklist = parseKws(inp.blacklist);

    const issues = [];
    const passed = [];
    const marks = {};       // fieldKey -> [{start,end,level}]
    const mark = (k, list) => { (marks[k] = marks[k] || []).push(...list); };

    const add = (dim, level, tag, msg, where, fix) =>
      issues.push({ dim, level, tag, msg, where: where || '', fix: fix || '' });
    const pass = m => passed.push(m);

    const fields = [{ key: 'title', label: '标题', text: title }];
    bullets.forEach((b, i) => { if (b) fields.push({ key: 'b' + (i + 1), label: '五点' + (i + 1), text: b }); });
    if (st) fields.push({ key: 'st', label: '后台词', text: st });

    const allText = fields.map(f => f.text).join('\n');

    // 什么都没填，直接返回空结果，别给分
    if (!title && !bullets.join('') && !st) {
      return {
        total: 0, grade: '待输入', verdict: '把标题和五点贴进来，30 项规则一次跑完。',
        dims: { structure: null, keyword: null, risk: null, readability: null },
        issues: [], passed: [], kwRows: [], coverage: null, marks: {},
        counts: { high: 0, mid: 0, low: 0 },
        stats: { titleLen: 0, titleLimit, site, bulletLens: [], avgBullet: 0, stBytes: 0, words: 0, avgSentence: 0, kwCount: kws.length }
      };
    }

    /* ---------- 1. 字符与结构 ---------- */
    const bannedPunct = /[!?$_{}^\u00AC\u00A6~<>*|\\]/g;
    const cjk = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g;
    if (!title) {
      add('structure', 'high', '缺失', '标题为空', '标题', '先把标题填上');
    } else {
      const len = title.length;
      if (len > titleLimit) {
        add('structure', 'high', '超长',
          `标题 ${len} 字符，超出 ${site} 站上限 ${titleLimit}，超 ${len - titleLimit} 字`,
          '标题', '先砍主观形容词和重复词，再砍不影响语义的介词，核心词+规格+场景必须留。');
      } else {
        pass(`标题 ${len}/${titleLimit} 字符，未超限`);
      }
      if (len < 80) add('structure', 'mid', '偏短', `标题只 ${len} 字符，曝光位没吃满`, '标题', '补材质、规格、适用人群等硬信息，目标 120–200。');

      // 禁用字符
      const bp = matchAll(bannedPunct, title);
      if (bp.length) {
        mark('title', bp.map(m => ({ start: m.start, end: m.end, level: 'high' })));
        add('structure', 'high', '禁用字符', `标题含禁用符号：${uniq(bp.map(m => m.text)).join(' ')}`, '标题',
          '亚马逊标题只允许字母、数字和 - , . & / 等，感叹号、问号、$、{} 一律去掉。');
      } else pass('标题无禁用特殊字符');

      // 中文/全角
      const cj = matchAll(cjk, title);
      if (cj.length) {
        mark('title', cj.map(m => ({ start: m.start, end: m.end, level: 'high' })));
        add('structure', 'high', '语种错误', `标题含中文/全角字符：${uniq(cj.map(m => m.text)).join(' ')}`, '标题', '该站点文案必须全英文半角，中文只剩“与描述不符”风险。');
      }

      // 重复标点
      const rp = matchAll(/([!?.,;:])\1+/g, title);
      if (rp.length) add('structure', 'low', '重复标点', `重复标点：${uniq(rp.map(m => m.text)).join(' ')}`, '标题', '保留一个即可。');

      // 空格
      if (/  +/.test(title)) add('structure', 'low', '空格', '标题里有连续空格', '标题', '压缩成一个空格。');
      if (/\s+[,.;:!?]/.test(title)) add('structure', 'low', '空格', '标点前多了一个空格', '标题', '去掉标点前的空格。');
      if (/,[A-Za-z0-9]/.test(title)) add('structure', 'low', '空格', '逗号后缺空格', '标题', '逗号后加一个空格，读起来更顺。');
      if (!/  +/.test(title) && !/\s+[,.;:!?]/.test(title) && !/,[A-Za-z0-9]/.test(title)) pass('标题空格与标点格式正常');

      // 分隔符混用
      if (title.indexOf('|') >= 0 && /\s-\s/.test(title)) {
        add('structure', 'low', '分隔符', '标题同时用了 | 和 -', '标题', '统一成一种，通常用 - 更稳。');
      }

      // 单词重复
      const freq = {};
      tokens(title).forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const dup = Object.keys(freq).filter(w => freq[w] >= 3);
      if (dup.length) {
        add('structure', 'low', '重复词', `标题里这些词出现 3 次以上：${dup.map(w => w + '×' + freq[w]).join('、')}`, '标题',
          '同义堆词不加权重，删掉重复的换成新信息。');
      } else pass('标题无单词重复堆砌');
    }

    // 五点条数
    const filled = bullets.filter(Boolean);
    if (filled.length < 5) {
      add('structure', 'high', '缺条', `五点只填了 ${filled.length} 条（应为 5 条）`, '五点', '空着的位置等于白送竞品。');
    } else pass('五点齐全（5 条）');

    const bulletLens = [];
    bullets.forEach((b, i) => {
      if (!b) return;
      const n = b.length, label = '五点' + (i + 1);
      bulletLens.push(n);
      if (n > 500) {
        add('structure', 'high', '超限', `${label} ${n} 字符，超过 500 上限会被后台截断`, label, '砍到 300 以内，把最硬的卖点放前 200 字符。');
      } else if (n > 300) {
        add('structure', 'low', '偏长', `${label} ${n} 字符，移动端会折叠`, label, '前 200 字符写最强卖点，后面放补充说明。');
      }
      if (n < 90) add('structure', 'low', '偏短', `${label} 只有 ${n} 字符，信息量不足`, label, '补场景或规格，一条至少覆盖一个买家问题。');
      // 每条五点的标点/语种
      const c2 = matchAll(cjk, b);
      if (c2.length) {
        mark('b' + (i + 1), c2.map(m => ({ start: m.start, end: m.end, level: 'high' })));
        add('structure', 'high', '语种错误', `${label} 含中文/全角字符`, label, '换成英文半角。');
      }
    });
    if (bulletLens.length === 5) {
      const avg = Math.round(bulletLens.reduce((a, b) => a + b, 0) / 5);
      pass(`五条长度均衡，平均 ${avg} 字符`);
    }

    // 后台搜索词
    let stBytes = 0;
    if (st) {
      stBytes = bytes(st);
      if (stBytes > 250) add('structure', 'high', '超限', `后台搜索词 ${stBytes} 字节，超过 250 上限`, '后台词', '删掉重复词和标题已有的词。');
      else pass(`后台搜索词 ${stBytes}/250 字节`);
      if (/[,;:]/.test(st)) add('structure', 'low', '格式', '后台搜索词别用逗号/分号分隔', '后台词', '空格分隔即可，标点占字节不加权重。');
      const tset = new Set(tokens(title));
      const dupSt = uniq(tokens(st)).filter(w => w.length > 3 && tset.has(w));
      if (dupSt.length) add('structure', 'low', '浪费', `后台词里有标题已出现的词：${dupSt.slice(0, 8).join('、')}`, '后台词', '后台位不重复索引标题词，换成同义词/错拼/场景词。');
    }

    /* ---------- 2. 合规风险 ---------- */
    const hits = {};
    fields.forEach(f => {
      RISK.forEach(rule => {
        let ms = matchAll(rule.re, f.text);
        // 邮箱里已经报过一次，别再当成外链重复报
        if (rule.id === 'url') ms = ms.filter(m => m.start > 0 && f.text[m.start - 1] !== '@');
        if (!ms.length) return;
        mark(f.key, ms.map(m => ({ start: m.start, end: m.end, level: rule.level })));
        const k = rule.id;
        if (!hits[k]) hits[k] = { rule, wheres: new Set(), words: new Set(), count: 0 };
        hits[k].wheres.add(f.label);
        ms.forEach(m => hits[k].words.add(m.text.trim()));
        hits[k].count += ms.length;
      });
      // 他人品牌
      const bm = matchAll(BRAND_RE, f.text);
      if (bm.length) {
        mark(f.key, bm.map(m => ({ start: m.start, end: m.end, level: 'mid' })));
        if (!hits.__brand) hits.__brand = { rule: null, wheres: new Set(), words: new Set(), count: 0 };
        hits.__brand.wheres.add(f.label);
        bm.forEach(m => hits.__brand.words.add(m.text.trim()));
        hits.__brand.count += bm.length;
      }
    });

    Object.keys(hits).forEach(k => {
      const h = hits[k];
      const where = [...h.wheres].join('、');
      const words = [...h.words].slice(0, 6).join('、');
      if (k === '__brand') {
        add('risk', 'mid', '商标', `疑似他人品牌：${words}`, where,
          '除非自有或拿到授权，不要出现在文案里；即便是兼容件也只能写 compatible with，不能带 logo。');
        return;
      }
      const r = h.rule;
      add('risk', r.level, r.tag, `命中「${words}」（${where}）`, where, r.fix + (r.why ? ' 原因：' + r.why : ''));
    });

    // 自定义黑名单
    blacklist.forEach(w => {
      fields.forEach(f => {
        const ms = matchAll(new RegExp('\\b' + escRe(w).replace(/\\?\s+/g, '\\s+') + '\\b', 'gi'), f.text);
        if (!ms.length) return;
        mark(f.key, ms.map(m => ({ start: m.start, end: m.end, level: 'high' })));
        add('risk', 'high', '自定义禁用', `命中你的禁用词「${w}」`, f.label, '按你的规则删改。');
      });
    });

    // 全大写：标题里的全大写词一律提示；五点若整条都大写才是问题（五点开头大写小标题是常规写法）
    fields.forEach(f => {
      let ms = [];
      if (f.key === 'title') {
        ms = matchAll(/\b[A-Z]{4,}\b/g, f.text).filter(m => !ALLOW_CAPS.has(m.text));
        if (ms.length) {
          mark(f.key, ms.map(m => ({ start: m.start, end: m.end, level: 'mid' })));
          add('risk', 'mid', '全大写', `标题里全大写单词：${uniq(ms.map(m => m.text)).slice(0, 6).join(' ')}`, f.label,
            '标题除品牌和缩写外不要全大写，影响可读性，也容易被判关键词堆砌。');
        }
      } else {
        const letters = (f.text.match(/[A-Za-z]/g) || []).length;
        const upper = (f.text.match(/[A-Z]/g) || []).length;
        if (letters > 20 && upper / letters > 0.8) {
          mark(f.key, [{ start: 0, end: f.text.length, level: 'mid' }]);
          add('risk', 'mid', '全大写', `${f.label} 整条都是大写`, f.label, '改成句首大写 + 正常大小写，全大写读起来很费力。');
        }
      }
    });

    if (!Object.keys(hits).length && !blacklist.length) pass('未命中常见违禁词库');

    /* ---------- 3. 可读性 / AI 检索 ---------- */
    const hasNum = /\d/.test(allText);
    const hasUnit = /(\d+(?:\.\d+)?)\s*(?:cm|mm|inch|in|oz|ml|l|g|kg|lb|lbs|ft|m|mah|w|v)\b/i.test(allText);
    const hasMaterial = /\b(silicone|tempered\s+glass|polycarbonate|tpu|pvc|eva|nylon|polyester|abs|stainless\s+steel|aluminum|neoprene|latex|fiberglass|pc)\b/i.test(allText);
    const hasPackage = /\b(package\s+includes?|what'?s\s+in\s+the\s+box|includes?|comes?\s+with|\b\d+\s*[x\u00d7]\s)/i.test(allText);
    const hasAudience = /\b(for\s+(?:adults?|men|women|kids|children|beginners?|youth|teens?)|ideal\s+for|perfect\s+for|great\s+for|suitable\s+for|designed\s+for)\b/i.test(allText);
    const hasFit = /\b(fits?|fitting|adjustable|one\s+size|size)\b/i.test(allText);
    const hasCare = /\b(rinse|hand\s+wash|machine\s+wash|wash|clean|dry|storage?|care)\b/i.test(allText);

    if (hasUnit) pass('含带单位的规格数字');
    else if (hasNum) add('readability', 'low', '缺规格', '有数字但没有单位（cm / oz / mm…）', '', '规格补上单位才算硬参数。');
    else add('readability', 'mid', '缺规格', '全篇没有一个具体数字', '', '补尺寸、重量、时长这类可量化信息，AI 检索和买家都靠这个判断。');

    if (!hasMaterial) add('readability', 'mid', '缺材质', '没写材质', '', '写清 silicone / PC frame / tempered glass，材质是最常被问的问题。');
    else pass('写明了材质');

    if (!hasPackage) add('readability', 'low', '缺包含物', '没写清单里有什么（package includes）', '', '写“1 x mask, 1 x dry top snorkel, 1 x mesh bag”，能明显降退货。');
    else pass('写明了包装清单');

    if (!hasAudience) add('readability', 'mid', '缺人群/场景', '没写适用人群或使用场景', '', '加 for adults / beginners / travel & snorkeling 这类长尾场景。');
    else pass('写明了适用人群或场景');

    if (!hasFit) add('readability', 'low', '缺适配', '没写尺寸/适配信息', '', '尺码、可调范围、头围适配写清楚，减少“戴着不合适”的差评。');
    if (!hasCare) add('readability', 'low', '缺保养', '没写清洁/保养', '', '一句 rinse with fresh water after use 就够。');

    const sents = allText.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 3);
    const words = allText.split(/\s+/).filter(Boolean).length;
    const avgSent = sents.length ? Math.round(words / sents.length) : words;
    if (avgSent > 28) add('readability', 'low', '句子过长', `平均每句 ${avgSent} 词，偏长`, '', '拆成短句，一句一个卖点，移动端才读得下去。');
    else if (words > 0) pass(`平均句长 ${avgSent} 词，读起来不吃力`);

    /* ---------- 4. 关键词覆盖 ---------- */
    const kwRows = [];
    let kwDim = null;
    if (kws.length) {
      const nTitle = normText(title);
      const nBullets = bullets.map(normText);
      const nSt = normText(st);
      let got = 0, all = 0;

      kws.forEach(kw => {
        const wl = String(kw).toLowerCase().split(/[\s\-]+/).filter(w => w.length > 2);
        const weight = Math.max(1, wl.length);
        const re = kwRegex(kw);
        const tHit = countIn(re, nTitle);
        const bHits = nBullets.map(t => countIn(re, t));
        const sHit = countIn(re, nSt);
        const anyB = bHits.some(x => x > 0);

        // 标题里词全在，但顺序不同
        const wordsInTitle = wl.filter(w => new RegExp('\\b' + escRe(w), 'i').test(nTitle)).length;

        let val = 0, status = '未覆盖', advice = '';
        if (tHit > 0) { val = 1; status = '标题已覆盖'; }
        else if (wordsInTitle === wl.length && wl.length > 1) { val = 0.75; status = '标题词都在·未连写'; advice = '词都在标题里，但没连成一个短语——能连写就连写，精确匹配更吃权重。'; }
        else if (anyB) { val = 0.55; status = '只在五点'; advice = '标题缺这个词，判断一下是不是主卖点，是就前移。'; }
        else if (wl.length > 1 && wordsInTitle >= Math.ceil(wl.length * 0.6)) { val = 0.3; status = '部分覆盖'; advice = '缺其中一部分词，补齐更完整。'; }
        else { advice = wl.length >= 3 ? '长尾词，用自然句写进五点。' : '核心词，优先塞进标题靠前位置。'; }

        got += weight * val; all += weight;

        const where = [];
        if (tHit) where.push('标题');
        bHits.forEach((c, i) => { if (c) where.push('五点' + (i + 1)); });
        if (sHit) where.push('后台词');

        kwRows.push({
          kw, inTitle: tHit, inBullets: bHits.map(x => x > 0), inSt: sHit > 0,
          weight, status, advice, where: where.join(' / '), val
        });

        if (val === 0) {
          add('keyword', 'mid', '未覆盖', `关键词「${kw}」全文未出现`, '', advice);
        } else if (val === 0.55) {
          add('keyword', 'low', '仅在五点', `关键词「${kw}」只在五点出现，标题没有`, '', advice);
        }
      });

      const coverage = all ? got / all : 0;
      kwDim = Math.round(coverage * 100);

      // 核心词必须在标题
      const core = kwRows[0];
      if (core && core.inTitle === 0) {
        add('keyword', 'high', '核心词缺位', `第一个关键词「${core.kw}」不在标题里`, '标题', '核心词不进标题，等于把最值钱的曝光位让给竞品。');
      } else if (core) pass(`核心词「${core.kw}」已在标题`);
      pass(`关键词覆盖率 ${kwDim}%（${kwRows.filter(r => r.val > 0).length}/${kwRows.length} 个有出现）`);
    } else {
      add('keyword', 'low', '未填关键词', '没填目标关键词，这项不参与打分', '', '把要打的核心词贴进来（一行一个），才能算覆盖率。');
    }

    /* ---------- 5. 打分 ---------- */
    const dims = { structure: 100, keyword: kwDim, risk: 100, readability: 100 };
    issues.forEach(i => {
      if (dims[i.dim] == null) return;
      const d = i.level === 'high' ? 9 : i.level === 'mid' ? 3.5 : 1;
      dims[i.dim] -= d;
    });
    Object.keys(dims).forEach(k => {
      if (dims[k] != null) dims[k] = Math.max(0, Math.min(100, Math.round(dims[k])));
    });

    const W = { structure: 0.25, keyword: 0.30, risk: 0.30, readability: 0.15 };
    let sum = 0, ws = 0;
    Object.keys(W).forEach(k => { if (dims[k] != null) { sum += dims[k] * W[k]; ws += W[k]; } });
    const total = ws ? Math.round(sum / ws) : 0;

    const hs = issues.filter(i => i.level === 'high').length;
    const ms = issues.filter(i => i.level === 'mid').length;
    const ls = issues.filter(i => i.level === 'low').length;

    let grade, verdict;
    if (hs > 0) { grade = '有硬伤'; verdict = `${hs} 项必须改，改完再上架。`; }
    else if (total >= 90) { grade = '可上架'; verdict = '没有硬伤，剩下的都是微调。'; }
    else if (total >= 78) { grade = '微调'; verdict = '再改一轮就能上。'; }
    else if (total >= 62) { grade = '要改'; verdict = '问题不少，先把建议改的过一遍。'; }
    else { grade = '别急'; verdict = '基础信息缺口太大，先补内容。'; }

    const order = { high: 0, mid: 1, low: 2 };
    const dimOrder = { structure: 0, risk: 1, keyword: 2, readability: 3 };
    issues.sort((a, b) => (order[a.level] - order[b.level]) || (dimOrder[a.dim] - dimOrder[b.dim]));

    // 关键词表排序：未覆盖在前
    kwRows.sort((a, b) => a.val - b.val || b.weight - a.weight);

    return {
      total, grade, verdict,
      dims,
      issues, passed, kwRows,
      coverage: kwDim,
      marks,
      counts: { high: hs, mid: ms, low: ls },
      stats: {
        titleLen: title.length, titleLimit, site,
        bulletLens, avgBullet: bulletLens.length ? Math.round(bulletLens.reduce((a, b) => a + b, 0) / bulletLens.length) : 0,
        stBytes, words, avgSentence: avgSent,
        kwCount: kws.length
      }
    };
  }

  global.LISTING = { analyze, parseKws, RISK, BRANDS };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.LISTING;
})(typeof window !== 'undefined' ? window : global);
