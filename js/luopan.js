/**
 * 风水罗盘 & 玄空飞星 — 廿四山 · 二十四向 · 年星飞宫 · 月星飞宫
 * Fengshui Compass — 24 Mountains · Annual/Monthly Flying Stars
 */
var FengShuiLuopan = (function() {

  // ============ 廿四山 (24 Mountains) ============
  // 每山15°, 按北(子)0°顺时针排列

  var MOUNTAINS = [
    {idx:0,  name:'子', full:'子',    dir:'N', deg:0,   trigram:'坎', wx:'水', yinYang:'yang'},
    {idx:1,  name:'癸', full:'癸',    dir:'N', deg:15,  trigram:'坎', wx:'水', yinYang:'yin'},
    {idx:2,  name:'丑', full:'丑',    dir:'NE',deg:30,  trigram:'艮', wx:'土', yinYang:'yin'},
    {idx:3,  name:'艮', full:'艮',    dir:'NE',deg:45,  trigram:'艮', wx:'土', yinYang:'yang'},
    {idx:4,  name:'寅', full:'寅',    dir:'NE',deg:60,  trigram:'艮', wx:'土', yinYang:'yang'},
    {idx:5,  name:'甲', full:'甲',    dir:'E', deg:75,  trigram:'震', wx:'木', yinYang:'yang'},
    {idx:6,  name:'卯', full:'卯',    dir:'E', deg:90,  trigram:'震', wx:'木', yinYang:'yang'},
    {idx:7,  name:'乙', full:'乙',    dir:'E', deg:105, trigram:'震', wx:'木', yinYang:'yin'},
    {idx:8,  name:'辰', full:'辰',    dir:'SE',deg:120, trigram:'巽', wx:'土', yinYang:'yang'},
    {idx:9,  name:'巽', full:'巽',    dir:'SE',deg:135, trigram:'巽', wx:'木', yinYang:'yin'},
    {idx:10, name:'巳', full:'巳',    dir:'SE',deg:150, trigram:'巽', wx:'火', yinYang:'yin'},
    {idx:11, name:'丙', full:'丙',    dir:'S', deg:165, trigram:'离', wx:'火', yinYang:'yang'},
    {idx:12, name:'午', full:'午',    dir:'S', deg:180, trigram:'离', wx:'火', yinYang:'yang'},
    {idx:13, name:'丁', full:'丁',    dir:'S', deg:195, trigram:'离', wx:'火', yinYang:'yin'},
    {idx:14, name:'未', full:'未',    dir:'SW',deg:210, trigram:'坤', wx:'土', yinYang:'yin'},
    {idx:15, name:'坤', full:'坤',    dir:'SW',deg:225, trigram:'坤', wx:'土', yinYang:'yin'},
    {idx:16, name:'申', full:'申',    dir:'SW',deg:240, trigram:'坤', wx:'土', yinYang:'yang'},
    {idx:17, name:'庚', full:'庚',    dir:'W', deg:255, trigram:'兑', wx:'金', yinYang:'yang'},
    {idx:18, name:'酉', full:'酉',    dir:'W', deg:270, trigram:'兑', wx:'金', yinYang:'yin'},
    {idx:19, name:'辛', full:'辛',    dir:'W', deg:285, trigram:'兑', wx:'金', yinYang:'yin'},
    {idx:20, name:'戌', full:'戌',    dir:'NW',deg:300, trigram:'乾', wx:'土', yinYang:'yang'},
    {idx:21, name:'乾', full:'乾',    dir:'NW',deg:315, trigram:'乾', wx:'金', yinYang:'yang'},
    {idx:22, name:'亥', full:'亥',    dir:'NW',deg:330, trigram:'乾', wx:'水', yinYang:'yang'},
    {idx:23, name:'壬', full:'壬',    dir:'N', deg:345, trigram:'坎', wx:'水', yinYang:'yang'}
  ];

  // ============ 玄空九星 ============
  var FLYING_STARS = [
    {num:1, name:'贪狼', wx:'水', color:'#6090d0', ji:true,  desc:'文昌星·主智慧和桃花，宜书房卧室'},
    {num:2, name:'巨门', wx:'土', color:'#c4a44a', ji:false, desc:'病符星·主疾病烦恼，宜泄不宜克'},
    {num:3, name:'禄存', wx:'木', color:'#5da85d', ji:false, desc:'蚩尤星·主是非口舌，宜制化'},
    {num:4, name:'文曲', wx:'木', color:'#7ec87e', ji:true,  desc:'文昌星·主学业官贵，宜书房'},
    {num:5, name:'廉贞', wx:'土', color:'#d0a040', ji:false, desc:'五黄煞·大凶星，宜静不宜动，忌动土'},
    {num:6, name:'武曲', wx:'金', color:'#d4c080', ji:true,  desc:'武曲星·主权贵偏财，宜大门办公室'},
    {num:7, name:'破军', wx:'金', color:'#e0d080', ji:false, desc:'肃杀星·主盗贼伤害，宜泄制'},
    {num:8, name:'左辅', wx:'土', color:'#c8a860', ji:true,  desc:'财星·主正财横财，宜大门厨房'},
    {num:9, name:'右弼', wx:'火', color:'#e06040', ji:true,  desc:'喜星·主喜庆婚姻，宜客厅卧室'}
  ];

  // ============ 年星飞宫 (按年份) ============
  // 年星入中: 1900年→1白, 逐年逆飞 (9-8-7-...)
  // 简化: 2000年→9紫入中
  function getYearStarInCenter(year) {
    var offset = (year - 2000 + 9000) % 9;
    var centerStar = (9 - offset + 9) % 9;
    if (centerStar === 0) centerStar = 9;
    return centerStar;
  }

  /**
   * 计算年星飞布到九宫
   * 返回: [{gong:1-9, star:1-9}]
   */
  function computeYearStars(year) {
    var centerStar = getYearStarInCenter(year);
    return computeFlyingGrid(centerStar, 'yang');
  }

  /**
   * 计算月星飞布
   */
  function computeMonthStars(year, month) {
    // 月份: 子午卯酉年正月起8白, 辰戌丑未年正月起5黄, 寅申巳亥年正月起2黑
    var zhiIdx = (year - 4) % 12;
    var group = zhiIdx % 4; // 0=子午卯酉, 1=辰戌丑未, 2=寅申巳亥, 3=子午卯酉
    var janStartMap = {0:8, 1:5, 2:2, 3:8};
    var janStar = janStartMap[group] || 8;

    // 月逆飞
    var monthStar = (janStar - (month - 1) + 108) % 9;
    if (monthStar === 0) monthStar = 9;

    return computeFlyingGrid(monthStar, 'yang');
  }

  /**
   * 飞星九宫布局 (通用)
   * centerStar: 入中的星数 1-9
   * direction: 'yang'顺飞 / 'yin'逆飞
   * 飞星顺序: 中→乾→兑→艮→离→坎→坤→震→巽
   */
  var FLY_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4];

  function computeFlyingGrid(centerStar, direction) {
    var stars = [];
    // Step through each gong in fly order
    for (var i = 0; i < 9; i++) {
      var gong = FLY_ORDER[i];
      var starIdx;
      if (i === 0) {
        starIdx = centerStar - 1; // 0-indexed
      } else {
        // From center, yang=顺(star increases), yin=逆(star decreases)
        var step = direction === 'yang' ? i : (9 - i);
        starIdx = (centerStar - 1 + step) % 9;
      }
      var starNum = starIdx + 1;
      stars.push({ gong: gong, starNum: starNum, star: FLYING_STARS[starNum-1] });
    }
    return stars;
  }

  // ============ 廿四山三元九运 ============
  // 当前下元八运: 2004-2023, 九运: 2024-2043
  function getCurrentYun(year) {
    if (year >= 2024 && year <= 2043) return {yun:9, name:'九运', range:'2024-2043', element:'火'};
    if (year >= 2004 && year <= 2023) return {yun:8, name:'八运', range:'2004-2023', element:'土'};
    if (year >= 1984 && year <= 2003) return {yun:7, name:'七运', range:'1984-2003', element:'金'};
    if (year >= 1964 && year <= 1983) return {yun:6, name:'六运', range:'1964-1983', element:'金'};
    return {yun:9, name:'九运', range:'2024-2043', element:'火'};
  }

  // ============ 坐向选择 ============
  function findMountainByName(name) {
    for (var i = 0; i < MOUNTAINS.length; i++) {
      if (MOUNTAINS[i].name === name || MOUNTAINS[i].full === name) return MOUNTAINS[i];
    }
    return MOUNTAINS[0];
  }

  /**
   * 玄空排盘 (山星/向星/运星)
   */
  function computeXuanKongPan(mountainName, year) {
    var mt = findMountainByName(mountainName);
    var yun = getCurrentYun(year);

    // 简化玄空排盘: 基于廿四山的三元龙
    // 地元龙: 壬丙甲庚辰戌丑未
    // 天元龙: 子午卯酉乾坤艮巽
    // 人元龙: 癸丁乙辛寅申巳亥
    var diYuan = ['壬','丙','甲','庚','辰','戌','丑','未'];
    var tianYuan = ['子','午','卯','酉','乾','坤','艮','巽'];
    var renYuan = ['癸','丁','乙','辛','寅','申','巳','亥'];

    var isTian = tianYuan.indexOf(mt.name) >= 0;
    var isDi = diYuan.indexOf(mt.name) >= 0;
    var isRen = renYuan.indexOf(mt.name) >= 0;

    var dragonType = isTian ? '天元龙' : isDi ? '地元龙' : '人元龙';

    // 返返回基础数据（完整玄空排盘实现需要更多时间）
    return {
      mountain: mt,
      yun: yun,
      dragonType: dragonType,
      year: year
    };
  }

  // ============ 灶位/门位吉凶 ============
  var DOOR_KITCHEN_TIPS = {
    '坎':{good:'东·东南', bad:'西南', desc:'正北开门宜在东或东南方安灶'},
    '坤':{good:'西北·西', bad:'东', desc:'西南开门宜在西北或西方安灶'},
    '震':{good:'南·北',   bad:'西', desc:'正东开门宜在南或北方安灶'},
    '巽':{good:'北·西北', bad:'西南', desc:'东南开门宜在北或西北安灶'},
    '乾':{good:'西·西南', bad:'南', desc:'西北开门宜在西或西南安灶'},
    '兑':{good:'西南·东', bad:'北', desc:'正西开门宜在西南或东方安灶'},
    '艮':{good:'南·西南', bad:'北', desc:'东北开门宜在南或西南安灶'},
    '离':{good:'东·东南', bad:'北', desc:'正南开宜在东或东南安灶'}
  };

  // ============ 罗盘度数转廿四山 ============
  function degToMountain(degrees) {
    var d = ((degrees % 360) + 360) % 360;
    var idx = Math.round(d / 15) % 24;
    return MOUNTAINS[idx];
  }

  return {
    MOUNTAINS: MOUNTAINS,
    FLYING_STARS: FLYING_STARS,
    FLY_ORDER: FLY_ORDER,
    computeYearStars: computeYearStars,
    computeMonthStars: computeMonthStars,
    computeFlyingGrid: computeFlyingGrid,
    getCurrentYun: getCurrentYun,
    findMountainByName: findMountainByName,
    computeXuanKongPan: computeXuanKongPan,
    degToMountain: degToMountain,
    DOOR_KITCHEN_TIPS: DOOR_KITCHEN_TIPS,
    getYearStarInCenter: getYearStarInCenter
  };

})();
