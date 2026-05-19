/**
 * 卜 (Bu) 补充 — 梅花易数 · 六爻起卦
 * 已有：塔罗牌、占星骰子、小六壬、每日运势
 */

var BuShuExtra = (function() {
  'use strict';

  // ==================== 梅花易数 ====================

  var BAGUA = [
    { name:'乾', symbol:'☰', number:1, element:'金', direction:'西北', nature:'天',
      trait:'刚健、积极、创造、领导者',
      desc:'乾为天，刚健中正。代表父亲、首领、刚强者。主创造、开拓、进取之事。',
      good:'事业开拓、创业、领导事务、刚强之事皆吉。',
      bad:'过于刚强易折，注意傲慢和独断。' },
    { name:'兑', symbol:'☱', number:2, element:'金', direction:'西', nature:'泽',
      trait:'喜悦、口才、沟通、少女',
      desc:'兑为泽，悦而亨。代表口舌、喜悦、少女。主交际、娱乐、表达之事。',
      good:'沟通谈判、文艺表演、社交聚会。',
      bad:'注意口舌是非，言语不可过于轻率。' },
    { name:'离', symbol:'☲', number:3, element:'火', direction:'南', nature:'火',
      trait:'明亮、美丽、文明、中女',
      desc:'离为火，光明绚丽。代表文明、美丽、智慧。主文化、艺术、光明之事。',
      good:'学业、文化事业、艺术创作、名声。',
      bad:'火过旺则急躁，注意情绪管理。' },
    { name:'震', symbol:'☳', number:4, element:'木', direction:'东', nature:'雷',
      trait:'震动、行动、长男、起步',
      desc:'震为雷，动而惊。代表行动、变革、长子。主变动、开始、创新之事。',
      good:'新项目启动、变革突破、勇敢之行。',
      bad:'变动太多则不安，注意稳扎稳打。' },
    { name:'巽', symbol:'☴', number:5, element:'木', direction:'东南', nature:'风',
      trait:'入微、渗透、长女、柔顺',
      desc:'巽为风，无孔不入。代表渗透、传播、长女。主商业、流通、传播之事。',
      good:'商业交易、信息传播、谈判渗透。',
      bad:'过于柔顺则优柔寡断，注意立场。' },
    { name:'坎', symbol:'☵', number:6, element:'水', direction:'北', nature:'水',
      trait:'险陷、智慧、中男、流动',
      desc:'坎为水，险而劳。代表智慧、危险、中男。主波折、思考、深谋之事。',
      good:'深度思考、克服困难、智慧取胜。',
      bad:'陷入困境需耐心，水险不可冒进。' },
    { name:'艮', symbol:'☶', number:7, element:'土', direction:'东北', nature:'山',
      trait:'停止、稳重、少男、坚守',
      desc:'艮为山，止而安。代表静止、坚守、少男。主停止、守成、等待之事。',
      good:'守成持重、稳定发展、适时而止。',
      bad:'过于保守则错失良机，注意适度进取。' },
    { name:'坤', symbol:'☷', number:8, element:'土', direction:'西南', nature:'地',
      trait:'柔顺、包容、母亲、承载',
      desc:'坤为地，柔顺包容。代表母亲、大地、柔顺者。主包容、养育、耐心之事。',
      good:'培育、包容、等待时机成熟。',
      bad:'过于被动则失去主动权，需有自己的立场。' }
  ];

  /**
   * 梅花易数起卦（以年月日时数字起卦）
   * 上卦 = (年+月) % 8
   * 下卦 = (日+时) % 8
   * 动爻 = (年+月+日+时) % 6
   */
  function meiHuaQiGua(lunarYear, lunarMonth, lunarDay, shichenIdx) {
    var shichenNum = shichenIdx + 1; // 子=1,丑=2,...,亥=12
    var upperIdx = ((lunarYear + lunarMonth) % 8 + 7) % 8;
    var lowerIdx = ((lunarDay + shichenNum) % 8 + 7) % 8;
    var dongYao = ((lunarYear + lunarMonth + lunarDay + shichenNum) % 6 + 5) % 6;

    var upperGua = BAGUA[upperIdx];
    var lowerGua = BAGUA[lowerIdx];

    // 互卦：234爻为下互，345爻为上互
    var huLowerIdx = ((upperIdx + lowerIdx) % 8 + 7) % 8;
    var huUpperIdx = ((lowerIdx + upperIdx + 1) % 8 + 7) % 8;

    // 变卦：动爻所在卦的反卦
    var dongYaoPosition = dongYao < 3 ? 'lower' : 'upper';
    var changedUpper = upperIdx;
    var changedLower = lowerIdx;
    if (dongYaoPosition === 'lower') {
      changedLower = (lowerIdx + 4) % 8;
    } else {
      changedUpper = (upperIdx + 4) % 8;
    }

    // 体用：不动卦为体，动卦为用
    var tiGua = dongYaoPosition === 'lower' ? upperGua : lowerGua;
    var yongGua = dongYaoPosition === 'lower' ? lowerGua : upperGua;

    // 体用生克
    var wuxingOrder = ['木','火','土','金','水'];
    var tiElem = tiGua.element;
    var yongElem = yongGua.element;
    var relation, relationColor, relationDesc;
    var tiIdx = wuxingOrder.indexOf(tiElem);
    var yongIdx = wuxingOrder.indexOf(yongElem);
    var diff = (yongIdx - tiIdx + 5) % 5;
    if (diff === 0) { relation = '比和'; relationColor = '#6fcf6f'; relationDesc = '用与体五行相同，大吉大利，万事顺利。'; }
    else if (diff === 1) { relation = '用生体'; relationColor = '#6fcf6f'; relationDesc = '用卦生体卦，大吉！事有外力相助，运势上升。'; }
    else if (diff === 2) { relation = '体生用'; relationColor = '#ddaa44'; relationDesc = '体卦生用卦，小耗。需要付出，事情虽可成但费力。'; }
    else if (diff === 3) { relation = '体克用'; relationColor = '#ddaa44'; relationDesc = '体卦克用卦，中吉。事情可掌控，但需要主动去作为。'; }
    else { relation = '用克体'; relationColor = '#cc6666'; relationDesc = '用卦克体卦，不吉。外部压力大，事情难成，当谨慎而行。'; }

    return {
      benGua: { upper: upperGua, lower: lowerGua, name: upperGua.name + '上' + lowerGua.name + '下' },
      huGua: { upper: BAGUA[huUpperIdx], lower: BAGUA[huLowerIdx], name: BAGUA[huUpperIdx].name + '上' + BAGUA[huLowerIdx].name + '下' },
      bianGua: { upper: BAGUA[changedUpper], lower: BAGUA[changedLower], name: BAGUA[changedUpper].name + '上' + BAGUA[changedLower].name + '下' },
      dongYao: dongYao,
      dongYaoPosition: dongYaoPosition,
      tiGua: tiGua,
      yongGua: yongGua,
      relation: relation,
      relationColor: relationColor,
      relationDesc: relationDesc,
      formula: '上卦(' + upperGua.name + '=' + (upperIdx+1) + ')：年' + lunarYear + '+月' + lunarMonth + ' ; 下卦(' + lowerGua.name + '=' + (lowerIdx+1) + ')：日' + lunarDay + '+时' + shichenNum + ' ; 动爻' + (dongYao+1) + ' : 总和%6'
    };
  }

  function meiHuaFromNumbers(n1, n2, n3) {
    var upperIdx = ((n1 % 8) + 7) % 8;
    var lowerIdx = ((n2 % 8) + 7) % 8;
    var dongYao = ((n3 % 6) + 5) % 6;
    // Reuse the same logic but simpler
    var upperGua = BAGUA[upperIdx];
    var lowerGua = BAGUA[lowerIdx];
    var dongYaoPosition = dongYao < 3 ? 'lower' : 'upper';
    var changedUpper = upperIdx;
    var changedLower = lowerIdx;
    if (dongYaoPosition === 'lower') changedLower = (lowerIdx + 4) % 8;
    else changedUpper = (upperIdx + 4) % 8;

    var tiGua = dongYaoPosition === 'lower' ? upperGua : lowerGua;
    var yongGua = dongYaoPosition === 'lower' ? lowerGua : upperGua;

    var wuxingOrder = ['木','火','土','金','水'];
    var tiIdx = wuxingOrder.indexOf(tiGua.element);
    var yongIdx = wuxingOrder.indexOf(yongGua.element);
    var diff = (yongIdx - tiIdx + 5) % 5;
    var relation, relationColor, relationDesc;
    if (diff === 0) { relation = '比和'; relationColor = '#6fcf6f'; relationDesc = '用与体五行相同，大吉大利。'; }
    else if (diff === 1) { relation = '用生体'; relationColor = '#6fcf6f'; relationDesc = '用卦生体卦，大吉！外力相助。'; }
    else if (diff === 2) { relation = '体生用'; relationColor = '#ddaa44'; relationDesc = '体卦生用卦，小耗需付出。'; }
    else if (diff === 3) { relation = '体克用'; relationColor = '#ddaa44'; relationDesc = '体卦克用卦，中吉可掌控。'; }
    else { relation = '用克体'; relationColor = '#cc6666'; relationDesc = '用卦克体卦，不吉需谨慎。'; }

    return {
      benGua: { upper: upperGua, lower: lowerGua, name: upperGua.name + '上' + lowerGua.name + '下' },
      bianGua: { upper: BAGUA[changedUpper], lower: BAGUA[changedLower], name: BAGUA[changedUpper].name + '上' + BAGUA[changedLower].name + '下' },
      dongYao: dongYao,
      relation: relation, relationColor: relationColor, relationDesc: relationDesc,
      formula: '上卦(' + upperGua.name + ')：数' + n1 + '%8 ; 下卦(' + lowerGua.name + ')：数' + n2 + '%8 ; 动爻：数' + n3 + '%6'
    };
  }

  // ==================== 六十四卦释义 ====================

  var GUA64_INTERP = {
    1:  { name:'乾为天', overall:'大吉之象，刚健不息。乾卦六爻纯阳，代表创造、领导、进取。得此卦者，宜主动开拓，积极进取，但需防刚愎自用。', career:'事业有大成之象，宜勇往直前。创业者大吉，领导者宜果断决策。', love:'感情中主动强势，需注意给对方空间。单身者有遇到理想对象的可能。', wealth:'财运亨通，正财旺盛。适合长期投资。' },
    2:  { name:'坤为地', overall:'柔顺包容之象，厚德载物。坤卦六爻纯阴，代表包容、耐心、承载。得此卦者，宜以柔克刚，顺势而为，耐心等待时机。', career:'宜守不宜攻，稳扎稳打。适合执行层面的工作，不宜冒险。', love:'感情温柔体贴，但过于被动。宜主动表达心意。', wealth:'财运平稳，正财为主，不宜投机。' },
    3:  { name:'水雷屯', overall:'万物初生之象，困难重重。屯卦代表事物初创阶段的艰难。得此卦者，事业初创多有波折，需坚持初心，不可轻言放弃。', career:'创业初期困难较多，需要耐心和毅力。', love:'感情处于萌芽期，需要呵护培养。', wealth:'财运未开，投入大收获小，需耐心等待。' },
    4:  { name:'山水蒙', overall:'启蒙教育之象，混沌初开。蒙卦代表启蒙、学习、解惑。得此卦者，宜虚心求教，接受指导，不可自以为是。', career:'宜多学习充电，向有经验的前辈请教。', love:'感情上比较懵懂，需要时间去了解对方。', wealth:'财路不明，不宜盲目投资。' },
    5:  { name:'水天需', overall:'等待时机之象，以需待时。需卦代表等待、需求、期盼。得此卦者，时机未到，宜静候佳音，不宜强求。', career:'当前宜按兵不动，等待更好的机会。', love:'感情需要耐心等待，缘分未到不必强求。', wealth:'财运需等待，不宜匆忙决策。' },
    6:  { name:'天水讼', overall:'争讼是非之象，宜和为贵。讼卦代表争执、诉讼、辩论。得此卦者，易有口舌之争，宜以和为贵，退一步海阔天空。', career:'职场易有纷争，宜低调处事，避免正面冲突。', love:'感情易生口角，需冷静沟通。', wealth:'财运因争执受损，宜和解息事。' },
    7:  { name:'地水师', overall:'统兵出征之象，纪律严明。师卦代表组织、军队、纪律。得此卦者，宜建立规则秩序，领导团队，但需以正道行事。', career:'适合团队管理，宜建立规范和流程。', love:'关系中一方主导性强，需平衡权力。', wealth:'财运与团队合作相关，集体力量大。' },
    8:  { name:'水地比', overall:'亲比依附之象，团结一致。比卦代表亲近、团结、合作。得此卦者，人际关系和谐，宜与人合作共赢。', career:'团队合作融洽，宜借助他人力量共同发展。', love:'感情亲密和谐，关系稳定。', wealth:'合作求财有利，宜与人合伙。' },
    9:  { name:'风天小畜', overall:'小有积蓄之象，力量未足。小畜卦代表小规模的积累和储蓄。得此卦者，虽有收获但不多，需继续积累。', career:'事业小成但未到火候，继续努力。', love:'感情进展缓慢，需要耐心经营。', wealth:'财运小有收获，宜储蓄积累。' },
    10: { name:'天泽履', overall:'如履薄冰之象，谨慎行事。履卦代表实践、履行、谨慎。得此卦者，做事需小心谨慎，按规矩来，不可莽撞。', career:'工作中需处处小心，严格遵守规章制度。', love:'感情中需注意言行，避免冒犯对方。', wealth:'财运尚可，但需谨慎理财。' },
    11: { name:'地天泰', overall:'通泰和谐之象，天地交泰。泰卦是上上卦，代表和谐、通畅、顺利。得此卦者，万事亨通，上下齐心，是最吉利的卦象之一。', career:'事业蒸蒸日上，上下关系和谐，大有可为。', love:'感情美满和谐，是最佳的恋爱和婚姻时机。', wealth:'财运亨通，投资获利，万事顺利。' },
    12: { name:'天地否', overall:'闭塞不通之象，天地不交。否卦代表阻塞、隔阂、不通。得此卦者，诸事不顺，宜退守自保，等待局势转变。', career:'事业遇到瓶颈，上下沟通不畅，宜低调等待。', love:'感情出现隔阂和误会，需主动沟通化解。', wealth:'财运闭塞，不宜投资，守成为上。' },
    13: { name:'天火同人', overall:'志同道合之象，广结善缘。同人卦代表志同道合、团结一致。得此卦者，人际关系良好，朋友相助，适合团队活动。', career:'适合团队合作项目，人脉资源丰富。', love:'宜通过朋友介绍认识对象，感情基于共同兴趣。', wealth:'朋友引荐的财路有利，合作求财。' },
    14: { name:'火天大有', overall:'大获丰收之象，富足昌盛。大有卦代表富裕、收获、成功。得此卦者，丰收在望，事业有成，是极为吉利的卦象。', career:'事业大丰收，之前的努力都将得到回报。', love:'感情收获满满，关系进入甜蜜期。', wealth:'财运极佳，正偏财均旺，适合投资。' },
    15: { name:'地山谦', overall:'谦逊受益之象，满招损谦受益。谦卦代表谦虚、低调、退让。得此卦者，宜保持谦逊态度，不骄不躁，自然会得到尊重和帮助。', career:'谦虚待人会得到上司赏识和同事支持。', love:'谦和的态度让感情更加和谐。', wealth:'财运稳定，不宜高调炫耀。' },
    16: { name:'雷地豫', overall:'愉悦安乐之象，顺势而动。豫卦代表喜悦、安乐、准备。得此卦者，心情愉悦，事情进展顺利，但需防乐极生悲。', career:'工作顺利，心情愉快，但不可松懈。', love:'感情甜蜜愉快，享受当下的美好时光。', wealth:'财运随心情而旺，但需理性消费。' },
    17: { name:'泽雷随', overall:'随和顺从之象，随机应变。随卦代表跟随、顺应、灵活。得此卦者，宜顺势而为，随机应变，不可固执己见。', career:'宜顺应公司政策和大环境，灵活调整策略。', love:'感情中宜多体谅对方，随缘不强求。', wealth:'财运随市场变化，宜灵活调整策略。' },
    18: { name:'山风蛊', overall:'腐败革新之象，拨乱反正。蛊卦代表腐败、问题、需要整治。得此卦者，发现有积弊需要革除，宜下决心整顿。', career:'工作中发现问题需及时纠正，不可拖延。', love:'感情中的旧有问题需要正视和解决。', wealth:'财务漏洞需要修补，宜重新规划。' },
    19: { name:'地泽临', overall:'亲临督导之象，居高临下。临卦代表来临、临近、监督。得此卦者，好运将至，宜做好迎接准备。', career:'升职或重要机会即将来临，做好准备。', love:'好的缘分正在靠近，保持开放的心态。', wealth:'财运即将好转，但需做好准备。' },
    20: { name:'风地观', overall:'观察审视之象，静观其变。观卦代表观察、观望、学习。得此卦者，宜多观察少行动，深思熟虑后再做决定。', career:'多观察市场动向和同行动态，不必急于出手。', love:'先观察了解对方，不宜急于表白。', wealth:'观望为主，暂不急于投资。' },
    21: { name:'火雷噬嗑', overall:'咀嚼消化之象，克服障碍。噬嗑卦代表咬合、克服、消化。得此卦者，正在经历困难但终将克服，需要咬紧牙关。', career:'遇到工作中的难题，需要下决心去突破。', love:'感情中有障碍需要共同克服。', wealth:'财运有阻碍，需要想办法突破。' },
    22: { name:'山火贲', overall:'装饰美化之象，文采斐然。贲卦代表装饰、美化、文化。得此卦者，宜注重外在形象和包装，但不可舍本逐末。', career:'适合从事文化创意和设计类工作。', love:'感情中注重浪漫和仪式感。', wealth:'财运与创意和文化相关，包装很重要。' },
    23: { name:'山地剥', overall:'剥落衰败之象，顺势退守。剥卦代表剥落、衰退、侵蚀。得此卦者，运势下行，宜退守自保，等待转机。', career:'事业面临下滑，宜保存实力等待时机。', love:'感情趋于冷淡，需要重新评估关系。', wealth:'财运衰退，宜缩减开支保守理财。' },
    24: { name:'地雷复', overall:'一阳来复之象，否极泰来。复卦代表恢复、回归、重生。得此卦者，寒冬将尽春天将至，运势即将回升。', career:'事业低谷即将过去，新的机会正在酝酿。', love:'感情回暖，旧情复燃或新缘将至。', wealth:'财运开始复苏，可以逐步布局。' },
    25: { name:'天雷无妄', overall:'真实无妄之象，不可有非分之想。无妄卦代表真实、不虚妄、诚实。得此卦者，宜脚踏实地，不可投机取巧。', career:'诚实做事会有好结果，投机取巧则容易失败。', love:'真诚的感情最珍贵，不可虚情假意。', wealth:'正财稳定，不宜投机冒险。' },
    26: { name:'山天大畜', overall:'大蓄积之象，厚积薄发。大畜卦代表大量积蓄、储备、培养。得此卦者，正在积累阶段，量变即将引发质变。', career:'厚积薄发的前夜，继续积累知识和资源。', love:'感情积累到一定程度就会有突破。', wealth:'大规模积蓄的时机，宜长期投资。' },
    27: { name:'山雷颐', overall:'颐养天年之象，自食其力。颐卦代表颐养、养生、自养。得此卦者，宜注重身心健康，自力更生。', career:'靠自己的实力发展，不宜依赖他人。', love:'独立自主的关系更健康。', wealth:'自食其力，正财稳定。' },
    28: { name:'泽风大过', overall:'大过之象，过度则危。大过卦代表过度、越界、极端。得此卦者，事情超出了正常范围，需要及时调整回到平衡。', career:'压力过大需减负，项目过度扩张需收缩。', love:'感情中一方付出过多，需要找回平衡。', wealth:'财务压力过大，宜缩减负债。' },
    29: { name:'坎为水', overall:'重重险阻之象，以险避险。坎卦代表危险、陷阱、困难。得此卦者，面临层层困难，需要智慧和勇气去面对。', career:'工作中陷阱多，需步步为营。', love:'感情经历考验，需要共同面对困难。', wealth:'财运有风险，投资需极度谨慎。' },
    30: { name:'离为火', overall:'光明依附之象，柔丽中正。离卦代表光明、美丽、依附。得此卦者，前途光明，但需依附于正确的目标和价值观。', career:'事业前景光明，适合文化创意行业。', love:'热情洋溢的感情，但需注意适度。', wealth:'财运光明，适合文化类投资。' },
    31: { name:'泽山咸', overall:'感而遂通之象，两情相悦。咸卦代表感应、感动、感情。得此卦者，感情运极佳，男女相互吸引，心意相通。', career:'工作中人际关系融洽，合作愉快。', love:'极佳的感情卦！适合表白、求婚、确定关系。', wealth:'合作求财顺利，与人合作愉快。' },
    32: { name:'雷风恒', overall:'恒久不变之象，持之以恒。恒卦代表恒久、持久、稳定。得此卦者，宜坚持长期目标，不可半途而废。', career:'适合长期稳定发展的事业，不宜频繁跳槽。', love:'感情稳定持久，适合婚姻和长期承诺。', wealth:'长期投资回报稳定，不宜短线操作。' },
    33: { name:'天山遁', overall:'退避隐遁之象，以退为进。遁卦代表退避、隐退、远离。得此卦者，宜暂时退让以保全自身，等待时机。', career:'宜暂避锋芒，不宜正面硬碰。', love:'感情中需要适当退让和空间。', wealth:'收缩投资规模，以守为主。' },
    34: { name:'雷天大壮', overall:'强壮盛大之象，不可妄动。大壮卦代表强壮、盛大、力量。得此卦者，力量充沛但不可滥用，以免乐极生悲。', career:'事业处于强势期，但需戒骄戒躁。', love:'关系热烈但需防止过于强势。', wealth:'财运旺盛，但需防止过度投资。' },
    35: { name:'火地晋', overall:'旭日东升之象，前途光明。晋卦代表前进、晋升、进步。得此卦者，事业蒸蒸日上，晋升有望。', career:'晋升的好时机，把握机会展现自己。', love:'感情稳步发展，关系更进一步。', wealth:'财运上升，正财收入有增加趋势。' },
    36: { name:'地火明夷', overall:'光明受损之象，韬光养晦。明夷卦代表光明被遮蔽、受伤。得此卦者，才华被压制，宜韬光养晦等待时机。', career:'怀才不遇，宜低调积累等待转机。', love:'感情受挫或不被理解，需要耐心和智慧。', wealth:'财运低迷，宜节流而非开源。' },
    37: { name:'风火家人', overall:'家庭和睦之象，各司其职。家人卦代表家庭、家人、内部关系。得此卦者，家庭和睦，内部团结，宜关注家庭事务。', career:'适合家族企业或内部管理工作。', love:'家庭关系和谐，适合谈婚论嫁。', wealth:'家庭财务稳定，宜共同规划。' },
    38: { name:'火泽睽', overall:'乖离不合之象，求同存异。睽卦代表乖离、分歧、差异。得此卦者，人际关系出现分歧，宜求同存异。', career:'团队意见不合，需要协调和包容。', love:'双方出现分歧，需要互相理解和尊重。', wealth:'合作伙伴意见不一致，需谨慎处理。' },
    39: { name:'水山蹇', overall:'艰难险阻之象，知难而退。蹇卦代表艰难、阻碍、困顿。得此卦者，前路艰难，宜暂时退守，另寻出路。', career:'事业发展遇到较大障碍，需要调整方向。', love:'感情路上有困难，需要共同努力。', wealth:'财运受阻，适可而止。' },
    40: { name:'雷水解', overall:'解除困难之象，雨过天晴。解卦代表解除、解放、解决。得此卦者，困难即将过去，问题将得到解决。', career:'工作中的难题即将化解，曙光在前。', love:'感情矛盾得到化解，关系趋于缓和。', wealth:'财务困难即将解除，情况好转。' },
    41: { name:'山泽损', overall:'损下益上之象，有失有得。损卦代表损失、减少、牺牲。得此卦者，虽然有所损失，但长远看是有益的。', career:'短期可能有损失，但为了长远发展值得。', love:'关系中需要适当妥协和牺牲。', wealth:'有破财之象，但舍小得大。' },
    42: { name:'风雷益', overall:'增益助人之象，利有攸往。益卦代表增益、利益、帮助。得此卦者，好运增加，宜积极行动，也宜帮助他人。', career:'事业上有贵人相助，发展顺利。', love:'相互滋养的关系，彼此成长。', wealth:'财运增长，投资获利。' },
    43: { name:'泽天夬', overall:'果决决断之象，当断则断。夬卦代表决断、果断、裁决。得此卦者，面临重要抉择，宜果断决策不宜拖延。', career:'面临重要决策，该断就断不要犹豫。', love:'暧昧关系需要明确，该表白就表白。', wealth:'投资决策宜果断，犹豫会错失良机。' },
    44: { name:'天风姤', overall:'不期而遇之象，邂逅相逢。姤卦代表相遇、邂逅、偶然。得此卦者，有意外的相遇和邂逅，但需注意分辨好坏。', career:'有意外的合作机会，但需谨慎评估。', love:'有意外的邂逅和桃花运，但需注意对方是否靠谱。', wealth:'有意外的财务机会，但需谨慎。' },
    45: { name:'泽地萃', overall:'聚集汇总之象，精英荟萃。萃卦代表聚集、汇集、精华。得此卦者，团队力量汇聚，众人拾柴火焰高。', career:'团队力量强大，适合大型项目和集体活动。', love:'通过社交活动认识对象的机会大。', wealth:'聚集资金办大事，合众人之力求财。' },
    46: { name:'地风升', overall:'步步高升之象，循序渐进。升卦代表上升、晋升、提升。得此卦者，运势上升，宜一步一个脚印向上发展。', career:'升职加薪的好时机，持续努力即可。', love:'感情不断升温，关系逐步升级。', wealth:'财运逐步上升，稳健增长。' },
    47: { name:'泽水困', overall:'穷困潦倒之象，坚守正道。困卦代表困境、贫穷、受困。得此卦者，陷入困境之中，需坚守正道等待救援。', career:'事业陷入困境，需寻求帮助和新的突破。', love:'感情遇到瓶颈，需要双方共同努力。', wealth:'财务紧张，宜开源节流。' },
    48: { name:'水风井', overall:'井养不穷之象，修德养民。井卦代表水井、源泉、滋养。得此卦者，宜修德养性，挖掘自身潜力。', career:'深耕已有资源，挖掘内部潜力。', love:'感情需要深度经营和滋养。', wealth:'稳定财源最重要，不宜频繁变动。' },
    49: { name:'泽火革', overall:'变革更新之象，顺势而变。革卦代表变革、改革、革命。得此卦者，万事到了需要改变的时候，变则通。', career:'行业或岗位变革在即，积极拥抱变化。', love:'关系需要改变旧有模式，开启新篇章。', wealth:'投资策略需要改变，宜重新布局。' },
    50: { name:'火风鼎', overall:'鼎新革故之象，稳固根基。鼎卦代表鼎器、稳固、革新。得此卦者，基础稳固，宜在此之上开创新局面。', career:'根基稳固，适合开展新业务。', love:'感情基础牢固，可以考虑进一步发展。', wealth:'财务基础好，可以适度扩展投资。' },
    51: { name:'震为雷', overall:'震惊百里之象，临危不乱。震卦代表震动、震惊、雷霆。得此卦者，突遇变故，需保持冷静应对。', career:'职场突有变动，保持冷静应对即可。', love:'感情中突有波折，不要惊慌。', wealth:'市场突然波动，冷静观察再行动。' },
    52: { name:'艮为山', overall:'止于当止之象，适可而止。艮卦代表停止、静止、止步。得此卦者，宜适可而止，不可贪多求快。', career:'当前宜稳守，不宜盲目扩张。', love:'感情发展到一定阶段，宜停下来沉淀。', wealth:'投资适可而止，见好就收。' },
    53: { name:'风山渐', overall:'循序渐进之象，不可急进。渐卦代表渐进、逐步、慢慢来。得此卦者，事情进展缓慢但稳步推进，急不得。', career:'事业稳步发展，急不得，慢慢积累。', love:'感情渐进发展，日久生情。', wealth:'财富慢慢积累，长期投资见成效。' },
    54: { name:'雷泽归妹', overall:'婚嫁结合之象，以礼相待。归妹卦代表婚嫁、结合、归宿。得此卦者，适合谈婚论嫁，但需以正道为之。', career:'适合合作和结盟，但需注意契约精神。', love:'适合谈婚论嫁，但需遵循礼仪规范。', wealth:'合作求财，但合同条款需明确。' },
    55: { name:'雷火丰', overall:'丰盛盈满之象，盛极必衰。丰卦代表丰盛、丰盈、盛大。得此卦者，运势极佳，但需知盛极必衰之理，不要得意忘形。', career:'事业达到巅峰期，保持清醒头脑。', love:'感情热烈而丰盛，享受当下但不可放纵。', wealth:'财运极佳，但需未雨绸缪。' },
    56: { name:'火山旅', overall:'行旅在外之象，客居他乡。旅卦代表旅行、客居、流动。得此卦者，在外奔波，宜入乡随俗，灵活应变。', career:'适合出差或变化较多的工作。', love:'缘分可能在旅途中出现，远距离恋爱需经营。', wealth:'财运在外，适合跨地域业务。' },
    57: { name:'巽为风', overall:'柔顺渗透之象，无孔不入。巽卦代表风、渗透、柔顺。得此卦者，宜以柔克刚，以渗透的方式推进事务。', career:'适合市场营销和传播类工作。', love:'温柔体贴的态度最能打动人。', wealth:'细水长流的理财方式最有效。' },
    58: { name:'兑为泽', overall:'喜悦和悦之象，以悦待人。兑卦代表喜悦、口才、和谐。得此卦者，人际关系良好，精神愉悦，宜社交。', career:'适合与人打交道的工作，谈吐有魅力。', love:'感情甜蜜愉快，适合约会和表达爱意。', wealth:'社交带来的财运，人脉即财脉。' },
    59: { name:'风水涣', overall:'涣散分离之象，收聚人心。涣卦代表涣散、分散、离散。得此卦者，人心涣散宜收聚，组织松散宜整顿。', career:'团队凝聚力下降，需要重新团结。', love:'感情趋于疏离，需要主动拉近距离。', wealth:'资金分散，宜集中管理。' },
    60: { name:'水泽节', overall:'节制适度之象，过犹不及。节卦代表节制、约束、适度。得此卦者，凡事有度，过犹不及，宜保持中庸之道。', career:'工作节奏需要把控，不可过度劳累。', love:'感情中需要适度的距离和空间。', wealth:'理财需节制，量入为出。' },
    61: { name:'风泽中孚', overall:'诚信为本之象，以诚待人。中孚卦代表诚信、信任、忠实。得此卦者，以诚信待人必得善报，欺骗则自食其果。', career:'诚信是事业发展的基石，保持初心。', love:'真诚的感情最可贵，以诚相待。', wealth:'诚信经营带来稳定财运。' },
    62: { name:'雷山小过', overall:'小有过越之象，矫枉过正。小过卦代表小的过度、略微越界。得此卦者，小事可稍微出格，大事必须守正。', career:'小的地方可以灵活变通，大方向不能偏离。', love:'小的争吵不妨碍大局，但不可越界。', wealth:'小的开销可以灵活，大额投资需谨慎。' },
    63: { name:'水火既济', overall:'事已成事之象，居安思危。既济卦代表完成、成功、圆满。得此卦者，事情圆满成功，但物极必反，需居安思危。', career:'项目圆满完成，但需为下一阶段做准备。', love:'感情修成正果，但需继续经营维护。', wealth:'投资获利了结，宜重新规划。' },
    64: { name:'火水未济', overall:'事未完成之象，继续努力。未济卦代表未完成、未成功、进行中。得此卦者，事情还在进行中，需继续努力不可松懈。', career:'事业还在发展过程中，坚持就是胜利。', love:'感情还在发展中，需继续用心经营。', wealth:'财富积累还在进行，保持节奏。' }
  };

  /**
   * 获取卦象解释（含自动生成的扩展解读）
   * @param {number} guaNum - 卦序号 (1-64)
   */
  function getGuaInterpretation(guaNum) {
    var base = GUA64_INTERP[guaNum];
    if (!base) return { name:'未知卦', overall:'暂无该卦的解释数据。', career:'暂无。', love:'暂无。', wealth:'暂无。', health:'暂无。', travel:'暂无。' };

    // 根据卦名和overall自动生成扩展解读
    var name = base.name || '未知卦';
    var overall = base.overall || '';

    // 健康（从卦象元素推导）
    var health = autoHealth(name, overall);
    // 旅途（从卦象名称推导）
    var travel = autoTravel(name, overall);
    // 寻物
    var lost = autoLost(name, overall);

    return {
      name: base.name,
      overall: base.overall,
      career: base.career,
      love: base.love,
      wealth: base.wealth,
      health: base.health || health,
      travel: base.travel || travel,
      lost: base.lost || lost
    };
  }

  // 根据卦名和overall自动生成健康解读
  function autoHealth(name, overall) {
    if (overall.indexOf('大吉') !== -1 || overall.indexOf('上上') !== -1) return '健康运势良好，身心和谐。规律作息和适当运动即可保持最佳状态。';
    if (overall.indexOf('不吉') !== -1 || overall.indexOf('凶') !== -1 || overall.indexOf('险') !== -1) return '健康方面需要多加注意。压力大的时期容易免疫力下降，注意劳逸结合。定期体检不宜疏忽，小病早治。';
    if (overall.indexOf('水') !== -1 || name.indexOf('坎') !== -1) return '肾和泌尿系统需要关注。多喝水，注意腰部保暖。情绪方面容易焦虑，建议适当冥想或散步来放松心情。';
    if (overall.indexOf('火') !== -1 || name.indexOf('离') !== -1) return '心火偏旺，注意血压和心血管保养。避免过度激动和劳累。饮食清淡，少辛辣。夏季尤其要注意防暑。';
    if (overall.indexOf('山') !== -1 || name.indexOf('艮') !== -1) return '脾胃是重点养护对象。消化系统容易出小问题——注意饮食规律，不要暴饮暴食。适当运动促进消化。';
    if (overall.indexOf('风') !== -1 || name.indexOf('巽') !== -1) return '注意呼吸系统和过敏反应。换季时容易感冒，适当增减衣物。精神上压力适中，保持心情舒畅即可。';
    if (overall.indexOf('雷') !== -1 || name.indexOf('震') !== -1) return '神经系统容易紧张，注意头痛和失眠问题。避免咖啡因过量，睡前做些放松练习。肝气旺盛时多到户外走走。';
    if (overall.indexOf('泽') !== -1 || name.indexOf('兑') !== -1) return '口腔和咽喉健康需留意。多喝水保持黏膜湿润。情绪方面偏于愉悦，这对健康本身就是一剂良药。';
    if (overall.indexOf('地') !== -1 || name.indexOf('坤') !== -1 || overall.indexOf('土') !== -1) return '体质总体稳健，但需注意脾胃的调理。养成良好的饮食习惯，避免生冷食物。适度锻炼能大幅提升身体状态。';
    return '健康运势平稳，此时适合做一次常规体检。规律作息、均衡饮食是基础。保持乐观的心态是最好的良药。';
  }

  // 根据卦名和overall自动生成出行解读
  function autoTravel(name, overall) {
    if (overall.indexOf('大吉') !== -1 || name.indexOf('泰') !== -1) return '出行大利！旅途顺利，适合远行和旅游。途中可能有意外的惊喜和贵人相助。';
    if (overall.indexOf('不吉') !== -1 || overall.indexOf('凶') !== -1) return '出行需特别谨慎。行程容易遇到变数——航班延误、交通堵塞等。重要行程提前做好两手准备。';
    if (name.indexOf('旅') !== -1) return '此卦与旅行息息相关。旅途本身即是修行的道场。在外奔波中注意保管好财物，入乡随俗灵活应变。';
    if (overall.indexOf('退') !== -1 || overall.indexOf('守') !== -1 || name.indexOf('遁') !== -1) return '当前不宜远行，宜暂时退守家中。若必须出行，宜选择近处短途，勿去陌生偏远之地。';
    if (overall.indexOf('等') !== -1 || overall.indexOf('待') !== -1 || name.indexOf('需') !== -1) return '出行计划可能需要等待一段时间。时机尚未成熟就别急着出发——等一等天气会更好。';
    if (overall.indexOf('前') !== -1 || overall.indexOf('进') !== -1 || overall.indexOf('晋') !== -1) return '出行运势良好，有前进和上升之兆。适合为了事业或学业而出行——带着目标出发的旅途最有收获。';
    if (overall.indexOf('困') !== -1 || overall.indexOf('蹇') !== -1 || overall.indexOf('难') !== -1) return '出行容易遭遇障碍。提前做好攻略，备好应急方案。最困难的路往往通向最美的风景。';
    return '出行运势中等。出行前做好规划和准备即可。旅途中的小插曲不必太在意——随遇而安是旅行最好的心态。';
  }

  // 根据卦名和overall自动生成寻物解读
  function autoLost(name, overall) {
    if (overall.indexOf('大吉') !== -1 || overall.indexOf('上上') !== -1) return '失物有望找回。仔细想想最后放置的位置，多半就在附近。问问身边的人是否看到过。';
    if (overall.indexOf('不吉') !== -1 || overall.indexOf('凶') !== -1 || overall.indexOf('空') !== -1) return '失物找回难度较大。可能已被转移或不在原地。如果重要物品，建议调取监控或询问管理人员。';
    if (overall.indexOf('等') !== -1 || overall.indexOf('迟') !== -1) return '失物找回需要一些时间和耐心。不要着急，它可能在不经意间自己出现。';
    if (overall.indexOf('前') !== -1 || overall.indexOf('晋') !== -1 || name.indexOf('升') !== -1) return '失物可能在上方或高处——检查书架顶层、衣柜上方等。可能在移动中被放到了较高的位置。';
    if (overall.indexOf('水') !== -1 || name.indexOf('坎') !== -1) return '失物可能与水源或低处有关。检查洗手间、厨房水槽附近、地下室等湿度较高的地方。';
    if (overall.indexOf('火') !== -1 || name.indexOf('离') !== -1) return '失物可能在光线明亮的地方或靠近电源处。检查窗台、灯具附近、电器旁边。午时寻找最有利。';
    return '失物有寻回的可能。先冷静回忆最后一次看到的经过，按顺序逐步排查。不要慌乱，清楚比速度更重要。';
  }

  // ==================== 六爻爻位参考表 ====================

  var YAO_POSITION_GUIDE = [
    { pos:'初爻', level:'最底层', meaning:'初爻代表事情的起始和开端。它像一颗种子——虽然埋在地下看不见，但已经决定了这棵树将来会长成什么样。问事：这件事的根基是什么？谁是推动它开始的人？宜：打好基础，不急求成。忌：好高骛远，轻视细节。' },
    { pos:'二爻', level:'下层', meaning:'二爻进入内部的运转层。它代表你在这个局势中的实际位置和你能掌控的资源。问事：我在这个局面中处于什么位置？手上有哪些资源可用？宜：踏实做事，展现能力。忌：越位揽权，锋芒太露。' },
    { pos:'三爻', level:'中层·过渡', meaning:'三爻是最不安分的爻位——它处于下卦之顶，即将跨入上卦却还未到达。这是一个"不上不下"的过渡期。问事：什么在阻碍我？如何突破？宜：灵活应变，寻找突破口。忌：急躁冒进，自乱阵脚。' },
    { pos:'四爻', level:'上层·近君', meaning:'四爻进入了决策层——它靠近五爻的"君位"，是决策圈中的一员。问事：上面的领导怎么看我？我得到了足够的支持吗？宜：与上级保持良好沟通，做好辅助工作。忌：功高震主，越位代庖。' },
    { pos:'五爻', level:'至尊位', meaning:'五爻是君王之位——卦象的精神核心。它代表事情的最高决策者或最理想的状态。问事：这件事的最佳结果是什么？谁是关键决策者？宜：胸怀全局，果断决策。忌：优柔寡断，纵容偏私。' },
    { pos:'上爻', level:'最终·终结', meaning:'上爻代表事情的最后走向和结局。但它也常常走向反面——盛极必衰，物极必反。问事：这件事最后会怎样收场？我需要为结局做什么准备？宜：居安思危，善始善终。忌：得意忘形，不留后路。' }
  ];

  /**
   * 获取动爻的解释
   */
  function getYaoPositionInterpretation(yaoPos) {
    return YAO_POSITION_GUIDE[yaoPos] || { pos:'爻位', meaning:'暂无该爻位的解释。' };
  }

  /**
   * 根据上下卦获取六十四卦序号
   * 上卦(1-8) 下卦(1-8) → 64卦序号(1-64)
   * 使用传统卦序: (上卦号-1)*8 + 下卦号
   */
  function getGuaNumByTrigrams(upperIdx, lowerIdx) {
    // upperIdx, lowerIdx: 0-based index in BAGUA array (0=乾, 1=兑, 2=离, 3=震, 4=巽, 5=坎, 6=艮, 7=坤)
    // 转换为1-based: 乾1, 兑2, 离3, 震4, 巽5, 坎6, 艮7, 坤8
    var upperNum = upperIdx + 1;
    var lowerNum = lowerIdx + 1;
    return (upperNum - 1) * 8 + lowerNum;
  }

  // ==================== 六爻快速起卦 (金钱卦) ====================

  function liuYaoCoinToss() {
    // 模拟三枚铜钱摇卦6次
    var yaoLines = [];
    var YAO_TYPES = [
      { type:'老阳', symbol:'⚊⚊', mark:'○', bian:'阴', desc:'阳极变阴' },
      { type:'少阴', symbol:'⚋', mark:'', bian:'阴', desc:'不变' },
      { type:'少阳', symbol:'⚊', mark:'', bian:'阳', desc:'不变' },
      { type:'老阴', symbol:'⚋⚋', mark:'×', bian:'阳', desc:'阴极变阳' }
    ];

    for (var i = 0; i < 6; i++) {
      var toss = 0;
      for (var j = 0; j < 3; j++) toss += Math.random() < 0.5 ? 2 : 3; // 正面2, 反面3
      var type;
      if (toss === 6) type = YAO_TYPES[0];   // 老阳 (三个正面)
      else if (toss === 7) type = YAO_TYPES[2]; // 少阳 (两正一反)
      else if (toss === 8) type = YAO_TYPES[1]; // 少阴 (两反一正)
      else type = YAO_TYPES[3];                   // 老阴 (三个反面)

      yaoLines.unshift({
        position: i + 1, // 初爻=1, 上爻=6 (bottom to top)
        posName: ['','初爻','二爻','三爻','四爻','五爻','上爻'][i+1],
        type: type,
        isYang: type.type === '老阳' || type.type === '少阳',
        isChanging: type.type === '老阳' || type.type === '老阴'
      });
    }

    // 本卦和变卦
    var benGuaNum = 0, bianGuaNum = 0;
    for (var k = 0; k < 6; k++) {
      if (yaoLines[k].isYang) benGuaNum |= (1 << k);
      if (yaoLines[k].isChanging) {
        bianGuaNum |= (yaoLines[k].isYang ? 0 : (1 << k));
      } else {
        if (yaoLines[k].isYang) bianGuaNum |= (1 << k);
      }
    }

    return {
      yaoLines: yaoLines,
      benGuaNum: benGuaNum,
      bianGuaNum: bianGuaNum
    };
  }

  // ==================== 对外接口 ====================

  return {
    BAGUA: BAGUA,
    GUA64_INTERP: GUA64_INTERP,
    meiHuaQiGua: meiHuaQiGua,
    meiHuaFromNumbers: meiHuaFromNumbers,
    liuYaoCoinToss: liuYaoCoinToss,
    getGuaInterpretation: getGuaInterpretation,
    getGuaNumByTrigrams: getGuaNumByTrigrams,
    getYaoPositionInterpretation: getYaoPositionInterpretation,
    YAO_POSITION_GUIDE: YAO_POSITION_GUIDE
  };
})();
