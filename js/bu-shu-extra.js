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
    var relation;
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
    meiHuaQiGua: meiHuaQiGua,
    meiHuaFromNumbers: meiHuaFromNumbers,
    liuYaoCoinToss: liuYaoCoinToss
  };
})();
