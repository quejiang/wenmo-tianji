/**
 * 紫微斗数核心排盘引擎
 * 包含：命宫/身宫、12宫、五行局、紫微星、十四主星、辅星、小星、神煞、四化、大限
 */

// ==================== 十二宫名称 ====================
var PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
];

// ==================== 十四主星名称 ====================
var STAR_NAMES = {
  ziwei: '紫微', tianji: '天机', taiyang: '太阳', wuqu: '武曲',
  tiantong: '天同', lianzhen: '廉贞', tianfu: '天府', taiyin: '太阴',
  tanlang: '贪狼', jumen: '巨门', tianxiang: '天相', tianliang: '天梁',
  qisha: '七杀', pojund: '破军'
};

// 辅星名称
var AUX_STAR_NAMES = {
  zuofu: '左辅', youbi: '右弼', wenchang: '文昌', wenqu: '文曲',
  tiankui: '天魁', tianyue: '天钺', lucun: '禄存', qingyang: '擎羊',
  tuoluo: '陀罗', huoxing: '火星', lingxing: '铃星', tianma: '天马',
  dikong: '地空', dijie: '地劫'
};

// 五行局名称
var ELEMENT_NAMES = ['', '', '水二局', '木三局', '金四局', '土五局', '火六局'];

// 小星名称
var MINOR_STAR_NAMES = {
  tianxi: '天喜', enguang: '恩光', tiangui: '天贵', tianshang: '天伤',
  longchi: '龙池', fengge: '凤阁', nianjie: '年解', huagai: '华盖',
  posui: '破碎', hongluan: '红鸾', santai: '三台', tianchu: '天厨',
  jiekong: '截空', xunkong: '旬空', xianchi: '咸池', tiande: '天德',
  bazuo: '八座', tianfu: '天福', tianku: '天哭', tianshou: '天寿',
  jieshen: '解神', tiankong: '天空', yinsha: '阴煞', tianxing: '天刑',
  fenggao: '封诰', guchen: '孤辰', feilian: '蜚廉', tiancai: '天才',
  tianguan: '天官', tianyue2: '天月', longde: '龙德', tianyao: '天姚',
  tianxu: '天虚', taifu: '台辅', tianwu: '天巫', dahao: '大耗',
  jiesha: '劫煞', yuede: '月德', tianshi: '天使', guasu: '寡宿'
};

// 命主表 — 由命宫地支决定
var MING_ZHU_MAP = ['贪狼','巨门','禄存','文曲','廉贞','武曲','破军','武曲','廉贞','文曲','禄存','巨门'];
// 身主表 — 由生年地支决定
var SHEN_ZHU_MAP = ['火星','天相','天梁','天同','文昌','天机','火星','天相','天梁','天同','文昌','天机'];

// 子年斗君 — 由生月+生时，寅起正月顺数至生月，再从生月宫起子时逆数至生时
function calcZiNianDouJun(lunarMonth, shichenIdx) {
  var monthZhi = (2 + lunarMonth - 1) % 12; // 寅起正月
  return (monthZhi - shichenIdx + 12) % 12; // 逆数至生时
}

// ==================== 纳音五行表 ====================
// 60甲子对应的五行：木=3, 金=4, 水=2, 火=6, 土=5
// 索引0-59对应甲子到癸亥
const NAYIN_ELEMENT = [
  4, 4, 6, 6, 3, 3, 5, 5, 4, 4, // 甲子-癸酉: 金金火火木木土土金金
  6, 6, 2, 2, 5, 5, 4, 4, 3, 3, // 甲戌-癸未: 火火水水土土金金木木
  2, 2, 5, 5, 6, 6, 3, 3, 2, 2, // 甲申-癸巳: 水水土土火火木木水水
  4, 4, 6, 6, 3, 3, 5, 5, 4, 4, // 甲午-癸卯: 金金火火木木土土金金
  6, 6, 2, 2, 5, 5, 6, 6, 3, 3, // 甲辰-癸丑: 火火水水土土火火木木
  2, 2, 5, 5, 4, 4, 3, 3, 2, 2  // 甲寅-癸亥: 水水土土金金木木水水
];

// ==================== 星曜亮度的宫位映射 ====================
// 每个主星有其庙旺利陷的宫位
const STAR_BRIGHTNESS = {
  ziwei: {
   庙: [2, 3, 4, 5, 6], 旺: [1, 7], 得: [8, 10, 11], 利: [9], 平: [0], 不: [], 陷: []
  },
  tianji: {
   庙: [4], 旺: [2, 3, 11], 得: [1], 利: [0, 5], 平: [6], 不: [7, 8, 10], 陷: [9]
  },
  taiyang: {
   庙: [6], 旺: [3, 5, 7], 得: [4, 8], 利: [2, 9], 平: [1, 10, 11], 不: [0], 陷: []
  },
  wuqu: {
   庙: [7, 8, 10], 旺: [2, 9, 11], 得: [4], 利: [1, 5], 平: [6], 不: [0, 3], 陷: []
  },
  tiantong: {
   庙: [0], 旺: [8, 11], 得: [2, 5, 6, 10], 利: [1, 3], 平: [7], 不: [4], 陷: [9]
  },
  lianzhen: {
   庙: [0, 8], 旺: [2, 5, 9], 得: [1, 10], 利: [3], 平: [6, 7], 不: [11], 陷: [4]
  },
  tianfu: {
   庙: [4, 0, 8], 旺: [1, 5, 7, 9, 10], 得: [2, 3, 6, 11], 利: [], 平: [], 不: [], 陷: []
  },
  taiyin: {
   庙: [8, 10, 11], 旺: [6, 7], 得: [9], 利: [2, 3, 4, 5], 平: [0, 1], 不: [], 陷: []
  },
  tanlang: {
   庙: [4, 7, 11], 旺: [0, 2, 3, 9, 10], 得: [1, 5, 6, 8], 利: [], 平: [], 不: [], 陷: []
  },
  jumen: {
   庙: [2, 3, 9], 旺: [0, 7], 得: [1, 8, 10, 11], 利: [5, 6], 平: [4], 不: [], 陷: []
  },
  tianxiang: {
   庙: [0, 8, 10], 旺: [2, 5, 9], 得: [1, 4, 6, 7, 11], 利: [3], 平: [], 不: [], 陷: []
  },
  tianliang: {
   庙: [0, 4, 7, 8], 旺: [1, 9], 得: [10], 利: [3, 11], 平: [6], 不: [2, 5], 陷: []
  },
  qisha: {
   庙: [2, 3, 7, 8], 旺: [0, 5], 得: [4, 9, 10], 利: [1, 6, 11], 平: [], 不: [], 陷: []
  },
  pojund: {
   庙: [0, 6], 旺: [1, 2, 3, 8, 10, 11], 得: [5, 9], 利: [4, 7], 平: [], 不: [], 陷: []
  }
};

