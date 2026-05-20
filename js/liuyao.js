/**
 * 六爻排盘（纳甲筮法）— Liu Yao Divination
 * 金钱卦：三枚铜钱摇六次，成卦象
 */
var LiuYao = (function() {
  'use strict';

  // ============ 六十四卦 ============
  // 每卦: name, upper, lower, lines(6爻阴阳:1阳0阴), shiYing[0], 六亲, 纳甲地支
  var HEXAGRAMS = [
    { id:1,  name:'乾为天',   upper:'☰乾', lower:'☰乾', lines:[1,1,1,1,1,1], shi:6, ying:3, palace:'乾宫', element:'金' },
    { id:2,  name:'坤为地',   upper:'☷坤', lower:'☷坤', lines:[0,0,0,0,0,0], shi:6, ying:3, palace:'坤宫', element:'土' },
    { id:3,  name:'水雷屯',   upper:'☵坎', lower:'☳震', lines:[1,0,0,0,1,0], shi:2, ying:5, palace:'坎宫', element:'水' },
    { id:4,  name:'山水蒙',   upper:'☶艮', lower:'☵坎', lines:[0,1,0,0,0,1], shi:6, ying:3, palace:'离宫', element:'火' },
    { id:5,  name:'水天需',   upper:'☵坎', lower:'☰乾', lines:[0,1,0,1,1,1], shi:4, ying:1, palace:'坤宫', element:'土' },
    { id:6,  name:'天水讼',   upper:'☰乾', lower:'☵坎', lines:[0,1,0,1,1,1], shi:4, ying:1, palace:'离宫', element:'火' },
    { id:7,  name:'地水师',   upper:'☷坤', lower:'☵坎', lines:[0,1,0,0,0,0], shi:3, ying:6, palace:'坎宫', element:'水' },
    { id:8,  name:'水地比',   upper:'☵坎', lower:'☷坤', lines:[0,0,0,0,1,0], shi:3, ying:6, palace:'坤宫', element:'土' },
    { id:9,  name:'风天小畜', upper:'☴巽', lower:'☰乾', lines:[1,1,0,1,1,1], shi:1, ying:4, palace:'巽宫', element:'木' },
    { id:10, name:'天泽履',   upper:'☰乾', lower:'☱兑', lines:[1,1,0,1,1,1], shi:5, ying:2, palace:'艮宫', element:'土' },
    { id:11, name:'地天泰',   upper:'☷坤', lower:'☰乾', lines:[1,1,1,0,0,0], shi:3, ying:6, palace:'坤宫', element:'土' },
    { id:12, name:'天地否',   upper:'☰乾', lower:'☷坤', lines:[0,0,0,1,1,1], shi:3, ying:6, palace:'乾宫', element:'金' },
    { id:13, name:'天火同人', upper:'☰乾', lower:'☲离', lines:[1,0,1,1,1,1], shi:6, ying:3, palace:'离宫', element:'火' },
    { id:14, name:'火天大有', upper:'☲离', lower:'☰乾', lines:[1,1,1,1,0,1], shi:3, ying:6, palace:'乾宫', element:'金' },
    { id:15, name:'地山谦',   upper:'☷坤', lower:'☶艮', lines:[0,0,1,0,0,0], shi:5, ying:2, palace:'兑宫', element:'金' },
    { id:16, name:'雷地豫',   upper:'☳震', lower:'☷坤', lines:[0,0,0,1,0,0], shi:1, ying:4, palace:'震宫', element:'木' },
    { id:17, name:'泽雷随',   upper:'☱兑', lower:'☳震', lines:[1,0,0,1,1,0], shi:3, ying:6, palace:'震宫', element:'木' },
    { id:18, name:'山风蛊',   upper:'☶艮', lower:'☴巽', lines:[0,1,1,0,0,1], shi:3, ying:6, palace:'巽宫', element:'木' },
    { id:19, name:'地泽临',   upper:'☷坤', lower:'☱兑', lines:[1,1,0,0,0,0], shi:2, ying:5, palace:'坤宫', element:'土' },
    { id:20, name:'风地观',   upper:'☴巽', lower:'☷坤', lines:[0,0,0,0,1,1], shi:4, ying:1, palace:'乾宫', element:'金' },
    { id:21, name:'火雷噬嗑', upper:'☲离', lower:'☳震', lines:[1,0,0,1,0,1], shi:5, ying:2, palace:'巽宫', element:'木' },
    { id:22, name:'山火贲',   upper:'☶艮', lower:'☲离', lines:[1,0,1,0,0,1], shi:1, ying:4, palace:'艮宫', element:'土' },
    { id:23, name:'山地剥',   upper:'☶艮', lower:'☷坤', lines:[0,0,0,0,0,1], shi:5, ying:2, palace:'乾宫', element:'金' },
    { id:24, name:'地雷复',   upper:'☷坤', lower:'☳震', lines:[1,0,0,0,0,0], shi:1, ying:4, palace:'坤宫', element:'土' },
    { id:25, name:'天雷无妄', upper:'☰乾', lower:'☳震', lines:[1,0,0,1,1,1], shi:4, ying:1, palace:'巽宫', element:'木' },
    { id:26, name:'山天大畜', upper:'☶艮', lower:'☰乾', lines:[1,1,1,0,0,1], shi:2, ying:5, palace:'艮宫', element:'土' },
    { id:27, name:'山雷颐',   upper:'☶艮', lower:'☳震', lines:[1,0,0,0,0,1], shi:4, ying:1, palace:'巽宫', element:'木' },
    { id:28, name:'泽风大过', upper:'☱兑', lower:'☴巽', lines:[0,1,1,1,1,0], shi:4, ying:1, palace:'震宫', element:'木' },
    { id:29, name:'坎为水',   upper:'☵坎', lower:'☵坎', lines:[0,1,0,0,1,0], shi:6, ying:3, palace:'坎宫', element:'水' },
    { id:30, name:'离为火',   upper:'☲离', lower:'☲离', lines:[1,0,1,1,0,1], shi:6, ying:3, palace:'离宫', element:'火' },
    { id:31, name:'泽山咸',   upper:'☱兑', lower:'☶艮', lines:[0,0,1,1,1,0], shi:3, ying:6, palace:'兑宫', element:'金' },
    { id:32, name:'雷风恒',   upper:'☳震', lower:'☴巽', lines:[0,1,1,1,0,0], shi:3, ying:6, palace:'震宫', element:'木' },
    { id:33, name:'天山遁',   upper:'☰乾', lower:'☶艮', lines:[0,0,1,1,1,1], shi:2, ying:5, palace:'乾宫', element:'金' },
    { id:34, name:'雷天大壮', upper:'☳震', lower:'☰乾', lines:[1,1,1,1,0,0], shi:4, ying:1, palace:'坤宫', element:'土' },
    { id:35, name:'火地晋',   upper:'☲离', lower:'☷坤', lines:[0,0,0,1,0,1], shi:4, ying:1, palace:'乾宫', element:'金' },
    { id:36, name:'地火明夷', upper:'☷坤', lower:'☲离', lines:[1,0,1,0,0,0], shi:1, ying:4, palace:'坎宫', element:'水' },
    { id:37, name:'风火家人', upper:'☴巽', lower:'☲离', lines:[1,0,1,0,1,1], shi:2, ying:5, palace:'巽宫', element:'木' },
    { id:38, name:'火泽睽',   upper:'☲离', lower:'☱兑', lines:[1,1,0,1,0,1], shi:4, ying:1, palace:'艮宫', element:'土' },
    { id:39, name:'水山蹇',   upper:'☵坎', lower:'☶艮', lines:[0,0,1,0,1,0], shi:4, ying:1, palace:'兑宫', element:'金' },
    { id:40, name:'雷水解',   upper:'☳震', lower:'☵坎', lines:[0,1,0,1,0,0], shi:2, ying:5, palace:'震宫', element:'木' },
    { id:41, name:'山泽损',   upper:'☶艮', lower:'☱兑', lines:[1,1,0,0,0,1], shi:3, ying:6, palace:'艮宫', element:'土' },
    { id:42, name:'风雷益',   upper:'☴巽', lower:'☳震', lines:[1,0,0,0,1,1], shi:3, ying:6, palace:'巽宫', element:'木' },
    { id:43, name:'泽天夬',   upper:'☱兑', lower:'☰乾', lines:[1,1,1,1,1,0], shi:5, ying:2, palace:'坤宫', element:'土' },
    { id:44, name:'天风姤',   upper:'☰乾', lower:'☴巽', lines:[0,1,1,1,1,1], shi:1, ying:4, palace:'乾宫', element:'金' },
    { id:45, name:'泽地萃',   upper:'☱兑', lower:'☷坤', lines:[0,0,0,1,1,0], shi:2, ying:5, palace:'兑宫', element:'金' },
    { id:46, name:'地风升',   upper:'☷坤', lower:'☴巽', lines:[0,1,1,0,0,0], shi:4, ying:1, palace:'震宫', element:'木' },
    { id:47, name:'泽水困',   upper:'☱兑', lower:'☵坎', lines:[0,1,0,1,1,0], shi:3, ying:6, palace:'兑宫', element:'金' },
    { id:48, name:'水风井',   upper:'☵坎', lower:'☴巽', lines:[0,1,1,0,1,0], shi:2, ying:5, palace:'震宫', element:'木' },
    { id:49, name:'泽火革',   upper:'☱兑', lower:'☲离', lines:[1,0,1,1,1,0], shi:4, ying:1, palace:'坎宫', element:'水' },
    { id:50, name:'火风鼎',   upper:'☲离', lower:'☴巽', lines:[0,1,1,1,0,1], shi:2, ying:5, palace:'离宫', element:'火' },
    { id:51, name:'震为雷',   upper:'☳震', lower:'☳震', lines:[1,0,0,1,0,0], shi:6, ying:3, palace:'震宫', element:'木' },
    { id:52, name:'艮为山',   upper:'☶艮', lower:'☶艮', lines:[0,0,1,0,0,1], shi:6, ying:3, palace:'艮宫', element:'土' },
    { id:53, name:'风山渐',   upper:'☴巽', lower:'☶艮', lines:[0,0,1,0,1,1], shi:3, ying:6, palace:'艮宫', element:'土' },
    { id:54, name:'雷泽归妹', upper:'☳震', lower:'☱兑', lines:[1,1,0,1,0,0], shi:3, ying:6, palace:'兑宫', element:'金' },
    { id:55, name:'雷火丰',   upper:'☳震', lower:'☲离', lines:[1,0,1,1,0,0], shi:5, ying:2, palace:'坎宫', element:'水' },
    { id:56, name:'火山旅',   upper:'☲离', lower:'☶艮', lines:[0,0,1,1,0,1], shi:1, ying:4, palace:'离宫', element:'火' },
    { id:57, name:'巽为风',   upper:'☴巽', lower:'☴巽', lines:[0,1,1,0,1,1], shi:6, ying:3, palace:'巽宫', element:'木' },
    { id:58, name:'兑为泽',   upper:'☱兑', lower:'☱兑', lines:[1,1,0,1,1,0], shi:6, ying:3, palace:'兑宫', element:'金' },
    { id:59, name:'风水涣',   upper:'☴巽', lower:'☵坎', lines:[0,1,0,0,1,1], shi:5, ying:2, palace:'离宫', element:'火' },
    { id:60, name:'水泽节',   upper:'☵坎', lower:'☱兑', lines:[1,1,0,0,1,0], shi:1, ying:4, palace:'坎宫', element:'水' },
    { id:61, name:'风泽中孚', upper:'☴巽', lower:'☱兑', lines:[1,1,0,0,1,1], shi:4, ying:1, palace:'艮宫', element:'土' },
    { id:62, name:'雷山小过', upper:'☳震', lower:'☶艮', lines:[0,0,1,1,0,0], shi:4, ying:1, palace:'兑宫', element:'金' },
    { id:63, name:'水火既济', upper:'☵坎', lower:'☲离', lines:[1,0,1,0,1,0], shi:3, ying:6, palace:'坎宫', element:'水' },
    { id:64, name:'火水未济', upper:'☲离', lower:'☵坎', lines:[0,1,0,1,0,1], shi:3, ying:6, palace:'离宫', element:'火' }
  ];

  // 快速查找
  var hexMap = {};
  HEXAGRAMS.forEach(function(h) { hexMap[h.id] = h; });

  // 按 lines 查找 (从下往上: lines[0]=初爻)
  function findByLines(lines) {
    for (var i = 0; i < HEXAGRAMS.length; i++) {
      if (HEXAGRAMS[i].lines.join(',') === lines.join(',')) return HEXAGRAMS[i];
    }
    return null;
  }

  // ============ 八卦 ============
  var TRIGRAMS = [
    { symbol:'☰', name:'乾', element:'金', num:1 },
    { symbol:'☱', name:'兑', element:'金', num:2 },
    { symbol:'☲', name:'离', element:'火', num:3 },
    { symbol:'☳', name:'震', element:'木', num:4 },
    { symbol:'☴', name:'巽', element:'木', num:5 },
    { symbol:'☵', name:'坎', element:'水', num:6 },
    { symbol:'☶', name:'艮', element:'土', num:7 },
    { symbol:'☷', name:'坤', element:'土', num:8 }
  ];

  // 3条爻→八卦 (上到下: 0=阴, 1=阳)
  function trigramFromLines(a, b, c) {
    var map = {
      '111': 0, // 乾
      '110': 1, // 兑
      '101': 2, // 离
      '100': 3, // 震
      '011': 4, // 巽
      '010': 5, // 坎
      '001': 6, // 艮
      '000': 7  // 坤
    };
    return TRIGRAMS[map[''+a+b+c]] || TRIGRAMS[7];
  }

  // ============ 六亲（以卦宫五行为主） ============
  var QIN_RELATIONS = {
    '金': { '金':'兄弟', '水':'子孙', '木':'妻财', '火':'官鬼', '土':'父母' },
    '水': { '金':'父母', '水':'兄弟', '木':'子孙', '火':'妻财', '土':'官鬼' },
    '木': { '金':'官鬼', '水':'父母', '木':'兄弟', '火':'子孙', '土':'妻财' },
    '火': { '金':'妻财', '水':'官鬼', '木':'父母', '火':'兄弟', '土':'子孙' },
    '土': { '金':'子孙', '水':'妻财', '木':'官鬼', '火':'父母', '土':'兄弟' }
  };

  // 六爻地支 (纳甲)
  var NA_JIA = {
    '乾宫': ['子','寅','辰','午','申','戌'],  // 内卦: 子寅辰, 外卦: 午申戌
    '震宫': ['子','寅','辰','午','申','戌'],
    '坎宫': ['寅','辰','午','申','戌','子'],
    '艮宫': ['辰','午','申','戌','子','寅'],
    '坤宫': ['未','巳','卯','丑','亥','酉'],  // 内卦: 未巳卯, 外卦: 丑亥酉
    '巽宫': ['丑','亥','酉','未','巳','卯'],
    '离宫': ['卯','丑','亥','酉','未','巳'],
    '兑宫': ['巳','卯','丑','亥','酉','未']
  };

  // ============ 卦辞数据库 ============
  var GUACI = {
    1:  { text:'元亨利贞', full:'乾卦象征天，刚健中正，纯粹精也。六爻皆阳，为万物创始之象。占得此卦：大吉大利，万事亨通，宜积极进取。但需居安思危，守正不移。', luck:'大吉' },
    2:  { text:'元亨，利牝马之贞', full:'坤卦象征地，柔顺包容，厚德载物。六爻皆阴，为承载万物之象。占得此卦：宜柔顺守成，不宜强出头。以柔克刚，以静制动。', luck:'吉' },
    3:  { text:'元亨利贞，勿用有攸往', full:'屯卦象征万物初生之艰难。雷在水下，郁结未发。占得此卦：创业初期多困难，需耐心等待时机，不宜轻举妄动。', luck:'小吉' },
    4:  { text:'亨，匪我求童蒙，童蒙求我', full:'蒙卦象征启蒙教育。山下水出，蒙昧待开。占得此卦：宜虚心求教，不宜好为人师。求学者吉，求财者需待时机。', luck:'平' },
    5:  { text:'有孚，光亨，贞吉，利涉大川', full:'需卦象征等待。云上于天，待雨而降。占得此卦：时机未到，需耐心等待。宜静不宜动，但前景光明。', luck:'平' },
    6:  { text:'有孚窒惕，中吉，终凶', full:'讼卦象征争讼。天与水违行，意见不合。占得此卦：易起争执，宜和解不宜诉讼。见好就收，不宜纠缠。', luck:'凶' },
    7:  { text:'贞，丈人吉，无咎', full:'师卦象征军队、战争。地中有水，藏兵于民。占得此卦：宜团结一致，有组织地行动。竞争激烈，需有备而战。', luck:'平' },
    8:  { text:'吉，原筮元永贞，无咎', full:'比卦象征亲附。地上有水，相亲相助。占得此卦：人际关系良好，宜合作共事。有人来依附，或宜投靠贵人。', luck:'吉' },
    11: { text:'小往大来，吉亨', full:'泰卦天地交泰，上下沟通。占得此卦：万事亨通，否极泰来。事业顺利，财源广进，人际和谐。', luck:'大吉' },
    12: { text:'否之匪人，不利君子贞', full:'否卦天地不交，闭塞不通。占得此卦：诸事不顺，小人当道。宜隐忍守正，不宜妄动。', luck:'凶' },
    63: { text:'亨小，利贞，初吉终乱', full:'既济卦事已成也。火在水上，烹煮已熟。占得此卦：万事已备，但需防盛极而衰。初吉终乱，宜戒骄戒躁。', luck:'平' },
    64: { text:'亨，小狐汔济，濡其尾', full:'未济卦事未成也。火在水上，不能相济。占得此卦：事尚未成，不宜妄断。需继续努力，不可半途而废。', luck:'平' }
  };

  // 补充常用卦辞
  var commonGuaci = {
    9:  { text:'亨，密云不雨', full:'小畜卦风行天上，小有积蓄。占得此卦：宜积少成多，不宜冒进。暂时受阻，但终将成功。', luck:'小吉' },
    10: { text:'履虎尾，不咥人，亨', full:'履卦天在上泽在下，谨慎行事。占得此卦：宜小心谨慎，步步为营。虽有风险但可化解。', luck:'平' },
    13: { text:'同人于野，亨', full:'同人卦天火相映，志同道合。占得此卦：宜与人合作，广结善缘。团队力量大，众人拾柴火焰高。', luck:'吉' },
    14: { text:'元亨', full:'大有卦火在天上，光明普照。占得此卦：富贵双全，事业兴旺。丰收之象，诸事顺遂。', luck:'大吉' },
    15: { text:'亨，君子有终', full:'谦卦地中有山，谦卑自牧。占得此卦：宜谦虚待人，不可骄傲。谦受益，满招损。', luck:'吉' },
    16: { text:'利建侯行师', full:'豫卦雷出地奋，欢欣鼓舞。占得此卦：宜积极行动，把握时机。心情愉悦，办事顺利。', luck:'吉' },
    17: { text:'元亨利贞，无咎', full:'随卦泽中有雷，随遇而安。占得此卦：宜顺应时势，不宜固执己见。随机应变则吉。', luck:'吉' },
    18: { text:'元亨，利涉大川', full:'蛊卦山下有风，弊病待除。占得此卦：宜革除积弊，拨乱反正。先难后易，需毅力。', luck:'平' },
    19: { text:'元亨利贞', full:'临卦地泽相临，以上临下。占得此卦：诸事渐近，好运将至。宜主动出击，但需把握分寸。', luck:'吉' },
    20: { text:'盥而不荐，有孚颙若', full:'观卦风行地上，观览万象。占得此卦：宜多观察，不宜草率决定。静观其变，伺机而动。', luck:'平' },
    21: { text:'亨，利用狱', full:'噬嗑卦雷电交加，咬合而通。占得此卦：依法行事，果断裁决。障碍将被清除。', luck:'平' },
    22: { text:'亨，小利有攸往', full:'贲卦山下有火，装饰美化。占得此卦：宜重外表形象，但不可徒有其表。小利可图。', luck:'小吉' },
    23: { text:'不利有攸往', full:'剥卦山附于地，剥落崩塌。占得此卦：小人得势，运势下行。宜守不宜攻，静待转机。', luck:'凶' },
    24: { text:'亨，出入无疾', full:'复卦雷在地中，一阳来复。占得此卦：否极泰来，转运在即。宜重新开始，万象更新。', luck:'吉' },
    25: { text:'元亨利贞，其匪正有眚', full:'无妄卦天下雷行，真实不虚。占得此卦：宜诚实守信，不可妄为。顺其自然则吉。', luck:'平' },
    26: { text:'利贞，不家食吉', full:'大畜卦天在山中，大有积蓄。占得此卦：宜积德积学，厚积薄发。前程远大。', luck:'吉' },
    27: { text:'贞吉，观颐，自求口实', full:'颐卦山下有雷，养精蓄锐。占得此卦：宜养生养德，自食其力。言语谨慎，饮食有节。', luck:'平' },
    28: { text:'栋桡，利有攸往，亨', full:'大过卦泽灭木，过犹不及。占得此卦：事有过当之象，宜调整平衡。非常时期需非常手段。', luck:'平' },
    29: { text:'习坎，有孚维心亨', full:'坎卦水重叠，险陷重重。占得此卦：困难重重，宜坚守信念。以诚待人，终能脱险。', luck:'凶' },
    30: { text:'利贞，亨，畜牝牛吉', full:'离卦火重叠，光明依附。占得此卦：宜依附有力者，借势而行。光明在前，但需柔顺。', luck:'吉' },
    31: { text:'亨，利贞，取女吉', full:'咸卦山上有泽，感应沟通。占得此卦：感情婚姻吉，宜沟通交流。以诚感人，事半功倍。', luck:'吉' },
    32: { text:'亨，无咎，利贞', full:'恒卦雷风相与，恒久不变。占得此卦：宜持之以恒，不宜半途而废。守正则吉。', luck:'平' },
    33: { text:'亨，小利贞', full:'遁卦天下有山，退避隐忍。占得此卦：宜知难而退，不宜正面对抗。退一步海阔天空。', luck:'小吉' },
    34: { text:'利贞', full:'大壮卦雷在天上，强盛壮大。占得此卦：运势正旺，但不可恃强凌弱。过刚易折，宜守正。', luck:'吉' },
    35: { text:'康侯用锡马蕃庶，昼日三接', full:'晋卦明出地上，晋升进步。占得此卦：事业蒸蒸日上，宜积极进取。贵人赏识，前途光明。', luck:'吉' },
    36: { text:'利艰贞', full:'明夷卦明入地中，光明受伤。占得此卦：宜韬光养晦，忍辱负重。黑暗终将过去。', luck:'凶' },
    37: { text:'利女贞', full:'家人卦风自火出，家道正也。占得此卦：家庭和睦，宜整顿内部。以和为贵，各司其职。', luck:'吉' },
    38: { text:'小事吉', full:'睽卦上火下泽，意见分歧。占得此卦：与人意见不合，小事可成大事难。宜求同存异。', luck:'平' },
    39: { text:'利西南，不利东北', full:'蹇卦山上有水，艰难险阻。占得此卦：前进困难，宜退守待援。求助贵人可化解。', luck:'凶' },
    40: { text:'利西南，无所往，其来复吉', full:'解卦雷雨作，困难解除。占得此卦：危机化解，宜趁势而为。问题即将解决。', luck:'吉' },
    41: { text:'有孚，元吉，无咎', full:'损卦山下有泽，损下益上。占得此卦：有失有得，宜舍小就大。损己利人终有回报。', luck:'平' },
    42: { text:'利有攸往，利涉大川', full:'益卦风雷相益，增益有利。占得此卦：运势上升，宜主动出击。见善则迁，有过则改。', luck:'吉' },
    43: { text:'扬于王庭', full:'夬卦泽上于天，决断裁决。占得此卦：宜当机立断，不可犹豫。果断行事则吉。', luck:'平' },
    44: { text:'女壮，勿用取女', full:'姤卦天下有风，不期而遇。占得此卦：有意外之遇，宜谨慎对待。不可轻信。', luck:'平' },
    45: { text:'亨，王假有庙', full:'萃卦泽上于地，聚集汇合。占得此卦：人气汇聚，宜组织活动。团结力量大。', luck:'吉' },
    46: { text:'元亨，用见大人', full:'升卦地中生木，上升进步。占得此卦：步步高升，宜乘势而上。贵人相助，前途似锦。', luck:'吉' },
    47: { text:'亨，贞大人吉', full:'困卦泽无水，困境受制。占得此卦：运势低迷，宜守不宜攻。逆境中保持乐观。', luck:'凶' },
    48: { text:'改邑不改井', full:'井卦木上有水，井养不穷。占得此卦：宜守住根本，不宜轻易改变。稳扎稳打。', luck:'平' },
    49: { text:'己日乃孚，元亨利贞', full:'革卦泽中有火，变革革新。占得此卦：宜改革创新，除旧布新。时机成熟可大胆变革。', luck:'吉' },
    50: { text:'元吉，亨', full:'鼎卦木上有火，鼎新革故。占得此卦：事业稳固，宜创新进取。位置重要，责任重大。', luck:'吉' },
    51: { text:'亨，震来虩虩，笑言哑哑', full:'震卦雷重叠，震动惊惧。占得此卦：突发变故，宜冷静应对。临危不乱则吉。', luck:'平' },
    52: { text:'艮其背，不获其身', full:'艮卦山重叠，止步不前。占得此卦：宜适可而止，知止不殆。该停则停。', luck:'平' },
    53: { text:'女归吉，利贞', full:'渐卦山上有木，循序渐进。占得此卦：宜按部就班，不可急于求成。慢工出细活。', luck:'吉' },
    54: { text:'征凶，无攸利', full:'归妹卦雷泽相配，婚嫁之事。占得此卦：婚恋需谨慎，不可草率。宜守规矩。', luck:'平' },
    55: { text:'亨，王假之，勿忧', full:'丰卦雷电皆至，丰盛充盈。占得此卦：运势鼎盛，宜趁势而上。但盛极必衰需警惕。', luck:'吉' },
    56: { text:'小亨，旅贞吉', full:'旅卦山上有火，旅行在外。占得此卦：漂泊不定，宜安分守己。客居他乡需谨慎。', luck:'小吉' },
    57: { text:'小亨，利有攸往', full:'巽卦风重叠，柔顺谦逊。占得此卦：宜顺势而为，不宜强求。以柔克刚，谦逊得助。', luck:'小吉' },
    58: { text:'亨，利贞', full:'兑卦泽重叠，喜悦交流。占得此卦：心情愉快，人际和谐。宜表达分享，合作共赢。', luck:'吉' },
    59: { text:'亨，王假有庙', full:'涣卦风行水上，涣散离散。占得此卦：宜凝聚人心，防范离散。以诚聚人。', luck:'平' },
    60: { text:'亨，苦节不可贞', full:'节卦泽上有水，节制约束。占得此卦：宜有节制，不宜过度。适可而止。', luck:'平' },
    61: { text:'豚鱼吉，利涉大川', full:'中孚卦泽上有风，诚信感化。占得此卦：宜以诚待人，信义为先。真诚可得人心。', luck:'吉' },
    62: { text:'亨，利贞，可小事不可大事', full:'小过卦山上有雷，小有过越。占得此卦：小错可谅，大事不宜。宜低调行事。', luck:'平' }
  };

  // 合并
  for (var k in commonGuaci) { if (!GUACI[k]) GUACI[k] = commonGuaci[k]; }

  // ============ 摇卦 ============
  function tossCoins() {
    var lines = []; // 从初爻到上爻
    var changingLines = []; // 动爻位置 (0-5)
    for (var i = 0; i < 6; i++) {
      var sum = 0;
      for (var j = 0; j < 3; j++) sum += Math.random() < 0.5 ? 2 : 3; // 正面=3, 反面=2
      var isYang, isChanging;
      if (sum === 6)      { isYang = false; isChanging = true; }  // 老阴 变阳
      else if (sum === 7) { isYang = true;  isChanging = false; } // 少阳 不变
      else if (sum === 8) { isYang = false; isChanging = false; } // 少阴 不变
      else                { isYang = true;  isChanging = true; }  // 老阳 变阴 (sum=9)
      lines.push({ yang: isYang, changing: isChanging, value: sum });
      if (isChanging) changingLines.push(i);
    }
    return { lines: lines, changingLines: changingLines };
  }

  function buildHexagrams(result) {
    var benLines = result.lines.map(function(l) { return l.yang ? 1 : 0; });
    var bianLines = result.lines.map(function(l) {
      return l.changing ? (l.yang ? 0 : 1) : (l.yang ? 1 : 0);
    });

    var benGua = findByLines(benLines);
    var bianGua = findByLines(bianLines);

    // 互卦: 2-3-4爻为下卦, 3-4-5爻为上卦
    var huLower = [benLines[1], benLines[2], benLines[3]];
    var huUpper = [benLines[2], benLines[3], benLines[4]];
    var huGua = findByLines(huLower.concat(huUpper));

    return { benGua: benGua, bianGua: bianGua, huGua: huGua, changingLines: result.changingLines };
  }

  // ============ 渲染 ============
  function renderLiuYao(containerId) {
    var result = tossCoins();
    var hexes = buildHexagrams(result);
    var html = buildLiuYaoHTML(result, hexes);
    var container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
  }

  function buildLiuYaoHTML(result, hexes) {
    var h = hexes;
    var html = '';

    html += '<div class="ly-container">';

    // 卦象展示
    html += '<div class="ly-cards">';

    // 本卦
    html += '<div class="ly-card ly-card-ben">';
    html += '<div class="ly-card-label">本卦</div>';
    html += renderHexagramCard(h.benGua, result);
    html += '</div>';

    // 互卦
    if (h.huGua) {
      html += '<div class="ly-card ly-card-hu">';
      html += '<div class="ly-card-label">互卦</div>';
      html += renderHexagramCard(h.huGua, null);
      html += '</div>';
    }

    // 变卦
    if (h.bianGua && h.bianGua.id !== h.benGua.id) {
      html += '<div class="ly-card ly-card-bian">';
      html += '<div class="ly-card-label">变卦</div>';
      html += renderHexagramCard(h.bianGua, null);
      html += '</div>';
    }

    html += '</div>'; // ly-cards

    // 六爻详情
    html += '<div class="ly-lines">';
    html += '<div class="ly-lines-header"><span>爻位</span><span>阴阳</span><span>六亲</span><span>地支</span><span>世应</span></div>';
    var palace = h.benGua.palace;
    var naJia = NA_JIA[palace] || NA_JIA['乾宫'];
    var element = h.benGua.element;

    for (var i = 5; i >= 0; i--) {
      var line = result.lines[i];
      var isShi = (h.benGua.shi === i + 1);
      var isYing = (h.benGua.ying === i + 1);
      var isChanging = line.changing;
      var yaoName = (i === 5) ? '上爻' : (i === 0) ? '初爻' : (i+1) + '爻';
      var yinYang = line.yang ? '⚊' : '⚋';
      var diZhi = naJia[i] || '—';
      var liuQin = getLiuQin(palace, element, diZhi);
      var shiYingLabel = isShi ? '世' : isYing ? '应' : '';
      var cls = isChanging ? 'ly-line-changing' : '';
      html += '<div class="ly-line ' + cls + '">';
      html += '<span>' + yaoName + '</span>';
      html += '<span>' + yinYang + (isChanging ? ' ⚡' : '') + '</span>';
      html += '<span>' + liuQin + '</span>';
      html += '<span>' + diZhi + '</span>';
      html += '<span class="ly-shiying">' + shiYingLabel + '</span>';
      html += '</div>';
    }
    html += '</div>'; // ly-lines

    // 动爻显示
    if (result.changingLines.length > 0) {
      html += '<div class="ly-changing-info">';
      html += '动爻：' + result.changingLines.map(function(i) { return (i === 0 ? '初' : i === 5 ? '上' : (i+1)) + '爻'; }).join('、');
      html += '</div>';
    }

    // 卦辞
    var guaci = GUACI[h.benGua.id];
    if (guaci) {
      html += '<div class="ly-guaci">';
      html += '<div class="ly-guaci-header">';
      html += '📜 ' + h.benGua.name + ' · <span class="ly-luck ly-luck-' + (guaci.luck === '大吉' || guaci.luck === '吉' ? 'good' : guaci.luck === '凶' ? 'bad' : 'neutral') + '">' + guaci.luck + '</span>';
      html += '</div>';
      html += '<div class="ly-guaci-text"><strong>卦辞：</strong>' + guaci.text + '</div>';
      html += '<div class="ly-guaci-full">' + guaci.full + '</div>';
      html += '</div>';
    }

    // 操作按钮
    html += '<div class="ly-actions">';
    html += '<button class="btn btn-primary" onclick="LiuYao.renderLiuYao(\'liuyaoResult\')">🪙 重新摇卦</button>';
    html += '</div>';

    html += '</div>'; // ly-container
    return html;
  }

  function renderHexagramCard(gua, result) {
    if (!gua) return '<div class="ly-empty">—</div>';
    var h = '';
    h += '<div class="ly-hex-name">' + gua.name + '</div>';
    h += '<div class="ly-hex-symbol">' + gua.upper + '<br>' + gua.lower + '</div>';
    h += '<div class="ly-hex-meta">' + gua.palace + ' · ' + gua.element + '</div>';
    return h;
  }

  function getLiuQin(palace, element, diZhi) {
    var diZhiElement = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
    var dzElem = diZhiElement[diZhi] || '土';
    return QIN_RELATIONS[element] ? (QIN_RELATIONS[element][dzElem] || '—') : '—';
  }

  // ============ 手动排卦 ============
  function manualCast(lines) {
    // lines: 6个数字 (6=老阴, 7=少阳, 8=少阴, 9=老阳)
    var resultLines = lines.map(function(v) {
      return {
        yang: (v === 7 || v === 9),
        changing: (v === 6 || v === 9),
        value: v
      };
    });
    var changingLines = [];
    resultLines.forEach(function(l, i) { if (l.changing) changingLines.push(i); });
    return { lines: resultLines, changingLines: changingLines };
  }

  return {
    HEXAGRAMS: HEXAGRAMS,
    GUACI: GUACI,
    tossCoins: tossCoins,
    buildHexagrams: buildHexagrams,
    renderLiuYao: renderLiuYao,
    buildLiuYaoHTML: buildLiuYaoHTML,
    manualCast: manualCast,
    findByLines: findByLines,
    hexMap: hexMap
  };
})();
