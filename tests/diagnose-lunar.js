/**
 * 诊断工具 — 农历数据精度追踪
 */
const lunar = require('../js/lunar.js');

// ========== 1. 验证基准JD和日干支 ==========
console.log('=== 基准JD 自洽性检查 ===');
const ref2000 = lunar.gregorianToJDN(2000, 1, 1);
console.log(`2000-01-01 JD=${ref2000}, 日干支=${lunar.getDayGanZhi(2000,1,1).full} (应=戊午)`);
console.log(`日干支公式: (${ref2000}+49)%60 = ${(ref2000+49)%60} (应=54)`);

// ========== 2. 1990年农历数据诊断 ==========
console.log('\n=== 1990年农历数据诊断 ===');
const info1990 = lunar.getLunarYearInfo(1990);
console.log(`1990年: leapMonth=${info1990.leapMonth}, yearDays=${info1990.yearDays}, totalMonths=${info1990.totalMonths}`);
for (let i = 0; i < info1990.totalMonths; i++) {
  const isLeap = info1990.leapMonth > 0 && i === info1990.leapMonth;
  console.log(`  月${i+1}${isLeap?'(闰)':''}: ${info1990.days[i]}天`);
}

// 1990年正月初一的JD
const newYear1990 = lunar.getLunarNewYearJD(1990);
const greg1990 = lunar.jdnToGregorian(newYear1990);
console.log(`1990正月初一 JD=${newYear1990} → ${greg1990.year}-${greg1990.month}-${greg1990.day}`);

// 验算：1990-06-15 农历
const l1990 = lunar.solarToLunar(1990, 6, 15);
const jd1990_615 = lunar.gregorianToJDN(1990, 6, 15);
const dayOffset = jd1990_615 - newYear1990;
console.log(`1990-06-15 JD=${jd1990_615}`);
console.log(`距正月初一: ${dayOffset}天`);
console.log(`农历结果: ${l1990.lunarYear}年${l1990.isLeap?'闰':''}${l1990.lunarMonth}月${l1990.lunarDay}日`);

// 反算：农历1990-05-01 → 公历
const rev1990 = lunar.lunarToSolar(1990, 5, 1, false);
console.log(`农历1990-05-01 → 公历: ${rev1990 ? rev1990.year+'-'+rev1990.month+'-'+rev1990.day : '失败'}`);

// ========== 3. 1990年前后农历数据一致性 ==========
console.log('\n=== 1985-1995 农历年份统计 ===');
for (let y = 1985; y <= 1995; y++) {
  const info = lunar.getLunarYearInfo(y);
  const nyd = lunar.getLunarNewYearJD(y);
  const g = lunar.jdnToGregorian(nyd);
  console.log(`${y}: 总${info.yearDays}天, 闰月${info.leapMonth || '无'}, 正月初一=${g.year}-${g.month}-${g.day}`);
  // 检查：后一年初一 - 本年初一 应等于本年天数
  const nydNext = lunar.getLunarNewYearJD(y + 1);
  const gap = nydNext - nyd;
  if (gap !== info.yearDays) {
    console.log(`  ⚠️ 年份天数不一致! 初一差=${gap}, 记录天数=${info.yearDays}`);
  }
}

// ========== 4. 2025年诊断 ==========
console.log('\n=== 2025年诊断 ===');
const l2025 = lunar.solarToLunar(2025, 6, 15);
console.log(`2025-06-15 农历: ${l2025.lunarYear}年${l2025.lunarMonth}月${l2025.lunarDay}日`);

// ========== 5. 节气精度检查 ==========
console.log('\n=== 节气精度 (2024-2025) ===');
const TERMS = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨',
  '立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分',
  '寒露','霜降','立冬','小雪','大雪','冬至'];

// 2024年立春 (index=2)
const lichun2024jd = lunar.getSolarTermJD(2024, 2);
const lichun2024 = lunar.jdnToGregorian(lichun2024jd);
console.log(`2024立春: ${lichun2024.month}-${lichun2024.day} (实际=2-4)`);

// 检查几个关键节气
const checks = [
  [2024, 2, '2024立春', 2, 4],
  [2025, 2, '2025立春', 2, 3], // 2025立春是2月3日
  [2025, 12, '2025夏至', 6, 21],
  [1990, 2, '1990立春', 2, 4],
];

checks.forEach(([y, ti, desc, em, ed]) => {
  const jd = lunar.getSolarTermJD(y, ti);
  const g = lunar.jdnToGregorian(jd);
  const match = g.month === em && g.day === ed;
  console.log(`${desc}: ${g.month}-${g.day} (预期=${em}-${ed}) ${match ? '✅' : '❌'}`);
});

// ========== 6. 节气月判定边界测试 ==========
console.log('\n=== 节气月边界 ===');
// 2025-02-03 应该在立春前 → 月支=丑(1), 月干依年干丁→丑月
// 月干: 年干丁(3) → 甲己丙,乙庚戊,丙辛庚,丁壬壬 → monthGanBase[3%5]=monthGanBase[3]=8
// 丑月(1): 从寅(2)顺数... 实际上丑月=1, 正月寅=2
// baseGan for 寅月=8, then 丑月=(8 + (1-2))%10=7 → 庚
// Wait, the formula uses monthZhiIdx directly...
const bzFeb3 = lunar.calculateBaZi(2025, 2, 3, 12);
const bzFeb5 = lunar.calculateBaZi(2025, 2, 5, 12);
console.log(`2025-02-03 月柱: ${bzFeb3.month.full} (立春前,应=乙丑或丁丑)`);
console.log(`2025-02-05 月柱: ${bzFeb5.month.full} (立春后,应=戊寅)`);

// 验算立春JD对应的日期
const lc2025jd = lunar.getSolarTermJD(2025, 2);
const lc2025 = lunar.jdnToGregorian(lc2025jd);
console.log(`2025立春JD=${lc2025jd} → ${lc2025.month}-${lc2025.day}`);
const jdFeb3 = lunar.gregorianToJDN(2025, 2, 3);
const jdFeb4 = lunar.gregorianToJDN(2025, 2, 4);
console.log(`2月3日JD=${jdFeb3}, 2月4日JD=${jdFeb4}`);
console.log(`2月3日 < 立春? ${jdFeb3 < lc2025jd}`);
console.log(`2月4日 < 立春? ${jdFeb4 < lc2025jd}`);
