/**
 * 紫微斗数流年/流月/流日/流时排盘引擎
 * 包含：小限、叠宫、博士十二神、将前十二神、长生十二神
 */

// ==================== 流年盘 ====================

/**
 * 计算流年命盘
 * @param {object} baseChart - 生年盘（来自 calculateZiWeiChart）
 * @param {object} baseBazi - 八字数据
 * @param {number} flowYear - 流年公历年
 * @param {string} gender - 'male'|'female'
 */
function calcLiuNianChart(baseChart, baseBazi, flowYear, gender) {
  var yearGanIdx = (flowYear - 4) % 10;
  yearGanIdx = (yearGanIdx + 10) % 10;
  var yearZhiIdx = (flowYear - 4) % 12;
  yearZhiIdx = (yearZhiIdx + 12) % 12;

  // 流年命宫：以斗君为起点，每年顺移一位
  var ziNianDouJun = baseChart.ziNianDouJun;
  var liuNianMingGong = (ziNianDouJun + (flowYear - baseChart.year)) % 12;
  liuNianMingGong = (liuNianMingGong + 12) % 12;

  // 12宫排列（从流年命宫逆时针）
  var palaces = [];
  var PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
  for (var i = 0; i < 12; i++) {
    var zhiIdx = (liuNianMingGong - i + 12) % 12;
    var ganIdx = getTianGanByYearGanAndZhi(yearGanIdx, zhiIdx);
    palaces.push({
      name: PALACE_NAMES[i],
      zhiIndex: zhiIdx,
      ganIndex: ganIdx,
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      isShenGong: false,
      stars: [],
      auxStars: [],
      minorStars: [],
      sihua: [],
      shenSha: {}
    });
  }

  // 流年太岁所在
  var taiSuiZhi = yearZhiIdx;

  // 流年四化（根据流年天干）
  var sihua = getSiHua(yearGanIdx);
  var sihuaStars = {};
  baseChart.starPositions; // 生年盘星曜位置（复用）

  // 流年博士十二神：禄存位起博士
  var boshiNames = ['博士','力士','青龙','小耗','将军','奏书','飞廉','喜神','病符','大耗','伏兵','官符'];
  var lucunZhi = { 0:11, 1:2, 2:3, 3:5, 4:6, 5:5, 6:6, 7:8, 8:9, 9:11 }[yearGanIdx] || 11;

  // 将前十二神：年支三合局起将星
  var triBase = yearZhiIdx % 4;
  var jiangQiZhi = [0, 9, 6, 3][triBase];
  var jiangQianNames = ['将星','攀鞍','岁驿','息神','华盖','劫煞','灾煞','天煞','指背','咸池','月煞','亡神'];

  // 岁前十二神：年支起岁建顺行
  var suiQianNames = ['岁建','晦气','丧门','贯索','官符','小耗','岁破','龙德','白虎','天德','吊客','病符'];

  // 填充12宫神煞
  palaces.forEach(function(p) {
    var relIdx = (p.zhiIndex - lucunZhi + 12) % 12;
    p.shenSha.boshi = boshiNames[relIdx];
    var jqIdx = (p.zhiIndex - jiangQiZhi + 12) % 12;
    p.shenSha.jiangQian = jiangQianNames[jqIdx];
    var sqIdx = (p.zhiIndex - yearZhiIdx + 12) % 12;
    p.shenSha.suiQian = suiQianNames[sqIdx];

    // 长生十二神（流年天干五行定长生位）
    var yrElement = {0:3,1:3,2:6,3:6,4:5,5:5,6:4,7:4,8:2,9:2}[yearGanIdx] || 3;
    var csZhiMap = {3:11, 6:2, 5:2, 4:5, 2:8}; // 木亥火寅土寅金巳水申
    var csZhi = csZhiMap[yrElement] || 11;
    var csNames = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
    p.shenSha.changSheng = csNames[(p.zhiIndex - csZhi + 12) % 12];
  });

  return {
    year: flowYear,
    yearGanIdx: yearGanIdx,
    yearZhiIdx: yearZhiIdx,
    yearGanZhi: GAN[yearGanIdx] + ZHI[yearZhiIdx],
    palaces: palaces,
    liuNianMingGong: liuNianMingGong,
    taiSuiZhi: taiSuiZhi,
    sihua: sihua,
    ziNianDouJun: ziNianDouJun
  };
}

