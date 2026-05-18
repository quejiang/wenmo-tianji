/**
 * 山 (Shan) — 五术之"山"
 * 子午流注 · 五行养生 · 打坐冥想 · 经络时辰
 */

var ShanShu = (function() {
  'use strict';

  // ==================== 十二经络流注 ====================

  var MERIDIANS = [
    { name:'胆经', organ:'胆', element:'木', shichen:0, shichenName:'子时', time:'23:00-01:00',
      tip:'胆汁推陈出新，宜熟睡。此时入睡最养胆气，胆经旺则决断力强。', color:'#88cc88' },
    { name:'肝经', organ:'肝', element:'木', shichen:1, shichenName:'丑时', time:'01:00-03:00',
      tip:'肝血推陈出新，必须熟睡。肝藏血，人卧则血归于肝。熬夜最伤肝。', color:'#66aa66' },
    { name:'肺经', organ:'肺', element:'金', shichen:2, shichenName:'寅时', time:'03:00-05:00',
      tip:'肺朝百脉，宜深度睡眠。此时肺经布气，呼吸均匀，是血压最低的时刻。', color:'#cccccc' },
    { name:'大肠经', organ:'大肠', element:'金', shichen:3, shichenName:'卯时', time:'05:00-07:00',
      tip:'大肠排毒，宜起床排便、喝温水。卯时天门开，地户亦开。', color:'#aaaaaa' },
    { name:'胃经', organ:'胃', element:'土', shichen:4, shichenName:'辰时', time:'07:00-09:00',
      tip:'胃经旺盛，宜吃早餐。此时消化吸收最佳，早餐吃得像皇帝。', color:'#ddaa66' },
    { name:'脾经', organ:'脾', element:'土', shichen:5, shichenName:'巳时', time:'09:00-11:00',
      tip:'脾运化水谷精微，宜工作学习。脾主思，此时头脑最清醒。', color:'#cc9944' },
    { name:'心经', organ:'心', element:'火', shichen:6, shichenName:'午时', time:'11:00-13:00',
      tip:'心经旺盛，宜午餐后小憩。午睡片刻养心神，不宜过久。', color:'#ee6666' },
    { name:'小肠经', organ:'小肠', element:'火', shichen:7, shichenName:'未时', time:'13:00-15:00',
      tip:'小肠分清泌浊，宜多喝水。此时吸收营养效率高，消化午餐。', color:'#dd5555' },
    { name:'膀胱经', organ:'膀胱', element:'水', shichen:8, shichenName:'申时', time:'15:00-17:00',
      tip:'膀胱经旺，宜多饮水排尿。此时是学习记忆黄金时段。', color:'#6688cc' },
    { name:'肾经', organ:'肾', element:'水', shichen:9, shichenName:'酉时', time:'17:00-19:00',
      tip:'肾藏精，宜休息养肾。不宜剧烈运动和大量饮水。', color:'#5577bb' },
    { name:'心包经', organ:'心包', element:'火', shichen:10, shichenName:'戌时', time:'19:00-21:00',
      tip:'心包护心，宜散步放松。保持心情愉快，可按摩内关穴。', color:'#ee8888' },
    { name:'三焦经', organ:'三焦', element:'火', shichen:11, shichenName:'亥时', time:'21:00-23:00',
      tip:'三焦通百脉，宜准备入睡。此时听轻音乐、泡脚有助入眠。', color:'#eeaaaa' }
  ];

  // ==================== 子午流注完整表 ====================

  function getCurrentMeridian() {
    var h = new Date().getHours();
    var idx = Math.floor(((h + 1) % 24) / 2);
    return MERIDIANS[idx];
  }

  function getMeridianTable() {
    return MERIDIANS.slice().sort(function(a, b) { return a.shichen - b.shichen; });
  }

  // ==================== 五行养生 ====================

  var WUXING_YANGSHENG = {
    '木': {
      color: '#66bb66', organ: '肝', fu: '胆',
      season: '春', direction: '东', taste: '酸', emotion: '怒',
      bodyPart: '筋·目',
      food: ['菠菜','芹菜','韭菜','绿豆','猕猴桃','柠檬'],
      avoid: '少喝酒，忌暴怒。春季养肝为先，早睡早起，多踏青。',
      desc: '肝主疏泄，喜条达而恶抑郁。木行人宜保持心情舒畅，避免压抑情绪。春季是养肝的最佳时节。',
      tips: ['早晨面向东方深呼吸3分钟','多吃绿色蔬菜','晚上11点前入睡','避免过度饮酒','适度运动疏通筋骨']
    },
    '火': {
      color: '#ee5555', organ: '心', fu: '小肠',
      season: '夏', direction: '南', taste: '苦', emotion: '喜',
      bodyPart: '脉·舌',
      food: ['苦瓜','莲子','百合','西瓜','番茄','红枣'],
      avoid: '忌过度兴奋，大喜伤心。夏季午睡片刻养心神。',
      desc: '心主血脉，藏神。火行人宜养心安神，夏季重点养心，保持情绪平稳。',
      tips: ['午时小憩15-30分钟','多吃红色苦味食物','保持心情平和','避免烈日暴晒','适当运动不宜大汗']
    },
    '土': {
      color: '#dd9944', organ: '脾', fu: '胃',
      season: '长夏', direction: '中', taste: '甘', emotion: '思',
      bodyPart: '肉·口',
      food: ['山药','小米','南瓜','红薯','黄豆','扁豆'],
      avoid: '忌思虑过度，思伤脾。饮食有节，不过饱过饥。',
      desc: '脾主运化，为后天之本。土行人宜养脾胃，长夏时节注意饮食卫生。',
      tips: ['早餐吃好，定时定量','多吃黄色甘味食物','避免思虑过度','注意腹部保暖','饭后散步助消化']
    },
    '金': {
      color: '#aaaaaa', organ: '肺', fu: '大肠',
      season: '秋', direction: '西', taste: '辛', emotion: '悲',
      bodyPart: '皮毛·鼻',
      food: ['白萝卜','雪梨','百合','银耳','杏仁','莲藕'],
      avoid: '忌过度悲伤，悲伤肺。秋季润燥养肺，预防呼吸道疾病。',
      desc: '肺主气，司呼吸。金行人宜润肺养阴，秋季是养肺的黄金季节。',
      tips: ['清晨深呼吸练习','多吃白色辛味食物','保持情绪乐观','注意保暖防寒','多喝水保持呼吸道湿润']
    },
    '水': {
      color: '#5577cc', organ: '肾', fu: '膀胱',
      season: '冬', direction: '北', taste: '咸', emotion: '恐',
      bodyPart: '骨·耳',
      food: ['黑豆','黑芝麻','核桃','海带','木耳','桑葚'],
      avoid: '忌恐惧过度，恐伤肾。冬季养藏，早睡晚起。',
      desc: '肾藏精，为先天之本。水行人宜补肾固精，冬季是养肾的最佳时机。',
      tips: ['早睡晚起，养精蓄锐','多吃黑色咸味食物','注意腰部保暖','适度节制房事','泡脚按摩涌泉穴']
    }
  };

  function getWuxingForElement(element) {
    return WUXING_YANGSHENG[element] || null;
  }

  // ==================== 打坐冥想指导 ====================

  var MEDITATION_GUIDES = [
    { title:'数息法', time:'5-15分钟', level:'入门',
      steps: [
        '找一安静处，盘腿而坐，脊柱挺直',
        '双手结定印（右手覆左掌上，拇指轻触）',
        '闭目，将注意力放在鼻端呼吸上',
        '吸气时默数"一"，呼气时默数"二"，从一数到十',
        '数到十后重新开始，如走神则从"一"重新数起',
        '每次练习5-15分钟，循序渐进'
      ],
      tip: '数息是入门最安全的法门，能快速安定心神。每天坚持，一个月后专注力会有明显提升。' },
    { title:'观想丹田', time:'10-20分钟', level:'进阶',
      steps: [
        '盘坐或平躺，全身放松',
        '将双手轻放于小腹丹田处（脐下三寸）',
        '闭目，意念集中于丹田',
        '吸气时观想一股暖流汇聚丹田',
        '呼气时观想浊气从脚底排出',
        '逐渐感到丹田处温热、充实',
        '保持这种观想10-20分钟'
      ],
      tip: '丹田是人体能量中心。观想丹田能培补元气、改善消化、增强体质。避免吃饱后立即练习。' },
    { title:'身体扫描', time:'15-30分钟', level:'进阶',
      steps: [
        '平躺，四肢微微张开，掌心向上',
        '从头顶开始，逐一将注意力放在身体各个部位',
        '去感知该部位的感觉（紧张/温暖/麻木/松弛）',
        '不必改变任何感觉，只是观察',
        '顺序：头顶→额头→眼睛→脸颊→下巴→脖子→肩膀→手臂→手掌→胸部→腹部→臀部→大腿→小腿→脚掌',
        '完成后静躺1-2分钟，慢慢睁开眼睛'
      ],
      tip: '身体扫描是正念冥想的经典练习，有助缓解压力、改善睡眠。睡前练习效果尤佳。' },
    { title:'慈心冥想', time:'10-15分钟', level:'中级',
      steps: [
        '静坐，闭目，先对自己默念三遍：愿我平安，愿我快乐，愿我安康',
        '然后观想一个你爱的人，对他/她默念：愿你平安，愿你快乐，愿你安康',
        '再观想一个中性的人（陌生人），同样默念祝福',
        '最后观想一切众生，默念：愿一切众生平安、快乐、安康',
        '结束时深呼吸三次，慢慢睁眼'
      ],
      tip: '慈心冥想能化解怨恨、增进同理心。研究表明能显著提升积极情绪和社交能力。' }
  ];

  // ==================== 五脏排毒时间表 ====================

  var DETOX_SCHEDULE = [
    { time:'21:00-23:00', organ:'三焦', activity:'免疫系统（淋巴）排毒', advice:'安静休息，听轻音乐' },
    { time:'23:00-01:00', organ:'胆', activity:'胆汁分泌、代谢毒素', advice:'必须熟睡！' },
    { time:'01:00-03:00', organ:'肝', activity:'肝脏解毒、造血', advice:'深度睡眠中' },
    { time:'03:00-05:00', organ:'肺', activity:'肺排毒、血气分布', advice:'深度睡眠中，咳嗽者此时较剧' },
    { time:'05:00-07:00', organ:'大肠', activity:'大肠排毒、排便', advice:'起床排便、喝温水' },
    { time:'07:00-09:00', organ:'胃', activity:'胃经最旺、消化吸收', advice:'吃营养早餐' },
    { time:'09:00-11:00', organ:'脾', activity:'脾运化水谷精微', advice:'多喝水帮助运化' },
    { time:'11:00-13:00', organ:'心', activity:'心经旺盛', advice:'午餐+小憩15-30分钟' },
    { time:'13:00-15:00', organ:'小肠', activity:'小肠吸收营养', advice:'适量饮水' },
    { time:'15:00-17:00', organ:'膀胱', activity:'膀胱排毒', advice:'多喝水、及时排尿' },
    { time:'17:00-19:00', organ:'肾', activity:'肾贮藏精气', advice:'少喝水、休息养肾' },
    { time:'19:00-21:00', organ:'心包', activity:'保护心脏', advice:'散步、放松情绪' }
  ];

  // ==================== 对外接口 ====================

  return {
    MERIDIANS: MERIDIANS,
    DETOX_SCHEDULE: DETOX_SCHEDULE,
    WUXING_YANGSHENG: WUXING_YANGSHENG,
    MEDITATION_GUIDES: MEDITATION_GUIDES,
    getCurrentMeridian: getCurrentMeridian,
    getMeridianTable: getMeridianTable,
    getWuxingForElement: getWuxingForElement
  };
})();
