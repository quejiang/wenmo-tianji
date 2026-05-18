/**
 * 农历/干支计算模块
 * 包含：农历数据、公历转农历、干支计算、节气计算
 */

// ==================== 农历数据 (1900-2100) ====================
// 每个年份用一个 32 位整数编码（标准农历数据格式）：
//   bit 0-3:   闰月月份 (0=无闰月)
//   bit 4-15:  12个月的大小月 (1=30天, 0=29天), bit4=正月
//   bit 16:    闰月大小 (1=30天, 0=29天)
// 数据来源：参照香港天文台农历数据

const LUNAR_INFO = [
  // 1900-1909
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  // 1910-1919
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  // 1920-1929
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  // 1930-1939
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  // 1940-1949
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  // 1950-1959
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  // 1960-1969
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  // 1970-1979
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  // 1980-1989
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  // 1990-1999
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  // 2000-2009
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  // 2010-2019
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  // 2020-2029
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  // 2030-2039
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  // 2040-2049
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  // 2050-2059
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0,
  // 2060-2069
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  // 2070-2079
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  // 2080-2089
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  // 2090-2100
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
  0x0d520
];

// 天干（var = 全局变量，跨文件使用）
var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 生肖
var SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// 时辰对应表 (时辰序号 0=子时23-1, 1=丑时1-3, ...)
var SHICHEN_NAME = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
var SHICHEN_HOUR = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]; // 起始小时
var SHICHEN_RANGE = ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
  '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
  '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'];

// ==================== 节气数据 ====================
// 24节气名称
const JIEQI_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 节气对应的黄经度数（用于计算）
const JIEQI_LONGITUDE = [
  285, 300, 315, 330, 345, 0,
  15, 30, 45, 60, 75, 90,
  105, 120, 135, 150, 165, 180,
  195, 210, 225, 240, 255, 270
];

// ==================== 公历工具函数 ====================

/**
 * 公历 → 儒略日 (Julian Day Number)
 * 使用 Jean Meeus "Astronomical Algorithms" 公式，全天域正确
 * 验证基准：2000-01-01 → 2451545 ✓
 */
function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 儒略日 → 公历
 */
function jdnToGregorian(jd) {
  const J = Math.floor(jd + 0.5);
  const f = J + 1401 + Math.floor((Math.floor((4 * J + 274277) / 146097) * 3) / 4) - 38;
  const e = 4 * f + 3;
  const g = Math.floor((e % 1461) / 4);
  const h = 5 * g + 2;
  const day = Math.floor((h % 153) / 5) + 1;
  const month = ((Math.floor(h / 153) + 2) % 12) + 1;
  const year = Math.floor(e / 1461) - 4716 + Math.floor((14 - month) / 12);
  return { year, month, day };
}

// ==================== 节气计算 ====================

// 24节气在2000年的 approximate day-of-year (1-indexed, 2000 is leap year)
// 数据来源: 参照寿星万年历，日均误差 < 1天
var TERM_DOY_2000 = [
    6,  21,  35,  50,  65,  80,    // 小寒...春分
   95, 111, 126, 142, 157, 173,    // 清明...夏至
  189, 204, 220, 236, 251, 267,    // 小暑...秋分
  282, 297, 312, 327, 342, 356     // 寒露...冬至
];

// JDN of 1999-12-31 (Jan 0, 2000)
var JDN_2000_JAN0 = 2451544;

/**
 * 计算指定年份某个节气的儒略日（改进版，查表法）
 * 基准年2000，误差在1900-2100范围内 < 1天
 */
function getSolarTermJD(year, termIndex) {
  var doy = TERM_DOY_2000[termIndex];
  // 用回归年长度 365.242189 递推
  return JDN_2000_JAN0 + doy + (year - 2000) * 365.242189;
}

/**
 * 获取某个公历日期所在的节气月（用于确定月干支）
 * 返回节气月序号：0=立春-惊蛰前, 1=惊蛰-清明前, ...
 * 特别注意：年柱以立春为界
 */
function getJieqiMonth(year, month, day) {
  const jd = gregorianToJDN(year, month, day);
  
  // 计算所有24个节气
  for (let i = 0; i < 24; i++) {
    const jieqiJD = getSolarTermJD(year, i);
    if (jd < jieqiJD - 0.5) {
      // 在当前节气之前
      if (i === 0) {
        // 在小寒之前，属于上一年的最后一个节气月
        return 11; // 对应丑月（大雪到小寒之间）
      }
      return i - 1;
    }
  }
  // 在冬至之后
  const nextYearJd = getSolarTermJD(year + 1, 0);
  if (jd < nextYearJd - 0.5) return 23;
  return 0;
}

/**
 * 获取以立春为界的干支年份
 * 返回调整后的干支年份（立春前用上一年）
 */
function getLichunYear(year, month, day) {
  const jd = gregorianToJDN(year, month, day);
  const lichunJD = getSolarTermJD(year, 2); // 立春是第3个节气(index=2)
  if (jd < lichunJD - 0.5) {
    return year - 1;
  }
  return year;
}