// ==================== 流月盘 ====================

/**
 * 计算流月命盘
 * 流月命宫：从流年斗君位（寅宫起正月顺数至流月，再从该宫起子时逆数至生时）
 * 简化：流年命宫起正月，顺数至流月
 */
function calcLiuYueChart(baseChart, baseBazi, flowYear, flowMonth, gender) {
  var yearGanIdx = (flowYear - 4) % 10;
  yearGanIdx = (yearGanIdx + 10) % 10;
  var yearZhiIdx = (flowYear - 4) % 12;
  yearZhiIdx = (yearZhiIdx + 12) % 12;

  // 流月命宫：寅宫起正月，顺数至流月，再逆数至生时
  var shichenIdx = baseBazi.hour.shichenIdx;
  var liuYueMingGong = (2 + flowMonth - 1 - shichenIdx + 12) % 12;

  var PAL_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
  var palaces = [];
  for (var i = 0; i < 12; i++) {
    var zhiIdx = (liuYueMingGong - i + 12) % 12;
    var ganIdx = getTianGanByYearGanAndZhi(yearGanIdx, zhiIdx);
    palaces.push({
      name: PAL_NAMES[i],
      zhiIndex: zhiIdx,
      ganIndex: ganIdx,
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      sihua: [],
      shenSha: {}
    });
  }

  // 流月博士十二神
  var boshiNames = ['博士','力士','青龙','小耗','将军','奏书','飞廉','喜神','病符','大耗','伏兵','官符'];
  var lucunZhi = {0:11,1:2,2:3,3:5,4:6,5:5,6:6,7:8,8:9,9:11}[yearGanIdx] || 11;

  palaces.forEach(function(p) {
    p.shenSha.boshi = boshiNames[(p.zhiIndex - lucunZhi + 12) % 12];
  });

  return {
    year: flowYear, month: flowMonth,
    yearGanIdx: yearGanIdx, yearZhiIdx: yearZhiIdx,
    palaces: palaces,
    liuYueMingGong: liuYueMingGong
  };
}

// ==================== 流日盘 ====================

/**
 * 流日命宫：流月命宫起初一，顺数至流日
 */
function calcLiuRiChart(baseChart, baseBazi, flowYear, flowMonth, flowDay, gender) {
  var yearGanIdx = (flowYear - 4) % 10;
  yearGanIdx = (yearGanIdx + 10) % 10;

  // 先算流月命宫
  var shichenIdx = baseBazi.hour.shichenIdx;
  var liuYueMingGong = (2 + flowMonth - 1 - shichenIdx + 12) % 12;

  // 流日命宫：从流月命宫起初一，顺数至流日
  var liuRiMingGong = (liuYueMingGong + flowDay - 1) % 12;

  var PAL_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
  var palaces = [];
  for (var i = 0; i < 12; i++) {
    var zhiIdx = (liuRiMingGong - i + 12) % 12;
    var ganIdx = getTianGanByYearGanAndZhi(yearGanIdx, zhiIdx);
    palaces.push({
      name: PAL_NAMES[i],
      zhiIndex: zhiIdx,
      ganIndex: ganIdx,
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      sihua: [],
      shenSha: {}
    });
  }

  return {
    year: flowYear, month: flowMonth, day: flowDay,
    palaces: palaces,
    liuRiMingGong: liuRiMingGong
  };
}

// ==================== 流时盘 ====================