// 亮度排序权重（用于显示）：庙 > 旺 > 得 > 利 > 平 > 不 > 陷
const BRIGHTNESS_ORDER = { '庙': 6, '旺': 5, '得': 4, '利': 3, '平': 2, '不': 1, '陷': 0 };

// ==================== 命宫计算 ====================

/**
 * 计算命宫地支索引
 * 方法：寅宫起正月，顺数至生月，再从生月起子时，逆数至生时
 * 命宫地支 = (2 + 月 - 1 - 时) mod 12 = (月 + 1 - 时) mod 12
 */
function calcMingGongZhi(lunarMonth, shichenIdx) {
  return ((lunarMonth + 1 - shichenIdx) % 12 + 12) % 12;
}

/**
 * 计算身宫地支索引
 * 方法：寅宫起正月，顺数至生月，再从生月起子时，顺数至生时
 * 身宫地支 = (2 + 月 - 1 + 时) mod 12 = (月 + 1 + 时) mod 12
 */
function calcShenGongZhi(lunarMonth, shichenIdx) {
  return ((lunarMonth + 1 + shichenIdx) % 12 + 12) % 12;
}

/**
 * 根据年干和地支位置计算天干（五虎遁）
 * 年干→寅宫天干：甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
 */
function getTianGanByYearGanAndZhi(yearGanIndex, zhiIndex) {
  const baseGan = [2, 4, 6, 8, 0][yearGanIndex % 5]; // 寅宫天干
  // 从寅宫顺行到目标地支：ganOffset = (zhiIndex - 2 + 12) % 12
  return (baseGan + (zhiIndex - 2 + 12) % 12) % 10;
}

// ==================== 五行局计算 ====================

/**
 * 根据命宫干支获取五行局数
 */
function getElementBureau(mingGongGanIndex, mingGongZhiIndex) {
  // 查表法：遍历60甲子找到纳音五行
  for (let i = 0; i < 60; i++) {
    const g = i % 10;
    const z = i % 12;
    if (g === mingGongGanIndex && z === mingGongZhiIndex) {
      return NAYIN_ELEMENT[i];
    }
  }
  return 2; // 默认水二局
}

// ==================== 紫微星位置 ====================

/**
 * 根据五行局数和农历日数计算紫微星宫位地支索引
 * 公式：紫微星位 = 寅 + ceil(日数/局数) - 1
 */
function calcZiWeiPosition(bureauNum, lunarDay) {
  const offset = Math.ceil(lunarDay / bureauNum);
  return (2 + offset - 1) % 12; // 寅(index=2) + offset - 1
}

// ==================== 十四主星排布 ====================

/**
 * 根据紫微星位置，排布所有14主星
 * 返回 { starKey: zhiIndex }
 */
function arrangeAllStars(ziweiZhi) {
  const stars = {};
  
  // 紫微系六星
  stars.ziwei = ziweiZhi;
  stars.tianji = (ziweiZhi - 1 + 12) % 12;
  stars.taiyang = (ziweiZhi - 3 + 12) % 12;
  stars.wuqu = (ziweiZhi - 4 + 12) % 12;
  stars.tiantong = (ziweiZhi - 5 + 12) % 12;
  stars.lianzhen = (ziweiZhi + 4) % 12;
  
  // 天府位置：与紫微以寅申为轴心对称
  // 公式：天府 = (寅 - (紫微 - 寅) + 12) % 12 = (4 - 紫微 + 12) % 12
  const tianfuActual = (4 - ziweiZhi + 12) % 12;
  
  stars.tianfu = tianfuActual;
  stars.taiyin = (tianfuActual + 1) % 12;
  stars.tanlang = (tianfuActual + 2) % 12;
  stars.jumen = (tianfuActual + 3) % 12;
  stars.tianxiang = (tianfuActual + 4) % 12;
  stars.tianliang = (tianfuActual + 5) % 12;
  stars.qisha = (tianfuActual + 6) % 12;
  stars.pojund = (tianfuActual + 10) % 12;
  
  return stars;
}

// ==================== 辅星排布 ====================

/**
 * 排布所有辅星
 */