// ==================== 农历转换 ====================

/**
 * 获取农历年的信息
 * @returns {{ leapMonth: number, days: number[], yearDays: number }}
 */
function getLunarYearInfo(lunarYear) {
  const idx = lunarYear - 1900;
  if (idx < 0 || idx >= LUNAR_INFO.length) {
    console.error('农历年份 ' + lunarYear + ' 超出数据范围 (1900-2100)');
    return null;
  }
  
  const info = LUNAR_INFO[idx];
  const leapMonth = info & 0xf;               // bit 0-3: 闰月月份
  const leapDays = (info & 0x10000) ? 30 : 29; // bit 16: 闰月大小
  
  // bit 4-15: 12个月大小 (bit4=正月)
  const monthBits = (info >> 4) & 0xfff;
  const days = [];
  let yearDays = 0;
  
  for (let i = 0; i < 12; i++) {
    const dayCount = (monthBits & (1 << i)) ? 30 : 29;
    days.push(dayCount);
    yearDays += dayCount;
  }
  
  // 处理闰月
  if (leapMonth > 0 && leapMonth <= 12) {
    days.splice(leapMonth, 0, leapDays);
    yearDays += leapDays;
  }
  
  return {
    leapMonth: leapMonth,
    leapDays: leapDays,
    days: days,
    yearDays: yearDays,
    totalMonths: leapMonth > 0 ? 13 : 12
  };
}

/**
 * 计算农历年正月初一的儒略日
 */
function getLunarNewYearJD(lunarYear) {
  // 基准：1900年正月初一 = 1900年1月31日
  const baseYear = 1900;
  const baseJD = gregorianToJDN(1900, 1, 31);
  
  if (lunarYear === baseYear) return baseJD;
  
  if (lunarYear > baseYear) {
    let jd = baseJD;
    for (let y = baseYear; y < lunarYear; y++) {
      const info = getLunarYearInfo(y);
      jd += info.yearDays;
    }
    return jd;
  } else {
    let jd = baseJD;
    for (let y = lunarYear; y < baseYear; y++) {
      const info = getLunarYearInfo(y);
      jd -= info.yearDays;
    }
    return jd;
  }
}

/**
 * 公历转农历
 * @returns {{ lunarYear, lunarMonth, lunarDay, isLeap, yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi }}
 */
function solarToLunar(year, month, day) {
  const jd = gregorianToJDN(year, month, day);
  
  // 先确定农历年份（找到正月初一在jd之前的最近的年份）
  let lunarYear = year;
  let newYearJD = getLunarNewYearJD(lunarYear);
  
  if (jd < newYearJD) {
    // 在正月初一之前，属于上一年
    lunarYear--;
    newYearJD = getLunarNewYearJD(lunarYear);
  } else {
    // 检查是否在下一年
    const nextNewYearJD = getLunarNewYearJD(lunarYear + 1);
    if (jd >= nextNewYearJD) {
      lunarYear++;
      newYearJD = nextNewYearJD;
    }
  }
  
  // 计算从正月初一到目标日期的天数偏移
  let offset = jd - newYearJD;
  
  // 遍历月份找到对应的农历月日
  const yearInfo = getLunarYearInfo(lunarYear);
  let lunarMonth = 1;
  let isLeap = false;
  
  for (let i = 0; i < yearInfo.totalMonths; i++) {
    const monthDays = yearInfo.days[i];
    if (offset < monthDays) {
      lunarMonth = i + 1;
      // 判断是否是闰月
      if (yearInfo.leapMonth > 0 && i > yearInfo.leapMonth) {
        lunarMonth = i; // 闰月后的月份编号-1（因为闰月占了位置）
      }
      if (yearInfo.leapMonth > 0 && i === yearInfo.leapMonth) {
        isLeap = true;
        lunarMonth = yearInfo.leapMonth;
      }
      break;
    }
    offset -= monthDays;
  }
  
  const lunarDay = offset + 1;
  
  return {
    lunarYear: lunarYear,
    lunarMonth: lunarMonth,
    lunarDay: lunarDay,
    isLeap: isLeap,
    leapMonth: yearInfo.leapMonth
  };
}

// ==================== 干支计算 ====================

/**
 * 计算年干支（以立春为界）
 * @returns {{ gan: string, zhi: string, ganIndex: number, zhiIndex: number }}
 */
function getYearGanZhi(year, month, day) {
  const lichunYear = getLichunYear(year, month, day);
  const index = (lichunYear - 4) % 60;
  const gIdx = index % 10;
  const zIdx = index % 12;
  return {
    gan: GAN[gIdx],
    zhi: ZHI[zIdx],
    ganIndex: gIdx,
    zhiIndex: zIdx,
    full: GAN[gIdx] + ZHI[zIdx],
    animal: SHENGXIAO[zIdx]
  };
}