/**
 * 流时命宫：流日命宫起子时，顺数至流时
 */
function calcLiuShiChart(baseChart, baseBazi, flowYear, flowMonth, flowDay, flowShichen, gender) {
  var yearGanIdx = (flowYear - 4) % 10;
  yearGanIdx = (yearGanIdx + 10) % 10;

  // 流日命宫
  var shichenIdx = baseBazi.hour.shichenIdx;
  var liuYueMingGong = (2 + flowMonth - 1 - shichenIdx + 12) % 12;
  var liuRiMingGong = (liuYueMingGong + flowDay - 1) % 12;

  // 流时命宫
  var liuShiMingGong = (liuRiMingGong + flowShichen) % 12;

  var PAL_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
  var palaces = [];
  for (var i = 0; i < 12; i++) {
    var zhiIdx = (liuShiMingGong - i + 12) % 12;
    var ganIdx = getTianGanByYearGanAndZhi(yearGanIdx, zhiIdx);
    palaces.push({
      name: PAL_NAMES[i],
      zhiIndex: zhiIdx,
      ganIndex: ganIdx,
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      sihua: [],
      shenSha: {}
    });
  }

  return {
    year: flowYear, month: flowMonth, day: flowDay, shichen: flowShichen,
    shichenName: SHICHEN_NAME[flowShichen] || '',
    palaces: palaces,
    liuShiMingGong: liuShiMingGong
  };
}

// ==================== 小限 ====================

/**
 * 计算小限命宫（从戌宫起生年，男顺女逆，岁数定宫位）
 */
function calcXiaoXianMingGong(yearZhiIdx, gender, virtualAge) {
  var shun = gender === 'male';
  var base = 10; // 戌宫(zhiIndex=10)
  var offset = shun ? (virtualAge - 1) : -(virtualAge - 1);
  return ((base + offset) % 12 + 12) % 12;
}

/**
 * 获取所有小限宫位分布
 */
function getXiaoXianDistribution(yearZhiIdx, gender, virtualAge) {
  var mingGong = calcXiaoXianMingGong(yearZhiIdx, gender, virtualAge);
  var PAL_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
  var result = {};
  for (var i = 0; i < 12; i++) {
    var zhiIdx = (mingGong - i + 12) % 12;
    result[zhiIdx] = PAL_NAMES[i];
  }
  return result;
}

// ==================== 博士十二神 (生年盘) ====================

/**
 * 完整的博士十二神排布（生年盘用）
 * 禄存位起博士，阳男阴女顺行/阴男阳女逆行
 */
function getBoshiStars(yearGanIdx, gender) {
  var lucunZhi = {0:11,1:2,2:3,3:5,4:6,5:5,6:6,7:8,8:9,9:11}[yearGanIdx] || 11;
  var yangGan = [0,2,4,6,8];
  var isYang = yangGan.indexOf(yearGanIdx) !== -1;
  var shun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
  var names = ['博士','力士','青龙','小耗','将军','奏书','飞廉','喜神','病符','大耗','伏兵','官符'];
  var result = {};
  for (var i = 0; i < 12; i++) {
    var zhiIdx = shun ? (lucunZhi + i) % 12 : (lucunZhi - i + 12) % 12;
    result[ZHI[zhiIdx]] = names[i];
  }
  return result;
}

// ==================== 将前十二神 ====================

function getJiangQianStars(yearZhiIdx) {
  var triBase = yearZhiIdx % 4;
  var jiangQiZhi = [0, 9, 6, 3][triBase];
  var names = ['将星','攀鞍','岁驿','息神','华盖','劫煞','灾煞','天煞','指背','咸池','月煞','亡神'];
  var result = {};
  for (var i = 0; i < 12; i++) {
    result[ZHI[(jiangQiZhi + i) % 12]] = names[i];
  }
  return result;
}

// ==================== 岁前十二神 ====================