function arrangeAuxStars(lunarMonth, shichenIdx, yearGanIndex, yearZhiIndex) {
  const aux = {};
  
  // 左辅：辰起正月顺行
  aux.zuofu = (4 + lunarMonth - 1) % 12;
  
  // 右弼：戌起正月逆行
  aux.youbi = (10 - lunarMonth + 1 + 12) % 12;
  
  // 文昌：戌起子时逆行
  aux.wenchang = (10 - shichenIdx + 12) % 12;
  
  // 文曲：辰起子时顺行
  aux.wenqu = (4 + shichenIdx) % 12;
  
  // 天魁/天钺：根据年干
  const tiankuiMap = [1, 0, 11, 9, 1, 0, 11, 9, 7, 5]; // 甲→丑,乙→子,丙→亥,丁→酉,戊→丑,己→子,庚→亥,辛→酉,壬→未,癸→巳
  const tianyueMap = [7, 8, 9, 11, 7, 8, 9, 11, 3, 3];   // 甲→未,乙→申,丙→酉,丁→亥,戊→未,己→申,庚→酉,辛→亥,壬→卯,癸→卯
  aux.tiankui = tiankuiMap[yearGanIndex];
  aux.tianyue = tianyueMap[yearGanIndex];
  
  // 禄存：根据年干
  const lucunMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]; // 甲→寅,乙→卯,丙→巳,丁→午,戊→巳,己→午,庚→申,辛→酉,壬→亥,癸→子
  aux.lucun = lucunMap[yearGanIndex];
  
  // 擎羊：禄存+1
  aux.qingyang = (aux.lucun + 1) % 12;
  
  // 陀罗：禄存-1
  aux.tuoluo = (aux.lucun - 1 + 12) % 12;
  
  // 火星：根据年支和时辰
  // 寅午戌年：火星丑起，顺时行
  // 申子辰年：火星寅起，顺时行
  // 巳酉丑年：火星卯起，顺时行
  // 亥卯未年：火星酉起，顺时行
  let huoxingBase;
  if (yearZhiIndex === 2 || yearZhiIndex === 6 || yearZhiIndex === 10) { // 寅午戌
    huoxingBase = 1; // 丑
  } else if (yearZhiIndex === 8 || yearZhiIndex === 0 || yearZhiIndex === 4) { // 申子辰
    huoxingBase = 2; // 寅
  } else if (yearZhiIndex === 5 || yearZhiIndex === 9 || yearZhiIndex === 1) { // 巳酉丑
    huoxingBase = 3; // 卯
  } else { // 亥卯未
    huoxingBase = 9; // 酉
  }
  aux.huoxing = (huoxingBase + shichenIdx) % 12;
  
  // 铃星：根据年支和时辰
  // 寅午戌年：铃星卯起，顺时行
  // 申子辰年：铃星戌起，顺时行
  // 巳酉丑年：铃星戌起，顺时行
  // 亥卯未年：铃星戌起，顺时行
  let lingxingBase;
  if (yearZhiIndex === 2 || yearZhiIndex === 6 || yearZhiIndex === 10) { // 寅午戌
    lingxingBase = 3; // 卯
  } else if (yearZhiIndex === 8 || yearZhiIndex === 0 || yearZhiIndex === 4) { // 申子辰
    lingxingBase = 10; // 戌
  } else if (yearZhiIndex === 5 || yearZhiIndex === 9 || yearZhiIndex === 1) { // 巳酉丑
    lingxingBase = 10; // 戌
  } else { // 亥卯未
    lingxingBase = 10; // 戌
  }
  aux.lingxing = (lingxingBase + shichenIdx) % 12;
  
  // 天马：根据年支（三合局）
  // 寅午戌→申(8), 申子辰→寅(2), 巳酉丑→亥(11), 亥卯未→巳(5)
  const tianmaMap = { triFire: 8, triWater: 2, triMetal: 11, triWood: 5 };
  if (yearZhiIndex === 2 || yearZhiIndex === 6 || yearZhiIndex === 10) { // 寅午戌
    aux.tianma = 8;
  } else if (yearZhiIndex === 8 || yearZhiIndex === 0 || yearZhiIndex === 4) { // 申子辰
    aux.tianma = 2;
  } else if (yearZhiIndex === 5 || yearZhiIndex === 9 || yearZhiIndex === 1) { // 巳酉丑
    aux.tianma = 11;
  } else { // 亥卯未
    aux.tianma = 5;
  }
  
  // 地空/地劫：根据时辰
  // 地空：亥起子时逆行
  aux.dikong = (11 - shichenIdx + 12) % 12;
  // 地劫：亥起子时顺行
  aux.dijie = (11 + shichenIdx) % 12;
  
  return aux;
}

// ==================== 四化星 ====================

/**
 * 根据年干获取四化映射
 * 返回 { starKey: '禄'|'权'|'科'|'忌' }
 */
function getSiHua(yearGanIndex) {
  const sihuaTable = [
    // 禄,      权,      科,      忌
    ['lianzhen', 'pojund', 'wuqu', 'taiyang'],  // 甲
    ['tianji', 'tianliang', 'ziwei', 'taiyin'],  // 乙
    ['tiantong', 'tianji', 'wenchang', 'lianzhen'], // 丙
    ['taiyin', 'tiantong', 'tianji', 'jumen'],    // 丁
    ['tanlang', 'taiyin', 'youbi', 'tianji'],      // 戊
    ['wuqu', 'tanlang', 'tianliang', 'wenqu'],     // 己
    ['taiyang', 'wuqu', 'taiyin', 'tiantong'],     // 庚
    ['jumen', 'taiyang', 'wenqu', 'wenchang'],     // 辛
    ['tianliang', 'ziwei', 'zuofu', 'wuqu'],        // 壬
    ['pojund', 'jumen', 'taiyin', 'tanlang']        // 癸
  ];
  
  const [lu, quan, ke, ji] = sihuaTable[yearGanIndex];
  return { lu, quan, ke, ji };
}

// ==================== 宫干四化（飞宫四化/后天四化） ====================
// 每个宫位的天干会对宫内的星曜产生四化（离心自化↓）或对宫星曜产生四化（向心自化↑）

const PALACE_GAN_SIHUA = [
  //  禄          权          科          忌
  ['lianzhen', 'pojund',   'wuqu',     'taiyang'],  // 甲
  ['tianji',   'tianliang','ziwei',    'taiyin'],   // 乙
  ['tiantong', 'tianji',   'wenchang', 'lianzhen'], // 丙
  ['taiyin',   'tiantong', 'tianji',   'jumen'],    // 丁
  ['tanlang',  'taiyin',   'youbi',    'tianji'],   // 戊
  ['wuqu',     'tanlang',  'tianliang','wenqu'],    // 己
  ['taiyang',  'wuqu',     'taiyin',   'tiantong'], // 庚
  ['jumen',    'taiyang',  'wenqu',    'wenchang'], // 辛
  ['tianliang','ziwei',    'zuofu',    'wuqu'],     // 壬
  ['pojund',   'jumen',    'taiyin',   'tanlang']   // 癸
];

/**
 * 根据一个宫位的天干，查找该宫位内星曜的自化（离心自化↓）
 * 以及该宫位天干对"对宫"星曜的向心自化（↑）
 * 
 * @param {number} ganIndex - 宫位天干索引
 * @param {object} selfPalace - 本宫对象（含 stars, auxStars）
 * @param {object} oppositePalace - 对宫对象（含 stars, auxStars）
 * @returns {object} { self: [{starName, type}] 离心↓, opposite: [{starName, type}] 向心↑ }
 */