/**
 * 计算月干支（以节气为界）
 * 月支：正月为寅(2), 二月为卯(3), ...
 * 月干：根据年干推算（五虎遁）
 */
function getMonthGanZhi(year, month, day) {
  // 确定节气月
  const jieqiMonth = getJieqiMonth(year, month, day);
  
  // 节气月对应的地支
  // 0=立春(寅月), 1=惊蛰(卯月), 2=清明(辰月), ...
  // 但实际上节气月的 index 对应关系需要调整
  // jieqiMonth: 0=小寒, 1=大寒, 2=立春, 3=雨水, ...
  // 月支以"寅"为正月，所以：
  // 立春(2)→寅(2), 惊蛰(4)→卯(3), 清明(6)→辰(4), 立夏(8)→巳(5),
  // 芒种(10)→午(6), 小暑(12)→未(7), 立秋(14)→申(8), 白露(16)→酉(9),
  // 寒露(18)→戌(10), 立冬(20)→亥(11), 大雪(22)→子(0), 小寒(0)→丑(1)
  
  const monthZhiMap = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0];
  const monthZhiIdx = monthZhiMap[jieqiMonth];
  
  // 月干根据年干推算（五虎遁）
  // 年干为甲己→正月丙寅, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅
  const lichunYear = getLichunYear(year, month, day);
  const yearGanIdx = (lichunYear - 4) % 10;
  const monthGanBase = [2, 4, 6, 8, 0]; // 甲/己→2(丙), 乙/庚→4(戊), ...
  const baseGan = monthGanBase[Math.floor(yearGanIdx % 5)];
  const monthGanIdx = (baseGan + ((monthZhiIdx - 2 + 12) % 12)) % 10;
  
  return {
    gan: GAN[monthGanIdx],
    zhi: ZHI[monthZhiIdx],
    ganIndex: monthGanIdx,
    zhiIndex: monthZhiIdx,
    full: GAN[monthGanIdx] + ZHI[monthZhiIdx]
  };
}

/**
 * 计算日干支
 * 基于儒略日数的公式：日干支序号 = (JD + 9) % 60
 * 这个公式需要验证调整
 */
function getDayGanZhi(year, month, day) {
  const jd = gregorianToJDN(year, month, day);
  // 干支序号 = (JD + 49) % 60
  // 验证: 2000-01-01 JD=2451545 → (2451545+49)%60=54 → 戊午 ✓
  //        2005-04-21 JD=2453482 → (2453482+49)%60=11 → 乙亥 ✓
  const index = ((jd + 49) % 60 + 60) % 60;
  const gIdx = index % 10;
  const zIdx = index % 12;
  
  return {
    gan: GAN[gIdx],
    zhi: ZHI[zIdx],
    ganIndex: gIdx,
    zhiIndex: zIdx,
    full: GAN[gIdx] + ZHI[zIdx]
  };
}

/**
 * 计算时干支
 * 时支由小时确定，时干根据日干推算（五鼠遁）
 */
function getHourGanZhi(hour, dayGanIndex, minute) {
  // 使用 getShichenIndex 统一处理，支持小数小时
  const decHour = hour + (minute || 0) / 60;
  const shichenIdx = getShichenIndex(decHour);
  
  // 时干根据日干推算（五鼠遁）
  // 日干为甲己→子时为甲子, 乙庚→丙子, 丙辛→戊子, 丁壬→庚子, 戊癸→壬子
  const hourGanBase = [0, 2, 4, 6, 8]; // 甲/己→0(甲), 乙/庚→2(丙), ...
  const baseGan = hourGanBase[Math.floor(dayGanIndex % 5)];
  const hourGanIdx = (baseGan + shichenIdx) % 10;
  
  return {
    gan: GAN[hourGanIdx],
    zhi: ZHI[shichenIdx],
    ganIndex: hourGanIdx,
    zhiIndex: shichenIdx,
    full: GAN[hourGanIdx] + ZHI[shichenIdx],
    shichenIdx: shichenIdx,
    shichenName: SHICHEN_NAME[shichenIdx]
  };
}

// ==================== 真太阳时 ====================

/**
 * 省市县三级经度数据
 * 格式：{ 省: { cities: { 市: { lng: number, districts: [区县, ...] } } } }
 */
