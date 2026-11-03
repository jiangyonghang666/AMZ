/* 今天吃什么 · 菜谱数据 v2
 * 以后加菜：往 recipes 里追加一个对象就行，字段说明：
 *   name    菜名
 *   cuisine 菜系（家常菜/川菜/粤菜/东北菜/汤羹/主食/简餐）
 *   diff    难度 1=简单 2=进阶 3=硬菜
 *   time    大约耗时（分钟）
 *   cost    食材成本（元，两人份粗估）
 *   tags    标签：辣/清淡/下饭/快手/硬菜/减脂/素
 *   ing     食材（写法要和下面 catalog 里的名字一致，匹配靠字符串相等）
 *   note    一句话做法提示（可选）
 */
window.EAT_DATA = {
  version: 'v2',

  /* 视为常备的调料（不参与"缺啥"计算，可在页面上关掉） */
  seasonings: ['葱','姜','蒜','食用油','盐','白糖','生抽','老抽','醋','料酒','蚝油','淀粉','白胡椒粉','香油','鸡精'],

  /* 食材目录（快速点选用） */
  catalog: [
    { group: '鲜肉蛋', items: ['鸡蛋','皮蛋','猪肉末','五花肉','猪里脊','排骨','猪肝','猪蹄','肥牛卷','牛腩','牛肉','牛排','羊肉卷','鸡腿','鸡翅','鸡胸肉','鸡爪','鸭腿','培根','午餐肉','火腿肠','腊肠','虾','鲈鱼','龙利鱼','鱿鱼','蛤蜊'] },
    { group: '蔬菜', items: ['番茄','土豆','青椒','彩椒','茄子','黄瓜','包菜','白菜','娃娃菜','生菜','油麦菜','空心菜','菠菜','西兰花','芥蓝','荷兰豆','秋葵','豆角','洋葱','胡萝卜','白萝卜','冬瓜','丝瓜','苦瓜','西葫芦','莴笋','山药','莲藕','红薯','玉米','金针菇','香菇','平菇','杏鲍菇','豆芽','韭菜','芹菜','蒜苔','蒜苗','花菜','毛豆','豌豆','大葱','柠檬'] },
    { group: '豆制品', items: ['豆腐','豆皮','豆干','千张','腐竹'] },
    { group: '干货/粉面', items: ['粉丝','粉条','米粉','河粉','黄豆','木耳','银耳','海带','紫菜','虾皮','花生米'] },
    { group: '主食', items: ['米饭','面条','挂面','面粉','饺子皮','馄饨皮','年糕','乌冬面','意面','吐司','手抓饼','馒头'] },
    { group: '调料酱料（不常备的）', items: ['豆瓣酱','豆豉','甜面酱','黄豆酱','韩式辣酱','咖喱块','孜然粉','番茄酱','沙拉酱','干辣椒','花椒','小米辣','芝麻','酸菜','啤酒'] }
  ],

  recipes: [
    /* ================= 家常菜 ================= */
    { name:'番茄炒蛋',   cuisine:'家常菜', diff:1, time:10, cost:6,  tags:['清淡','快手'], ing:['番茄','鸡蛋'], note:'蛋先炒盛出，番茄炒出汁再回锅' },
    { name:'青椒肉丝',   cuisine:'家常菜', diff:1, time:20, cost:12, tags:['下饭'],       ing:['青椒','猪里脊'], note:'肉丝加淀粉生抽腌10分钟更嫩' },
    { name:'酸辣土豆丝', cuisine:'家常菜', diff:1, time:15, cost:3,  tags:['快手','素'],  ing:['土豆','青椒','干辣椒'], note:'土豆丝泡水去淀粉，大火快炒' },
    { name:'蒜蓉西兰花', cuisine:'家常菜', diff:1, time:15, cost:7,  tags:['清淡','减脂'], ing:['西兰花'], note:'先焯水1分钟，蒜蓉爆香下锅' },
    { name:'手撕包菜',   cuisine:'家常菜', diff:1, time:10, cost:4,  tags:['快手','素'],  ing:['包菜','干辣椒'], note:'大火+一点点醋，脆的关键' },
    { name:'醋溜白菜',   cuisine:'家常菜', diff:1, time:10, cost:3,  tags:['素'],         ing:['白菜'], note:'白菜帮斜刀片薄' },
    { name:'蚝油生菜',   cuisine:'家常菜', diff:1, time:8,  cost:4,  tags:['清淡','素'],  ing:['生菜'], note:'烫15秒就捞，蚝油汁一浇' },
    { name:'上汤娃娃菜', cuisine:'家常菜', diff:1, time:15, cost:6,  tags:['清淡','素'],  ing:['娃娃菜'], note:'蒜瓣煎黄加水煮出奶白汤' },
    { name:'韭菜炒蛋',   cuisine:'家常菜', diff:1, time:10, cost:6,  tags:['快手'],       ing:['韭菜','鸡蛋'] },
    { name:'芹菜炒香干', cuisine:'家常菜', diff:1, time:15, cost:8,  tags:['素'],         ing:['芹菜','豆干'] },
    { name:'蒜苔炒肉',   cuisine:'家常菜', diff:1, time:15, cost:14, tags:['下饭'],       ing:['蒜苔','猪里脊'] },
    { name:'肉末茄子',   cuisine:'家常菜', diff:2, time:25, cost:10, tags:['下饭'],       ing:['茄子','猪肉末'], note:'茄子先盐腌挤水，省油不腻' },
    { name:'木须肉',     cuisine:'家常菜', diff:2, time:25, cost:14, tags:[],             ing:['猪里脊','鸡蛋','木耳','黄瓜'] },
    { name:'可乐鸡翅',   cuisine:'家常菜', diff:1, time:30, cost:18, tags:['下饭'],       ing:['鸡翅'], note:'鸡翅划两刀，可乐没过一半' },
    { name:'红烧肉',     cuisine:'家常菜', diff:3, time:90, cost:25, tags:['硬菜','下饭'], ing:['五花肉'], note:'焯水→炒糖色→小火炖1小时' },
    { name:'红烧排骨',   cuisine:'家常菜', diff:3, time:60, cost:25, tags:['硬菜'],       ing:['排骨'] },
    { name:'土豆炖牛腩', cuisine:'家常菜', diff:3, time:90, cost:30, tags:['硬菜'],       ing:['牛腩','土豆','胡萝卜'], note:'牛腩炖1小时再下土豆' },
    { name:'番茄牛腩',   cuisine:'家常菜', diff:3, time:90, cost:32, tags:['硬菜'],       ing:['牛腩','番茄'], note:'两个番茄一个炒碎一个切块' },
    { name:'孜然牛肉',   cuisine:'家常菜', diff:2, time:25, cost:28, tags:['下饭','辣'],  ing:['牛肉','洋葱','孜然粉'], note:'牛肉逆纹切薄片，大火快炒' },
    { name:'香煎鸡胸肉', cuisine:'家常菜', diff:1, time:15, cost:10, tags:['减脂','清淡'], ing:['鸡胸肉'], note:'拍松+盐和黑胡椒腌15分钟' },
    { name:'凉拌黄瓜',   cuisine:'家常菜', diff:1, time:5,  cost:3,  tags:['快手','素'],  ing:['黄瓜','小米辣'], note:'拍碎更入味' },
    { name:'苦瓜炒蛋',   cuisine:'家常菜', diff:1, time:10, cost:6,  tags:['清淡','素'],  ing:['苦瓜','鸡蛋'], note:'苦瓜焯水加盐，减苦味' },
    { name:'青椒炒蛋',   cuisine:'家常菜', diff:1, time:10, cost:5,  tags:['快手','素'],  ing:['青椒','鸡蛋'] },
    { name:'西葫芦炒蛋', cuisine:'家常菜', diff:1, time:10, cost:5,  tags:['快手','素'],  ing:['西葫芦','鸡蛋'] },
    { name:'洋葱炒肉',   cuisine:'家常菜', diff:1, time:15, cost:12, tags:['下饭'],       ing:['洋葱','猪里脊'] },
    { name:'莴笋炒肉片', cuisine:'家常菜', diff:1, time:15, cost:10, tags:['清淡'],       ing:['莴笋','猪里脊'], note:'莴笋削皮后斜刀切薄片' },
    { name:'荷兰豆炒腊肠', cuisine:'家常菜', diff:1, time:15, cost:14, tags:['快手'],     ing:['荷兰豆','腊肠'], note:'腊肠煸出油再下荷兰豆' },
    { name:'玉米炒火腿肠', cuisine:'家常菜', diff:1, time:10, cost:7, tags:['快手','素'], ing:['玉米','火腿肠'] },
    { name:'清炒油麦菜', cuisine:'家常菜', diff:1, time:8,  cost:4,  tags:['清淡','素'],  ing:['油麦菜'], note:'大火10秒一锅出' },
    { name:'蒜蓉空心菜', cuisine:'家常菜', diff:1, time:10, cost:4,  tags:['快手','素'],  ing:['空心菜'], note:'出锅前点几滴醋，叶子不发黑' },
    { name:'清炒芥蓝',   cuisine:'家常菜', diff:1, time:10, cost:5,  tags:['清淡','素'],  ing:['芥蓝'], note:'梗厚，先下梗后下叶' },
    { name:'盐水毛豆',   cuisine:'家常菜', diff:1, time:15, cost:5,  tags:['快手','素'],  ing:['毛豆'], note:'剪掉两头更入味' },
    { name:'豌豆炒肉末', cuisine:'家常菜', diff:1, time:15, cost:9,  tags:['下饭'],       ing:['豌豆','猪肉末'] },
    { name:'千张肉丝',   cuisine:'家常菜', diff:1, time:15, cost:10, tags:['下饭'],       ing:['千张','猪里脊'] },
    { name:'平菇炒蛋',   cuisine:'家常菜', diff:1, time:10, cost:6,  tags:['快手','素'],  ing:['平菇','鸡蛋'], note:'平菇撕小朵，先干煸出水' },
    { name:'虎皮青椒',   cuisine:'家常菜', diff:1, time:10, cost:4,  tags:['下饭','素'],  ing:['青椒'], note:'干锅把青椒按压出虎皮斑' },
    { name:'茄子豆角',   cuisine:'家常菜', diff:2, time:25, cost:8,  tags:['下饭','素'],  ing:['茄子','豆角'], note:'两样都先过油，一起回锅' },
    { name:'红烧茄子',   cuisine:'家常菜', diff:2, time:25, cost:7,  tags:['下饭','素'],  ing:['茄子'], note:'腌盐挤水，糖醋汁收尾' },
    { name:'糖醋里脊',   cuisine:'家常菜', diff:3, time:40, cost:18, tags:['硬菜'],       ing:['猪里脊'], note:'糊挂厚，炸两遍，糖醋汁裹匀' },
    { name:'糖醋排骨',   cuisine:'家常菜', diff:3, time:50, cost:25, tags:['硬菜'],       ing:['排骨'], note:'1勺料酒2勺生抽3勺糖4勺醋5勺水' },
    { name:'爆炒猪肝',   cuisine:'家常菜', diff:2, time:20, cost:12, tags:['下饭'],       ing:['猪肝','洋葱'], note:'猪肝泡水去血水，大火快炒不能老' },
    { name:'红烧猪蹄',   cuisine:'家常菜', diff:3, time:90, cost:35, tags:['硬菜'],       ing:['猪蹄'], note:'焯水去毛，小火炖1.5小时' },
    { name:'黄豆焖猪蹄', cuisine:'家常菜', diff:3, time:90, cost:35, tags:['硬菜'],       ing:['猪蹄','黄豆'], note:'黄豆提前泡2小时' },
    { name:'啤酒鸭',     cuisine:'家常菜', diff:3, time:80, cost:30, tags:['硬菜','下饭'], ing:['鸭腿','啤酒'], note:'一罐啤酒代替水，去腥增香' },
    { name:'黄焖鸡',     cuisine:'家常菜', diff:2, time:40, cost:20, tags:['下饭'],       ing:['鸡腿','土豆','青椒','香菇'], note:'鸡腿剁块煸出油，焖20分钟' },
    { name:'大盘鸡',     cuisine:'家常菜', diff:3, time:60, cost:28, tags:['辣','硬菜'],  ing:['鸡腿','土豆','青椒'], note:'最后下宽面拌着吃才完整' },
    { name:'盐酥鸡',     cuisine:'家常菜', diff:2, time:35, cost:16, tags:[],             ing:['鸡腿'], note:'鸡腿肉切块裹淀粉，炸两遍' },
    { name:'柠檬鸡爪',   cuisine:'家常菜', diff:2, time:40, cost:18, tags:['快手'],       ing:['鸡爪','柠檬','小米辣'], note:'煮好冰水过凉，酸辣汁泡2小时' },
    { name:'皮蛋豆腐',   cuisine:'家常菜', diff:1, time:5,  cost:6,  tags:['快手','素'],  ing:['皮蛋','豆腐'], note:'嫩豆腐，淋上生抽香油' },
    { name:'凉拌木耳',   cuisine:'家常菜', diff:1, time:10, cost:4,  tags:['快手','素'],  ing:['木耳','小米辣'], note:'木耳焯2分钟，料汁一拌' },
    { name:'凉拌海带丝', cuisine:'家常菜', diff:1, time:10, cost:3,  tags:['快手','素'],  ing:['海带'] },
    { name:'凉拌秋葵',   cuisine:'家常菜', diff:1, time:10, cost:6,  tags:['清淡','素'],  ing:['秋葵'], note:'整根焯2分钟再切，不流黏液' },
    { name:'凉拌茄子',   cuisine:'家常菜', diff:1, time:15, cost:4,  tags:['素'],         ing:['茄子'], note:'蒸10分钟撕条，蒜泥汁一浇' },
    { name:'蒸水蛋',     cuisine:'家常菜', diff:1, time:15, cost:3,  tags:['清淡','快手'], ing:['鸡蛋'], note:'蛋液过筛，水蛋比1.5:1，盖保鲜膜扎孔' },
    { name:'肉末蒸蛋',   cuisine:'家常菜', diff:1, time:20, cost:6,  tags:['清淡'],       ing:['鸡蛋','猪肉末'] },

    /* ================= 川菜 ================= */
    { name:'麻婆豆腐',   cuisine:'川菜', diff:2, time:20, cost:8,  tags:['下饭','辣'],  ing:['豆腐','猪肉末','豆瓣酱'], note:'豆腐先盐水焯一下不易碎' },
    { name:'回锅肉',     cuisine:'川菜', diff:2, time:30, cost:18, tags:['下饭','辣'],  ing:['五花肉','蒜苗','豆瓣酱'], note:'五花肉整块先煮20分钟再切片' },
    { name:'鱼香肉丝',   cuisine:'川菜', diff:2, time:25, cost:15, tags:['下饭'],       ing:['猪里脊','木耳','胡萝卜','青椒'], note:'鱼香汁：糖醋生抽淀粉各一勺' },
    { name:'宫保鸡丁',   cuisine:'川菜', diff:2, time:25, cost:15, tags:['下饭','辣'],  ing:['鸡胸肉','花生米','干辣椒'] },
    { name:'水煮肉片',   cuisine:'川菜', diff:3, time:35, cost:20, tags:['辣','下饭'],  ing:['猪里脊','豆芽','生菜','豆瓣酱'], note:'肉片腌够味，热油泼葱花收尾' },
    { name:'水煮牛肉',   cuisine:'川菜', diff:3, time:35, cost:28, tags:['辣','硬菜'],  ing:['牛肉','豆芽','生菜','豆瓣酱'], note:'牛肉片薄，滑熟即起' },
    { name:'辣子鸡',     cuisine:'川菜', diff:3, time:40, cost:20, tags:['辣','下饭'],  ing:['鸡腿','干辣椒'], note:'鸡丁炸两遍才够脆' },
    { name:'干煸四季豆', cuisine:'川菜', diff:2, time:20, cost:8,  tags:['下饭'],       ing:['豆角','猪肉末'], note:'豆角一定要煸到起虎皮' },
    { name:'蚂蚁上树',   cuisine:'川菜', diff:2, time:20, cost:8,  tags:['下饭'],       ing:['粉丝','猪肉末','豆瓣酱'], note:'粉丝泡软即可，别煮过头' },
    { name:'酸汤肥牛',   cuisine:'川菜', diff:2, time:25, cost:22, tags:['辣'],         ing:['肥牛卷','金针菇'], note:'黄灯笼椒酱是灵魂，没有就多放醋' },
    { name:'麻辣香锅',   cuisine:'川菜', diff:3, time:40, cost:30, tags:['辣','硬菜'],  ing:['虾','午餐肉','豆皮','土豆','莲藕','金针菇','豆瓣酱'], note:'食材分开焯水断生，最后一起炒' },
    { name:'干锅土豆片', cuisine:'川菜', diff:2, time:30, cost:12, tags:['下饭','辣'],  ing:['土豆','五花肉','洋葱'], note:'土豆片煎到两面焦黄' },
    { name:'干锅菜花',   cuisine:'川菜', diff:2, time:25, cost:12, tags:['下饭'],       ing:['花菜','五花肉'], note:'五花肉煸出油，菜花干煸不加水' },
    { name:'酸菜鱼',     cuisine:'川菜', diff:3, time:45, cost:28, tags:['辣','硬菜'],  ing:['龙利鱼','酸菜'], note:'鱼片腌制上浆，汤滚了下锅30秒' },
    { name:'水煮龙利鱼', cuisine:'川菜', diff:2, time:30, cost:25, tags:['辣'],         ing:['龙利鱼','豆芽','豆瓣酱'], note:'龙利鱼无刺，浆好后汤里烫熟' },
    { name:'番茄龙利鱼', cuisine:'川菜', diff:2, time:25, cost:24, tags:['清淡'],       ing:['龙利鱼','番茄'], note:'番茄熬成浓汤再下鱼块' },
    { name:'辣炒蛤蜊',   cuisine:'川菜', diff:1, time:15, cost:15, tags:['辣','快手'],  ing:['蛤蜊','小米辣'], note:'蛤蜊提前吐沙，开口即熟' },
    { name:'爆炒鱿鱼',   cuisine:'川菜', diff:2, time:20, cost:18, tags:['辣','下饭'],  ing:['鱿鱼','洋葱','干辣椒'], note:'鱿鱼焯水10秒打卷即捞' },

    /* ================= 粤菜 ================= */
    { name:'白灼虾',     cuisine:'粤菜', diff:1, time:15, cost:25, tags:['清淡'],       ing:['虾'], note:'水里加姜葱酒，虾变红即捞' },
    { name:'清蒸鲈鱼',   cuisine:'粤菜', diff:2, time:25, cost:25, tags:['清淡'],       ing:['鲈鱼'], note:'大火蒸8分钟，豉油热油激香' },
    { name:'豉汁蒸排骨', cuisine:'粤菜', diff:2, time:40, cost:22, tags:[],             ing:['排骨','豆豉'], note:'排骨腌半小时，蒸30分钟' },
    { name:'香菇滑鸡',   cuisine:'粤菜', diff:2, time:30, cost:18, tags:['清淡'],       ing:['鸡腿','香菇'], note:'鸡腿去骨切块，淀粉腌制' },
    { name:'蒜蓉粉丝虾', cuisine:'粤菜', diff:2, time:30, cost:28, tags:[],             ing:['虾','粉丝'], note:'虾开背，蒜蓉金银两种' },
    { name:'虾仁滑蛋',   cuisine:'粤菜', diff:1, time:15, cost:20, tags:['清淡','快手'], ing:['虾','鸡蛋'], note:'虾仁滑熟盛出，蛋半凝固时回锅' },
    { name:'蛤蜊蒸蛋',   cuisine:'粤菜', diff:2, time:25, cost:15, tags:['清淡'],       ing:['蛤蜊','鸡蛋'], note:'蛤蜊煮开口，原汤兑蛋液一起蒸' },

    /* ================= 东北菜 ================= */
    { name:'地三鲜',     cuisine:'东北菜', diff:2, time:25, cost:10, tags:['下饭','素'], ing:['土豆','茄子','青椒'], note:'土豆茄子先过油炸更香' },
    { name:'小鸡炖蘑菇', cuisine:'东北菜', diff:3, time:60, cost:28, tags:['硬菜'],      ing:['鸡腿','香菇','粉条'] },
    { name:'猪肉炖粉条', cuisine:'东北菜', diff:3, time:60, cost:22, tags:['硬菜'],      ing:['五花肉','粉条','白菜'] },
    { name:'锅包肉',     cuisine:'东北菜', diff:3, time:40, cost:18, tags:['硬菜'],      ing:['猪里脊'], note:'淀粉糊厚挂，炸两遍，糖醋汁一烹' },
    { name:'东北乱炖',   cuisine:'东北菜', diff:2, time:40, cost:15, tags:[],            ing:['土豆','豆角','茄子','青椒','五花肉'], note:'一锅出，加生抽和一点黄豆酱' },
    { name:'酸菜白肉',   cuisine:'东北菜', diff:2, time:60, cost:25, tags:['硬菜'],      ing:['五花肉','酸菜','粉条'], note:'酸菜先炒出香味再炖' },
    { name:'溜肉段',     cuisine:'东北菜', diff:3, time:35, cost:16, tags:['下饭'],      ing:['猪里脊','青椒'], note:'咸鲜口的锅包肉，糊要挂住' },
    { name:'小葱拌豆腐', cuisine:'东北菜', diff:1, time:5,  cost:4,  tags:['快手','素'], ing:['豆腐','大葱'], note:'嫩豆腐直接拌，撒葱花淋香油' },
    { name:'拔丝地瓜',   cuisine:'东北菜', diff:3, time:30, cost:8,  tags:['硬菜','素'], ing:['红薯'], note:'糖熬到枣红色冒小泡，离火快翻' },

    /* ================= 汤羹 ================= */
    { name:'番茄蛋花汤', cuisine:'汤羹', diff:1, time:10, cost:5,  tags:['清淡','快手'], ing:['番茄','鸡蛋'] },
    { name:'紫菜蛋花汤', cuisine:'汤羹', diff:1, time:10, cost:4,  tags:['快手'],        ing:['紫菜','鸡蛋'], note:'关火再淋蛋液，蛋花才薄' },
    { name:'白菜豆腐汤', cuisine:'汤羹', diff:1, time:20, cost:6,  tags:['清淡'],        ing:['白菜','豆腐'] },
    { name:'丝瓜蛋汤',   cuisine:'汤羹', diff:1, time:10, cost:6,  tags:['清淡'],        ing:['丝瓜','鸡蛋'] },
    { name:'冬瓜虾皮汤', cuisine:'汤羹', diff:1, time:15, cost:5,  tags:['清淡','快手'], ing:['冬瓜','虾皮'], note:'虾皮炝锅，汤自带鲜味' },
    { name:'海带豆腐汤', cuisine:'汤羹', diff:1, time:20, cost:6,  tags:['清淡'],        ing:['海带','豆腐'] },
    { name:'猪肝菠菜汤', cuisine:'汤羹', diff:2, time:25, cost:12, tags:['清淡'],        ing:['猪肝','菠菜'], note:'猪肝腌10分钟，汤开下锅变色即好' },
    { name:'玉米排骨汤', cuisine:'汤羹', diff:2, time:60, cost:25, tags:[],              ing:['排骨','玉米','胡萝卜'], note:'排骨先焯水撇沫' },
    { name:'山药排骨汤', cuisine:'汤羹', diff:2, time:60, cost:25, tags:[],              ing:['排骨','山药'], note:'山药最后20分钟再下，不然炖化' },
    { name:'酸辣汤',     cuisine:'汤羹', diff:2, time:25, cost:8,  tags:['快手'],        ing:['豆腐','木耳','金针菇','火腿肠'], note:'白胡椒粉要足，出锅点醋' },
    { name:'罗宋汤',     cuisine:'汤羹', diff:3, time:80, cost:30, tags:[],              ing:['牛腩','番茄','土豆','包菜'], note:'牛腩炖1小时，番茄炒出酱再合体' },
    { name:'银耳羹',     cuisine:'汤羹', diff:1, time:60, cost:5,  tags:['清淡'],        ing:['银耳'], note:'小火炖40分钟出胶，冰糖最后放' },

    /* ================= 主食 ================= */
    { name:'葱油拌面',   cuisine:'主食', diff:1, time:15, cost:5,  tags:['快手'], ing:['面条'], note:'小葱小火熬到焦黄，生抽老抽糖调汁' },
    { name:'番茄鸡蛋面', cuisine:'主食', diff:1, time:15, cost:6,  tags:['快手'], ing:['面条','番茄','鸡蛋'] },
    { name:'炸酱面',     cuisine:'主食', diff:2, time:30, cost:12, tags:[],       ing:['面条','猪肉末'], note:'甜面酱黄豆酱1:1小火咕嘟10分钟' },
    { name:'油泼面',     cuisine:'主食', diff:2, time:25, cost:6,  tags:['辣'],   ing:['面条','豆芽','干辣椒'], note:'辣椒面铺面上，一勺热油泼上去' },
    { name:'红烧牛肉面', cuisine:'主食', diff:3, time:90, cost:25, tags:[],       ing:['面条','牛肉'], note:'牛肉提前炖上，吃的时候下面条' },
    { name:'疙瘩汤',     cuisine:'主食', diff:1, time:20, cost:5,  tags:[],       ing:['面粉','番茄','鸡蛋'], note:'面粉滴水搅成小疙瘩' },
    { name:'蛋炒饭',     cuisine:'主食', diff:1, time:10, cost:4,  tags:['快手'], ing:['米饭','鸡蛋'], note:'隔夜饭最好，先炒蛋再下饭' },
    { name:'扬州炒饭',   cuisine:'主食', diff:2, time:20, cost:10, tags:[],       ing:['米饭','鸡蛋','火腿肠','胡萝卜','玉米'] },
    { name:'新疆手抓饭', cuisine:'主食', diff:2, time:50, cost:22, tags:[],       ing:['米饭','羊肉卷','胡萝卜','洋葱'], note:'洋葱胡萝卜炒软垫底，焖出来油亮' },
    { name:'韭菜猪肉饺子', cuisine:'主食', diff:3, time:60, cost:15, tags:[],     ing:['饺子皮','猪肉末','韭菜'] },
    { name:'猪肉白菜饺子', cuisine:'主食', diff:3, time:60, cost:14, tags:[],     ing:['饺子皮','猪肉末','白菜'] },
    { name:'三鲜馄饨',   cuisine:'主食', diff:2, time:40, cost:15, tags:[],       ing:['馄饨皮','猪肉末','虾'], note:'馅里加点虾皮，鲜一倍' },
    { name:'葱花鸡蛋饼', cuisine:'主食', diff:1, time:15, cost:4,  tags:['快手'], ing:['面粉','鸡蛋'], note:'面糊能流动的状态最合适' },
    { name:'葱油饼',     cuisine:'主食', diff:2, time:30, cost:4,  tags:['素'],   ing:['面粉','大葱'], note:'油酥抹匀卷起来，擀薄再烙' },
    { name:'韭菜盒子',   cuisine:'主食', diff:2, time:35, cost:8,  tags:['素'],   ing:['面粉','韭菜','鸡蛋'], note:'皮擀薄馅大，小火烙两面金黄' },
    { name:'韩式炒年糕', cuisine:'主食', diff:1, time:20, cost:12, tags:['辣'],   ing:['年糕','韩式辣酱','包菜'], note:'年糕先煮软，酱汁咕嘟到挂浆' },
    { name:'海鲜乌冬面', cuisine:'主食', diff:2, time:20, cost:22, tags:[],       ing:['乌冬面','虾','蛤蜊'], note:'蛤蜊吐沙后和虾一起吊汤' },
    { name:'干炒牛河',   cuisine:'主食', diff:3, time:25, cost:22, tags:[],       ing:['河粉','牛肉','豆芽','洋葱'], note:'大火快炒不加水，河粉不断不粘' },
    { name:'照烧鸡腿饭', cuisine:'主食', diff:2, time:30, cost:18, tags:['下饭'], ing:['鸡腿','米饭'], note:'鸡腿去骨煎脆皮，照烧汁收浓' },

    /* ================= 简餐 ================= */
    { name:'黑椒牛排',   cuisine:'简餐', diff:1, time:15, cost:35, tags:['硬菜'], ing:['牛排','洋葱'], note:'牛排回温再下锅，一面2分钟' },
    { name:'咖喱鸡肉饭', cuisine:'简餐', diff:2, time:35, cost:18, tags:[],       ing:['鸡腿','土豆','胡萝卜','洋葱','咖喱块'] },
    { name:'金针菇培根卷', cuisine:'简餐', diff:1, time:20, cost:18, tags:[],     ing:['培根','金针菇'], note:'小火煎到培根出油，不用另外放油' },
    { name:'鸡蛋三明治', cuisine:'简餐', diff:1, time:10, cost:8,  tags:['快手'], ing:['吐司','鸡蛋','火腿肠'] },
    { name:'手抓饼',     cuisine:'简餐', diff:1, time:10, cost:8,  tags:['快手'], ing:['手抓饼','鸡蛋','火腿肠'], note:'不用解冻直接小火烙，加个蛋更香' },
    { name:'番茄肉酱意面', cuisine:'简餐', diff:2, time:30, cost:16, tags:[],     ing:['意面','猪肉末','番茄','番茄酱'], note:'意面煮到九分熟，酱炒浓再拌' },
    { name:'蔬菜沙拉',   cuisine:'简餐', diff:1, time:10, cost:10, tags:['减脂','快手','素'], ing:['生菜','黄瓜','玉米'], note:'沙拉酱或油醋汁随意' },
    { name:'鸡胸肉沙拉', cuisine:'简餐', diff:1, time:15, cost:16, tags:['减脂','清淡'], ing:['鸡胸肉','生菜','黄瓜'], note:'鸡胸煎好切条，趁热铺上去' }
  ]
};