function computePalaceSiHua(ganIndex, selfPalace, oppositePalace) {
  const [luKey, quanKey, keKey, jiKey] = PALACE_GAN_SIHUA[ganIndex];
  const targets = [
    { key: luKey, type: '禄' },
    { key: quanKey, type: '权' },
    { key: keKey, type: '科' },
    { key: jiKey, type: '忌' }
  ];

  const result = { self: [], opposite: [] };

  targets.forEach(function(t) {
    // 查找所有星曜名称（主星+辅星）以匹配
    const starName = STAR_NAMES[t.key] || AUX_STAR_NAMES[t.key];
    if (!starName) return;

    // 离心自化↓：天干对同宫内星曜的作用
    const inSelf = selfPalace.stars.find(function(s) { return s.name === starName; }) ||
                   selfPalace.auxStars.find(function(s) { return s.name === starName; });
    if (inSelf) {
      result.self.push({ starName: starName, type: t.type, starKey: t.key });
    }

    // 向心自化↑：天干对对宫内星曜的作用（从对宫化入）
    if (oppositePalace) {
      const inOpp = oppositePalace.stars.find(function(s) { return s.name === starName; }) ||
                    oppositePalace.auxStars.find(function(s) { return s.name === starName; });
      if (inOpp) {
        result.opposite.push({ starName: starName, type: t.type, starKey: t.key });
      }
    }
  });

  return result;
}

/**
 * 获取星曜在某个宫位的亮度等级
 * @returns {string} '庙'|'旺'|'得'|'利'|'平'|'不'|'陷'|''
 */
function getStarBrightness(starKey, zhiIndex) {
  const brightness = STAR_BRIGHTNESS[starKey];
  if (!brightness) return '';
  
  for (const [level, positions] of Object.entries(brightness)) {
    if (positions.includes(zhiIndex)) return level;
  }
  return '得'; // 默认
}

// ==================== 小星排布 ====================

function arrangeMinorStars(lunarMonth, shichenIdx, yearGanIndex, yearZhiIndex, dayGanIndex) {
  var m = {};

  // 天喜/红鸾：卯起子年逆数红鸾，对宫天喜
  var hongluanBase = (3 - yearZhiIndex + 12) % 12;
  m.hongluan = hongluanBase;
  m.tianxi = (hongluanBase + 6) % 12;

  // 天姚：丑起正月顺行
  m.tianyao = (1 + lunarMonth - 1) % 12;

  // 天哭/天虚：午起子年逆数天哭，对宫天虚
  var tiankuBase = (6 - yearZhiIndex + 12) % 12;
  m.tianku = tiankuBase;
  m.tianxu = (tiankuBase + 6) % 12;

  // 孤辰/寡宿：寅申巳亥三合
  var tri = yearZhiIndex % 4;
  // 寅午戌(0):孤辰巳,寡宿未 | 申子辰(1):孤辰亥,寡宿丑 | 巳酉丑(2):孤辰申,寡宿辰 | 亥卯未(3):孤辰寅,寡宿戌
  var guchenMap = [5, 11, 8, 2];
  var guasuMap = [7, 1, 4, 10];
  m.guchen = guchenMap[tri];
  m.guasu = guasuMap[tri];

  // 破碎：四孟年(寅申巳亥)，破碎在巳酉丑对应位
  var poSuiMap = [5, 9, 1, 7, 5, 9, 1, 7, 5, 9, 1, 7];
  m.posui = poSuiMap[yearZhiIndex];

  // 龙池/凤阁：辰戌二宫起，年干定
  m.longchi = (4 + yearGanIndex) % 12;
  m.fengge = (10 + yearGanIndex) % 12;

  // 三台/八座：左辅位+1为三台，右弼位+1为八座
  var zuofuZhi = (4 + lunarMonth - 1) % 12;
  var youbiZhi = (10 - lunarMonth + 1 + 12) % 12;
  m.santai = (zuofuZhi + 1) % 12;
  m.bazuo = (youbiZhi + 1) % 12;

  // 恩光/天贵：文昌位-1/+1
  var wenchangZhi = (10 - shichenIdx + 12) % 12;
  m.enguang = (wenchangZhi + 11) % 12;
  m.tiangui = (wenchangZhi + 1) % 12;

  // 天厨：年干
  var tianchuMap = [5, 6, 0, 6, 0, 6, 6, 2, 2, 6];
  m.tianchu = tianchuMap[yearGanIndex];

  // 天官/天福：年干
  var tianguanMap = [7, 4, 5, 11, 7, 4, 5, 8, 10, 10];
  var tianfuMap = [9, 8, 0, 10, 9, 8, 0, 3, 3, 3];
  m.tianguan = tianguanMap[yearGanIndex];
  m.tianfu = tianfuMap[yearGanIndex];

  // 台辅/封诰
  m.taifu = (dayGanIndex + 2) % 12;
  m.fenggao = (dayGanIndex + 8) % 12;

  // 截空/旬空：日干支定
  var jiekongBase = (10 - (dayGanIndex % 10) + 12) % 12;
  m.jiekong = jiekongBase;
  m.xunkong = (jiekongBase + 1) % 12;

  // 咸池：年支三合沐浴位
  var xianchiMap = [9, 6, 3, 0];
  m.xianchi = xianchiMap[tri];

  // 天德/月德
  var tiandeMap = [9, 7, 5, 3, 1, 10, 8, 6, 4, 2];
  m.tiande = tiandeMap[yearGanIndex % 10];
  var yuedeMap = [5, 3, 1, 11, 9, 5, 3, 1, 11, 9];
  m.yuede = yuedeMap[yearGanIndex % 10];

  // 天伤/天使
  m.tianshang = yearZhiIndex;
  m.tianshi = (yearZhiIndex + 6) % 12;

  // 天才/天寿：命宫地支定（暂用年支）
  m.tiancai = (yearZhiIndex + 3) % 12;
  m.tianshou = (yearZhiIndex + 9) % 12;

  // 天月：月支定
  var tianyueMap = [8, 5, 8, 2, 11, 8, 11, 5, 11, 5, 11, 5];
  m.tianyue2 = tianyueMap[lunarMonth - 1];

  // 天巫：月支
  var tianwuMap = [5, 8, 11, 2, 5, 8, 11, 2, 5, 8, 11, 2];
  m.tianwu = tianwuMap[lunarMonth - 1];

  // 解神/年解
  m.jieshen = (yearZhiIndex + 8) % 12;
  m.nianjie = (yearZhiIndex + 4) % 12;

  // 阴煞：月支
  var yinshaMap = [2, 5, 8, 11, 2, 5, 8, 11, 2, 5, 8, 11];
  m.yinsha = yinshaMap[lunarMonth - 1];

  // 天刑/天姚区分：酉起正月顺行为天刑
  m.tianxing = (9 + lunarMonth - 1) % 12;

  // 蜚廉
  var feilianMap = [8, 11, 2, 5, 8, 11, 2, 5, 8, 11, 2, 5];
  m.feilian = feilianMap[yearZhiIndex];

  // 天空
  var tiankongMap = [1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7, 4];
  m.tiankong = tiankongMap[yearZhiIndex];

  // 龙德
  var longdeMap = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6];
  m.longde = longdeMap[lunarMonth - 1];

  // 大耗
  m.dahao = (yearZhiIndex + 6) % 12;

  // 劫煞
  m.jiesha = (yearZhiIndex + 3) % 12;

  // 华盖：年支三合库位
  var huagaiMap = [4, 1, 10, 7];
  m.huagai = huagaiMap[tri];

  return m;
}