var PROVINCE_CITY_DATA = {
  '北京市': { cities: {
    '北京市': { lng: 116.40, districts: ['东城区','西城区','朝阳区','海淀区','丰台区','石景山区','通州区','大兴区','顺义区','昌平区','房山区','门头沟区','平谷区','怀柔区','密云区','延庆区'] }
  }},
  '天津市': { cities: {
    '天津市': { lng: 117.20, districts: ['和平区','河东区','河西区','南开区','河北区','红桥区','东丽区','西青区','津南区','北辰区','武清区','宝坻区','滨海新区','宁河区','静海区','蓟州区'] }
  }},
  '上海市': { cities: {
    '上海市': { lng: 121.47, districts: ['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'] }
  }},
  '重庆市': { cities: {
    '重庆市': { lng: 106.55, districts: ['渝中区','大渡口区','江北区','沙坪坝区','九龙坡区','南岸区','北碚区','渝北区','巴南区','万州区','涪陵区','黔江区','长寿区','江津区','合川区','永川区'] }
  }},
  '河北省': { cities: {
    '石家庄': { lng: 114.52, districts: ['长安区','桥西区','新华区','裕华区','藁城区','鹿泉区','栾城区','正定县'] },
    '唐山': { lng: 118.18, districts: ['路南区','路北区','古冶区','开平区','丰南区','丰润区','曹妃甸区'] },
    '保定': { lng: 115.47, districts: ['竞秀区','莲池区','满城区','清苑区','徐水区'] },
    '邯郸': { lng: 114.54, districts: ['邯山区','丛台区','复兴区','峰峰矿区'] },
    '廊坊': { lng: 116.68, districts: ['安次区','广阳区'] },
    '秦皇岛': { lng: 119.60, districts: ['海港区','山海关区','北戴河区'] },
    '沧州': { lng: 116.84, districts: ['新华区','运河区'] },
    '承德': { lng: 117.96, districts: ['双桥区','双滦区'] },
    '邢台': { lng: 114.50, districts: ['桥东区','桥西区'] },
    '张家口': { lng: 114.89, districts: ['桥东区','桥西区','宣化区'] },
    '衡水': { lng: 115.67, districts: ['桃城区'] }
  }},
  '山西省': { cities: {
    '太原': { lng: 112.55, districts: ['杏花岭区','迎泽区','小店区','尖草坪区','万柏林区','晋源区'] },
    '大同': { lng: 113.30, districts: ['平城区','云冈区','新荣区','云州区'] },
    '临汾': { lng: 111.52, districts: ['尧都区'] },
    '运城': { lng: 111.00, districts: ['盐湖区'] },
    '长治': { lng: 113.12, districts: ['潞州区','上党区'] },
    '晋城': { lng: 112.85, districts: ['城区'] },
    '阳泉': { lng: 113.58, districts: ['城区','矿区','郊区'] },
    '朔州': { lng: 112.43, districts: ['朔城区'] },
    '晋中': { lng: 112.75, districts: ['榆次区'] },
    '忻州': { lng: 112.73, districts: ['忻府区'] },
    '吕梁': { lng: 111.14, districts: ['离石区'] }
  }},
  '陕西省': { cities: {
    '西安': { lng: 108.93, districts: ['新城区','碑林区','莲湖区','灞桥区','未央区','雁塔区','阎良区','临潼区','长安区','高陵区','鄠邑区','蓝田县','周至县'] },
    '咸阳': { lng: 108.71, districts: ['秦都区','渭城区'] },
    '宝鸡': { lng: 107.24, districts: ['渭滨区','金台区','陈仓区'] },
    '渭南': { lng: 109.51, districts: ['临渭区'] },
    '汉中': { lng: 107.02, districts: ['汉台区'] },
    '延安': { lng: 109.49, districts: ['宝塔区'] },
    '榆林': { lng: 109.73, districts: ['榆阳区'] },
    '安康': { lng: 109.03, districts: ['汉滨区'] },
    '商洛': { lng: 109.94, districts: ['商州区'] },
    '铜川': { lng: 109.07, districts: ['耀州区'] }
  }},
  '河南省': { cities: {
    '郑州': { lng: 113.65, districts: ['中原区','二七区','管城回族区','金水区','惠济区'] },
    '洛阳': { lng: 112.45, districts: ['西工区','老城区','瀍河区','涧西区','洛龙区'] },
    '开封': { lng: 114.31, districts: ['鼓楼区','龙亭区','禹王台区','祥符区'] },
    '南阳': { lng: 112.53, districts: ['宛城区','卧龙区'] },
    '许昌': { lng: 113.85, districts: ['魏都区','建安区'] },
    '新乡': { lng: 113.88, districts: ['卫滨区','红旗区'] },
    '安阳': { lng: 114.39, districts: ['北关区','文峰区'] },
    '信阳': { lng: 114.08, districts: ['浉河区','平桥区'] },
    '商丘': { lng: 115.66, districts: ['梁园区','睢阳区'] },
    '周口': { lng: 114.65, districts: ['川汇区'] },
    '驻马店': { lng: 114.02, districts: ['驿城区'] }
  }},
  '山东省': { cities: {
    '济南': { lng: 117.00, districts: ['历下区','市中区','槐荫区','天桥区','历城区','长清区'] },
    '青岛': { lng: 120.38, districts: ['市南区','市北区','黄岛区','崂山区','李沧区','城阳区','即墨区'] },
    '烟台': { lng: 121.39, districts: ['芝罘区','福山区','莱山区','牟平区'] },
    '潍坊': { lng: 119.16, districts: ['潍城区','奎文区','寒亭区','坊子区'] },
    '临沂': { lng: 118.35, districts: ['兰山区','罗庄区','河东区'] },
    '淄博': { lng: 118.05, districts: ['张店区','淄川区','博山区'] },
    '济宁': { lng: 116.59, districts: ['任城区'] },
    '威海': { lng: 122.12, districts: ['环翠区','文登区'] },
    '泰安': { lng: 117.09, districts: ['泰山区','岱岳区'] },
    '日照': { lng: 119.53, districts: ['东港区','岚山区'] }
  }},
  '江苏省': { cities: {
    '南京': { lng: 118.79, districts: ['玄武区','秦淮区','建邺区','鼓楼区','浦口区','栖霞区','雨花台区','江宁区','六合区','溧水区','高淳区'] },
    '苏州': { lng: 120.59, districts: ['姑苏区','虎丘区','吴中区','相城区','吴江区','常熟市','张家港市','昆山市','太仓市'] },
    '无锡': { lng: 120.30, districts: ['梁溪区','锡山区','惠山区','滨湖区','新吴区','江阴市','宜兴市'] },
    '常州': { lng: 119.97, districts: ['天宁区','钟楼区','新北区','武进区','金坛区','溧阳市'] },
    '南通': { lng: 120.89, districts: ['崇川区','通州区'] },
    '徐州': { lng: 117.18, districts: ['鼓楼区','云龙区','贾汪区','泉山区','铜山区'] },
    '扬州': { lng: 119.41, districts: ['广陵区','邗江区','江都区'] },
    '镇江': { lng: 119.42, districts: ['京口区','润州区','丹徒区'] },
    '盐城': { lng: 120.16, districts: ['亭湖区','盐都区'] },
    '泰州': { lng: 119.92, districts: ['海陵区','高港区','姜堰区'] },
    '淮安': { lng: 119.02, districts: ['清江浦区','淮安区'] },
    '连云港': { lng: 119.22, districts: ['连云区','海州区'] },
    '宿迁': { lng: 118.30, districts: ['宿城区','宿豫区'] }
  }},
  '浙江省': { cities: {
    '杭州': { lng: 120.15, districts: ['上城区','下城区','江干区','拱墅区','西湖区','滨江区','萧山区','余杭区','富阳区','临安区'] },
    '宁波': { lng: 121.54, districts: ['海曙区','江北区','北仑区','镇海区','鄞州区','奉化区'] },
    '温州': { lng: 120.70, districts: ['鹿城区','龙湾区','瓯海区'] },
    '嘉兴': { lng: 120.76, districts: ['南湖区','秀洲区'] },
    '湖州': { lng: 120.09, districts: ['吴兴区','南浔区'] },
    '绍兴': { lng: 120.58, districts: ['越城区','柯桥区','上虞区'] },
    '金华': { lng: 119.65, districts: ['婺城区','金东区'] },
    '台州': { lng: 121.42, districts: ['椒江区','黄岩区','路桥区'] }
  }},
  '安徽省': { cities: {
    '合肥': { lng: 117.23, districts: ['瑶海区','庐阳区','蜀山区','包河区'] },
    '芜湖': { lng: 118.38, districts: ['镜湖区','弋江区','鸠江区'] },
    '蚌埠': { lng: 117.39, districts: ['龙子湖区','蚌山区','禹会区'] },
    '安庆': { lng: 117.05, districts: ['迎江区','大观区','宜秀区'] },
    '马鞍山': { lng: 118.51, districts: ['花山区','雨山区'] },
    '黄山': { lng: 118.34, districts: ['屯溪区','黄山区','徽州区'] }
  }},
  '湖北省': { cities: {
    '武汉': { lng: 114.30, districts: ['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','江夏区','黄陂区'] },
    '襄阳': { lng: 112.14, districts: ['襄城区','樊城区'] },
    '宜昌': { lng: 111.29, districts: ['西陵区','伍家岗区','点军区','猇亭区','夷陵区'] },
    '荆州': { lng: 112.24, districts: ['沙市区','荆州区'] },
    '黄石': { lng: 115.04, districts: ['黄石港区','西塞山区'] },
    '十堰': { lng: 110.80, districts: ['茅箭区','张湾区'] }
  }},
  '湖南省': { cities: {
    '长沙': { lng: 112.97, districts: ['芙蓉区','天心区','岳麓区','开福区','雨花区','望城区'] },
    '株洲': { lng: 113.13, districts: ['天元区','芦淞区','荷塘区','石峰区'] },
    '湘潭': { lng: 112.94, districts: ['雨湖区','岳塘区'] },
    '衡阳': { lng: 112.57, districts: ['蒸湘区','珠晖区','雁峰区','石鼓区'] },
    '岳阳': { lng: 113.13, districts: ['岳阳楼区','云溪区','君山区'] },
    '常德': { lng: 111.70, districts: ['武陵区','鼎城区'] },
    '张家界': { lng: 110.48, districts: ['永定区','武陵源区'] }
  }},
  '广东省': { cities: {
    '广州': { lng: 113.26, districts: ['越秀区','海珠区','荔湾区','天河区','白云区','黄埔区','花都区','番禺区','南沙区','从化区','增城区'] },
    '深圳': { lng: 114.06, districts: ['福田区','罗湖区','南山区','宝安区','龙岗区','盐田区','龙华区','坪山区','光明区'] },
    '珠海': { lng: 113.58, districts: ['香洲区','斗门区','金湾区'] },
    '佛山': { lng: 113.12, districts: ['禅城区','南海区','顺德区','三水区','高明区'] },
    '东莞': { lng: 113.75, districts: ['莞城','南城','东城','万江'] },
    '中山': { lng: 113.38, districts: ['石岐','东区','西区','南区'] },
    '惠州': { lng: 114.42, districts: ['惠城区','惠阳区'] },
    '汕头': { lng: 116.68, districts: ['金平区','龙湖区'] },
    '湛江': { lng: 110.36, districts: ['赤坎区','霞山区'] },
    '江门': { lng: 113.08, districts: ['蓬江区','江海区','新会区'] },
    '肇庆': { lng: 112.47, districts: ['端州区','鼎湖区'] }
  }},
  '广西': { cities: {
    '南宁': { lng: 108.33, districts: ['青秀区','兴宁区','西乡塘区','江南区','良庆区','邕宁区'] },
    '桂林': { lng: 110.28, districts: ['秀峰区','叠彩区','象山区','七星区','雁山区','临桂区'] },
    '柳州': { lng: 109.42, districts: ['城中区','鱼峰区','柳南区','柳北区'] },
    '北海': { lng: 109.12, districts: ['海城区','银海区'] },
    '玉林': { lng: 110.17, districts: ['玉州区'] }
  }},
  '福建省': { cities: {
    '福州': { lng: 119.30, districts: ['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区'] },
    '厦门': { lng: 118.09, districts: ['思明区','湖里区','集美区','海沧区','同安区','翔安区'] },
    '泉州': { lng: 118.59, districts: ['鲤城区','丰泽区','洛江区','泉港区'] },
    '漳州': { lng: 117.65, districts: ['芗城区','龙文区'] },
    '莆田': { lng: 119.01, districts: ['城厢区','涵江区','荔城区','秀屿区'] }
  }},
  '江西省': { cities: {
    '南昌': { lng: 115.86, districts: ['东湖区','西湖区','青云谱区','青山湖区','新建区'] },
    '九江': { lng: 115.99, districts: ['浔阳区','濂溪区'] },
    '赣州': { lng: 114.93, districts: ['章贡区','南康区','赣县区'] },
    '景德镇': { lng: 117.18, districts: ['珠山区','昌江区'] },
    '上饶': { lng: 117.94, districts: ['信州区','广丰区'] }
  }},
  '四川省': { cities: {
    '成都': { lng: 104.07, districts: ['武侯区','锦江区','青羊区','金牛区','成华区','龙泉驿区','青白江区','新都区','温江区','双流区','郫都区','都江堰市','彭州市'] },
    '绵阳': { lng: 104.68, districts: ['涪城区','游仙区','安州区'] },
    '德阳': { lng: 104.40, districts: ['旌阳区'] },
    '宜宾': { lng: 104.62, districts: ['翠屏区','叙州区'] },
    '南充': { lng: 106.08, districts: ['顺庆区','高坪区','嘉陵区'] },
    '泸州': { lng: 105.44, districts: ['江阳区','龙马潭区','纳溪区'] },
    '乐山': { lng: 103.76, districts: ['市中区','五通桥区','沙湾区'] },
    '达州': { lng: 107.50, districts: ['通川区','达川区'] }
  }},
  '贵州省': { cities: {
    '贵阳': { lng: 106.63, districts: ['南明区','云岩区','花溪区','乌当区','白云区','观山湖区'] },
    '遵义': { lng: 106.93, districts: ['红花岗区','汇川区'] }
  }},
  '云南省': { cities: {
    '昆明': { lng: 102.71, districts: ['五华区','盘龙区','官渡区','西山区','呈贡区'] },
    '大理': { lng: 100.23, districts: ['大理市'] },
    '丽江': { lng: 100.23, districts: ['古城区'] }
  }},
  '辽宁省': { cities: {
    '沈阳': { lng: 123.43, districts: ['和平区','沈河区','大东区','皇姑区','铁西区','苏家屯区','浑南区','沈北新区','于洪区'] },
    '大连': { lng: 121.61, districts: ['中山区','西岗区','沙河口区','甘井子区','旅顺口区','金州区'] },
    '鞍山': { lng: 122.99, districts: ['铁东区','铁西区','立山区'] },
    '抚顺': { lng: 123.93, districts: ['新抚区','望花区','东洲区','顺城区'] }
  }},
  '吉林省': { cities: {
    '长春': { lng: 125.32, districts: ['南关区','宽城区','朝阳区','二道区','绿园区','双阳区','九台区'] },
    '吉林': { lng: 126.55, districts: ['船营区','昌邑区','龙潭区','丰满区'] }
  }},
  '黑龙江省': { cities: {
    '哈尔滨': { lng: 126.64, districts: ['道里区','南岗区','道外区','香坊区','松北区','平房区','呼兰区','阿城区'] },
    '齐齐哈尔': { lng: 123.96, districts: ['龙沙区','建华区','铁锋区'] },
    '大庆': { lng: 125.03, districts: ['萨尔图区','龙凤区','让胡路区'] },
    '牡丹江': { lng: 129.63, districts: ['东安区','西安区','阳明区','爱民区'] }
  }},
  '甘肃省': { cities: {
    '兰州': { lng: 103.83, districts: ['城关区','七里河区','西固区','安宁区','红古区'] },
    '天水': { lng: 105.72, districts: ['秦州区','麦积区'] }
  }},
  '青海省': { cities: {
    '西宁': { lng: 101.78, districts: ['城中区','城东区','城西区','城北区'] }
  }},
  '宁夏': { cities: {
    '银川': { lng: 106.23, districts: ['兴庆区','金凤区','西夏区'] }
  }},
  '新疆': { cities: {
    '乌鲁木齐': { lng: 87.62, districts: ['天山区','沙依巴克区','新市区','水磨沟区','头屯河区','米东区'] }
  }},
  '海南省': { cities: {
    '海口': { lng: 110.32, districts: ['秀英区','龙华区','琼山区','美兰区'] },
    '三亚': { lng: 109.51, districts: ['海棠区','吉阳区','天涯区','崖州区'] }
  }},
  '内蒙古': { cities: {
    '呼和浩特': { lng: 111.75, districts: ['新城区','回民区','玉泉区','赛罕区'] },
    '包头': { lng: 109.84, districts: ['昆都仑区','东河区','青山区'] },
    '鄂尔多斯': { lng: 109.78, districts: ['东胜区','康巴什区'] }
  }},
  '西藏': { cities: {
    '拉萨': { lng: 91.11, districts: ['城关区'] }
  }},
  '香港': { cities: {
    '香港': { lng: 114.17, districts: ['中西区','湾仔区','东区','南区','油尖旺区','深水埗区','九龙城区','观塘区','荃湾区','屯门区','元朗区','沙田区','大埔区','北区','西贡区','离岛区'] }
  }},
  '澳门': { cities: {
    '澳门': { lng: 113.55, districts: ['花地玛堂区','花王堂区','望德堂区','大堂区','风顺堂区','嘉模堂区','路氹填海区'] }
  }},
  '台湾': { cities: {
    '台北': { lng: 121.52, districts: ['中正区','大同区','中山区','松山区','大安区','万华区','信义区','士林区','北投区','内湖区','南港区','文山区'] },
    '高雄': { lng: 120.31, districts: ['苓雅区','新兴区','前金区','盐埕区','鼓山区','三民区','左营区'] },
    '台中': { lng: 120.68, districts: ['中区','东区','西区','南区','北区','西屯区','南屯区','北屯区'] },
    '台南': { lng: 120.21, districts: ['中西区','东区','南区','北区','安平区','安南区'] }
  }}
};

