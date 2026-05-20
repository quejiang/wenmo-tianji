/**
 * 八字胎元、命宫、童子命检测
 * 附加到 bazi-reading.js 的解读流程
 */
var BaziAdvanced = (function() {
  'use strict';

  // ============ 胎元 ============
  // 胎元 = 月干前一位, 月支前三位
  function calcTaiYuan(monthGan, monthZhi) {
    var ganIdx = monthGan; // 0=甲~9=癸
    var zhiIdx = monthZhi; // 0=子~11=亥
    var taiGan = (ganIdx + 1) % 10;
    var taiZhi = (zhiIdx + 3) % 12;
    return { gan: taiGan, zhi: taiZhi };
  }

  // ============ 命宫 (八字) ============
  // 命宫 = 以月支起子时，顺数至生时
  // 传统算法: 14 - (月数 + 时数), 超过14则 26 - (月数+时数)
  // 月数: 正月=1...十二月=12
  // 时数: 子=1, 丑=2, ..., 亥=12
  function calcMingGong(lunarMonth, shiChenIndex) {
    var sum = lunarMonth + (shiChenIndex + 1); // shiChenIndex 0-11, +1变成1-12
    var gong;
    if (sum < 14) {
      gong = 14 - sum;
    } else {
      gong = 26 - sum;
    }
    if (gong < 1) gong += 12;
    if (gong > 12) gong -= 12;
    return gong - 1; // 返回0-based地支index
  }

  // ============ 身宫 ============
  // 身宫与命宫方向相反: 如果命宫在子(0), 身宫在午(6)
  function calcShenGong(mingGongIndex) {
    return (mingGongIndex + 6) % 12;
  }

  // ============ 童子命检测 ============
  // 传统口诀检测法
  var TONGZI_PATTERNS = {
    // 春秋寅子贵，冬夏卯未辰
    spring: { months: [1,2,3], check: function(h, d) { return h === 2 || d === 0; } }, // 寅=2, 子=0
    summer: { months: [4,5,6], check: function(h, d) { return h === 3 || d === 7; } }, // 卯=3, 未=7
    autumn: { months: [7,8,9], check: function(h, d) { return h === 2 || d === 0; } }, // 寅=2, 子=0
    winter: { months: [10,11,12], check: function(h, d) { return h === 3 || d === 7 || d === 4; } } // 卯=3, 未=7, 辰=4
  };

  // 第二套检测口诀
  var TONGZI_CHECK2 = {
    // 金命：辰巳(4,5) 木命：午未(6,7) 水命：子丑(0,1) 火命：戌亥(10,11) 土命：申酉(8,9)
    check: function(elementIndex, zhiIndex) {
      var ranges = {
        0: [10,11], // 金 → 戌亥
        1: [0,1],    // 水 → 子丑
        2: [4,5],    // 木 → 辰巳
        3: [6,7],    // 火 → 午未
        4: [8,9]     // 土 → 申酉
      };
      var r = ranges[elementIndex];
      return r ? (r[0] === zhiIndex || r[1] === zhiIndex) : false;
    }
  };

  function detectTongZi(bazi) {
    var results = [];
    var lunarMonth = bazi.lunar.lunarMonth; // 1-12
    var hourZhi = bazi.hourZhi; // 0-11
    var dayZhi = bazi.dayZhi; // 0-11

    // 方法1：季节口诀
    var season;
    if (lunarMonth >= 1 && lunarMonth <= 3) season = 'spring';
    else if (lunarMonth >= 4 && lunarMonth <= 6) season = 'summer';
    else if (lunarMonth >= 7 && lunarMonth <= 9) season = 'autumn';
    else season = 'winter';

    var pattern = TONGZI_PATTERNS[season];
    var method1 = pattern && pattern.check(hourZhi, dayZhi);

    // 方法2：日柱纳音五行
    var dayElement = ['金','水','木','火','土']; // 简化: 根据纳音
    // 用日柱地支五行简化判断
    var elementMap = { 0:'水',1:'土',2:'木',3:'木',4:'土',5:'火',6:'火',7:'土',8:'金',9:'金',10:'土',11:'水' };
    var el = elementMap[dayZhi] || '土';
    var elIdx = { '金':0,'水':1,'木':2,'火':3,'土':4 };
    var method2 = TONGZI_CHECK2.check(elIdx[el] || 4, dayZhi);

    // 方法3：时柱空亡检查
    // 日柱旬空: 甲子旬戌亥空, 甲戌旬申酉空, 甲申旬午未空, 甲午旬辰巳空, 甲辰旬寅卯空, 甲寅旬子丑空
    var kongWang = getKongWang(bazi.dayGan, bazi.dayZhi);
    var method3 = kongWang[0] === hourZhi || kongWang[1] === hourZhi;

    var score = (method1 ? 1 : 0) + (method2 ? 1 : 0) + (method3 ? 1 : 0);

    if (score >= 2) {
      results.push({
        level: score >= 3 ? 'high' : 'medium',
        desc: '童子命迹象（' + score + '项吻合）',
        details: [
          method1 ? '✓ 春秋寅子贵/冬夏卯未辰口诀命中' : '',
          method2 ? '✓ 纳音五行时辰检验命中' : '',
          method3 ? '✓ 时柱正值日柱旬空' : ''
        ].filter(Boolean).join('，')
      });
    }

    return results;
  }

  function getKongWang(dayGan, dayZhi) {
    var pairs = [[0,1],[2,3],[4,5],[6,7],[8,9]];
    var ganIdx = dayGan; // 0-9
    var pairIdx = Math.floor(ganIdx / 2);
    var startZhi = (10 - pairIdx * 2) % 12; // 旬首地支
    return [(startZhi + 10) % 12, (startZhi + 11) % 12]; // 空亡两个地支
  }

  // ============ 渲染 ============
  function renderAdvancedBazi(containerId, bazi) {
    var html = '';

    // 胎元
    var taiYuan = calcTaiYuan(bazi.monthGan, bazi.monthZhi);
    var GAN = '甲乙丙丁戊己庚辛壬癸';
    var ZHI = '子丑寅卯辰巳午未申酉戌亥';
    html += '<div class="ba-adv-row">';
    html += '<span class="ba-adv-label">胎元</span>';
    html += '<span class="ba-adv-val">' + GAN[taiYuan.gan] + ZHI[taiYuan.zhi] + '</span>';
    html += '<span class="ba-adv-note">月柱天干进一、地支进三</span>';
    html += '</div>';

    // 命宫
    var mingGongIdx = calcMingGong(bazi.lunar.lunarMonth, bazi.hourZhi);
    html += '<div class="ba-adv-row">';
    html += '<span class="ba-adv-label">命宫</span>';
    html += '<span class="ba-adv-val">' + ZHI[mingGongIdx] + '</span>';
    html += '<span class="ba-adv-note">月支起子时顺数至生时</span>';
    html += '</div>';

    // 身宫
    var shenGongIdx = calcShenGong(mingGongIdx);
    html += '<div class="ba-adv-row">';
    html += '<span class="ba-adv-label">身宫</span>';
    html += '<span class="ba-adv-val">' + ZHI[shenGongIdx] + '</span>';
    html += '<span class="ba-adv-note">与命宫地支相冲（相差六位）</span>';
    html += '</div>';

    // 童子命检测
    var tongZi = detectTongZi(bazi);
    html += '<div class="ba-adv-row">';
    html += '<span class="ba-adv-label">童子命</span>';
    if (tongZi.length > 0) {
      var t = tongZi[0];
      html += '<span class="ba-adv-val" style="color:#e0a050">⚠ ' + t.desc + '</span>';
      html += '<span class="ba-adv-note">' + t.details + '</span>';
    } else {
      html += '<span class="ba-adv-val">未检测到</span>';
      html += '<span class="ba-adv-note">三项检测均未命中</span>';
    }
    html += '</div>';

    var container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
  }

  return {
    calcTaiYuan: calcTaiYuan,
    calcMingGong: calcMingGong,
    calcShenGong: calcShenGong,
    detectTongZi: detectTongZi,
    renderAdvancedBazi: renderAdvancedBazi
  };
})();