// ==================== 神煞 ====================

function arrangeShenSha(yearZhiIndex) {
  // 岁前星：岁建起年支顺行
  var suiQianNames = ['岁建','晦气','丧门','贯索','官符','小耗','岁破','龙德','白虎','天德','吊客','病符'];
  var suiQian = {};
  for (var i = 0; i < 12; i++) {
    suiQian[ZHI[(yearZhiIndex + i) % 12]] = suiQianNames[i];
  }

  // 将前星：將星起年支三合逆数
  var jiangQianNames = ['將星','攀鞍','岁驿','息神','华盖','劫煞','灾煞','天煞','指背','咸池','月煞','亡神'];
  var triBase = yearZhiIndex % 4;
  var jiangQi = [0, 9, 6, 3][triBase]; // 申子辰→子, 巳酉丑→酉, 寅午戌→午, 亥卯未→卯
  var jiangQian = {};
  for (var j = 0; j < 12; j++) {
    jiangQian[ZHI[(jiangQi + j) % 12]] = jiangQianNames[j];
  }

  // 十二长生 — 按宫位天干五行
  // 返回函数，调用时传入宫干
  function getChangsheng(ganIndex) {
    var elem = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5][ganIndex]; // 甲乙木(3),丙丁火(6),戊己土(5),庚辛金(4),壬癸水(2)
    // 木:长生亥(11), 火:长生寅(2), 土:长生寅(2)? 实际土与火同
    // 金:长生巳(5), 水:长生申(8)
    var csMap = {'木':'亥','火':'寅','土':'寅','金':'巳','水':'申'};
    var csZhi = [11, 2, 2, 5, 8][elem - 1]; // 按木火土金水
    var changNames = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
    return function(zhiIndex) {
      return changNames[(zhiIndex - csZhi + 12) % 12];
    };
  }

  // 太岁煞禄 — 年干定
  function getTaiSui(yearGanIndex) {
    // 甲年:博巳,力申,青亥... 简化用标准分布
    var boshiZhi = [5, 8, 11, 2, 5, 8, 11, 2, 5, 8][yearGanIndex % 10];
    var names = ['博士','力士','青龙','小耗','将军','奏书','飞廉','喜神','病符','大耗','伏兵','官符'];
    return function(zhiIndex) {
      return names[(zhiIndex - boshiZhi + 12) % 12];
    };
  }

  return { suiQian: suiQian, jiangQian: jiangQian, getChangsheng: getChangsheng, getTaiSui: getTaiSui };
}

// ==================== 大限/小限/流年 ====================

function calcDaXian(mingGongZhi, gender, bureauNum, yearGanIndex) {
  // 阳男阴女顺行，阴男阳女逆行 (阳年=甲丙戊庚壬)
  var yangGan = [0, 2, 4, 6, 8];
  var isYang = yangGan.indexOf(yearGanIndex) !== -1;
  var shun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);

  // 起运岁数 = 五行局数（顺行）或 五行局数+1（逆行）
  var startAge = shun ? bureauNum : bureauNum + 1;
  var result = [];
  for (var i = 0; i < 12; i++) {
    var offset = shun ? i : (12 - i) % 12;
    var zhiIdx = (mingGongZhi + offset) % 12;
    result.push({
      zhiIndex: zhiIdx,
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9
    });
  }
  return result;
}

function calcXiaoXian(yearZhiIndex, gender, age) {
  // 小限：男顺女逆从戌宫起生年
  var shun = gender === 'male';
  var base = shun ? (10 + age - 1) : (10 - age + 1 + 12);
  return (base % 12 + 12) % 12;
}

function calcLiuNian(yearZhiIndex, gender, age) {
  // 流年：太岁所在
  // 简化：逐年顺行
  return yearZhiIndex;
}

// ==================== 主排盘函数 ====================

/**
 * 完整紫微斗数排盘
 * @param {number} year - 公历年
 * @param {number} month - 公历月
 * @param {number} day - 公历日
 * @param {number} hour - 公历小时 (0-23)
 * @param {object} bazi - 八字数据（来自lunar.js的calculateBaZi）
 */