// 兼容旧代码：扁平城市经度表（动态从 PROVINCE_CITY_DATA 生成）
var CITY_LONGITUDE = (function() {
  var map = {};
  var seen = {};
  for (var prov in PROVINCE_CITY_DATA) {
    var cities = PROVINCE_CITY_DATA[prov].cities;
    for (var city in cities) {
      map[city] = cities[city].lng; // 城市名可能重名，后覆盖前
    }
  }
  return map;
})();

/**
 * 计算某日期在一年中的第几天
 */
function dayOfYear(year, month, day) {
  const monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeap) monthDays[2] = 29;
  let doy = day;
  for (let i = 1; i < month; i++) doy += monthDays[i];
  return doy;
}

/**
 * 计算均时差 (Equation of Time)
 * 返回分钟数，正值表示真太阳时比平太阳时快
 * 公式基于 Spencer (1971) 的傅里叶级数近似，误差 < 1分钟
 */
function getEquationOfTime(year, month, day) {
  const doy = dayOfYear(year, month, day);
  const B = (360 / 365) * (doy - 81);
  const rad = Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * B * rad) - 7.53 * Math.cos(B * rad) - 1.5 * Math.sin(B * rad);
  return eot; // 单位：分钟
}

/**
 * 计算真太阳时（返回小数小时）
 * @param {number} year - 公历年
 * @param {number} month - 公历月
 * @param {number} day - 公历日
 * @param {number} hour - 钟表小时 (0-23)
 * @param {number} minute - 钟表分钟 (0-59)
 * @param {number} longitude - 出生地经度 (东经为正)
 * @param {number} [tzMeridian=120] - 时区基准经度 (中国标准时 = 120°E)
 * @returns {{ hour: number, eotMinutes: number, lonAdjustMinutes: number, totalAdjustMinutes: number }}
 */
