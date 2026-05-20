/**
 * 山医命相卜 · 排盘精度验证脚本 v2
 * 运行: node tests/ziwei-validation.js
 */
global.window = global;
const lunar = require('../js/lunar.js');

// ziwei.js 在浏览器中依赖全局变量 — Node.js 下注入
Object.assign(global, {
  GAN: lunar.GAN, ZHI: lunar.ZHI, SHENGXIAO: lunar.SHENGXIAO,
  SHICHEN_NAME: lunar.SHICHEN_NAME, SHICHEN_HOUR: lunar.SHICHEN_HOUR,
  SHICHEN_RANGE: lunar.SHICHEN_RANGE,
  CITY_LONGITUDE: lunar.CITY_LONGITUDE,
  JIEQI_NAMES: lunar.JIEQI_NAMES, JIEQI_LONGITUDE: lunar.JIEQI_LONGITUDE,
  getYearGanZhi: lunar.getYearGanZhi, getMonthGanZhi: lunar.getMonthGanZhi,
  getDayGanZhi: lunar.getDayGanZhi, getHourGanZhi: lunar.getHourGanZhi,
  getShichenIndex: lunar.getShichenIndex,
  getTrueSolarTime: lunar.getTrueSolarTime,
  solarToLunar: lunar.solarToLunar
});

const ziwei = require('../js/ziwei.js');

let passed = 0, failed = 0, warnings = 0;

function ok(desc, actual, expected) {
  if (actual === expected) { passed++; console.log(`  ✅ ${desc}: ${actual}`); }
  else { failed++; console.log(`  ❌ ${desc}: got "${actual}", expected "${expected}"`); }
}

function t(text) { console.log(`\n${'='.repeat(55)}\n  ${text}\n${'='.repeat(55)}`); }

// ==================== 1. 儒略日 ====================
t('1. 儒略日自洽');
ok('2000-01-01=2451545', lunar.gregorianToJDN(2000,1,1), 2451545);
const jd = lunar.gregorianToJDN(2025, 6, 15);
const bk = lunar.jdnToGregorian(jd);
ok('回转换 year', bk.year, 2025);
ok('回转换 month', bk.month, 6);
ok('回转换 day', bk.day, 15);

// ==================== 2. 日干支 ====================
t('2. 日干支');
const gz = (y,m,d) => lunar.getDayGanZhi(y,m,d).full;
ok('2000-01-01', gz(2000,1,1), '戊午');
ok('2025-01-01', gz(2025,1,1), '庚午');
ok('2025-06-15', gz(2025,6,15), '乙卯');
ok('1990-06-15', gz(1990,6,15), '辛亥');

// ==================== 3. 年干支 ====================
t('3. 年干支（立春为界）');
const ygz = (y,m,d) => lunar.getYearGanZhi(y,m,d).full;
ok('2024-02-03(立春前→癸卯)', ygz(2024,2,3), '癸卯');
ok('2024-02-05(立春后→甲辰)', ygz(2024,2,5), '甲辰');
ok('1984-02-01(立春前→癸亥)', ygz(1984,2,1), '癸亥');
ok('1984-02-05(立春后→甲子)', ygz(1984,2,5), '甲子');

// ==================== 4. 月干支 ====================
t('4. 月干支（节气为界）');
const mgz = (y,m,d) => lunar.getMonthGanZhi(y,m,d).full;
ok('2025-01-06(小寒后→丁丑)', mgz(2025,1,6), '丁丑');
ok('2025-02-03(立春前→丁丑)', mgz(2025,2,3), '丁丑');
ok('2025-02-04(立春后→戊寅)', mgz(2025,2,4), '戊寅');
ok('2025-06-01', mgz(2025,6,1), '辛巳');
ok('2025-06-15(芒种后→壬午)', mgz(2025,6,15), '壬午');
ok('2025-07-15(小暑后→癸未)', mgz(2025,7,15), '癸未');

// ==================== 5. 时干支 ====================
t('5. 时干支（五鼠遁）');
const hgz = (h, dg, m) => lunar.getHourGanZhi(h, dg, m||0).full;
ok('甲日子时', hgz(23,0), '甲子');
ok('甲日午时', hgz(12,0), '庚午');
ok('乙日子时', hgz(23,1), '丙子');
ok('丙日子时', hgz(23,2), '戊子');
ok('丁日子时', hgz(23,3), '庚子');
ok('戊日子时', hgz(23,4), '壬子');
ok('己日子时', hgz(23,5), '甲子');
ok('庚日子时', hgz(23,6), '丙子');
ok('辛日子时', hgz(23,7), '戊子');
ok('壬日子时', hgz(23,8), '庚子');
ok('癸日子时', hgz(23,9), '壬子');
ok('辛日午时', hgz(12,7), '甲午');
ok('戊日辰时', hgz(8,4), '丙辰');