function calculateZiWeiChart(year, month, day, hour, bazi, gender) {
  const lunarMonth = bazi.lunar.lunarMonth;
  const lunarDay = bazi.lunar.lunarDay;
  const shichenIdx = bazi.hour.shichenIdx;
  const yearGanIndex = bazi.year.ganIndex;
  const yearZhiIndex = bazi.year.zhiIndex;
  
  // 1. 命宫
  const mingGongZhi = calcMingGongZhi(lunarMonth, shichenIdx);
  const mingGongGan = getTianGanByYearGanAndZhi(yearGanIndex, mingGongZhi);
  
  // 2. 身宫
  const shenGongZhi = calcShenGongZhi(lunarMonth, shichenIdx);
  
  // 3. 12宫安列（从命宫逆时针排）
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    const zhiIdx = (mingGongZhi - i + 12) % 12;
    const ganIdx = getTianGanByYearGanAndZhi(yearGanIndex, zhiIdx);
    palaces.push({
      name: PALACE_NAMES[i],
      zhiIndex: zhiIdx,
      ganIndex: ganIdx,
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      isShenGong: zhiIdx === shenGongZhi,
      stars: [],
      auxStars: [],
      minorStars: [],
      sihua: [],
      shenSha: {}
    });
  }
  
  // 4. 五行局
  const bureau = getElementBureau(mingGongGan, mingGongZhi);
  
  // 5. 紫微星位置
  const ziweiZhi = calcZiWeiPosition(bureau, lunarDay);
  
  // 6. 十四主星排布
  const starPositions = arrangeAllStars(ziweiZhi);
  
  // 7. 辅星排布
  const auxPositions = arrangeAuxStars(lunarMonth, shichenIdx, yearGanIndex, yearZhiIndex);
  
  // 8. 四化
  const sihua = getSiHua(yearGanIndex);
  
  // 9. 将星曜填充到各宫
  // 主星
  for (const [starKey, zhiIdx] of Object.entries(starPositions)) {
    const palace = palaces.find(p => p.zhiIndex === zhiIdx);
    if (palace) {
      palace.stars.push({
        key: starKey,
        name: STAR_NAMES[starKey],
        brightness: getStarBrightness(starKey, zhiIdx)
      });
    }
  }
  
  // 辅星
  for (const [auxKey, zhiIdx] of Object.entries(auxPositions)) {
    const palace = palaces.find(p => p.zhiIndex === zhiIdx);
    if (palace) {
      palace.auxStars.push({
        key: auxKey,
        name: AUX_STAR_NAMES[auxKey]
      });
    }
  }

  // 小星
  var dayGanIndex = bazi.day.ganIndex;
  var minorPositions = arrangeMinorStars(lunarMonth, shichenIdx, yearGanIndex, yearZhiIndex, dayGanIndex);
  for (var mk in minorPositions) {
    if (minorPositions.hasOwnProperty(mk)) {
      var mzhi = minorPositions[mk];
      var mpalace = palaces.find(function(p) { return p.zhiIndex === mzhi; });
      if (mpalace && MINOR_STAR_NAMES[mk]) {
        mpalace.minorStars.push({
          key: mk,
          name: MINOR_STAR_NAMES[mk]
        });
      }
    }
  }

  // 神煞
  var shenShaData = arrangeShenSha(yearZhiIndex);
  palaces.forEach(function(p) {
    p.shenSha = p.shenSha || {};
    p.shenSha.suiQian = shenShaData.suiQian[ZHI[p.zhiIndex]] || '';
    p.shenSha.jiangQian = shenShaData.jiangQian[ZHI[p.zhiIndex]] || '';
    p.shenSha.changSheng = shenShaData.getChangsheng(p.ganIndex)(p.zhiIndex);
    p.shenSha.taiSui = shenShaData.getTaiSui(yearGanIndex)(p.zhiIndex);
  });

  // 大限
  var daXian = calcDaXian(mingGongZhi, gender, bureau, yearGanIndex);

  // 子年斗君
  var ziNianDouJun = calcZiNianDouJun(lunarMonth, shichenIdx);

  // 命主/身主
  var mingZhu = MING_ZHU_MAP[mingGongZhi];
  var shenZhu = SHEN_ZHU_MAP[yearZhiIndex];
  
  // 生年四化标记
  const sihuaTypes = [
    { key: sihua.lu, type: '禄', source: '生年' },
    { key: sihua.quan, type: '权', source: '生年' },
    { key: sihua.ke, type: '科', source: '生年' },
    { key: sihua.ji, type: '忌', source: '生年' }
  ];
  
  for (var si = 0; si < sihuaTypes.length; si++) {
    var sit = sihuaTypes[si];
    var targetZhi = starPositions[sit.key];
    if (targetZhi === undefined) {
      targetZhi = auxPositions[sit.key];
    }
    if (targetZhi !== undefined) {
      var palace = palaces.find(function(p) { return p.zhiIndex === targetZhi; });
      if (palace) {
        palace.sihua.push({ starName: STAR_NAMES[sit.key] || AUX_STAR_NAMES[sit.key], type: sit.type, source: '生年' });
      }
    }
  }

  // 宫干四化（飞宫四化）：每个宫位的天干对同宫/对宫星曜的四化
  for (var pi = 0; pi < 12; pi++) {
    var selfP = palaces[pi];
    var oppIdx = (pi + 6) % 12; // 对宫 = 相差6位
    var oppP = palaces[oppIdx];
    var palaceSiHua = computePalaceSiHua(selfP.ganIndex, selfP, oppP);

    // 离心自化↓：天干化同宫星曜
    for (var si = 0; si < palaceSiHua.self.length; si++) {
      var s = palaceSiHua.self[si];
      // 标记到星曜上（不重复）
      var exists = selfP.sihua.some(function(x) { return x.starName === s.starName && x.type === s.type && x.source === '离心'; });
      if (!exists) {
        selfP.sihua.push({ starName: s.starName, type: s.type, source: '离心' });
      }
    }

    // 向心自化↑：天干化对宫星曜，记录在"对宫"的星曜上
    for (var sj = 0; sj < palaceSiHua.opposite.length; sj++) {
      var so = palaceSiHua.opposite[sj];
      var oppExists = oppP.sihua.some(function(x) { return x.starName === so.starName && x.type === so.type && x.source === '向心'; });
      if (!oppExists) {
        oppP.sihua.push({ starName: so.starName, type: so.type, source: '向心' });
      }
    }
  }
  
  // 来因宫：宫位天干与年干相同的宫
  var laiyinZhi = -1;
  for (var lpi = 0; lpi < 12; lpi++) {
    if (palaces[lpi].ganIndex === yearGanIndex) {
      laiyinZhi = palaces[lpi].zhiIndex;
      break;
    }
  }

  // 将大限数据附加到各宫
  daXian.forEach(function(dx) {
    var dp = palaces.find(function(p) { return p.zhiIndex === dx.zhiIndex; });
    if (dp) {
      dp.daXian = { startAge: dx.startAge, endAge: dx.endAge };
    }
  });

  // 小限：每个宫位对应的虚岁（男顺女逆，从戌宫起生年）
  palaces.forEach(function(p, pi) {
    var ages = [];
    for (var a = 1; a <= 99; a++) {
      if (calcXiaoXian(yearZhiIndex, gender, a) === p.zhiIndex) ages.push(a);
    }
    p.xiaoXian = ages;
    // 流年：太岁位
    p.liuNian = yearZhiIndex;
  });

  return {
    year: year,
    palaces,
    mingGong: {
      zhiIndex: mingGongZhi,
      ganIndex: mingGongGan,
      ganZhi: GAN[mingGongGan] + ZHI[mingGongZhi]
    },
    shenGong: {
      zhiIndex: shenGongZhi
    },
    bureau,
    bureauName: ELEMENT_NAMES[bureau],
    ziweiZhi,
    laiyinZhi,
    starPositions,
    auxPositions,
    sihua,
    mingZhu: mingZhu,
    shenZhu: shenZhu,
    ziNianDouJun: ziNianDouJun
  };
}

