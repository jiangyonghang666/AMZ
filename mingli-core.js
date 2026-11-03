/* 八字命盘 · 核心算法与解读规则
 * 历法数据：寿星天文历（VSOP87/ELP2000 节气 + 定朔定气农历），由 lunar_python 生成，
 *           JS 侧 1900-02-01 ~ 2101-01-28 共 73383 天逐日对拍，农历换算零误差。
 * 命理依据：《渊海子平》《三命通会》《滴天髓》《子平真诠》《穷通宝鉴》
 * 这是一个"排盘 + 规则解读"工具，不是通灵，结论仅供文化参考。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Ming = factory();
}(this, function () {
  'use strict';

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var WX = ['木', '火', '土', '金', '水'];
  var GAN_WX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  var ZHI_WX = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  var SHENG = [1, 2, 3, 4, 0];   // 木生火 火生土 土生金 金生水 水生木
  var KE = [2, 3, 4, 0, 1];      // 木克土 火克金 土克水 金克木 水克火
  var ZHI_CANG = ['癸', '己癸辛', '甲丙戊', '乙', '戊乙癸', '丙庚戊', '丁己', '己丁乙', '庚壬戊', '辛', '戊辛丁', '壬甲'];
  var CANG_W = [1, 0.6, 0.3];    // 本气 / 中气 / 余气
  var NAYIN = ['海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'];
  var SHISHEN = {
    比肩: '比肩', 劫财: '劫财', 食神: '食神', 伤官: '伤官', 偏财: '偏财', 正财: '正财',
    七杀: '七杀', 正官: '正官', 偏印: '偏印', 正印: '正印'
  };
  var LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var LUNAR_DAY = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  var SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  /* ---------- 数据表 ---------- */
  var LUNAR_INFO = [0x804bd,0x4ae,0xa57,0x5054d,0xd26,0xd95,0x140655,0x56a,0x9ad,0x2055d,0x4ae,0x60a5b,0xa4d,0xd25,0x150d25,0xb54,0xd6a,0x20ada,0x95b,0x170497,0x497,0xa4b,0x50b4b,0x6a5,0x6d4,0x140ab5,0x2b6,0x957,0x2052f,0x497,0x60656,0xd4a,0xea5,0x1506a9,0x5ad,0x2b6,0x13086e,0x92e,0x170c8d,0xc95,0xd4a,0x160d8a,0xb55,0x56a,0x140a5b,0x25d,0x92d,0x20d2b,0xa95,0x70b55,0x6ca,0xb55,0x150535,0x4da,0xa5b,0x130457,0x52b,0x80a9a,0xe95,0x6aa,0x60aea,0xab5,0x4b6,0x40aae,0xa57,0x526,0x30f26,0xd95,0x705b5,0x56a,0x96d,0x504dd,0x4ad,0xa4d,0x40d4d,0xd25,0x80d55,0xb54,0xb6a,0x16095a,0x95b,0x49b,0x40a97,0xa4b,0xa0b27,0x6a5,0x6d4,0x60af4,0xab6,0x957,0x504af,0x497,0x64b,0x3074a,0xea5,0x806b5,0x5ac,0xab6,0x5096d,0x92e,0xc96,0x40d95,0xd4a,0xda5,0x20755,0x56a,0x70abb,0x25d,0x92d,0x50cab,0xa95,0xb4a,0x40baa,0xad5,0x9055d,0x4ba,0xa5b,0x160517,0x52b,0xa93,0x40795,0x6aa,0xad5,0x205b5,0x4b6,0x60a6e,0xa4e,0xd26,0x50ea6,0xd53,0x5aa,0x3076a,0x96d,0xb04af,0x4ad,0xa4d,0x160d0b,0xd25,0xd52,0x50dd4,0xb5a,0x56d,0x2055b,0x49b,0x70a57,0xa4b,0xaa5,0x150b25,0x6d2,0xada,0x1304b6,0x937,0x8049f,0x497,0x64b,0x16068a,0xea5,0x6b2,0x140a6c,0xaae,0x92e,0x30d2e,0xc96,0x70d55,0xd4a,0xda5,0x505d5,0x56a,0xa6d,0x4055d,0x52d,0x80a9b,0xa95,0xb4a,0x60b6a,0xad5,0x55a,0x40aba,0xa5b,0x52b,0x30b27,0x693,0x70733,0x6aa,0xad5,0x1504b5,0x4b6,0xa57,0x4054e,0xd16,0x80e96,0xd52,0xdaa,0x1606aa,0x56d,0x4ae,0x40a9d,0xa2d,0xd15,0x20f25,0xd52];
  var LUNAR_FROM = 1900;
  var LUNAR_TO = 2100;
  var JQ_B64 = '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';
  var JQ_FROM = 1900;
  var JQ_TO = 2101;

  var JQ = (function () {
    var s = JQ_B64, bin = [];
    if (typeof atob === 'function') {
      var raw = atob(s);
      for (var i = 0; i < raw.length; i++) bin.push(raw.charCodeAt(i));
    } else {
      var b = Buffer.from(s, 'base64');
      for (var j = 0; j < b.length; j++) bin.push(b[j]);
    }
    return bin;
  }());

  var TERM_NAME = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

  function mod(n, m) { return ((n % m) + m) % m; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function bj(y, m, d, h, mi) { return Date.UTC(y, m - 1, d, h, mi || 0); }  // 把北京民用时间当作"UTC"统一比较
  function ymd(t) { var d = new Date(t); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()]; }
  function fmt(t) { var a = ymd(t); return a[0] + '-' + pad2(a[1]) + '-' + pad2(a[2]) + ' ' + pad2(a[3]) + ':' + pad2(a[4]); }

  /* 节气时刻（北京时） */
  function termTime(y, i) {
    if (y < JQ_FROM || y > JQ_TO) return null;
    var o = ((y - JQ_FROM) * 24 + i) * 2;
    var v = (JQ[o] << 8) | JQ[o + 1];
    var day = v >> 11, hh = (v >> 6) & 31, mm = v & 63;
    return bj(y, (i >> 1) + 1, day, hh, mm);
  }
  /* 全部「节」（十二节令） */
  function jieList(y0, y1) {
    var out = [];
    for (var y = y0; y <= y1; y++) {
      for (var i = 0; i < 24; i += 2) {
        var t = termTime(y, i);
        if (t === null) continue;
        out.push({ t: t, name: TERM_NAME[i], branch: mod((i >> 1) + 1, 12), year: y, idx: i });
      }
    }
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  }

  /* ---------- 农历 ---------- */
  function info(y) { return LUNAR_INFO[y - LUNAR_FROM]; }
  function leapMonth(y) { return (info(y) >> 16) & 15; }
  function leapBig(y) { return (info(y) >> 20) & 1; }
  function monthDays(y, m) { return ((info(y) >> (12 - m)) & 1) ? 30 : 29; }
  function yearDays(y) {
    var d = 0;
    for (var m = 1; m <= 12; m++) d += monthDays(y, m);
    if (leapMonth(y)) d += leapBig(y) ? 30 : 29;
    return d;
  }
  function monthsOf(y) {
    var out = [], lp = leapMonth(y);
    for (var m = 1; m <= 12; m++) {
      out.push({ m: m, leap: false, days: monthDays(y, m) });
      if (m === lp) out.push({ m: m, leap: true, days: leapBig(y) ? 30 : 29 });
    }
    return out;
  }
  var BASE1900 = bj(1900, 1, 31, 0, 0);

  function solarToLunar(y, m, d) {
    var off = Math.round((bj(y, m, d, 0, 0) - BASE1900) / 86400000);
    var yy = LUNAR_FROM;
    while (yy <= LUNAR_TO && off >= yearDays(yy)) { off -= yearDays(yy); yy++; }
    if (yy > LUNAR_TO) return null;
    var ms = monthsOf(yy);
    for (var i = 0; i < ms.length; i++) {
      if (off < ms[i].days) {
        return { year: yy, month: ms[i].m, day: off + 1, leap: ms[i].leap,
                 text: (ms[i].leap ? '闰' : '') + LUNAR_MONTH[ms[i].m - 1] + '月' + LUNAR_DAY[off] };
      }
      off -= ms[i].days;
    }
    return null;
  }

  function lunarToSolar(y, m, d, isLeap) {
    if (y < LUNAR_FROM || y > LUNAR_TO) return null;
    var off = 0, yy;
    for (yy = LUNAR_FROM; yy < y; yy++) off += yearDays(yy);
    var ms = monthsOf(y);
    var found = false;
    for (var i = 0; i < ms.length; i++) {
      if (ms[i].m === m && ms[i].leap === !!isLeap) { found = true; break; }
      off += ms[i].days;
    }
    if (!found) return null;
    off += d - 1;
    var t = BASE1900 + off * 86400000;
    var a = ymd(t);
    return { year: a[0], month: a[1], day: a[2] };
  }

  /* ---------- 干支 ---------- */
  function gz(i) { return GAN[mod(i, 10)] + ZHI[mod(i, 12)]; }
  function gzOf(gan, zhi) { return GAN[mod(gan, 10)] + ZHI[mod(zhi, 12)]; }
  function ganParity(g) { return mod(g, 2); }   // 0 阳 1 阴

  function nayin(idx) { return NAYIN[Math.floor(mod(idx, 60) / 2)]; }

  function shiShen(dayGan, otherGan) {
    var d = GAN_WX[dayGan], o = GAN_WX[otherGan], same = ganParity(dayGan) === ganParity(otherGan);
    if (d === o) return same ? '比肩' : '劫财';
    if (SHENG[d] === o) return same ? '食神' : '伤官';
    if (KE[d] === o) return same ? '偏财' : '正财';
    if (SHENG[o] === d) return same ? '偏印' : '正印';
    return same ? '七杀' : '正官';
  }

  /* ---------- 真太阳时 ---------- */
  function rad(d) { return d * Math.PI / 180; }

  /* 均时差（分）—— NOAA 算法，口径与《寿星天文历》一致，误差 < 20 秒 */
  function equationOfTime(t) {
    var jd = t / 86400000 + 2440587.5;
    var T = (jd - 2451545.0) / 36525;
    var L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360);
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var C = Math.sin(rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
            Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * T) +
            Math.sin(rad(3 * M)) * 0.000289;
    var trueLong = L0 + C;
    var omega = 125.04 - 1934.136 * T;
    var lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
    var eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    var eps = eps0 + 0.00256 * Math.cos(rad(omega));
    var alpha = Math.atan2(Math.cos(rad(eps)) * Math.sin(rad(lambda)), Math.cos(rad(lambda))) * 180 / Math.PI;
    var E = mod(L0 - 0.0057183 - alpha + 180, 360) - 180;   // 度
    return 4 * E;                                          // 分钟
  }

  /* 北京时间 → 出生地真太阳时；lon 为东经度数 */
  function trueSolar(y, m, d, h, mi, lon) {
    var t = bj(y, m, d, h, mi);
    var eot = equationOfTime(t);
    var delta = (lon - 120) * 4 + eot;          // 经度时差 + 均时差（分钟）
    var a = ymd(t + Math.round(delta * 60000));
    return { y: a[0], m: a[1], d: a[2], h: a[3], mi: a[4],
             delta: delta, eot: eot, lon: lon };
  }

  /* ---------- 四柱 ---------- */
  function fourPillars(o) {
    var y = o.y, mo = o.m, d = o.d, h = o.h, mi = o.mi || 0;
    var t = bj(y, mo, d, h, mi);
    var jie = jieList(y - 1, y + 1);
    var lichun = termTime(y, 2);
    var yearGz = mod(t < lichun ? y - 1 - 4 : y - 4, 60);

    // 月柱：取出生时刻之前最近的「节」
    var prev = null, next = null;
    for (var i = 0; i < jie.length; i++) {
      if (jie[i].t <= t) prev = jie[i]; else { next = jie[i]; break; }
    }
    var mb = prev.branch;
    var yGan = mod(yearGz, 10);
    var yinGan = mod(yGan * 2 + 2, 10);          // 五虎遁：甲己丙作首
    var mGan = mod(yinGan + mod(mb - 2, 12), 10);
    var monthGz = ganZhiIndex(mGan, mb);

    // 日柱：儒略日 + 定标；23:00 起算次日（可关）
    var dayBase = Math.floor(bj(y, mo, d, 0, 0) / 86400000);
    var lateZi = (o.lateZi !== false) && h >= 23;
    var dayGz = mod(dayBase + (lateZi ? 1 : 0) + 17, 60);
    var dGan = mod(dayGz, 10);

    // 时柱：五鼠遁
    var hb = mod(Math.floor((h + 1) / 2), 12);
    var hGan = mod((dGan % 5) * 2 + hb, 10);
    var hourGz = ganZhiIndex(hGan, hb);

    return {
      t: t, jie: prev, nextJie: next,
      year: { idx: yearGz, gan: mod(yearGz, 10), zhi: mod(yearGz, 12), text: gz(yearGz) },
      month: { idx: monthGz, gan: mGan, zhi: mb, text: gzOf(mGan, mb) },
      day: { idx: dayGz, gan: dGan, zhi: mod(dayGz, 12), text: gz(dayGz) },
      hour: { idx: hourGz, gan: hGan, zhi: hb, text: gzOf(hGan, hb) }
    };
  }
  function ganZhiIndex(g, z) {
    for (var k = 0; k < 60; k++) if (mod(k, 10) === mod(g, 10) && mod(k, 12) === mod(z, 12)) return k;
    return 0;
  }

  /* ---------- 大运 ---------- */
  function luck(p, gender, count) {
    count = count || 8;
    var yangYear = ganParity(mod(p.year.idx, 10)) === 0;  // 阳年
    var male = gender === '男';
    var forward = (yangYear && male) || (!yangYear && !male);
    var ref = forward ? p.nextJie : p.jie;
    if (!ref) ref = p.nextJie || p.jie;
    if (!ref) return { forward: forward, startYears: 0, startMonths: 0, list: [], ref: null };
    var days = Math.abs(ref.t - p.t) / 86400000;
    var startYears = days / 3;                       // 三日折一年
    var sy = Math.floor(startYears), sm = Math.round((startYears - sy) * 12);
    if (sm >= 12) { sy++; sm -= 12; }
    var list = [];
    for (var k = 1; k <= count; k++) {
      var idx = mod(p.month.idx + (forward ? k : -k), 60);
      var ageExact = startYears + (k - 1) * 10;
      var ay = Math.floor(ageExact), am = Math.round((ageExact - ay) * 12);
      if (am === 12) { ay++; am = 0; }
      list.push({ idx: idx, text: gz(idx), gan: mod(idx, 10), zhi: mod(idx, 12),
                  age: ay, ageText: ay + '岁' + (am ? am + '个月' : ''),
                  year: p.birthYear + Math.round(ageExact) });
    }
    return { forward: forward, startYears: sy, startMonths: sm, list: list, ref: ref };
  }

  /* ---------- 五行强弱 ---------- */
  function wuxingScore(p) {
    var s = [0, 0, 0, 0, 0];
    var pillars = [p.year, p.month, p.day, p.hour];
    for (var i = 0; i < 4; i++) {
      s[GAN_WX[pillars[i].gan]] += 1;
      var z = pillars[i].zhi, ca = ZHI_CANG[z], mult = (i === 1) ? 1.5 : 1;  // 月令加权
      for (var j = 0; j < ca.length; j++) {
        var g = GAN.indexOf(ca[j]);
        s[GAN_WX[g]] += CANG_W[j] * mult;
      }
    }
    var total = s.reduce(function (a, b) { return a + b; }, 0);
    return { raw: s, total: total, pct: s.map(function (v) { return v / total; }) };
  }

  function strength(p, wx, gender) {
    var dWx = GAN_WX[p.day.gan];
    var shengMe = [0, 1, 2, 3, 4].filter(function (k) { return SHENG[k] === dWx; })[0];
    var self = wx.pct[dWx], seal = wx.pct[shengMe];
    var ratio = self + seal;
    var deLing = (ZHI_WX[p.month.zhi] === dWx) || (SHENG[ZHI_WX[p.month.zhi]] === dWx);
    var label = ratio >= 0.55 ? '偏旺' : ratio >= 0.45 ? '中和' : '偏弱';
    return { ratio: ratio, dWx: dWx, shengMe: shengMe, deLing: deLing, label: label,
             self: self, seal: seal };
  }

  /* ---------- 格局 / 用神 ---------- */
  function geJu(p) {
    var mz = p.month.zhi, cang = ZHI_CANG[mz].split('');
    var main = GAN.indexOf(cang[0]);
    var ss = shiShen(p.day.gan, main);
    var touGan = null;
    for (var i = 0; i < cang.length; i++) {
      var g = GAN.indexOf(cang[i]);
      var tou = [p.year, p.month, p.hour].some(function (x) { return x.gan === g; });
      if (tou) { touGan = { gan: cang[i], ss: shiShen(p.day.gan, g) }; break; }
    }
    var nameMap = { 正官: '正官格', 七杀: '七杀格', 正财: '正财格', 偏财: '偏财格', 正印: '正印格',
      偏印: '偏印格', 食神: '食神格', 伤官: '伤官格', 比肩: '建禄格', 劫财: '羊刃格' };
    return { shiShen: ss, name: nameMap[ss] || (ss + '格'), main: main, touGan: touGan,
             zhi: mz, mainGan: cang[0] };
  }

  function yongShen(st, p) {
    var dWx = st.dWx;
    var strong = st.label === '偏旺';
    var weak = st.label === '偏弱';
    var yin = st.shengMe;               // 印
    var bi = dWx;                       // 比劫
    var shi = SHENG[dWx];               // 食伤
    var cai = KE[dWx];                  // 财
    var guan = [0, 1, 2, 3, 4].filter(function (k) { return KE[k] === dWx; })[0]; // 官杀
    var monthZhiWx = ZHI_WX[p.month.zhi];
    var winter = p.month.zhi === 11 || p.month.zhi === 0 || p.month.zhi === 1;  // 亥子丑
    var summer = p.month.zhi === 5 || p.month.zhi === 6 || p.month.zhi === 7;   // 巳午未
    var favor = [], avoid = [], tiaohou = '';
    if (weak) { favor = [yin, bi]; avoid = [cai, guan, shi]; }
    else if (strong) { favor = [shi, cai, guan]; avoid = [yin, bi]; }
    else { favor = [shi, cai]; avoid = []; }
    if (winter) tiaohou = '生于冬月，寒气重，调候首重「火」——《穷通宝鉴》谓冬水冻木、非丙不解，看命先看暖气有无。';
    else if (summer) tiaohou = '生于夏月，火气炎，调候首重「水」——《穷通宝鉴》谓夏木枯焦、得水则荣，先看润泽。';
    else tiaohou = '生于' + TERM_NAME[p.jie.idx] + '后，气候平和，以格局旺衰为主，调候为辅。';
    return { favor: favor, avoid: avoid, tiaohou: tiaohou };
  }

  /* ---------- 神煞 ---------- */
  var TIANYI = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 8: [3, 5], 9: [3, 5], 7: [6, 2] };
  var WENCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
  var YIMA = { 0: 2, 4: 2, 8: 2, 5: 11, 9: 11, 1: 11, 2: 8, 6: 8, 10: 8, 11: 5, 3: 5, 7: 5 };
  var TAOHUA = { 0: 9, 4: 9, 8: 9, 5: 6, 9: 6, 1: 6, 2: 3, 6: 3, 10: 3, 11: 0, 3: 0, 7: 0 };
  var HUAGAI = { 0: 4, 4: 4, 8: 4, 5: 7, 9: 7, 1: 7, 2: 10, 6: 10, 10: 10, 11: 1, 3: 1, 7: 1 };
  var YANGREN = [3, 4, 6, 7, 6, 7, 9, 10, 0, 1];

  function shenSha(p) {
    var out = [];
    var zhis = [p.year.zhi, p.month.zhi, p.day.zhi, p.hour.zhi];
    var names = ['年支', '月支', '日支', '时支'];
    var ty = TIANYI[p.day.gan] || [];
    for (var i = 0; i < 4; i++) if (ty.indexOf(zhis[i]) >= 0) out.push({ name: '天乙贵人', at: names[i] });
    if (zhis.indexOf(WENCHANG[p.day.gan]) >= 0) out.push({ name: '文昌', at: names[zhis.indexOf(WENCHANG[p.day.gan])] });
    var ym = YIMA[p.year.zhi], th = TAOHUA[p.year.zhi], hg = HUAGAI[p.year.zhi];
    if (zhis.indexOf(ym) >= 0) out.push({ name: '驿马', at: names[zhis.indexOf(ym)] });
    if (zhis.indexOf(th) >= 0) out.push({ name: '桃花', at: names[zhis.indexOf(th)] });
    if (zhis.indexOf(hg) >= 0) out.push({ name: '华盖', at: names[zhis.indexOf(hg)] });
    if (zhis.indexOf(YANGREN[p.day.gan]) >= 0 && p.day.gan !== 0) out.push({ name: '羊刃', at: names[zhis.indexOf(YANGREN[p.day.gan])] });
    var xunShou = p.day.idx - mod(p.day.idx, 10);
    var kong = [mod(mod(xunShou, 12) + 10, 12), mod(mod(xunShou, 12) + 11, 12)];
    out.push({ name: '空亡', at: '日柱旬空 ' + ZHI[kong[0]] + ZHI[kong[1]] });
    return out;
  }

  /* ---------- 命宫 / 胎元 ---------- */
  function gongWei(p) {
    var mb = mod(p.month.zhi - 2, 12) + 1;      // 寅月=1
    var hb = p.hour.zhi + 1;                    // 子=1
    var sum = mb + hb;
    var seq = sum <= 14 ? 14 - sum : 26 - sum;  // 子=1 ... 亥=12
    var bz = mod(seq - 1, 12);
    var yGan = mod(p.year.idx, 10);
    var yinGan = mod(yGan * 2 + 2, 10);
    var mg = mod(yinGan + mod(bz - 2, 12), 10);
    var taiYuan = gzOf(p.month.gan + 1, p.month.zhi + 3);
    return { mingGong: gzOf(mg, bz), taiYuan: taiYuan };
  }

  /* ---------- 十干体象（《滴天髓》） ---------- */
  var TI_XIANG = {
    0: '甲木参天，脱胎要火，春不容金，秋不容土，火炽乘龙，水宕骑虎，地润天和，植立千古。',
    1: '乙木虽柔，刲羊解牛，怀丁抱丙，跨凤乘猴，虚湿之地，骑马亦忧，藤萝系甲，可春可秋。',
    2: '丙火猛烈，欺霜侮雪，能煅庚金，逢辛反怯，土众成慈，水猖显节，虎马犬乡，甲来焚灭。',
    3: '丁火柔中，内性昭融，抱乙而孝，合壬而忠，旺而不烈，衰而不穷，如有嫡母，可秋可冬。',
    4: '戊土固重，既中且正，静翕动辟，万物司命，水润物生，火燥物病，若在艮坤，怕冲宜静。',
    5: '己土卑湿，中正蓄藏，不愁木盛，不畏水狂，火少火晦，金多金光，若要物旺，宜助宜帮。',
    6: '庚金带煞，刚健为最，得水而清，得火而锐，土润则生，土干则脆，能赢甲兄，输于乙妹。',
    7: '辛金软弱，温润而清，畏土之叠，乐水之盈，能扶社稷，能救生灵，热则喜母，寒则喜丁。',
    8: '壬水通河，能泄金气，刚中之德，周流不滞，通根透癸，冲天奔地，化则有情，从则相济。',
    9: '癸水至弱，达于天津，得龙而运，功化斯神，不愁火土，不论庚辛，合戊见火，化象斯真。'
  };
  var WX_TRAIT = {
    0: '木主仁，性直，喜条达', 1: '火主礼，性急，贵明亮', 2: '土主信，性厚，重承诺',
    3: '金主义，性刚，重决断', 4: '水主智，性灵，善变通'
  };
  var SS_TRAIT = {
    比肩: '自立、好胜，凡事靠自己，朋友多但易争', 劫财: '敢冲敢赌，重义气，钱到手里留不住',
    食神: '温和有才艺，讲口福与生活情趣，不爱争', 伤官: '聪明外露，锋芒足，不服管，创意强',
    偏财: '会抓机会，人缘广，财来财去看得开', 正财: '务实守成，讲性价比，靠稳定积累',
    七杀: '有魄力、抗压，适合攻坚与管人，压力也大', 正官: '守规矩、重名声，适合体制内与长期经营',
    偏印: '思维偏门，直觉强，好学但易钻牛角尖', 正印: '厚道、靠长辈与学历，稳中求进'
  };

  /* ---------- 主流程 ---------- */
  function analyze(input) {
    // 有经度且开启校正：先用真太阳时替换出生时刻，再排盘
    var ts = null, eff = input;
    if (input.useTrueSolar && typeof input.lon === 'number' && isFinite(input.lon)) {
      ts = trueSolar(input.y, input.m, input.d, input.h, input.mi || 0, input.lon);
      eff = { y: ts.y, m: ts.m, d: ts.d, h: ts.h, mi: ts.mi };
    }
    var p = { y: eff.y, m: eff.m, d: eff.d, h: eff.h, mi: eff.mi || 0, birthYear: input.y, lateZi: input.lateZi };
    var fp = fourPillars(p);
    fp.birthYear = input.y;
    var wx = wuxingScore(fp);
    var st = strength(fp, wx, input.gender);
    var ge = geJu(fp);
    var ys = yongShen(st, fp);
    var luckInfo = luck(fp, input.gender, 8);
    var sha = shenSha(fp);
    var gw = gongWei(fp);
    var lunar = solarToLunar(input.y, input.m, input.d);
    return { pillars: fp, wx: wx, strength: st, geju: ge, yong: ys, luck: luckInfo, shensha: sha, gong: gw,
             lunar: lunar, gender: input.gender, input: input, solar: ts };
  }

  function tenGodRows(p) {
    var cols = [p.year, p.month, p.day, p.hour];
    return cols.map(function (c, i) {
      var ganSS = i === 2 ? '日元' : shiShen(p.day.gan, c.gan);
      var cang = ZHI_CANG[c.zhi].split('').map(function (g) {
        return { gan: g, ss: shiShen(p.day.gan, GAN.indexOf(g)) };
      });
      return { ganSS: ganSS, gan: GAN[c.gan], zhi: ZHI[c.zhi], cang: cang, nayin: nayin(c.idx),
               zhiWx: WX[ZHI_WX[c.zhi]] };
    });
  }

  /* 多维度解读 */
  function reading(r) {
    var p = r.pillars, st = r.strength, wx = r.wx, ge = r.geju, ys = r.yong;
    var dGan = p.day.gan, dWx = GAN_WX[dGan];
    var rows = tenGodRows(p);
    var counts = {};
    rows.forEach(function (row, i) {
      if (i !== 2) counts[row.ganSS] = (counts[row.ganSS] || 0) + 1;
      row.cang.forEach(function (c) { counts[c.ss] = (counts[c.ss] || 0) + 1; });
    });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 2);
    var out = [];

    out.push({
      key: 'xing', title: '一、日主与性情',
      text: [
        '日主' + GAN[dGan] + '（' + WX[dWx] + '），' + WX_TRAIT[dWx] + '。' + p.day.text + '日生人。',
        '《滴天髓》论' + GAN[dGan] + '：' + TI_XIANG[dGan],
        '十神以' + top.map(function (k) { return k + '（' + counts[k] + '）'; }).join('、') + '为重：' +
          top.map(function (k) { return k + '主' + SS_TRAIT[k]; }).join('；') + '。'
      ].join(''),
      basis: '《滴天髓》十干体象 · 《渊海子平》论十神'
    });

    out.push({
      key: 'qiang', title: '二、旺衰与喜忌',
      text: [
        '同类（比劫+印星）占 ' + Math.round(st.ratio * 100) + '%，' + (st.deLing ? '月令得气，' : '月令失气，') +
          '判为「' + st.label + '」。',
        '五行分布：' + WX.map(function (w, i) { return w + Math.round(wx.pct[i] * 100) + '%'; }).join(' · ') + '。',
        '喜：' + (ys.favor.length ? ys.favor.map(function (i) { return WX[i]; }).join('、') : '随运而定') +
          (ys.avoid.length ? '；忌：' + ys.avoid.map(function (i) { return WX[i]; }).join('、') : '') + '。',
        ys.tiaohou
      ].join(''),
      basis: '《滴天髓》旺衰论 · 《子平真诠》论用神 · 《穷通宝鉴》调候'
    });

    out.push({
      key: 'ge', title: '三、格局',
      text: '月令' + ZHI[p.month.zhi] + '（' + WX[ZHI_WX[p.month.zhi]] + '），本气' + ge.mainGan + '为' +
        ge.shiShen + (ge.touGan ? '；另透' + ge.touGan.gan + '（' + ge.touGan.ss + '）' : '（本气未透干）') +
        '，取「' + ge.name + '」。' + GE_TEXT[ge.shiShen] + '。',
      basis: '《子平真诠》论用神 · 《三命通会》论格局'
    });

    out.push({
      key: 'shi', title: '四、事业与财运',
      text: [
        '十神计数：正官' + (counts['正官'] || 0) + '、七杀' + (counts['七杀'] || 0) +
          '、正财' + (counts['正财'] || 0) + '、偏财' + (counts['偏财'] || 0) +
          '、食神' + (counts['食神'] || 0) + '、伤官' + (counts['伤官'] || 0) + '。',
        CAREER_TEXT(ge.shiShen, st.label)
      ].join(''),
      basis: '《子平真诠》论财官 · 《渊海子平》论食伤生财'
    });

    var dayZhi = p.day.zhi;
    out.push({
      key: 'hun', title: '五、婚姻与六亲',
      text: [
        '日支' + ZHI[dayZhi] + '为夫妻宫，藏' + ZHI_CANG[dayZhi].split('').join('') + '，' +
          '十神' + ZHI_CANG[dayZhi].split('').map(function (g) { return shiShen(dGan, GAN.indexOf(g)); })[0] + '。',
        MARRIAGE_TEXT(r.gender, counts, p)
      ].join(''),
      basis: '《三命通会》论夫妻宫 · 《渊海子平》论六亲'
    });

    var weakWx = [];
    wx.pct.forEach(function (v, i) { if (v < 0.06) weakWx.push(i); });
    out.push({
      key: 'jian', title: '六、健康提示',
      text: [
        (weakWx.length ? '五行偏枯在' + weakWx.map(function (i) { return WX[i]; }).join('、') + '。' : '五行分布尚匀。'),
        '按五行配脏腑（木肝胆、火心小肠、土脾胃、金肺大肠、水肾膀胱），' +
          (weakWx.length ? '相关系统宜早养护、勿熬夜劳损。' : '整体注意作息规律即可。'),
        '此条属传统五行类推，不作医学诊断。'
      ].join(''),
      basis: '《黄帝内经》五行配脏腑（取象类推）'
    });

    out.push({
      key: 'yun', title: '七、大运流年',
      text: [
        (r.luck.forward ? '阳男阴女顺行，' : '阴男阳女逆行，') +
          '出生距' + r.luck.ref.name + ' ' + (Math.abs(r.luck.ref.t - p.t) / 86400000).toFixed(1) + ' 天，' +
          '三日折一年，约 ' + r.luck.startYears + '岁' + (r.luck.startMonths ? r.luck.startMonths + '个月' : '') + '起运。',
        '大运干支见下表；逢喜用（' + ys.favor.map(function (i) { return WX[i]; }).join('') + '）之运多顺，逢忌神（' + (ys.avoid.length ? ys.avoid.map(function (i) { return WX[i]; }).join('') : '—') + '）之运多阻。',
        '具体断事仍须结合流年与原局冲合，此处只给趋势。'
      ].join(''),
      basis: '《渊海子平》论大运起法 · 《子平真诠》论行运'
    });

    return out;
  }

  var GE_TEXT = {
    正官: '正官格喜财印相生、忌伤官见官，宜守正业、稳步升迁',
    七杀: '七杀格喜食神制杀或印绶化杀，主魄力与压力并存，宜武职、竞争性行业',
    正财: '正财格喜食伤生财、身旺任财，主稳定积累、务实经营',
    偏财: '偏财格喜身旺、喜食伤，主机会财、人脉财，起伏也大',
    正印: '正印格喜官杀生印、忌财破印，主学历、长辈庇荫、稳中求进',
    偏印: '偏印格喜财制枭、喜官杀，主偏门技艺、专业深耕',
    食神: '食神格喜财星、忌枭神夺食，主才艺、口碑、细水长流',
    伤官: '伤官格喜财星流通或印制伤，忌见正官，主才华外露、宜自由职业与创意',
    比肩: '建禄格（月令比肩）喜官杀财，忌再见比劫夺财，主自立门户',
    劫财: '羊刃格（月令劫财）喜官杀制刃、喜财，主强势、宜合伙须防争'
  };

  function CAREER_TEXT(shishen, label) {
    var m = {
      正官: '官星得用，走"名分"路线：职位、职称、平台背书对你比短期暴利更有价值。',
      七杀: '杀星有制则贵：适合压力大、要拍板的岗位，忌无制而硬扛，容易内耗。',
      正财: '财星贴身，适合做复购和长线：一条链接养三年，比追爆款更适合你。',
      偏财: '偏财旺，适合抓窗口、做流量与渠道；但要留后手，别把利润全压在一波行情上。',
      正印: '印星主学习与资质，靠专业与信誉吃饭，越老越值钱。',
      偏印: '偏印主"冷门"，越细分越有优势，适合技术、研究、平台规则类工作。',
      食神: '食神主输出与口碑，做内容、做服务、做复购会顺。',
      伤官: '伤官主才华与不服管，自由度高、规则少的场景最能发挥；忌在层级森严处硬碰。',
      比肩: '比肩主自立，单干或小团队都能立住，忌与人合钱。',
      劫财: '劫财主竞争，适合抢市场的活，分钱要先说清。'
    };
    return (m[shishen] || '格局平平，宜先稳住基本盘。') +
      (label === '偏弱' ? '身弱任财官吃力，先扶身（印、比劫）再谈扩张。' :
        label === '偏旺' ? '身旺须有出口，走食伤生财或官杀约束，别把力气全用在硬扛上。' : '');
  }

  function MARRIAGE_TEXT(gender, counts, p) {
    var spouseStar = gender === '男' ? ((counts['正财'] || 0) + (counts['偏财'] || 0)) : ((counts['正官'] || 0) + (counts['七杀'] || 0));
    var s = gender === '男' ? '财星' : '官星';
    var base = spouseStar === 0 ? '原局' + s + '不显，感情上多靠自己主动，缘分来得晚一点反而稳。'
      : spouseStar >= 3 ? '原局' + s + '偏多，选择多也易分心，定下来比挑更好重要。'
        : '原局' + s + '有度，感情观务实，婚后以过日子为主。';
    var chong = (p.day.zhi + 6) % 12;
    if ([p.year.zhi, p.month.zhi, p.hour.zhi].indexOf(chong) >= 0) base += '夫妻宫逢冲，聚少离多或异地，反而少摩擦。';
    return base;
  }

  return {
    solarToLunar: solarToLunar, lunarToSolar: lunarToSolar, fourPillars: fourPillars,
    analyze: analyze, reading: reading, tenGodRows: tenGodRows, termTime: termTime, jieList: jieList,
    trueSolar: trueSolar, equationOfTime: equationOfTime,
    gz: gz, GAN: GAN, ZHI: ZHI, WX: WX, NAYIN: NAYIN, SHENGXIAO: SHENGXIAO,
    ganWx: function (g) { return GAN_WX[g]; },
    zhiWx: function (z) { return ZHI_WX[z]; },
    LUNAR_MONTH: LUNAR_MONTH, LUNAR_DAY: LUNAR_DAY, fmt: fmt, mod: mod,
    lunarRange: [LUNAR_FROM, LUNAR_TO]
  };
}));