function getSuiQianStars(yearZhiIdx) {
  var names = ['岁建','晦气','丧门','贯索','官符','小耗','岁破','龙德','白虎','天德','吊客','病符'];
  var result = {};
  for (var i = 0; i < 12; i++) {
    result[ZHI[(yearZhiIdx + i) % 12]] = names[i];
  }
  return result;
}

// ==================== 长生十二神 ====================

function getChangShengStars(ganIndex) {
  var elem = {0:3,1:3,2:6,3:6,4:5,5:5,6:4,7:4,8:2,9:2}[ganIndex] || 3;
  var csZhi = {3:11, 6:2, 5:2, 4:5, 2:8}[elem] || 11;
  var names = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
  var result = {};
  for (var i = 0; i < 12; i++) {
    result[ZHI[(csZhi + i) % 12]] = names[i];
  }
  return result;
}

// ==================== 叠宫计算 ====================

/**
 * 计算叠宫信息：本命盘+大限+流年三重宫位叠加
 */
function calcOverlayPalaces(baseChart, flowChart, daXianIndex) {
  var overlay = {};
  // 对于每个地支，找出：
  // 1. 本命盘的宫位名
  // 2. 大限的宫位名（如果在该大限区间内）
  // 3. 流年的宫位名
  for (var zhiIdx = 0; zhiIdx < 12; zhiIdx++) {
    var benMingPalace = null;
    var daXianPalace = null;
    var liuNianPalace = null;

    for (var i = 0; i < 12; i++) {
      if (baseChart.palaces[i].zhiIndex === zhiIdx) {
        benMingPalace = baseChart.palaces[i];
        break;
      }
    }

    for (var j = 0; j < 12; j++) {
      if (flowChart.palaces[j].zhiIndex === zhiIdx) {
        liuNianPalace = flowChart.palaces[j];
        break;
      }
    }

    overlay[zhiIdx] = {
      zhi: ZHI[zhiIdx],
      benMing: benMingPalace ? benMingPalace.name : '—',
      liuNian: liuNianPalace ? liuNianPalace.name : '—',
      stars: benMingPalace ? benMingPalace.stars.concat(benMingPalace.auxStars) : [],
      sihua: benMingPalace ? (benMingPalace.sihua || []) : []
    };
  }
  return overlay;
}

// ==================== 小限流月流日流时综合 ====================

/**
 * 获取完整的时间层级排盘
 */
function getFullTimelineCharts(baseChart, baseBazi, gender, targetYear, targetMonth, targetDay, targetShichen) {
  var liuNian = calcLiuNianChart(baseChart, baseBazi, targetYear, gender);
  var liuYue = calcLiuYueChart(baseChart, baseBazi, targetYear, targetMonth, gender);
  var liuRi = calcLiuRiChart(baseChart, baseBazi, targetYear, targetMonth, targetDay, gender);
  var liuShi = calcLiuShiChart(baseChart, baseBazi, targetYear, targetMonth, targetDay, targetShichen, gender);

  // 虚岁
  var age = targetYear - baseChart.year + 1;
  var xiaoXianMingGong = calcXiaoXianMingGong(baseBazi.year.zhiIndex, gender, age);
  var xiaoXianDist = getXiaoXianDistribution(baseBazi.year.zhiIndex, gender, age);

  // 博士十二神
  var boshiStars = getBoshiStars(baseBazi.year.ganIndex, gender);
  var jiangQianStars = getJiangQianStars(baseBazi.year.zhiIndex);
  var suiQianStars = getSuiQianStars(baseBazi.year.zhiIndex);

  return {
    liuNian: liuNian,
    liuYue: liuYue,
    liuRi: liuRi,
    liuShi: liuShi,
    xiaoXianMingGong: xiaoXianMingGong,
    xiaoXianDist: xiaoXianDist,
    virtualAge: age,
    boshiStars: boshiStars,
    jiangQianStars: jiangQianStars,
    suiQianStars: suiQianStars
  };
}