// ==================== 紫微合盘（两人盘对比） ====================
function calculateZiWeiSynastry(chart1, chart2, bazi1, bazi2) {
  var scores = [];
  var details = [];
  var totalScore = 0;
  var maxScore = 0;

  // 1. 命宫主星五行生克 (25分)
  maxScore += 25;
  var ming1Stars = getPalaceStars(chart1, chart1.mingGong.zhiIndex);
  var ming2Stars = getPalaceStars(chart2, chart2.mingGong.zhiIndex);
  var elem1 = getStarElements(ming1Stars);
  var elem2 = getStarElements(ming2Stars);
  var elemScore = calcElementCompatibility(elem1, elem2) * 25;
  scores.push({ name: '命宫五行契合度', score: Math.round(elemScore), max: 25, detail: '命宫主星五行生克关系' });
  totalScore += elemScore;
  if (elemScore >= 20) details.push('命宫主星五行相生，性格互补和谐');
  else if (elemScore >= 12) details.push('命宫主星五行中立，性格尚可磨合');
  else details.push('命宫主星五行相克，性格差异较大需更多的理解和包容');

  // 2. 夫妻宫互动 (20分)
  maxScore += 20;
  var fuqi1 = getPalaceStars(chart1, (chart1.mingGong.zhiIndex + 2) % 12);
  var fuqi2 = getPalaceStars(chart2, (chart2.mingGong.zhiIndex + 2) % 12);
  var fuqiCompat = calcElementCompatibility(getStarElements(fuqi1), getStarElements(fuqi2)) * 20;
  scores.push({ name: '夫妻宫和谐度', score: Math.round(fuqiCompat), max: 20, detail: '双方夫妻宫主星五行互动' });
  totalScore += fuqiCompat;
  if (fuqiCompat >= 14) details.push('夫妻宫相合，感情容易维系');
  else details.push('夫妻宫互动一般，需要更多经营');

  // 3. 四化飞入对方命宫/夫妻宫 (20分)
  maxScore += 20;
  var crossSihuaScore = calcCrossSihua(chart1, chart2);
  scores.push({ name: '四化互动', score: Math.round(crossSihuaScore * 20), max: 20, detail: '双方化禄化权化科是否入对方重要宫位' });
  totalScore += crossSihuaScore * 20;
  if (crossSihuaScore > 0.5) details.push('四化互动良好，缘分牵引力强');
  else details.push('四化互动较弱，缘分较淡');

  // 4. 命宫地支六合/三合 (15分)
  maxScore += 15;
  var zhiScore = calcZhiCompatibility(chart1.mingGong.zhiIndex, chart2.mingGong.zhiIndex) * 15;
  scores.push({ name: '命宫地支合度', score: Math.round(zhiScore), max: 15, detail: '命宫地支是否六合或三合' });
  totalScore += zhiScore;
  if (zhiScore >= 12) details.push('命宫地支相合，根基相投');
  else details.push('命宫地支无特殊合相');

  // 5. 命主星互动 (10分)
  maxScore += 10;
  var mingZhuScore = calcMingZhuCompat(chart1.mingZhu, chart2.mingZhu) * 10;
  scores.push({ name: '命主星互动', score: Math.round(mingZhuScore), max: 10, detail: '双方命主星的五行关系' });
  totalScore += mingZhuScore;

  // 6. 身宫关系 (10分)
  maxScore += 10;
  var shenScore = calcZhiCompatibility(chart1.shenGong.zhiIndex, chart2.shenGong.zhiIndex) * 10;
  scores.push({ name: '身宫和谐度', score: Math.round(shenScore), max: 10, detail: '身宫地支合度（后天发展重心）' });
  totalScore += shenScore;

  return {
    totalScore: Math.round(totalScore),
    maxScore: maxScore,
    scores: scores,
    details: details,
    verdict: totalScore >= 80 ? '天作之合，缘分深厚' :
             totalScore >= 60 ? '缘分不错，可以发展' :
             totalScore >= 40 ? '需要磨合，但仍有希望' : '缘分较浅，需要加倍努力'
  };
}

function getPalaceStars(chart, zhiIdx) {
  for (var i = 0; i < chart.palaces.length; i++) {
    if (chart.palaces[i].zhiIndex === zhiIdx) {
      return chart.palaces[i].stars.map(function(s) { return s.key; });
    }
  }
  return [];
}

function getStarElements(starKeys) {
  var STAR_ELEMENTS = {
    ziwei: '土', tianji: '木', taiyang: '火', wuqu: '金',
    tiantong: '水', lianzhen: '火', tianfu: '土', taiyin: '水',
    tanlang: '木', jumen: '水', tianxiang: '水', tianliang: '土',
    qisha: '金', pojund: '水'
  };
  var elements = [];
  starKeys.forEach(function(k) {
    if (STAR_ELEMENTS[k]) elements.push(STAR_ELEMENTS[k]);
  });
  return elements;
}

function calcElementCompatibility(elems1, elems2) {
  var ELEM_CYCLE = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };
  var bestScore = 0;
  elems1.forEach(function(e1) {
    elems2.forEach(function(e2) {
      var diff = (ELEM_CYCLE[e2] - ELEM_CYCLE[e1] + 5) % 5;
      if (diff === 0) bestScore = Math.max(bestScore, 1.0);    // 同
      else if (diff === 1) bestScore = Math.max(bestScore, 0.7); // 生
      else if (diff === 4) bestScore = Math.max(bestScore, 0.5); // 被生
      else bestScore = Math.max(bestScore, 0.2);                  // 克/被克
    });
  });
  return elems1.length === 0 || elems2.length === 0 ? 0.5 : bestScore;
}