function getTrueSolarTime(year, month, day, hour, minute, longitude, tzMeridian) {
  if (tzMeridian === undefined) tzMeridian = 120;
  
  // 经度修正：每度 4 分钟
  const lonAdjust = (longitude - tzMeridian) * 4;
  
  // 均时差
  const eot = getEquationOfTime(year, month, day);
  
  // 总修正（分钟）
  const totalAdjust = lonAdjust + eot;
  
  // 真太阳时（小数小时）
  const clockMinutes = hour * 60 + (minute || 0);
  const trueSolarMinutes = clockMinutes + totalAdjust;
  let trueHour = trueSolarMinutes / 60;
  
  // 规范化到 [0, 24)
  trueHour = ((trueHour % 24) + 24) % 24;
  
  return {
    hour: trueHour,
    eotMinutes: eot,
    lonAdjustMinutes: lonAdjust,
    totalAdjustMinutes: totalAdjust,
    clockHour: hour + (minute || 0) / 60
  };
}

/**
 * 根据小数小时确定时辰序号
 * @param {number} decimalHour - 小数小时 (0-24)
 * @returns {number} 时辰序号 0=子时 ... 11=亥时
 */
function getShichenIndex(decimalHour) {
  let h = ((decimalHour % 24) + 24) % 24;
  if (h >= 23 || h < 1)  return 0;   // 子时  23:00 - 01:00
  if (h < 3)  return 1;               // 丑时  01:00 - 03:00
  if (h < 5)  return 2;               // 寅时  03:00 - 05:00
  if (h < 7)  return 3;               // 卯时  05:00 - 07:00
  if (h < 9)  return 4;               // 辰时  07:00 - 09:00
  if (h < 11) return 5;               // 巳时  09:00 - 11:00
  if (h < 13) return 6;               // 午时  11:00 - 13:00
  if (h < 15) return 7;               // 未时  13:00 - 15:00
  if (h < 17) return 8;               // 申时  15:00 - 17:00
  if (h < 19) return 9;               // 酉时  17:00 - 19:00
  if (h < 21) return 10;              // 戌时  19:00 - 21:00
  return 11;                            // 亥时  21:00 - 23:00
}

