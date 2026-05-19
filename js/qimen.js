/**
 * 奇门遁甲 — 时家奇门 · 拆补法排盘
 * Qimen Dunjia — Time-based, Dismantle-Supplement Method
 */
var QiMen = (function() {

  // ============ 基础数据 ============

  // 24节气 → [阳/阴遁, 局数范围]
  // 冬至~芒种: 阳遁 (Yang); 夏至~大雪: 阴遁 (Yin)
  var JIEQI_BUREAU = [
    {jie:'冬至', startMMDD:[12,22], dun:'yang', range:[1,9]},   // 阳遁1局~9局
    {jie:'小寒', startMMDD:[1,5],   dun:'yang', range:[2,8]},
    {jie:'大寒', startMMDD:[1,20],  dun:'yang', range:[3,6]},
    {jie:'立春', startMMDD:[2,4],   dun:'yang', range:[8,5]},
    {jie:'雨水', startMMDD:[2,19],  dun:'yang', range:[9,6]},
    {jie:'惊蛰', startMMDD:[3,6],   dun:'yang', range:[1,4]},
    {jie:'春分', startMMDD:[3,21],  dun:'yang', range:[3,9]},
    {jie:'清明', startMMDD:[4,5],   dun:'yang', range:[4,1]},
    {jie:'谷雨', startMMDD:[4,20],  dun:'yang', range:[5,2]},
    {jie:'立夏', startMMDD:[5,5],   dun:'yang', range:[6,3]},
    {jie:'小满', startMMDD:[5,21],  dun:'yang', range:[8,5]},
    {jie:'芒种', startMMDD:[6,6],   dun:'yang', range:[9,4]},
    {jie:'夏至', startMMDD:[6,21],  dun:'yin',  range:[9,1]},   // 阴遁9局~1局
    {jie:'小暑', startMMDD:[7,7],   dun:'yin',  range:[8,2]},
    {jie:'大暑', startMMDD:[7,23],  dun:'yin',  range:[7,1]},
    {jie:'立秋', startMMDD:[8,7],   dun:'yin',  range:[2,5]},
    {jie:'处暑', startMMDD:[8,23],  dun:'yin',  range:[1,6]},
    {jie:'白露', startMMDD:[9,8],   dun:'yin',  range:[9,3]},
    {jie:'秋分', startMMDD:[9,23],  dun:'yin',  range:[7,1]},
    {jie:'寒露', startMMDD:[10,8],  dun:'yin',  range:[6,9]},
    {jie:'霜降', startMMDD:[10,23], dun:'yin',  range:[5,8]},
    {jie:'立冬', startMMDD:[11,7],  dun:'yin',  range:[4,6]},
    {jie:'小雪', startMMDD:[11,22], dun:'yin',  range:[3,5]},
    {jie:'大雪', startMMDD:[12,7],  dun:'yin',  range:[1,4]}
  ];

  // 八卦 → 九宫格位置 (后天文王八卦)
  var GONG_MAP = { 坎:1, 坤:2, 震:3, 巽:4, 中:5, 乾:6, 兑:7, 艮:8, 离:9 };

  // 九宫格显示位置（洛书）：row/col 0-indexed
  var LUOSHU_POS = {
    4:{r:0,c:0}, 9:{r:0,c:1}, 2:{r:0,c:2},
    3:{r:1,c:0}, 5:{r:1,c:1}, 7:{r:1,c:2},
    8:{r:2,c:0}, 1:{r:2,c:1}, 6:{r:2,c:2}
  };

  // 地盘干（固定）
  var EARTH_STEM = {1:'子',2:'申',3:'卯',4:'巳',5:'戊己',6:'午',7:'酉',8:'寅',9:'亥'};

  // 九星 (petal number, name)
  var STARS = [
    {n:1,name:'天蓬',wx:'水',color:'#4a90d9'},
    {n:2,name:'天芮',wx:'土',color:'#c4a44a'},
    {n:3,name:'天冲',wx:'木',color:'#5da85d'},
    {n:4,name:'天辅',wx:'木',color:'#7ec87e'},
    {n:5,name:'天禽',wx:'土',color:'#d0a040'},
    {n:6,name:'天心',wx:'金',color:'#d4c080'},
    {n:7,name:'天柱',wx:'金',color:'#e0d080'},
    {n:8,name:'天任',wx:'土',color:'#c8a860'},
    {n:9,name:'天英',wx:'火',color:'#e06040'}
  ];

  // 八门
  var DOORS = [
    {n:1,name:'休门',wx:'水',desc:'吉门，主休养、婚姻、谒贵'},
    {n:2,name:'死门',wx:'土',desc:'凶门，主丧葬、刑戮'},
    {n:3,name:'伤门',wx:'木',desc:'凶门，主疾病、车祸、竞争'},
    {n:4,name:'杜门',wx:'木',desc:'平门，主隐遁、保密、闭塞'},
    {n:5,name:'中门',wx:'土',desc:'寄坤二宫'},
    {n:6,name:'开门',wx:'金',desc:'吉门，主开业、出行、上任'},
    {n:7,name:'惊门',wx:'金',desc:'凶门，主惊恐、官司、口舌'},
    {n:8,name:'生门',wx:'土',desc:'吉门，主财运、求财、生机'},
    {n:9,name:'景门',wx:'火',desc:'平门，主文书、考试、宴会'}
  ];

  // 八神
  var SPIRITS = ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'];

  // 九宫 → 八卦名称
  var GUA_NAME = {1:'坎',2:'坤',3:'震',4:'巽',5:'中宫',6:'乾',7:'兑',8:'艮',9:'离'};

  // 八卦 → 意象
  var GUA_YI = {
    '坎':'水·险陷·北方','坤':'地·柔顺·西南','震':'雷·震动·东方',
    '巽':'风·入·东南','中宫':'中·调候','乾':'天·刚健·西北',
    '兑':'泽·悦·西方','艮':'山·止·东北','离':'火·丽·南方'
  };

  // ============ 核心算法 ============

  /**
   * 太阳黄经度数 → 节气索引 (0-23)
   * 使用儒略日近似
   */
  function solarLongitudeApprox(year, month, day) {
    // 简化近似：基于日期估算黄经
    var dayOfYear = 0;
    var monthDays = [0,31,28,31,30,31,30,31,31,30,31,30,31];
    if (year%4===0&&(year%100!==0||year%400===0)) monthDays[2]=29;
    for (var i=1;i<month;i++) dayOfYear += monthDays[i];
    dayOfYear += day;

    // 春分点在3月20日左右，太阳黄经0°
    var vernalEquinoxDOY = 79; // 约3月20日
    var solarLong = ((dayOfYear - vernalEquinoxDOY) / 365.25) * 360;
    if (solarLong < 0) solarLong += 360;

    // 每15°一个节气，从春分(0°)开始
    // 黄经315°=立春(节气0)
    var jieqiIdx = Math.floor(((solarLong + 45) % 360) / 15);
    return jieqiIdx;
  }

  /**
   * 根据阳历年月日确定奇门用局
   * 返回 {dun:'yang'|'yin', ju:1-9, jieqi:string, yuan:'上元'|'中元'|'下元'}
   */
  function determineBureau(year, month, day, ganzhiDay) {
    // 1. 确定节气
    var dayOfYear = 0;
    var monthDays = [0,31,28,31,30,31,30,31,31,30,31,30,31];
    if (year%4===0&&(year%100!==0||year%400===0)) monthDays[2]=29;
    for (var i=1;i<month;i++) dayOfYear += monthDays[i];
    dayOfYear += day;

    // 节气简化判断（按中气日期近似）
    var jieqiApprox = [
      {startDOY:0,   endDOY:14,  idx:23}, // 大雪→冬至
      {startDOY:15,  endDOY:34,  idx:0},  // 冬至→小寒
      {startDOY:35,  endDOY:49,  idx:1},  // 小寒→大寒
      {startDOY:50,  endDOY:63,  idx:2},  // 大寒→立春
      {startDOY:64,  endDOY:78,  idx:3},  // 立春→雨水
      {startDOY:79,  endDOY:93,  idx:4},  // 雨水→惊蛰
      {startDOY:94,  endDOY:108, idx:5},  // 惊蛰→春分
      {startDOY:109, endDOY:123, idx:6},  // 春分→清明
      {startDOY:124, endDOY:138, idx:7},  // 清明→谷雨
      {startDOY:139, endDOY:153, idx:8},  // 谷雨→立夏
      {startDOY:154, endDOY:168, idx:9},  // 立夏→小满
      {startDOY:169, endDOY:183, idx:10}, // 小满→芒种
      {startDOY:184, endDOY:198, idx:11}, // 芒种→夏至
      {startDOY:199, endDOY:213, idx:12}, // 夏至→小暑
      {startDOY:214, endDOY:228, idx:13}, // 小暑→大暑
      {startDOY:229, endDOY:243, idx:14}, // 大暑→立秋
      {startDOY:244, endDOY:258, idx:15}, // 立秋→处暑
      {startDOY:259, endDOY:273, idx:16}, // 处暑→白露
      {startDOY:274, endDOY:288, idx:17}, // 白露→秋分
      {startDOY:289, endDOY:303, idx:18}, // 秋分→寒露
      {startDOY:304, endDOY:318, idx:19}, // 寒露→霜降
      {startDOY:319, endDOY:333, idx:20}, // 霜降→立冬
      {startDOY:334, endDOY:348, idx:21}, // 立冬→小雪
      {startDOY:349, endDOY:365, idx:22}  // 小雪→大雪
    ];

    var jqIdx = 22; // default
    for (var i=0;i<jieqiApprox.length;i++) {
      if (dayOfYear >= jieqiApprox[i].startDOY && dayOfYear <= jieqiApprox[i].endDOY) {
        jqIdx = jieqiApprox[i].idx;
        break;
      }
    }

    // 2. 确定局数
    // 拆补法：根据日干支和节气确定上/中/下元
    // 日干支索引：甲己为符头
    var ganIdx = ganzhiDay ? ganzhiDay.ganIndex : (year * 365 + dayOfYear) % 10;
    var fuTouOff = ganIdx % 5; // 0=甲/己符头

    // 三元：上元(符头后第1-5天), 中元(第6-10天), 下元(第11-15天)
    // 简化：用日干支序号 % 15 来确定三元
    var daySeq = ((year * 365 + dayOfYear + 10) % 60 + 60) % 60; // 近似
    var yuanSeq = Math.floor(daySeq / 5) % 3; // 0/1/2 → 上/中/下元

    var bureauInfo = JIEQI_BUREAU[jqIdx];
    var jieqi = bureauInfo.jie;
    var dun = bureauInfo.dun;
    var range = bureauInfo.range;
    var yuanNames = ['上元','中元','下元'];
    var yuanName = yuanNames[yuanSeq];

    // 局数：上元=range[0], 中/下元依次变化
    var ju;
    if (dun === 'yang') {
      // 阳遁：上元→中元→下元，局数递进
      if (yuanSeq === 0) ju = range[0];
      else if (yuanSeq === 1) ju = range[0] + (range[0]+5 > 9 ? range[1]-range[0] : 5);
      else ju = range[1] || (range[0]+5 > 9 ? 9 : range[0]+5);
    } else {
      // 阴遁：上元→中元→下元，局数递退
      if (yuanSeq === 0) ju = range[0];
      else if (yuanSeq === 1) ju = range[0] - 5;
      else ju = range[1] || 1;
    }
    // 边界处理
    ju = Math.max(1, Math.min(9, ju));

    return {dun:dun, ju:ju, jieqi:jieqi, yuan:yuanName, jqIdx:jqIdx};
  }

  /**
   * 时辰 → 值符星 & 值使门
   * 地盘星按局数排列，值符为时干所在之宫的原星
   */
  function findZhiFuStarAndDoor(bureau, shiGanIdx, shiZhiIdx) {
    var ju = bureau.ju;
    var dun = bureau.dun;

    // 地盘星排列：阳遁顺排，阴遁逆排
    var earthStars = []; // earthStars[gong] = starNum (gong 1-9)
    var starSeq = [1,2,3,4,5,6,7,8,9];
    if (dun === 'yin') starSeq = [1,9,8,7,6,5,4,3,2]; // 阴遁逆排

    for (var i=0;i<9;i++) {
      var gong = ((ju - 1 + i) % 9) + 1;
      earthStars[gong] = starSeq[i];
    }

    // 时干 → 地盘干所在宫位
    // 地盘干固定：坎1=戊己, 坤2=申(庚), 震3=卯(乙), 巽4=巳(丙),
    //   中5=戊己, 乾6=午(丁), 兑7=酉(辛), 艮8=寅(壬), 离9=亥(癸)
    var GAN_TO_GONG = {}; // gan index → gong
    // 地盘奇仪：戊在坎1(阳遁1局)
    var baseGong = ju;
    for (var i=0;i<10;i++) {
      var gong = dungeonToGong(jizz(baseGong, dun, i));
      GAN_TO_GONG[i] = gong;
    }

    var zhiFuGong = GAN_TO_GONG[shiGanIdx];
    var zhiFuStar = earthStars[zhiFuGong];

    // 值使门：时支所在宫位的地盘门
    // 门排列：休1→死2→伤3→杜4→中5→开6→惊7→生8→景9
    var earthDoors = [];
    if (dun === 'yang') {
      for (var i=0;i<9;i++) earthDoors[((ju-1+i)%9)+1] = (i%9)+1;
    } else {
      for (var i=0;i<9;i++) earthDoors[((ju-1+9-i)%9)+1] = (i%9)+1;
    }

    // 值使门：
    // 旬首（甲-戊 = shiXunShou）在地盘的位置
    // shiZhiIdx → 属旬
    var xunOff = Math.floor(shiZhiIdx / 2) * 2; // 旬首地支：子0丑1→0, 寅2卯3→2, ...
    var xunShouZhi = [0,2,4,6,8,10][Math.floor(shiZhiIdx / 2)];
    if (xunShouZhi === undefined) xunShouZhi = 0;

    var zhiShiGong = GAN_TO_GONG[ganForXunShou(xunShouZhi)];
    var zhiShiDoor = earthDoors[zhiShiGong] || 6;

    return {
      zhiFuStar: zhiFuStar || 1,
      zhiFuGong: zhiFuGong,
      zhiShiDoor: zhiShiDoor,
      zhiShiGong: zhiShiGong,
      earthStars: earthStars,
      earthDoors: earthDoors,
      GAN_TO_GONG: GAN_TO_GONG
    };
  }

  function dungeonToGong(baseGong, dun, offset) {
    var g;
    if (offset === 0) {
      g = baseGong;
    } else {
      var step = dun === 'yang' ? offset : -offset;
      g = ((baseGong - 1 + step + 9) % 9) + 1;
    }
    return g === 5 ? 2 : g; // 中5寄坤2
  }

  function jizz(baseGong, dun, i) {
    if (i === 0) return baseGong;
    return dungeonToGong(baseGong, dun, i);
  }

  function ganForXunShou(xunShouZhi) {
    // 旬首地支→旬首天干
    // 六旬：甲子戊(0), 甲戌己(1), 甲申庚(2), 甲午辛(3), 甲辰壬(4), 甲寅癸(5)
    var map = {0:4, 2:5, 4:6, 6:7, 8:8, 10:9}; // zhouShouZhi → ganIdx
    return map[xunShouZhi] !== undefined ? map[xunShouZhi] : 4;
  }

  /**
   * 完整排盘
   */
  function compute(year, month, day, hour, minute) {
    // 1. 临时复用全局 bazi 数据获取干支
    // 若无法获取，则用简化计算
    var shiGanIdx, shiZhiIdx, dayGanIdx, dayZhiIdx;

    var bazi;
    if (typeof currentBazi !== 'undefined' && currentBazi) {
      bazi = currentBazi;
      shiGanIdx = bazi.hour.ganIndex;
      shiZhiIdx = bazi.hour.zhiIndex;
      dayGanIdx = bazi.day.ganIndex;
      dayZhiIdx = bazi.day.zhiIndex;
    } else {
      // 简化干支计算
      var jd;
      if (typeof gregorianToJDN === 'function') {
        jd = gregorianToJDN(year, month, day);
      } else {
        jd = Math.floor((year * 365.25 + month * 30.4 + day + 1720994.5));
      }
      dayGanIdx = Math.floor(((jd + 49) % 60 + 60) % 60) % 10;
      dayZhiIdx = Math.floor(((jd + 49) % 60 + 60) % 60) % 12;
      var shichen = hour >= 23 || hour < 1 ? 0 : hour < 3 ? 1 : hour < 5 ? 2 : hour < 7 ? 3 : hour < 9 ? 4 : hour < 11 ? 5 : hour < 13 ? 6 : hour < 15 ? 7 : hour < 17 ? 8 : hour < 19 ? 9 : hour < 21 ? 10 : 11;
      shiZhiIdx = shichen;
      var ganBase = [0, 2, 4, 6, 8][dayGanIdx % 5];
      shiGanIdx = (ganBase + shichen) % 10;
      bazi = {hour:{ganIndex:shiGanIdx,zhiIndex:shiZhiIdx},day:{ganIndex:dayGanIdx,zhiIndex:dayZhiIdx}};
    }

    var bureau = determineBureau(year, month, day, bazi.day);
    var zu = findZhiFuStarAndDoor(bureau, shiGanIdx, shiZhiIdx);

    // 2. 九宫排布
    var palaces = [];
    var LUOSHU_ORDER = [4,9,2,3,5,7,8,1,6];

    // 天盘星：值符星在时干宫，其他星按阳顺阴逆排列
    var starGong = {}; // starNum → gong
    var starSeq = bureau.dun === 'yang' ? [1,2,3,4,5,6,7,8,9] : [1,9,8,7,6,5,4,3,2];

    // 找到值符星在 starSeq 中的位置
    var zfIdx = starSeq.indexOf(zu.zhiFuStar);

    // 时干宫
    var shiGanGong = zu.GAN_TO_GONG[shiGanIdx];

    // 从值符星开始，依次填入宫位（从时干宫开始阳顺阴逆）
    for (var i=0;i<9;i++) {
      var s = starSeq[(zfIdx + i) % 9];
      var gongOffset = bureau.dun === 'yang' ? i : (9 - i) % 9;
      var gong = ((shiGanGong - 1 + gongOffset) % 9) + 1;
      if (gong === 5) gong = 2; // 中5寄坤2
      starGong[s] = gong;
    }

    // 天盘干（奇仪）：时干在地盘所在宫的奇仪作为值符宫的奇仪，依次阳顺阴逆
    // 简化：用宫位对应的奇仪
    var heavenGanGong = {}; // gong → ganIdx
    for (var i=0;i<10;i++) {
      var g = zu.GAN_TO_GONG[i];
      if (!heavenGanGong[g]) heavenGanGong[g] = i;
    }

    // 八门：值使门在时支宫，其他顺排
    var doorGong = {};
    var doorSeq = [1,2,3,4,5,6,7,8,9];
    var zsIdx = doorSeq.indexOf(zu.zhiShiDoor);
    for (var i=0;i<9;i++) {
      var d = doorSeq[(zsIdx + i) % 9];
      var gong = ((zu.zhiShiGong - 1 + i) % 9) + 1;
      if (gong === 5) gong = 2;
      doorGong[d] = gong;
    }

    // 八神：阳遁顺排(1→8)，阴遁逆排(8→1)
    var spiritGong = {};
    var spiritOrder = bureau.dun === 'yang' ? [0,1,2,3,4,5,6,7] : [0,7,6,5,4,3,2,1];
    for (var i=0;i<8;i++) {
      var s = spiritOrder[i];
      var gong = ((zu.zhiFuGong - 1 + i) % 8) + 1;
      if (gong >= 5) gong++;
      spiritGong[s] = gong;
    }

    // 构建每个宫的数据
    for (var pi=0; pi<LUOSHU_ORDER.length; pi++) {
      var g = LUOSHU_ORDER[pi];
      var pos = LUOSHU_POS[g];

      // 找天盘星
      var tStar = null;
      for (var sn=1; sn<=9; sn++) {
        if (starGong[sn] === g) { tStar = sn; break; }
      }

      // 找门
      var tDoor = null;
      for (var dn=1; dn<=9; dn++) {
        if (doorGong[dn] === g) { tDoor = dn; break; }
      }

      // 找神
      var tSpirit = null;
      for (var sn=0; sn<8; sn++) {
        if (spiritGong[sn] === g) { tSpirit = sn; break; }
      }

      // 地奇仪（按局数布）
      var earthQiYi = '';
      for (var ei=0; ei<10; ei++) {
        var qg = dungeonToGong(bureau.ju, bureau.dun, ei);
        if (qg === g) {
          var GAN_NAMES = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
          earthQiYi += (ei===0?'':GAN_NAMES[ei]);
          break;
        }
      }
      // 更准确的方法：
      var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
      earthQiYi = GAN[heavenGanGong[g] || 0];

      palaces.push({
        gong: g,
        row: pos.r,
        col: pos.c,
        gua: GUA_NAME[g],
        guaYi: GUA_YI[GUA_NAME[g]],
        earthQiYi: earthQiYi,
        starIdx: tStar,
        star: tStar ? STARS[tStar-1] : null,
        doorIdx: tDoor,
        door: tDoor ? DOORS[tDoor-1] : null,
        spiritIdx: tSpirit,
        spirit: tSpirit !== null ? SPIRITS[tSpirit] : '',
        isZhongWu: g === 5
      });
    }

    return {
      bureau: bureau,
      palaces: palaces.sort(function(a,b) { return a.gong - b.gong; }),
      luoshuPalaces: palaces, // already in luoshu order
      shiGanIdx: shiGanIdx,
      shiZhiIdx: shiZhiIdx,
      dayGanIdx: dayGanIdx,
      dayZhiIdx: dayZhiIdx,
      zu: zu
    };
  }

  // ============ 公开接口 ============

  return {
    compute: compute,
    determineBureau: determineBureau,
    STARS: STARS,
    DOORS: DOORS,
    SPIRITS: SPIRITS,
    GUA_NAME: GUA_NAME,
    LUOSHU_POS: LUOSHU_POS,
    LUOSHU_ORDER: [4,9,2,3,5,7,8,1,6]
  };

})();
