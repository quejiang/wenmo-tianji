/**
 * 医 (Yi) — 五术之"医"
 * 中医体质辨识 · 五行脏腑 · 节气养生 · 药膳
 */

var YiShu = (function() {
  'use strict';

  // ==================== 中医体质辨识 ====================

  var CONSTITUTIONS = [
    {
      id: 'pinghe', name: '平和质', emoji: '☯', color: '#6fcf6f',
      trait: '阴阳气血调和，体态适中，面色润泽，精力充沛',
      desc: '先天禀赋良好，后天调养得当。性格随和开朗，对自然环境和社会环境适应能力强。',
      body: '体型匀称健壮，面色肤色润泽，头发稠密有光泽，目光有神，唇色红润',
      psych: '性格随和开朗，情绪稳定',
      risk: '患病少，即使生病也容易康复',
      care: ['保持现有的良好生活习惯','饮食有节，起居有常','适度运动，保持心情舒畅','定期体检，防病于未然'],
      avoid: []
    },
    {
      id: 'qixu', name: '气虚质', emoji: '😮‍💨', color: '#88aacc',
      trait: '元气不足，疲乏、气短、自汗，肌肉松软不实',
      desc: '元气不足，以疲乏、气短、自汗等气虚表现为主要特征。多因先天不足、久病或过度劳累所致。',
      body: '肌肉松软不实，面色偏黄或苍白，目光少神，唇色少华，声音低怯',
      psych: '性格内向，情绪不稳定，胆小不喜欢冒险',
      risk: '易患感冒、内脏下垂等病，病后康复缓慢',
      care: ['多吃益气健脾食物：山药、小米、红枣、鸡肉、牛肉','按摩足三里、气海穴','避免过度劳累和大汗运动','练习太极拳、八段锦等柔和运动'],
      avoid: ['生冷食物','过度运动消耗元气','长期熬夜']
    },
    {
      id: 'yangxu', name: '阳虚质', emoji: '🥶', color: '#cc9966',
      trait: '阳气不足，畏寒怕冷，手足不温，喜热饮食',
      desc: '阳气不足，以畏寒怕冷、手足不温等虚寒表现为主。多因先天不足或久居寒冷环境所致。',
      body: '肌肉松软，体型偏胖，面色柔白，口唇色淡',
      psych: '性格多沉静、内向',
      risk: '易患痰饮、肿胀、泄泻等，感邪易从寒化',
      care: ['多吃温阳食物：羊肉、韭菜、核桃、生姜、桂圆','艾灸关元、命门穴','注意腰腹部保暖','多晒太阳，尤其背部','冬季早睡晚起'],
      avoid: ['生冷寒凉食物','空调温度过低','夜间户外活动']
    },
    {
      id: 'yinxu', name: '阴虚质', emoji: '🥵', color: '#ee8866',
      trait: '阴液亏少，口燥咽干，手足心热，体型偏瘦',
      desc: '阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征。多因熬夜、久病、房劳伤精所致。',
      body: '体型偏瘦，面色潮红，口燥咽干，大便干燥',
      psych: '性情急躁，外向好动，活泼',
      risk: '易患虚劳、失精、不寐等，感邪易从热化',
      care: ['多吃滋阴食物：银耳、百合、雪梨、鸭肉、绿豆','按摩太溪、三阴交穴','避免熬夜和过度劳累','练瑜伽、冥想等安静运动'],
      avoid: ['辛辣燥热食物','熬夜','剧烈运动出汗过多']
    },
    {
      id: 'tanshi', name: '痰湿质', emoji: '😐', color: '#aaaa77',
      trait: '痰湿凝聚，形体肥胖，腹部肥满，口黏苔腻',
      desc: '痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等痰湿表现为主要特征。多因饮食不节、缺乏运动所致。',
      body: '体型肥胖，腹部肥满松软，面部皮肤油脂较多，多汗且黏',
      psych: '性格温和、稳重，善于忍耐',
      risk: '易患消渴、中风、胸痹等',
      care: ['多吃健脾利湿食物：薏米、红豆、冬瓜、白扁豆','按摩丰隆、阴陵泉穴','坚持有氧运动：快走、游泳、骑车','少坐多动，每天运动30分钟以上'],
      avoid: ['肥甘厚腻食物','甜食饮料','久坐不动']
    },
    {
      id: 'shire', name: '湿热质', emoji: '😤', color: '#cc8844',
      trait: '湿热内蕴，面垢油光，口苦口干，大便黏滞',
      desc: '湿热内蕴，以面垢油光、口苦口干等湿热表现为主要特征。多因饮食辛辣、居住潮湿所致。',
      body: '形体中等或偏瘦，面垢油光，易生痤疮，口苦口干',
      psych: '容易心烦急躁',
      risk: '易患疮疖、黄疸、泌尿系感染等',
      care: ['多吃清热利湿食物：绿豆、黄瓜、苦瓜、芹菜','按摩曲池、合谷穴','保持居住环境干燥通风','适合大强度运动以出汗排湿'],
      avoid: ['辛辣油腻食物','烟酒','潮湿闷热环境']
    },
    {
      id: 'xueyu', name: '血瘀质', emoji: '😣', color: '#aa5588',
      trait: '血行不畅，肤色晦暗，舌质紫暗，易出现瘀斑',
      desc: '血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主要特征。多因气滞、寒凝或外伤所致。',
      body: '肤色晦暗，色素沉着，容易出现瘀斑，口唇暗淡',
      psych: '易烦，健忘',
      risk: '易患症瘕、痛证、血证等',
      care: ['多吃活血化瘀食物：山楂、黑豆、醋、玫瑰花茶','按摩血海、三阴交穴','坚持适量运动促进血液循环','保持心情舒畅，避免焦虑'],
      avoid: ['寒凉食物','久坐久卧不动','情绪抑郁']
    },
    {
      id: 'qiyu', name: '气郁质', emoji: '😔', color: '#7788aa',
      trait: '气机郁滞，神情抑郁，忧虑脆弱，烦闷不乐',
      desc: '气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征。多因情志不遂、肝气郁结所致。',
      body: '形体瘦者为多，面色苍暗或萎黄',
      psych: '性格内向不稳定，敏感多虑',
      risk: '易患郁证、脏躁、百合病、不寐等',
      care: ['多吃行气解郁食物：玫瑰花、佛手、金橘、小麦','按摩太冲、膻中穴','练习瑜伽、舞蹈等舒展运动','多参加社交活动，培养兴趣爱好'],
      avoid: ['独处时间过长','睡前饮咖啡浓茶','压抑情绪不表达']
    },
    {
      id: 'tebing', name: '特禀质', emoji: '🤧', color: '#8899aa',
      trait: '先天失常，过敏体质，遗传性疾病',
      desc: '先天失常，以生理缺陷、过敏反应等为主要特征。包括过敏体质、遗传性疾病、胎传性疾病等。',
      body: '过敏体质者一般无特殊，先天禀赋异常者或有畸形或生理缺陷',
      psych: '随禀质不同情况各异',
      risk: '易患过敏性疾病、哮喘、荨麻疹等',
      care: ['饮食清淡均衡，粗细搭配','避免接触过敏原','保持居住环境清洁通风','加强体育锻炼增强免疫力'],
      avoid: ['已知过敏食物','含添加剂的加工食品','花粉季外出不防护']
    }
  ];

  function getConstitutionById(id) {
    for (var i = 0; i < CONSTITUTIONS.length; i++) {
      if (CONSTITUTIONS[i].id === id) return CONSTITUTIONS[i];
    }
    return CONSTITUTIONS[0];
  }

  // ==================== 简单体质自测 ====================

  function quickConstitutionTest(answers) {
    // answers: { qixu:bool, yangxu:bool, yinxu:bool, tanshi:bool, shire:bool, xueyu:bool, qiyu:bool, tebing:bool }
    // 简化：返回匹配度最高的体质
    if (!answers) return CONSTITUTIONS[0];
    var primary = 'pinghe';
    // 倾向判断逻辑
    if (answers.yangxu) primary = 'yangxu';
    if (answers.yinxu) primary = 'yinxu';
    if (answers.tanshi) primary = 'tanshi';
    if (answers.shire) primary = 'shire';
    if (answers.xueyu) primary = 'xueyu';
    if (answers.qiyu) primary = 'qiyu';
    if (answers.tebing) primary = 'tebing';
    if (answers.qixu) primary = 'qixu';
    return getConstitutionById(primary);
  }

  // ==================== 五行脏腑对应 ====================

  var WUXING_ZANGFU = {
    '木': { zang:'肝', fu:'胆', season:'春', direction:'东', sense:'目', tissue:'筋', emotion:'怒', taste:'酸', color:'#66bb66',
      desc:'肝藏血，主疏泄。在志为怒，在液为泪，在体合筋，其华在爪，开窍于目。',
      imbalance:'肝气郁结则胸胁胀痛、心情抑郁；肝火上炎则头痛目赤、急躁易怒。',
      foods:['菠菜','韭菜','芹菜','绿豆','柠檬'] },
    '火': { zang:'心', fu:'小肠', season:'夏', direction:'南', sense:'舌', tissue:'脉', emotion:'喜', taste:'苦', color:'#ee6666',
      desc:'心主血脉，藏神。在志为喜，在液为汗，在体合脉，其华在面，开窍于舌。',
      imbalance:'心火亢盛则口舌生疮、心烦失眠；心血不足则心悸怔忡、面色不华。',
      foods:['苦瓜','莲子','百合','番茄','红枣'] },
    '土': { zang:'脾', fu:'胃', season:'长夏', direction:'中', sense:'口', tissue:'肉', emotion:'思', taste:'甘', color:'#dd9944',
      desc:'脾主运化，统血。在志为思，在液为涎，在体合肉，主四肢，开窍于口，其华在唇。',
      imbalance:'脾气虚弱则食欲不振、腹胀便溏；脾湿困则头重身困、口中黏腻。',
      foods:['山药','小米','南瓜','红薯','黄豆'] },
    '金': { zang:'肺', fu:'大肠', season:'秋', direction:'西', sense:'鼻', tissue:'皮毛', emotion:'悲', taste:'辛', color:'#aaaaaa',
      desc:'肺主气，司呼吸，朝百脉。在志为悲，在液为涕，在体合皮，其华在毛，开窍于鼻。',
      imbalance:'肺气不足则气短乏力、易感冒；肺燥则干咳无痰、口干鼻燥。',
      foods:['白萝卜','雪梨','百合','银耳','杏仁'] },
    '水': { zang:'肾', fu:'膀胱', season:'冬', direction:'北', sense:'耳', tissue:'骨', emotion:'恐', taste:'咸', color:'#6688cc',
      desc:'肾藏精，主水液，纳气。在志为恐，在液为唾，在体合骨，主骨生髓，其华在发，开窍于耳及二阴。',
      imbalance:'肾阴虚则腰膝酸软、五心烦热；肾阳虚则畏寒肢冷、腰膝冷痛。',
      foods:['黑豆','黑芝麻','核桃','海带','桑葚'] }
  };

  // ==================== 二十四节气养生 ====================

  var SOLAR_TERMS = [
    { name:'立春', season:'春', month:2, element:'木', advice:'春捂秋冻，早睡早起，多踏青散步，食葱姜蒜助阳气生发。' },
    { name:'雨水', season:'春', month:2, element:'木', advice:'注意调养脾胃，少食酸多食甘，防"倒春寒"。' },
    { name:'惊蛰', season:'春', month:3, element:'木', advice:'万物复苏，适当增加运动量。梨润肺防春燥，舒展筋骨。' },
    { name:'春分', season:'春', month:3, element:'木', advice:'阴阳平衡之日，宜保持情志平和。饮食寒热均衡。' },
    { name:'清明', season:'春', month:4, element:'木', advice:'清气上升，多户外活动。养肝明目，食枸杞菊花。' },
    { name:'谷雨', season:'春', month:4, element:'木', advice:'雨水增多，注意祛湿。薏米红豆汤，防风湿关节痛。' },
    { name:'立夏', season:'夏', month:5, element:'火', advice:'养心安神，午睡片刻。饮食清淡，适量吃苦味食物清心火。' },
    { name:'小满', season:'夏', month:5, element:'火', advice:'湿热渐重，注意清热利湿。吃苦瓜、绿豆，防皮肤病。' },
    { name:'芒种', season:'夏', month:6, element:'火', advice:'梅雨季将至，健脾祛湿。食薏米、冬瓜，多喝茶水。' },
    { name:'夏至', season:'夏', month:6, element:'火', advice:'阳极阴生，养心为上。午睡宁神，饮食宜清淡偏酸。' },
    { name:'小暑', season:'夏', month:7, element:'火', advice:'暑热渐盛，防中暑。食西瓜绿豆汤，避免中午外出。' },
    { name:'大暑', season:'夏', month:7, element:'火', advice:'一年最热时，防暑降温。多吃冬瓜苦瓜，饮酸梅汤。' },
    { name:'立秋', season:'秋', month:8, element:'金', advice:'秋燥开始，润肺养阴。食梨百合银耳，早睡早起。' },
    { name:'处暑', season:'秋', month:8, element:'金', advice:'暑气渐消，防秋燥。多喝水，食蜂蜜润肺，适度运动。' },
    { name:'白露', season:'秋', month:9, element:'金', advice:'天气转凉，勿露身。注意保暖，尤其腹部。饮食温热。' },
    { name:'秋分', season:'秋', month:9, element:'金', advice:'阴阳再平衡，润肺防燥。食白色食物，保持心情愉快。' },
    { name:'寒露', season:'秋', month:10, element:'金', advice:'气温骤降，足部保暖。泡脚艾灸，防寒从脚底入。' },
    { name:'霜降', season:'秋', month:10, element:'金', advice:'秋末寒重，防寒保暖。食温补食物，为入冬做准备。' },
    { name:'立冬', season:'冬', month:11, element:'水', advice:'冬季开始，早睡晚起。进补以温阳为主，食羊肉炖品。' },
    { name:'小雪', season:'冬', month:11, element:'水', advice:'寒气渐重，温补肾阳。食核桃黑豆，泡脚按摩涌泉。' },
    { name:'大雪', season:'冬', month:12, element:'水', advice:'寒冬腊月，温补防寒。食当归生姜羊肉汤，护阳气。' },
    { name:'冬至', season:'冬', month:12, element:'水', advice:'阴极阳生，进补最佳日。食饺子、汤圆，温补肾精。' },
    { name:'小寒', season:'冬', month:1, element:'水', advice:'最寒冷时节开始，重保暖。三九补一冬，来年无病痛。' },
    { name:'大寒', season:'冬', month:1, element:'水', advice:'最后节气，冬藏为主。进补收官，养生过渡至春季。' }
  ];

  function getCurrentSolarTerm() {
    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    // 近似节气判断（基于每月两个节气）
    var termIdx = (m - 1) * 2 + (d < 16 ? 0 : 1);
    if (termIdx >= 24) termIdx = 23;
    return SOLAR_TERMS[termIdx];
  }

  // ==================== 对外接口 ====================

  return {
    CONSTITUTIONS: CONSTITUTIONS,
    WUXING_ZANGFU: WUXING_ZANGFU,
    SOLAR_TERMS: SOLAR_TERMS,
    getConstitutionById: getConstitutionById,
    quickConstitutionTest: quickConstitutionTest,
    getCurrentSolarTerm: getCurrentSolarTerm
  };
})();