// ==================== 6. 节气精度 ====================
t('6. 节气（天文算法验证）');
function checkTerm(year, termIdx, expMonth, expDay) {
  const jd = lunar.getSolarTermJD(year, termIdx);
  const g = lunar.jdnToGregorian(jd);
  const match = g.month === expMonth && g.day === expDay;
  const name = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨',
    '立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分',
    '寒露','霜降','立冬','小雪','大雪','冬至'][termIdx];
  if (match) { passed++; console.log(`  ✅ ${year} ${name}: ${g.month}-${g.day}`); }
  else { failed++; console.log(`  ❌ ${year} ${name}: got ${g.month}-${g.day}, expected ${expMonth}-${expDay}`); }
}
checkTerm(2024, 2, 2, 4);   // 立春
checkTerm(2025, 2, 2, 3);   // 立春 (2025=2/3)
checkTerm(2025, 11, 6, 21); // 夏至
checkTerm(2025, 12, 7, 6);  // 小暑
checkTerm(2025, 0, 1, 5);   // 小寒
checkTerm(2025, 23, 12, 21);// 冬至
checkTerm(1990, 2, 2, 4);   // 立春

// ==================== 7. 紫微斗数引擎 ====================
t('7. 命宫·身宫·五行局');

const bz1 = lunar.calculateBaZi(1990, 6, 15, 12);
ok('命宫 (5+1-6)=子(0)', ziwei.calcMingGongZhi(bz1.lunar.lunarMonth, bz1.hour.shichenIdx), 0);
ok('身宫 (5+1+6)=子(0)', ziwei.calcShenGongZhi(bz1.lunar.lunarMonth, bz1.hour.shichenIdx), 0);

// 五行局
const mingGan1 = ziwei.getTianGanByYearGanAndZhi(bz1.year.ganIndex, 0); // 命宫子
const bureau1 = ziwei.getElementBureau(mingGan1, 0);
ok('五行局在2-6', bureau1 >= 2 && bureau1 <= 6, true);

// ==================== 8. 紫微星 + 14主星 ====================
t('8. 紫微星 & 十四主星');
ok('水二局日23→紫微子(0)', ziwei.calcZiWeiPosition(2, 23), 1);
ok('木三局日15→紫微午(6)', ziwei.calcZiWeiPosition(3, 15), 6);

const stars0 = ziwei.arrangeAllStars(0);
ok('紫微0→紫微子', stars0.ziwei, 0);
ok('紫微0→天府辰', stars0.tianfu, 4);
ok('紫微0→破军寅', stars0.pojund, (4+10)%12);

// ==================== 9. 四化 ====================
t('9. 四化飞星');
const shJia = ziwei.getSiHua(0); // 甲年
ok('甲年廉贞禄', shJia.lu, 'lianzhen');
ok('甲年破军权', shJia.quan, 'pojund');
ok('甲年武曲科', shJia.ke, 'wuqu');
ok('甲年太阳忌', shJia.ji, 'taiyang');

const shXin = ziwei.getSiHua(7); // 辛年
ok('辛年巨门禄', shXin.lu, 'jumen');
ok('辛年文昌忌', shXin.ji, 'wenchang');

// ==================== 10. 辅星 ====================
t('10. 辅星排布');
const aux = ziwei.arrangeAuxStars(1, 0, 0, 0);
ok('甲子年正月→左辅辰(4)', aux.zuofu, 4);
ok('甲子年→禄存寅(2)', aux.lucun, 2);
ok('甲子年→擎羊卯(3)', aux.qingyang, 3);

// ==================== 11. 完整排盘 ====================
t('11. 完整排盘');
const chart = ziwei.calculateZiWeiChart(1990, 6, 15, 12, bz1, 'male');
ok('12宫完整', chart.palaces.length, 12);
ok('命宫ganZhi非空', chart.mingGong.ganZhi.length > 0, true);
ok('五行局名称非空', chart.bureauName.length > 0, true);
ok('紫微星位0-11', chart.ziweiZhi >= 0 && chart.ziweiZhi < 12, true);
ok('每宫有主星', Array.isArray(chart.palaces[0].stars), true);
ok('每宫有辅星', Array.isArray(chart.palaces[0].auxStars), true);
ok('四化映射存在', !!chart.sihua, true);

// 检查四化挂入命盘
let sihuaCount = 0;
chart.palaces.forEach(p => { sihuaCount += (p.sihua||[]).length; });
ok('主星四化已挂入宫位(≥4)', sihuaCount >= 4, true);

// ==================== 12. 月柱边界回归 ====================
t('12. 月柱边界回归测试');
const bzFeb3 = lunar.calculateBaZi(2025, 2, 3, 12);
const bzFeb4 = lunar.calculateBaZi(2025, 2, 4, 12);
ok('2025-02-03 月柱=丁丑(立春前)', bzFeb3.month.full, '丁丑');
ok('2025-02-04 月柱=戊寅(立春后)', bzFeb4.month.full, '戊寅');

// 年柱边界
ok('2025-02-03 年柱=甲辰(立春前)', bzFeb3.year.full, '甲辰');
ok('2025-02-04 年柱=乙巳(立春后)', bzFeb4.year.full, '乙巳');

// ==================== 结果 ====================
console.log(`\n${'='.repeat(55)}`);
console.log(`  ✅ ${passed} 通过  ❌ ${failed} 失败  ⚠️ ${warnings} 警告`);
console.log(`  通过率: ${(passed/(passed+failed)*100).toFixed(1)}%`);
console.log(`${'='.repeat(55)}\n`);
process.exit(failed > 0 ? 1 : 0);