// ==================== 导出工具函数 ====================

/**
 * 完整八字计算
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {number} hour - 钟表小时 (0-23)
 * @param {object} [opts]
 * @param {boolean} [opts.useTrueSolar] - 是否使用真太阳时
 * @param {number}  [opts.longitude] - 经度，默认 120
 * @param {number}  [opts.minute] - 分钟 (0-59)，默认 0
 */
function calculateBaZi(year, month, day, hour, opts) {
  const yearGZ = getYearGanZhi(year, month, day);
  const monthGZ = getMonthGanZhi(year, month, day);
  const dayGZ = getDayGanZhi(year, month, day);
  const lunar = solarToLunar(year, month, day);

  let hourGZ;
  let trueSolarInfo = null;
  const minute = (opts && opts.minute !== undefined) ? opts.minute : 0;

  if (opts && opts.useTrueSolar) {
    const longitude = (opts.longitude !== undefined) ? opts.longitude : 120;
    trueSolarInfo = getTrueSolarTime(year, month, day, hour, minute, longitude);
    const shichenIdx = getShichenIndex(trueSolarInfo.hour);
    hourGZ = getHourGanZhiByShichen(shichenIdx, dayGZ.ganIndex);
  } else {
    hourGZ = getHourGanZhi(hour, dayGZ.ganIndex, minute);
  }

  return {
    year: yearGZ,
    month: monthGZ,
    day: dayGZ,
    hour: hourGZ,
    lunar: lunar,
    trueSolar: trueSolarInfo
  };
}