function calcZhiCompatibility(z1, z2) {
  var sixHeMap = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  for (var i = 0; i < sixHeMap.length; i++) {
    if ((sixHeMap[i][0] === z1 && sixHeMap[i][1] === z2) || (sixHeMap[i][1] === z1 && sixHeMap[i][0] === z2)) return 1.0;
  }
  if ((z1 + 4) % 12 === z2 || (z2 + 4) % 12 === z1) return 0.8;
  if (z1 === z2) return 0.6;
  if ((z1 + 6) % 12 === z2) return 0.3;
  return 0.4;
}

function calcCrossSihua(chart1, chart2) {
  var score = 0;
  var targetZhis = [chart2.mingGong.zhiIndex, (chart2.mingGong.zhiIndex + 2) % 12]; // 对方命宫+夫妻宫
  chart1.palaces.forEach(function(p1) {
    (p1.sihua || []).forEach(function(sh) {
      if (sh.type === '禄' || sh.type === '权' || sh.type === '科') {
        for (var i = 0; i < p1.stars.length; i++) {
          if (p1.stars[i].name === sh.starName) {
            // 找到这颗星在chart2的哪个宫
            chart2.palaces.forEach(function(p2) {
              for (var j = 0; j < p2.stars.length; j++) {
                if (p2.stars[j].name === sh.starName && targetZhis.indexOf(p2.zhiIndex) !== -1) {
                  score += sh.type === '禄' ? 0.5 : 0.25;
                }
              }
            });
          }
        }
      }
    });
  });
  // 双向计算
  chart2.palaces.forEach(function(p2) {
    (p2.sihua || []).forEach(function(sh) {
      if (sh.type === '禄' || sh.type === '权' || sh.type === '科') {
        for (var i = 0; i < p2.stars.length; i++) {
          if (p2.stars[i].name === sh.starName) {
            chart1.palaces.forEach(function(p1) {
              for (var j = 0; j < p1.stars.length; j++) {
                if (p1.stars[j].name === sh.starName && [chart1.mingGong.zhiIndex, (chart1.mingGong.zhiIndex + 2) % 12].indexOf(p1.zhiIndex) !== -1) {
                  score += sh.type === '禄' ? 0.5 : 0.25;
                }
              }
            });
          }
        }
      }
    });
  });
  return Math.min(score, 1.0);
}

function calcMingZhuCompat(mz1, mz2) {
  var elemMap = { '紫微':'土','天机':'木','太阳':'火','武曲':'金','天同':'水','廉贞':'火','天府':'土','太阴':'水','贪狼':'木','巨门':'水','天相':'水','天梁':'土','七杀':'金','破军':'水' };
  var e1 = elemMap[mz1] || '土';
  var e2 = elemMap[mz2] || '土';
  return calcElementCompatibility([e1], [e2]);
}

// ==================== 宫位量化评分 ====================
function scorePalaces(chart) {
  return chart.palaces.map(function(p) {
    var score = 50; // 基准分
    // 主星庙旺加分
    p.stars.forEach(function(s) {
      if (s.brightness === '庙') score += 15;
      else if (s.brightness === '旺') score += 10;
      else if (s.brightness === '得') score += 5;
      else if (s.brightness === '陷') score -= 10;
      else if (s.brightness === '不') score -= 5;
    });
    // 吉星加分
    p.auxStars.forEach(function(a) {
      if (['zuofu','youbi','wenchang','wenqu','tiankui','tianyue','lucun'].indexOf(a.key) !== -1) score += 5;
      if (['qingyang','tuoluo','huoxing','lingxing','dikong','dijie'].indexOf(a.key) !== -1) score -= 5;
    });
    // 四化影响
    (p.sihua || []).forEach(function(sh) {
      if (sh.type === '禄') score += 8;
      else if (sh.type === '权') score += 5;
      else if (sh.type === '科') score += 6;
      else if (sh.type === '忌') score -= 8;
    });
    // 无主星空宫扣分
    if (p.stars.length === 0) score -= 10;
    return {
      name: p.name,
      score: Math.max(0, Math.min(100, score)),
      level: score >= 80 ? '强宫' : score >= 60 ? '中上' : score >= 40 ? '中等' : score >= 20 ? '偏弱' : '弱宫',
      zhiIndex: p.zhiIndex
    };
  });
}

// ==================== 宫位网格布局 ====================
// 将12地支映射到4x4网格的显示位置
//  巳(5) 午(6) 未(7) 申(8)
//  辰(4)             酉(9)
//  卯(3)             戌(10)
//  寅(2) 丑(1) 子(0) 亥(11)
const ZHI_TO_GRID = [
  { row: 3, col: 2 }, // 0: 子
  { row: 3, col: 1 }, // 1: 丑
  { row: 3, col: 0 }, // 2: 寅
  { row: 2, col: 0 }, // 3: 卯
  { row: 1, col: 0 }, // 4: 辰
  { row: 0, col: 0 }, // 5: 巳
  { row: 0, col: 1 }, // 6: 午
  { row: 0, col: 2 }, // 7: 未
  { row: 0, col: 3 }, // 8: 申
  { row: 1, col: 3 }, // 9: 酉
  { row: 2, col: 3 }, // 10: 戌
  { row: 3, col: 3 }  // 11: 亥
];

// 如果在 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PALACE_NAMES, STAR_NAMES, AUX_STAR_NAMES, MINOR_STAR_NAMES, ELEMENT_NAMES,
    NAYIN_ELEMENT, STAR_BRIGHTNESS, BRIGHTNESS_ORDER, ZHI_TO_GRID,
    calcMingGongZhi, calcShenGongZhi, getTianGanByYearGanAndZhi,
    getElementBureau, calcZiWeiPosition, arrangeAllStars,
    arrangeAuxStars, arrangeMinorStars, arrangeShenSha,
    getSiHua, computePalaceSiHua, getStarBrightness,
    calcDaXian, calcXiaoXian, calculateZiWeiChart,
    calculateZiWeiSynastry, scorePalaces
  };
}
