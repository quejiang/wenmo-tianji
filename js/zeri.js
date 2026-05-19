/**
 * 择日/择吉 — 黄历宜忌 · 十二建除 · 神煞择日
 * ZeRi — Chinese Almanac Date Selection
 */
var ZeRi = (function() {

  // ============ 基础数据 ============

  // 十二建除 (按正月起寅的顺序)
  var JIAN_CHU = ['建','除','满','平','定','执','破','危','成','收','开','闭'];

  // 建除吉凶
  var JIAN_CHU_JI_XIONG = {
    '建':'平', '除':'吉', '满':'平', '平':'平',
    '定':'吉', '执':'平', '破':'凶', '危':'凶',
    '成':'吉', '收':'平', '开':'吉', '闭':'凶'
  };

  var JIAN_CHU_DESC = {
    '建':'建立之日，宜出行、上任，忌动土','除':'除旧布新，宜扫除、治病、沐浴',
    '满':'圆满之日，宜祭祀、祈福、开市','平':'平常之日，百事皆可，无大吉凶',
    '定':'安定之日，宜订婚、嫁娶、签约','执':'执守之日，宜捕捉、讨债、安葬',
    '破':'破败之日，宜拆屋、求医，忌嫁娶','危':'危险之日，宜小心谨慎，忌远行',
    '成':'成就之日，宜嫁娶、开市、出行','收':'收敛之日，宜收藏、修仓、纳财',
    '开':'开放之日，宜开业、嫁娶、出行','闭':'闭藏之日，宜安葬、修造、纳畜'
  };

  // 黄道黑道
  var HUANG_HEI_DAO = {
    0:['子','丑','卯','午','未','酉'], // 建日黄道(青龙)
    1:['寅','卯','辰','巳','申','亥'], // 除日黄道(明堂)
    2:['辰','巳','午','未','亥','子'], // 满日黄道(天刑→黑道,简化)
    3:['丑','辰','午','未','戌','亥'], 4:['巳','未','酉','亥','丑','寅'],
    5:['寅','卯','巳','申','酉','丑'], 6:['寅','午','戌','亥','子','丑'],
    7:['子','丑','寅','午','申','酉'], 8:['子','卯','辰','巳','酉','亥'],
    9:['丑','卯','辰','巳','未','酉'], 10:['子','丑','卯','午','未','申'],
    11:['寅','卯','辰','午','未','亥']
  };

  // 每日宜忌（按十二建除和五行干支）
  var ACTIVITY_GROUPS = {
    '嫁娶':{yi:['成','定','开'], ji:['破','闭']},
    '开业':{yi:['成','开','满'], ji:['破','闭']},
    '出行':{yi:['建','成','开'], ji:['破','危']},
    '动土':{yi:['建','成','开'], ji:['破','危']},
    '搬家':{yi:['成','开','定'], ji:['破','闭']},
    '安葬':{yi:['闭','成','破'], ji:['建','开']},
    '求医':{yi:['除','破'], ji:['建','成']},
    '开业交易':{yi:['成','开','满'], ji:['破','闭']},
    '签约':{yi:['定','成','开'], ji:['破','闭']},
    '祭祀':{yi:['满','成','开','闭'], ji:['破']},
    '入学':{yi:['成','开','定'], ji:['破']},
    '出行旅游':{yi:['建','成','开'], ji:['破','危']},
    '装修':{yi:['建','成','开'], ji:['破','危']},
    '理发':{yi:['除','开'], ji:['破','闭']},
    '捕捉':{yi:['执','收'], ji:['成','开']},
    '纳财':{yi:['收','成','开'], ji:['破','闭']},
    '会友':{yi:['成','开','建'], ji:['破']},
    '栽种':{yi:['成','开','建'], ji:['破','闭']}
  };

  // 农历月份 → 建除起始月支的关系
  // 正月建寅(2), 二月建卯(3), ...
  function monthToJianZhi(lunarMonth) {
    return (lunarMonth + 1) % 12; // 正月→寅(2)→建除index由日支确定
  }

  // ============ 核心算法 ============

  /**
   * 计算某日的十二建除
   * 正月(寅月)从寅日起建, 二月(卯月)从卯日起建...
   * lunarMonth: 1-12 农历月
   * riZhiIndex: 0-11 当日地支索引
   */
  function calcJianChu(lunarMonth, riZhiIndex) {
    var monthZhiIdx = (lunarMonth + 1) % 12; // 正月→寅(2)→idx
    var jianIdx = (riZhiIndex - monthZhiIdx + 12) % 12;
    return JIAN_CHU[jianIdx];
  }

  /**
   * 计算某日的黄道黑道
   */
  function calcHuangHei(riZhiIdx, jianChuIdx) {
    // 按十二建除分黄黑道
    var HUANG_DAO = ['青龙','明堂','天刑','朱雀','金匮','天德','白虎','玉堂','天牢','玄武','司命','勾陈'];
    var HUANG_JI = [true,true,false,false,true,true,false,true,false,false,true,false];

    var idx = jianChuIdx;
    return {name:HUANG_DAO[idx], isJi:HUANG_JI[idx]};
  }

  /**
   * 计算某日宜忌活动
   */
  function calcYiJi(jianChuName) {
    var yi = [], ji = [];

    for (var activity in ACTIVITY_GROUPS) {
      var rules = ACTIVITY_GROUPS[activity];
      if (rules.yi.indexOf(jianChuName) >= 0) yi.push(activity);
      if (rules.ji.indexOf(jianChuName) >= 0) ji.push(activity);
    }

    return {yi:yi, ji:ji};
  }

  /**
   * 判断某日是否为"杨公忌日"等大忌日
   */
  function isBigTaboo(lunarMonth, lunarDay) {
    // 杨公忌日（农历固定日期）
    var yangGongJi = [
      [1,13],[2,11],[3,9],[4,7],[5,5],[6,3],
      [7,1],[7,29],[8,27],[9,25],[10,23],[11,21],[12,19]
    ];

    for (var i=0;i<yangGongJi.length;i++) {
      if (yangGongJi[i][0] === lunarMonth && yangGongJi[i][1] === lunarDay) {
        return {isBig:true, name:'杨公忌日',desc:'大事不宜，百事忌用'};
      }
    }

    // 四离四绝
    return null;
  }

  /**
   * 计算日值神煞
   */
  function calcDayShenSha(riGanIdx, riZhiIdx) {
    var sha = [];

    // 天恩日
    if ([0,1,2,3,4,5,6,7,8,9].indexOf(riGanIdx) >= 0) {
      sha.push({name:'天恩',ji:true});
    }

    // 月厌
    var yueYanMap = [11,10,9,8,7,6,5,4,3,2,1,0];
    if (yueYanMap[riZhiIdx % 12] === riZhiIdx) {
      sha.push({name:'月厌',ji:false});
    }

    // 四废日
    var siFeiDays = [
      {g:6,z:2},{g:6,z:8},{g:8,z:2},{g:8,z:8}, // 庚申辛酉
    ];
    for (var i=0;i<siFeiDays.length;i++) {
      if (siFeiDays[i].g === riGanIdx && siFeiDays[i].z === riZhiIdx) {
        sha.push({name:'四废',ji:false,desc:'百事不举'});
      }
    }

    return sha;
  }

  /**
   * 生成月历数据
   * year: 阳历年, month: 阳历月(1-12)
   * 返回该月每天的数据
   */
  function generateMonthCalendar(year, month) {
    var days = [];
    var daysInMonth = new Date(year, month, 0).getDate();

    for (var d=1; d<=daysInMonth; d++) {
      // 获取农历信息
      var lunarInfo = null;
      if (typeof solarToLunar === 'function') {
        try {
          lunarInfo = solarToLunar(year, month, d);
        } catch(e) {}
      }

      if (!lunarInfo) {
        // 简化：用偏移估算
        lunarInfo = {lunarMonth:((month+9)%12)+1, lunarDay:((d+7)%30)+1, isLeap:false};
      }

      // 计算日干支
      var riGanIdx = 0, riZhiIdx = 0;
      if (typeof gregorianToJDN === 'function') {
        var jd = gregorianToJDN(year, month, d);
        riGanIdx = Math.floor(((jd + 49) % 60 + 60) % 60) % 10;
        riZhiIdx = Math.floor(((jd + 49) % 60 + 60) % 60) % 12;
      } else {
        riGanIdx = ((year * 365 + d + month*30) % 10 + 10) % 10;
        riZhiIdx = ((year * 365 + d + month*30) % 12 + 12) % 12;
      }

      var jianChu = calcJianChu(lunarInfo.lunarMonth, riZhiIdx);
      var jianChuIdx = JIAN_CHU.indexOf(jianChu);
      var hh = calcHuangHei(riZhiIdx, jianChuIdx);
      var yiJi = calcYiJi(jianChu);
      var bigTaboo = isBigTaboo(lunarInfo.lunarMonth, lunarInfo.lunarDay);
      var shenSha = calcDayShenSha(riGanIdx, riZhiIdx);

      var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
      var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

      days.push({
        solarDay: d,
        solarMonth: month,
        solarYear: year,
        lunarMonth: lunarInfo.lunarMonth,
        lunarDay: lunarInfo.lunarDay,
        isLeap: lunarInfo.isLeap || false,
        ganzhi: GAN[riGanIdx] + ZHI[riZhiIdx],
        jianChu: jianChu,
        jianChuJiXiong: JIAN_CHU_JI_XIONG[jianChu],
        jianChuDesc: JIAN_CHU_DESC[jianChu],
        huangHei: hh,
        yi: yiJi.yi,
        ji: yiJi.ji,
        bigTaboo: bigTaboo,
        shenSha: shenSha,
        dayOfWeek: new Date(year, month-1, d).getDay(),
        isToday: (function(){
          var now = new Date();
          return now.getFullYear() === year && now.getMonth()+1 === month && now.getDate() === d;
        })()
      });
    }

    return {
      year: year,
      month: month,
      days: days,
      monthName: year+'年'+month+'月'
    };
  }

  /**
   * 搜索最佳吉日
   * 在指定范围内找到最适合某活动的日期
   */
  function findBestDates(year, month, activity, count) {
    count = count || 5;
    var calendar = generateMonthCalendar(year, month);
    var candidates = [];

    for (var i=0;i<calendar.days.length;i++) {
      var d = calendar.days[i];
      if (d.bigTaboo) continue;
      if (d.jianChuJiXiong === '凶') continue;

      var score = 0;
      if (d.jianChuJiXiong === '吉') score += 3;
      if (d.huangHei && d.huangHei.isJi) score += 2;
      if (d.yi.indexOf(activity) >= 0) score += 5;
      if (d.ji.indexOf(activity) >= 0) score -= 10;

      candidates.push({day:d, score:score});
    }

    candidates.sort(function(a,b){return b.score - a.score;});
    return candidates.slice(0, count);
  }

  return {
    generateMonthCalendar: generateMonthCalendar,
    findBestDates: findBestDates,
    calcJianChu: calcJianChu,
    calcYiJi: calcYiJi,
    calcHuangHei: calcHuangHei,
    JIAN_CHU: JIAN_CHU,
    JIAN_CHU_JI_XIONG: JIAN_CHU_JI_XIONG,
    JIAN_CHU_DESC: JIAN_CHU_DESC,
    ACTIVITY_GROUPS: ACTIVITY_GROUPS
  };

})();