/**
 * 根据时辰序号直接计算时干支（用于真太阳时）
 */
function getHourGanZhiByShichen(shichenIdx, dayGanIndex) {
  const hourGanBase = [0, 2, 4, 6, 8];
  const baseGan = hourGanBase[Math.floor(dayGanIndex % 5)];
  const hourGanIdx = (baseGan + shichenIdx) % 10;

  return {
    gan: GAN[hourGanIdx],
    zhi: ZHI[shichenIdx],
    ganIndex: hourGanIdx,
    zhiIndex: shichenIdx,
    full: GAN[hourGanIdx] + ZHI[shichenIdx],
    shichenIdx: shichenIdx,
    shichenName: SHICHEN_NAME[shichenIdx]
  };
}

// 如果在 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LUNAR_INFO, GAN, ZHI, SHENGXIAO, SHICHEN_NAME, SHICHEN_RANGE,
    JIEQI_NAMES, JIEQI_LONGITUDE, CITY_LONGITUDE,
    gregorianToJDN, jdnToGregorian,
    getSolarTermJD, getJieqiMonth, getLichunYear,
    getLunarYearInfo, getLunarNewYearJD, solarToLunar,
    getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi,
    getShichenIndex, getTrueSolarTime, getEquationOfTime, dayOfYear,
    getHourGanZhiByShichen, calculateBaZi
  };
}
