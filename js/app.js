/**
 * 文墨天机 — 五术框架主应用逻辑
 * 山 · 医 · 命 · 相 · 卜
 */

// 全局存储
let currentChart = null;
let currentBazi = null;
let currentTrueSolarInfo = null;
let currentAstrologyChart = null;
let activeWushu = 'ming';   // 当前五术大类
var _chartResult = null;    // 保存排盘结果供命Tab共享

var LUNAR_MONTH_NAMES = ['', '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'];
var LUNAR_DAY_NAMES = ['', '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

function lunarDateToChinese(month, day, isLeap) {
  var m = LUNAR_MONTH_NAMES[month] || (month + '月');
  var d = LUNAR_DAY_NAMES[day] || (day + '日');
  return (isLeap ? '闰' : '') + m + d;
}

// ==================== 省市县联动选择器 ====================
function initCitySelect() {
  var provSel = document.getElementById('provinceSelect');
  var provinces = Object.keys(PROVINCE_CITY_DATA).sort();
  provinces.forEach(function(p) {
    var opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    provSel.appendChild(opt);
  });
}

function onProvinceChange() {
  var prov = document.getElementById('provinceSelect').value;
  var citySel = document.getElementById('citySelect');
  var distSel = document.getElementById('districtSelect');
  citySel.innerHTML = '<option value="">-- 选择城市 --</option>';
  distSel.innerHTML = '<option value="">-- 先选城市 --</option>';

  if (!prov) return;
  var cities = PROVINCE_CITY_DATA[prov].cities;
  var cityNames = Object.keys(cities).sort();
  cityNames.forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c + ' (' + cities[c].lng.toFixed(2) + '°E)';
    citySel.appendChild(opt);
  });
}

function onCityChange() {
  var prov = document.getElementById('provinceSelect').value;
  var city = document.getElementById('citySelect').value;
  var distSel = document.getElementById('districtSelect');
  distSel.innerHTML = '<option value="">-- 选择区县 (可选) --</option>';

  if (!prov || !city) return;
  var cityData = PROVINCE_CITY_DATA[prov].cities[city];
  document.getElementById('longitude').value = cityData.lng.toFixed(2);
  var districts = cityData.districts;
  districts.forEach(function(d) {
    var opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    distSel.appendChild(opt);
  });
}

function onDistrictChange() {
  var prov = document.getElementById('provinceSelect').value;
  var city = document.getElementById('citySelect').value;
  var dist = document.getElementById('districtSelect').value;
  if (prov && city) {
    var cityData = PROVINCE_CITY_DATA[prov].cities[city];
    document.getElementById('longitude').value = cityData.lng.toFixed(2);
  }
}

function onTrueSolarToggle() {
  const checked = document.getElementById('useTrueSolar').checked;
  document.getElementById('trueSolarRow').style.display = checked ? 'flex' : 'none';
}

// ==================== 农历/公历日期切换 ====================
var currentDateType = 'solar';

function switchDateType(type) {
  currentDateType = type;
  var solarDiv = document.getElementById('solarDateInput');
  var lunarDiv = document.getElementById('lunarDateInput');
  var opts = document.querySelectorAll('.dt-opt');
  opts.forEach(function(o) {
    var isActive = o.getAttribute('data-type') === type;
    o.classList.toggle('active', isActive);
    o.style.background = isActive ? 'rgba(240,215,140,0.12)' : 'transparent';
    o.style.color = isActive ? '#f0d78c' : '#888';
  });
  if (type === 'lunar') {
    solarDiv.style.display = 'none';
    lunarDiv.style.display = 'block';
    // 从当前公历日期初始化农历
    var dateVal = document.getElementById('birthDate').value;
    if (dateVal) {
      var parts = dateVal.split('-').map(Number);
      if (parts.length === 3 && typeof solarToLunar === 'function') {
        var lunar = solarToLunar(parts[0], parts[1], parts[2]);
        document.getElementById('lunarYear').value = lunar.lunarYear;
        updateLunarMonthOptions();
        // 选中正确的月份（处理闰月位置）
        var monthSel = document.getElementById('lunarMonth');
        var leapInfo = getLunarYearInfo(lunar.lunarYear);
        var monthIdx = lunar.lunarMonth - 1;
        if (lunar.isLeap) monthIdx = leapInfo.leapMonth; // 闰月 = leapMonth 位置
        else if (leapInfo.leapMonth > 0 && lunar.lunarMonth > leapInfo.leapMonth) monthIdx += 1;
        monthSel.selectedIndex = monthIdx;
        document.getElementById('isLeapMonth').checked = lunar.isLeap;
        showLeapCheckbox();
        updateLunarDayOptions();
        document.getElementById('lunarDay').value = lunar.lunarDay;
      }
    } else {
      updateLunarMonthOptions();
      updateLunarDayOptions();
    }
    onLunarInputChange();
  } else {
    solarDiv.style.display = 'block';
    lunarDiv.style.display = 'none';
  }
}

function getLunarDateValues() {
  var y = parseInt(document.getElementById('lunarYear').value) || 1990;
  var monthSel = document.getElementById('lunarMonth');
  var dayVal = parseInt(document.getElementById('lunarDay').value) || 1;
  var isLeap = document.getElementById('isLeapMonth').checked;
  // 解析选中项的值（格式: "月份编号" 或 "月份编号|leap"）
  var optVal = monthSel.value;
  if (optVal.indexOf('|') >= 0) {
    var parts = optVal.split('|');
    return { year: y, month: parseInt(parts[0]), day: dayVal, isLeap: parts[1] === 'leap' };
  }
  return { year: y, month: parseInt(optVal), day: dayVal, isLeap: false };
}

function updateLunarMonthOptions() {
  var year = parseInt(document.getElementById('lunarYear').value) || 1990;
  var monthSel = document.getElementById('lunarMonth');
  if (typeof getLunarYearInfo !== 'function') return;
  var info = getLunarYearInfo(year);
  if (!info) return;
  var html = '';
  for (var i = 0; i < info.totalMonths; i++) {
    var label, isLeapMonth = false;
    if (info.leapMonth > 0 && i === info.leapMonth) {
      label = '闰' + info.leapMonth + '月';
      isLeapMonth = true;
    } else if (info.leapMonth > 0 && i > info.leapMonth) {
      label = (i) + '月';
    } else {
      label = (i + 1) + '月';
    }
    var val;
    if (info.leapMonth > 0 && i === info.leapMonth) {
      val = info.leapMonth; // 闰月用被闰的月份编号
    } else if (info.leapMonth > 0 && i > info.leapMonth) {
      val = i;
    } else {
      val = i + 1;
    }
    var marker = isLeapMonth ? '|leap' : '';
    html += '<option value="' + val + marker + '"' + (isLeapMonth ? ' style="color:#e0a050"' : '') + '>' + label + '</option>';
  }
  monthSel.innerHTML = html;
  showLeapCheckbox();
  updateLunarDayOptions();
  onLunarInputChange();
}

function showLeapCheckbox() {
  var year = parseInt(document.getElementById('lunarYear').value) || 1990;
  var monthSel = document.getElementById('lunarMonth');
  var leapLabel = document.getElementById('leapLabel');
  if (typeof getLunarYearInfo !== 'function') { leapLabel.style.display = 'none'; return; }
  var info = getLunarYearInfo(year);
  if (!info || info.leapMonth === 0) { leapLabel.style.display = 'none'; return; }
  // 只有选中的是闰月时才显示
  var optVal = monthSel.value;
  leapLabel.style.display = (optVal.indexOf('|leap') >= 0) ? 'inline' : 'none';
}

function updateLunarDayOptions() {
  var year = parseInt(document.getElementById('lunarYear').value) || 1990;
  var monthSel = document.getElementById('lunarMonth');
  var daySel = document.getElementById('lunarDay');
  if (typeof getLunarYearInfo !== 'function') return;
  var info = getLunarYearInfo(year);
  if (!info) return;
  // 找到选中的月份在 days[] 中的索引
  var idx = monthSel.selectedIndex;
  var maxDay = (idx >= 0 && idx < info.days.length) ? info.days[idx] : 30;
  var curDay = parseInt(daySel.value) || 1;
  var html = '';
  for (var d = 1; d <= maxDay; d++) {
    html += '<option value="' + d + '"' + (d === curDay ? ' selected' : '') + '>' + d + '</option>';
  }
  daySel.innerHTML = html;
  if (curDay > maxDay) daySel.value = maxDay;
}

function onLunarInputChange() {
  var preview = document.getElementById('lunarSolarPreview');
  if (!preview) return;
  if (currentDateType !== 'lunar') { preview.textContent = ''; return; }
  if (typeof lunarToSolar !== 'function') { preview.textContent = ''; return; }
  var v = getLunarDateValues();
  var solar = lunarToSolar(v.year, v.month, v.day, v.isLeap);
  if (solar) {
    var d = ('0' + solar.day).slice(-2);
    preview.textContent = '→ 公历 ' + solar.year + '-' + ('0' + solar.month).slice(-2) + '-' + d;
  }
}

// ==================== 亮度CSS类映射 ====================
const BRIGHTNESS_CSS = {
  '庙': 'miao',
  '旺': 'wang',
  '得': 'de',
  '利': 'li',
  '平': 'ping',
  '不': 'bu',
  '陷': 'xian'
};

// ==================== 宫位到网格位置映射 ====================
// 从 ziwei.js 的 ZHI_TO_GRID 读取
// 网格是4行×4列，中心4格为空
function getGridPosition(zhiIndex) {
  const map = [
    { row: 4, col: 3 }, // 0: 子 → grid-row: 4, grid-col: 3
    { row: 4, col: 2 }, // 1: 丑
    { row: 4, col: 1 }, // 2: 寅
    { row: 3, col: 1 }, // 3: 卯
    { row: 2, col: 1 }, // 4: 辰
    { row: 1, col: 1 }, // 5: 巳
    { row: 1, col: 2 }, // 6: 午
    { row: 1, col: 3 }, // 7: 未
    { row: 1, col: 4 }, // 8: 申
    { row: 2, col: 4 }, // 9: 酉
    { row: 3, col: 4 }, // 10: 戌
    { row: 4, col: 4 }  // 11: 亥
  ];
  return map[zhiIndex];
}

// ==================== 渲染命盘 ====================

function renderChart(chart, bazi) {
  const grid = document.getElementById('chartGrid');
  grid.innerHTML = '';

  // 渲染12个宫格
  chart.palaces.forEach((palace, idx) => {
    const pos = getGridPosition(palace.zhiIndex);
    const cell = document.createElement('div');
    cell.className = 'palace-cell';
    cell.style.gridRow = pos.row;
    cell.style.gridColumn = pos.col;

    // 命宫/身宫高亮
    if (palace.zhiIndex === chart.mingGong.zhiIndex) {
      cell.classList.add('ming-gong');
    }
    if (palace.isShenGong) {
      cell.classList.add('shen-gong');
    }
    // 来因宫高亮
    if (chart.laiyinZhi !== undefined && palace.zhiIndex === chart.laiyinZhi) {
      cell.classList.add('laiyin-gong');
    }

    // 宫位头
    const header = document.createElement('div');
    header.className = 'palace-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'palace-name';
    nameSpan.textContent = palace.name;
    nameSpan.onclick = function(e) { e.stopPropagation(); showPalacePopup(palace.name, e); };

    const ganzhiSpan = document.createElement('span');
    ganzhiSpan.className = 'palace-ganzhi';
    ganzhiSpan.textContent = palace.ganZhi;

    header.appendChild(nameSpan);
    header.appendChild(ganzhiSpan);
    cell.appendChild(header);

    // 命宫/身宫标记
    if (palace.zhiIndex === chart.mingGong.zhiIndex) {
      const badge = document.createElement('span');
      badge.className = 'palace-badge ming';
      badge.textContent = '命';
      header.appendChild(badge);
    }
    if (palace.isShenGong) {
      const badge = document.createElement('span');
      badge.className = 'palace-badge shen';
      badge.textContent = '身';
      header.appendChild(badge);
    }
    // 来因宫标记
    if (chart.laiyinZhi !== undefined && palace.zhiIndex === chart.laiyinZhi) {
      var laiyinBadge = document.createElement('span');
      laiyinBadge.className = 'palace-badge laiyin';
      laiyinBadge.textContent = '来因';
      header.appendChild(laiyinBadge);
    }

    // 星曜列表
    const starList = document.createElement('div');
    starList.className = 'star-list';

    // 主星（按亮度排序）
    const sortedMainStars = [...palace.stars].sort((a, b) => {
      const orderA = BRIGHTNESS_ORDER[a.brightness] || 0;
      const orderB = BRIGHTNESS_ORDER[b.brightness] || 0;
      return orderB - orderA;
    });

    sortedMainStars.forEach(star => {
      const starItem = document.createElement('div');
      starItem.className = 'star-item main-star';

      // 亮度标记
      if (star.brightness) {
        const brightSpan = document.createElement('span');
        brightSpan.className = `star-brightness ${BRIGHTNESS_CSS[star.brightness] || ''}`;
        brightSpan.textContent = star.brightness;
        starItem.appendChild(brightSpan);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'star-item-name';
      nameSpan.textContent = star.name;
      nameSpan.onclick = function(e) { e.stopPropagation(); showStarPopup(star.name, e); };
      starItem.appendChild(nameSpan);

      // 四化标记
      var sihuaArr = palace.sihua || [];
      for (var si = 0; si < sihuaArr.length; si++) {
        if (sihuaArr[si].starName === star.name) {
          var sh = sihuaArr[si];
          var sihuaSpan2 = document.createElement('span');
          sihuaSpan2.className = 'sihua-badge ' + getSihuaCss(sh.type) + (sh.source === '向心' ? ' centripetal' : '') + (sh.source === '离心' ? ' centrifugal' : '');
          var arrow = sh.source === '向心' ? '↑' : (sh.source === '离心' ? '↓' : '');
          sihuaSpan2.textContent = arrow + sh.type;
          starItem.appendChild(sihuaSpan2);
        }
      }

      starList.appendChild(starItem);
    });

    // 辅星
    palace.auxStars.forEach(star => {
      const starItem = document.createElement('div');
      starItem.className = 'star-item aux-star';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'star-item-name';
      nameSpan.textContent = star.name;
      nameSpan.onclick = function(e) { e.stopPropagation(); showStarPopup(star.name, e); };
      starItem.appendChild(nameSpan);

      // 四化标记（有些辅星也有四化）
      var sihuaArr2 = palace.sihua || [];
      for (var sj = 0; sj < sihuaArr2.length; sj++) {
        if (sihuaArr2[sj].starName === star.name) {
          var sha = sihuaArr2[sj];
          var sihuaSpanA = document.createElement('span');
          sihuaSpanA.className = 'sihua-badge ' + getSihuaCss(sha.type) + (sha.source === '向心' ? ' centripetal' : '') + (sha.source === '离心' ? ' centrifugal' : '');
          var arrowA = sha.source === '向心' ? '↑' : (sha.source === '离心' ? '↓' : '');
          sihuaSpanA.textContent = arrowA + sha.type;
          starItem.appendChild(sihuaSpanA);
        }
      }

      starList.appendChild(starItem);
    });

    // 小星
    if (palace.minorStars && palace.minorStars.length > 0) {
      palace.minorStars.forEach(star => {
        const starItem = document.createElement('div');
        starItem.className = 'star-item minor-star';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'star-item-name';
        nameSpan.textContent = star.name;
        nameSpan.onclick = function(e) { e.stopPropagation(); showStarPopup(star.name, e); };
        starItem.appendChild(nameSpan);
        starList.appendChild(starItem);
      });
    }

    // 神煞 + 大限
    if (palace.shenSha && (palace.shenSha.suiQian || palace.shenSha.changSheng || palace.daXian)) {
      const shenLine = document.createElement('div');
      shenLine.className = 'shensha-line';
      var parts = [];
      if (palace.shenSha.suiQian) parts.push(palace.shenSha.suiQian);
      if (palace.shenSha.jiangQian) parts.push(palace.shenSha.jiangQian);
      if (palace.shenSha.changSheng) parts.push(palace.shenSha.changSheng);
      if (palace.shenSha.taiSui) parts.push(palace.shenSha.taiSui);
      if (palace.daXian) parts.push(palace.daXian.startAge + '~' + palace.daXian.endAge + '岁');
      shenLine.textContent = parts.join(' · ');
      starList.appendChild(shenLine);
    }

    cell.appendChild(starList);
    // 点击整个宫格显示宫位百科
    cell.onclick = function(e) { e.stopPropagation(); showPalacePopup(palace.name, e); };
    grid.appendChild(cell);
  });

  // 中心信息
  const center = document.createElement('div');
  center.className = 'center-empty';
  center.style.gridRow = '2 / 4';
  center.style.gridColumn = '2 / 4';

  const centerInfo = document.createElement('div');
  centerInfo.className = 'center-info';

  const label = document.createElement('div');
  label.className = 'center-label';
  label.textContent = '命宫';
  label.style.cursor = 'pointer';
  label.onclick = function(e) { e.stopPropagation(); showPalacePopup('命宫', e); };

  const nameDiv = document.createElement('div');
  nameDiv.className = 'center-name';
  nameDiv.textContent = chart.mingGong.ganZhi;
  nameDiv.style.cursor = 'pointer';
  nameDiv.onclick = function(e) { e.stopPropagation(); showPalacePopup('命宫', e); };

  const bureauDiv = document.createElement('div');
  bureauDiv.className = 'center-bureau';
  bureauDiv.textContent = chart.bureauName;
  bureauDiv.style.cursor = 'pointer';
  bureauDiv.onclick = function(e) { e.stopPropagation(); showStarPopup('五行局', e); };

  const animalDiv = document.createElement('div');
  animalDiv.className = 'center-info-item';
  animalDiv.textContent = bazi.year.animal + '年';

  centerInfo.appendChild(label);
  centerInfo.appendChild(nameDiv);
  centerInfo.appendChild(bureauDiv);
  centerInfo.appendChild(animalDiv);

  // 命主/身主
  var mzszDiv = document.createElement('div');
  mzszDiv.className = 'center-info-item';
  mzszDiv.textContent = '命主' + chart.mingZhu + ' · 身主' + chart.shenZhu;
  mzszDiv.style.cursor = 'pointer';
  mzszDiv.onclick = function(e) { e.stopPropagation(); showStarPopup('命主', e); };
  centerInfo.appendChild(mzszDiv);

  // 斗君
  var dJunDiv = document.createElement('div');
  dJunDiv.className = 'center-info-item';
  dJunDiv.textContent = '斗君' + ZHI[chart.ziNianDouJun];
  dJunDiv.style.cursor = 'pointer';
  dJunDiv.onclick = function(e) { e.stopPropagation(); showStarPopup('斗君', e); };
  centerInfo.appendChild(dJunDiv);

  // 来因宫
  if (chart.laiyinZhi !== undefined) {
    var laiyinDiv = document.createElement('div');
    laiyinDiv.className = 'center-info-item';
    laiyinDiv.style.color = '#d4a84c';
    laiyinDiv.style.cursor = 'pointer';
    var laiyinName = '';
    for (var lp = 0; lp < chart.palaces.length; lp++) {
      if (chart.palaces[lp].zhiIndex === chart.laiyinZhi) { laiyinName = chart.palaces[lp].name; break; }
    }
    laiyinDiv.textContent = '来因 ' + laiyinName;
    laiyinDiv.onclick = function(e) { e.stopPropagation(); showStarPopup('来因宫', e); };
    centerInfo.appendChild(laiyinDiv);
  }

  if (chart.shenGong.zhiIndex === chart.mingGong.zhiIndex) {
    const shenLabel = document.createElement('div');
    shenLabel.className = 'center-info-item';
    shenLabel.textContent = '命身同宫';
    shenLabel.style.color = '#88bbff';
    shenLabel.style.cursor = 'pointer';
    shenLabel.onclick = function(e) { e.stopPropagation(); showStarPopup('命身同宫', e); };
    centerInfo.appendChild(shenLabel);
  }

  center.appendChild(centerInfo);
  grid.appendChild(center);

  // 显示紫微盘面模式切换
  var modeBar = document.getElementById('ziweiModeBar');
  if (modeBar) modeBar.style.display = 'flex';
  // 重置到默认三合盘模式
  switchZiweiMode('sanhe');
}

function getSihuaCss(type) {
  const map = { '禄': 'lu', '权': 'quan', '科': 'ke', '忌': 'ji' };
  return map[type] || '';
}

// 星曜百科弹窗
function showStarPopup(starName, event) {
  // 教程打开时禁止弹出百科，避免拦截教程按钮点击
  if (typeof Tutorial !== 'undefined' && Tutorial.isOpen && Tutorial.isOpen()) return;

  var info = STAR_ENCYCLOPEDIA[starName];

  var popup = document.getElementById('starPopup');
  document.getElementById('popupStarName').textContent = starName;

  var body = document.getElementById('popupStarBody');
  var html = '';

  // 判断当前模式
  var isPro = (typeof UserMode !== 'undefined') ? UserMode.isProfessional() : true;
  var style = (typeof UserMode !== 'undefined') ? UserMode.getStyle() : '';

  if (!info) {
    html += '<div class="sp-props"><span class="sp-category">紫微斗数星曜</span></div>';
    html += '<div class="sp-detail">「'+ starName + '」是紫微斗数中的一颗星曜，目前百科中暂无该星的详细解读。可参阅相关古籍资料以获取更多信息。</div>';
  } else {
    // 属性行
    var props = [];
    if (info.category) props.push('<span class="sp-category">' + info.category + '</span>');
    if (info.yinYang) props.push('阴阳: <b>' + info.yinYang + '</b>');
    if (info.wuXing) props.push('五行: <b>' + info.wuXing + '</b>');
    if (info.huaQi) props.push('四化: <b>' + info.huaQi + '</b>');
    if (info.trait) props.push('<span class="sp-trait">' + info.trait + '</span>');
    html += '<div class="sp-props">' + props.join(' · ') + '</div>';

    // 详解 — 根据模式选择解读
    var reading = '';
    if (isPro) {
      reading = info.detail || '';
    } else if (style === 'story' && info.storyTelling) {
      reading = info.storyTelling;
    } else if (style === 'psychology' && info.psychology) {
      reading = info.psychology;
    } else if (info.simplified) {
      reading = info.simplified;
    } else {
      reading = info.detail || '';
      // 非专业模式自动简化术语
      if (typeof UserMode !== 'undefined' && typeof UserMode.simplifyText === 'function') {
        reading = UserMode.simplifyText(reading, style);
      }
    }

    if (reading) {
      html += '<div class="sp-detail">' + reading + '</div>';
    }

    // 非专业模式加术语提示条
    if (!isPro) {
      html += '<div class="sp-nonpro-hint">💡 <em>以上为' + 
        (style==='story'?'故事化':style==='psychology'?'心理化':'生活化') + 
        '解读，点击右上角 🔬 可切换专业模式</em></div>';
    }

    // 关键词
    if (info.keywords && info.keywords.length > 0) {
      html += '<div class="sp-keywords">';
      info.keywords.forEach(function(kw) {
        html += '<span class="sp-kw-tag">' + kw + '</span>';
      });
      html += '</div>';
    }
  }

  body.innerHTML = html;

  // 定位弹窗
  popup.style.display = 'block';
  var x = event.clientX;
  var y = event.clientY;
  requestAnimationFrame(function() {
    var pw = popup.offsetWidth;
    var ph = popup.offsetHeight;
    var ww = window.innerWidth;
    var wh = window.innerHeight;

    if (x + pw + 10 > ww) x = ww - pw - 10;
    if (y + ph + 10 > wh) y = wh - ph - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
  });
}

function closeStarPopup() {
  document.getElementById('starPopup').style.display = 'none';
}

// ==================== 星盘点击弹窗 ====================

function showAstroPopup(type, idOrIdx, event) {
  // 教程打开时禁止弹出
  if (typeof Tutorial !== 'undefined' && Tutorial.isOpen && Tutorial.isOpen()) return;
  event.stopPropagation();
  var chart = window._astroChart;
  if (!chart) return;

  var ZODIAC_ALL = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  var ZODIAC_SYM = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  var ZODIAC_COLOR = ['#e06050','#8ab860','#e0c050','#8899cc','#f0a050','#a08060','#e0a0b0','#cc5060','#b070d0','#708090','#60b0d0','#6088c0'];
  var ZODIAC_ELEM = ['火','土','风','水','火','土','风','水','火','土','风','水'];
  var ZODIAC_MODE = ['基本','固定','变动','基本','固定','变动','基本','固定','变动','基本','固定','变动'];
  var HOUSE_NAMES = ['一宫·命宫','二宫·财帛','三宫·兄弟','四宫·田宅','五宫·子女','六宫·奴仆','七宫·夫妻','八宫·疾厄','九宫·迁移','十宫·官禄','十一宫·福德','十二宫·玄秘'];
  var HOUSE_MEANING = [
    '代表自我、外表、给人的第一印象。宫内有星则自我特质鲜明。',
    '代表正财、价值观、物质安全感。宫内星曜影响赚钱方式。',
    '代表沟通、学习、短途旅行、手足邻里关系。',
    '代表家庭、根源、父亲、不动产、晚年生活。',
    '代表创造力、恋爱、子女、娱乐、投机。',
    '代表日常工作、健康、同事、服务精神。',
    '代表婚姻、合作伙伴、公开的敌人。',
    '代表偏财、遗产、生死、性、深层心理学。',
    '代表高等教育、长途旅行、哲学、信仰。',
    '代表事业、名声、社会地位、母亲。',
    '代表朋友、社团、理想、未来愿景。',
    '代表潜意识、因果、隐秘、灵性、牺牲。'
  ];

  var popup = document.getElementById('astroInfoPopup');
  var iconEl = document.getElementById('aipIcon');
  var titleEl = document.getElementById('aipTitle');
  var bodyEl = document.getElementById('aipBody');
  var footerEl = document.getElementById('aipFooter');

  var title = '', body = '', icon = '', tags = '';

  if (type === 'planet') {
    var p = chart.planets[idOrIdx];
    if (!p) return;
    icon = '<span style="font-size:1.4em;color:'+p.color+'">'+p.glyph+'</span>';
    title = p.name + ' 在 ' + p.zodiacSymbol + ' ' + p.zodiac;
    body = '<p>位置：<b>'+p.zodiac+' '+p.degree+'°'+p.minute+'\'</b></p>';
    if (p.signMeaning) body += '<p style="margin-top:8px">'+p.signMeaning+'</p>';
    tags = '<span class="aip-tag planet">'+p.glyph+' '+p.name+'</span>' +
           '<span class="aip-tag sign">'+p.element+'象</span>' +
           '<span class="aip-tag sign">'+p.mode+'</span>' +
           '<span class="aip-tag sign">'+p.zodiacSymbol+'</span>';
  }
  else if (type === 'house') {
    var h = chart.houses[idOrIdx];
    if (!h) return;
    var zIdx = ZODIAC_ALL.indexOf(h.zodiac);
    icon = '<span style="font-size:1.3em;color:'+ZODIAC_COLOR[zIdx]+'">'+h.symbol+'</span>';
    title = '第'+(h.num)+'宫：' + h.name.split('·')[1];
    body = '<p>宫头星座：<b>'+h.zodiac+' '+h.degree+'°</b></p>';
    body += '<p style="margin-top:6px">'+h.meaning+'</p>';
    // 列出宫内行星
    var inHouse = chart.planets.filter(function(pl) {
      var hIdx = Math.floor(((pl.lon - chart.asc + 360) % 360) / 30);
      return hIdx === h.num - 1;
    });
    if (inHouse.length > 0) {
      body += '<p style="margin-top:8px"><b>宫内行星：</b>' + inHouse.map(function(pl) {
        return '<span style="color:'+pl.color+'">'+pl.glyph+' '+pl.name+'</span>';
      }).join('、') + '</p>';
    }
    tags = '<span class="aip-tag house">'+h.name+'</span>' +
           '<span class="aip-tag sign">宫头 '+h.zodiac+'</span>';
  }
  else if (type === 'sign') {
    var sIdx = idOrIdx;
    icon = '<span style="font-size:1.4em;color:'+ZODIAC_COLOR[sIdx]+'">'+ZODIAC_SYM[sIdx]+'</span>';
    title = ZODIAC_ALL[sIdx] + '座（'+ZODIAC_SYM[sIdx]+'）';
    body = '<p>元素：<b>'+ZODIAC_ELEM[sIdx]+'</b> · 模式：<b>'+ZODIAC_MODE[sIdx]+'</b></p>';
    body += '<p style="margin-top:6px">黄经区间：<b>'+(sIdx*30)+'° ~ '+((sIdx+1)*30)+'°</b></p>';
    var signPlanets = [];
    chart.planets.forEach(function(pl) {
      if (pl.index === sIdx) signPlanets.push(pl);
    });
    if (signPlanets.length > 0) {
      body += '<p style="margin-top:8px"><b>此星座内行星：</b>' + signPlanets.map(function(pl) {
        return '<span style="color:'+pl.color+'">'+pl.glyph+' '+pl.name+'</span>';
      }).join('、') + '</p>';
    }
    tags = '<span class="aip-tag sign">'+ZODIAC_ELEM[sIdx]+'象</span>' +
           '<span class="aip-tag sign">'+ZODIAC_MODE[sIdx]+'</span>';
  }
  else if (type === 'axis') {
    var axisMap = {
      asc:  { name:'上升点 ASC', lon:chart.asc, zod:chart.ascZod, color:'#ff8888', desc:'上升星座代表你给外界的第一印象、你的外貌气质和面对新环境时的本能反应。它是人格的面具，也是你与世界互动的方式。' },
      desc: { name:'下降点 DES', lon:chart.desc, zod:chart.descZod, color:'#ff8888', desc:'下降星座代表婚姻伴侣、合作对象和"投射"到他人身上的自我特质。它揭示你在亲密关系中吸引和寻找的类型。' },
      mc:   { name:'中天 MC', lon:chart.mc, zod:chart.mcZod, color:'#88ccff', desc:'中天代表事业方向、社会地位和人生目标。它指向你的职业天赋和公众形象，是通往成就的道路。' },
      ic:   { name:'天底 IC', lon:chart.ic, zod:chart.icZod, color:'#88ccff', desc:'天底代表家庭根源、内心深处和晚年归宿。它揭示你的私密自我、童年经历和安全感来源。' }
    };
    var ax = axisMap[idOrIdx];
    if (!ax) return;
    var zIdx = ZODIAC_ALL.indexOf(ax.zod.zodiac);
    icon = '<span style="font-size:1.3em;color:'+ax.color+'">'+(idOrIdx==='asc'?'AC':idOrIdx==='desc'?'DS':idOrIdx==='mc'?'MC':'IC')+'</span>';
    title = ax.name;
    body = '<p>落在：<b style="color:'+ZODIAC_COLOR[zIdx]+'">'+ax.zod.symbol+' '+ax.zod.zodiac+' '+ax.zod.degree+'°</b></p>';
    body += '<p style="margin-top:8px">'+ax.desc+'</p>';
    tags = '<span class="aip-tag axis">'+ax.name+'</span>' +
           '<span class="aip-tag sign">'+ax.zod.symbol+' '+ax.zod.zodiac+'</span>';
  }

  iconEl.innerHTML = icon;
  titleEl.textContent = title;
  bodyEl.innerHTML = body;
  footerEl.innerHTML = tags;

  // 定位弹窗
  popup.style.display = 'block';
  var x = event.clientX;
  var y = event.clientY;
  requestAnimationFrame(function() {
    var pw = popup.offsetWidth || 300;
    var ph = popup.offsetHeight || 200;
    var ww = window.innerWidth;
    var wh = window.innerHeight;

    if (x + pw + 16 > ww) x = ww - pw - 16;
    if (y + ph + 16 > wh) y = wh - ph - 16;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
  });
}

function closeAstroPopup() {
  document.getElementById('astroInfoPopup').style.display = 'none';
}

// 宫位百科弹窗
function showPalacePopup(palaceName, event) {
  // 教程打开时禁止弹出百科，避免拦截教程按钮点击
  if (typeof Tutorial !== 'undefined' && Tutorial.isOpen && Tutorial.isOpen()) return;

  var info = PALACE_ENCYCLOPEDIA[palaceName];
  // palaceName 如 '命宫'（已含宫字）或 '兄弟'（需补宫字）
  var displayName = palaceName.indexOf('宫') !== -1 ? palaceName : palaceName + '宫';

  var popup = document.getElementById('starPopup');
  document.getElementById('popupStarName').textContent = displayName;

  var body = document.getElementById('popupStarBody');
  var html = '';

  if (!info) {
    html += '<div class="sp-props"><span class="sp-category">紫微斗数宫位</span></div>';
    html += '<div class="sp-detail">「'+ displayName + '」是紫微斗数命盘中的宫位，目前百科中暂无该宫位的详细解读。</div>';
  } else {
    // 属性行
    var props = [];
    if (info.category) props.push('<span class="sp-category">' + info.category + '</span>');
    if (info.trait) props.push('<span class="sp-trait">' + info.trait + '</span>');
    html += '<div class="sp-props">' + props.join(' · ') + '</div>';

    // 详解
    if (info.detail) {
      var isPro = (typeof UserMode !== 'undefined') ? UserMode.isProfessional() : true;
      var style = (typeof UserMode !== 'undefined') ? UserMode.getStyle() : '';
      var palaceReading = info.detail;
      if (!isPro && typeof UserMode !== 'undefined' && typeof UserMode.simplifyText === 'function') {
        palaceReading = UserMode.simplifyText(palaceReading, style);
      }
      html += '<div class="sp-detail">' + palaceReading + '</div>';
    }

    // 关键词
    if (info.keywords && info.keywords.length > 0) {
      html += '<div class="sp-keywords">';
      info.keywords.forEach(function(kw) {
        html += '<span class="sp-kw-tag">' + kw + '</span>';
      });
      html += '</div>';
    }
  }

  body.innerHTML = html;

  // 定位弹窗
  popup.style.display = 'block';
  var x = event.clientX;
  var y = event.clientY;
  requestAnimationFrame(function() {
    var pw = popup.offsetWidth;
    var ph = popup.offsetHeight;
    var ww = window.innerWidth;
    var wh = window.innerHeight;

    if (x + pw + 10 > ww) x = ww - pw - 10;
    if (y + ph + 10 > wh) y = wh - ph - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
  });
}

// 点击空白关闭星曜弹窗 & 命例库面板
document.addEventListener('click', function(e) {
  // 关闭星曜弹窗
  var popup = document.getElementById('starPopup');
  if (popup && popup.style.display === 'block') {
    if (!popup.contains(e.target)) {
      popup.style.display = 'none';
    }
  }
  // 关闭命例库面板 (点击面板外部区域)
  var panel = document.getElementById('casesPanel');
  var floatBtn = document.getElementById('btnFloatCases');
  if (panel && (panel.style.display === 'block')) {
    if (!panel.contains(e.target) && !(floatBtn && floatBtn.contains(e.target))) {
      panel.style.display = 'none';
    }
  }
});

// ==================== AI 命盘解读 ====================

function toggleAiAnalysis() {
  var container = document.getElementById('aiAnalysisContainer');
  var btn = document.getElementById('btnAiAnalyze');
  
  if (container.style.display === 'none' || !container.style.display) {
    if (!currentChart || !currentBazi) return;
    renderAiAnalysis(currentChart, currentBazi);
    container.style.display = 'block';
    btn.textContent = '🤖 收起解读';
    btn.classList.add('btn-ai-active');
    container.scrollIntoView({ behavior: 'smooth' });
  } else {
    container.style.display = 'none';
    btn.textContent = '🤖 AI 命盘解读';
    btn.classList.remove('btn-ai-active');
  }
}

function renderAiAnalysis(chart, bazi) {
  var content = document.getElementById('aiContent');
  content.innerHTML = '';
  
  var sections = AIAnalysis.analyze(chart, bazi);
  
  sections.forEach(function(section, idx) {
    var block = document.createElement('div');
    block.className = 'ai-block';
    block.style.animationDelay = (idx * 0.05) + 's';
    
    var title = document.createElement('div');
    title.className = 'ai-block-title';
    title.textContent = (section.icon || '') + ' ' + section.title;
    
    var text = document.createElement('div');
    text.className = 'ai-block-text';
    text.textContent = section.content;
    
    block.appendChild(title);
    block.appendChild(text);
    content.appendChild(block);
  });
  
  // 添加免责声明
  var disclaimer = document.createElement('div');
  disclaimer.className = 'ai-disclaimer';
  disclaimer.textContent = '以上解读由紫微斗数规则引擎自动生成，仅供参考。命理为概率之学，人生之路仍在自己手中。';
  content.appendChild(disclaimer);
}

// ==================== 渲染八字栏 ====================

function renderBaziBar(bazi) {
  document.getElementById('baziBar').style.display = 'flex';
  document.getElementById('baziYear').textContent = bazi.year.full;
  document.getElementById('baziMonth').textContent = bazi.month.full;
  document.getElementById('baziDay').textContent = bazi.day.full;
  document.getElementById('baziHour').textContent = bazi.hour.full;
  
  var lunar = bazi.lunar;
  document.getElementById('baziLunar').textContent =
    lunarDateToChinese(lunar.lunarMonth, lunar.lunarDay, lunar.isLeap);
  document.getElementById('baziAnimal').textContent = bazi.year.animal;

  // 真太阳时信息
  const tsItem = document.getElementById('baziTrueSolarItem');
  if (bazi.trueSolar) {
    if (tsItem) {
      tsItem.style.display = '';
      const ts = bazi.trueSolar;
      const h = Math.floor(ts.hour);
      const m = Math.round((ts.hour - h) * 60);
      const timeStr = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
      const sign = ts.totalAdjustMinutes >= 0 ? '+' : '';
      const tsEl = document.getElementById('baziTrueSolar');
      if (tsEl) tsEl.textContent = timeStr + ' (' + sign + Math.round(ts.totalAdjustMinutes) + 'min)';
    }
  } else {
    if (tsItem) tsItem.style.display = 'none';
  }
}

// ==================== 渲染详情面板 ====================

function renderDetailPanel(chart, bazi) {
  const panel = document.getElementById('detailPanel');
  if (!panel) return;
  const grid = document.getElementById('detailGrid');
  if (!grid) return;
  panel.style.display = 'block';
  grid.innerHTML = '';

  // 重置 AI 面板
  document.getElementById('aiAnalysisContainer').style.display = 'none';
  document.getElementById('btnAiAnalyze').textContent = '🤖 AI 命盘解读';
  document.getElementById('btnAiAnalyze').classList.remove('btn-ai-active');

  const items = [
    { label: '年柱', value: bazi.year.full + ' (' + bazi.year.animal + '年)' },
    { label: '命宫', value: chart.mingGong.ganZhi },
    { label: '身宫', value: ZHI[chart.shenGong.zhiIndex] + '宫' },
    { label: '五行局', value: chart.bureauName },
    { label: '紫微星', value: ZHI[chart.ziweiZhi] + '宫' },
    { label: '时辰', value: bazi.hour.shichenName },
    { label: '农历', value: bazi.lunar.lunarYear + '年' + lunarDateToChinese(bazi.lunar.lunarMonth, bazi.lunar.lunarDay, bazi.lunar.isLeap) }
  ];

  // 真太阳时详情
  if (bazi.trueSolar) {
    const ts = bazi.trueSolar;
    const h = Math.floor(ts.hour);
    const m = Math.round((ts.hour - h) * 60);
    const timeStr = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    items.push({ label: '真太阳时', value: timeStr });
    items.push({ label: '均时差', value: ts.eotMinutes.toFixed(1) + ' 分钟' });
    items.push({ label: '经度修正', value: ts.lonAdjustMinutes.toFixed(1) + ' 分钟' });
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'detail-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'd-label';
    labelSpan.textContent = item.label;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'd-value';
    valueSpan.textContent = item.value;
    
    div.appendChild(labelSpan);
    div.appendChild(valueSpan);
    grid.appendChild(div);
  });
}

// ==================== 主流程 ====================

/**
 * 从小时+分钟实时计算并显示对应时辰
 */
function onTimeChange() {
  const h = parseInt(document.getElementById('birthHour').value) || 0;
  const m = parseInt(document.getElementById('birthMinute').value) || 0;
  const dec = h + m / 60;
  const idx = getShichenIndex(dec);
  const range = SHICHEN_RANGE[idx];
  document.getElementById('derivedShichen').textContent = SHICHEN_NAME[idx] + ' ' + range;
}

// ==================== 五术切换 ====================

function switchWushu(wushu) {
  activeWushu = wushu;
  document.querySelectorAll('.wushu-tab').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-wushu') === wushu);
  });
  document.querySelectorAll('.wushu-panel').forEach(function(p) {
    p.classList.toggle('active', p.id === 'wushu' + wushu.charAt(0).toUpperCase() + wushu.slice(1));
  });

  // 触发各模块的初始化渲染
  if (wushu === 'shan') initShanTab();
  if (wushu === 'yi') initYiTab();
  if (wushu === 'ming') initMingTab();
  if (wushu === 'xiang') initXiangTab();
  if (wushu === 'bu') initBuTab();
}

function switchShanTab(sub) {
  switchSubTab('shan', sub);
  if (sub === 'zhiwu') renderShanZhiwu();
  else if (sub === 'wuxing') renderShanWuxing();
  else if (sub === 'meditation') renderShanMeditation();
  else if (sub === 'detox') renderShanDetox();
}
function switchYiTab(sub) {
  switchSubTab('yi', sub);
  if (sub === 'constitution') renderYiConstitution();
  else if (sub === 'zangfu') renderYiZangfu();
  else if (sub === 'jieqi') renderYiJieqi();
}
function switchMingTab(sub) {
  switchSubTab('ming', sub);
  if (sub === 'ziwei') {
    var liuBar = document.getElementById('liuTimeBar');
    if (liuBar) liuBar.style.display = currentChart ? 'flex' : 'none';
  }
  if (sub === 'bazi' && currentBazi) {
    renderBaziTab(currentBazi, document.getElementById('gender').value);
  }
  if (sub === 'astro' && currentAstrologyChart) {
    setTimeout(function() { renderAstrologyTab(currentAstrologyChart); }, 50);
  }
}
function switchXiangTab(sub) {
  switchSubTab('xiang', sub);
  if (sub === 'palm') renderXiangPalm();
  else if (sub === 'face') renderXiangFace();
  else if (sub === 'fengshui') renderFengShuiStars();
  else if (sub === 'luopan') renderLuoPan();
  else if (sub === 'name') { /* name analysis is self-contained */ }
}
function switchBuTab(sub) {
  switchSubTab('bu', sub);
  if (sub === 'tarot') ensureTarotLoaded();
  else if (sub === 'horoscope') ensureHoroscopeLoaded();
  else if (sub === 'qimen') renderQiMen();
  else if (sub === 'zeri') renderZeRiCalendar();
}
function switchSubTab(prefix, sub) {
  var panel = document.getElementById('wushu' + prefix.charAt(0).toUpperCase() + prefix.slice(1));
  if (!panel) return;
  // Update sub-tab buttons
  panel.querySelectorAll('.ws-tab').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-subtab') === prefix + '-' + sub);
  });
  // Show/hide sub-content panels (ID format: prefix + CapitalizedSub, e.g. 'shanZhiwu')
  var targetId = prefix + sub.charAt(0).toUpperCase() + sub.slice(1);
  panel.querySelectorAll('.ws-content').forEach(function(c) {
    c.classList.toggle('active', c.id === targetId);
  });
}

// ==================== 各模块懒初始化 ====================

function initShanTab() {
  var activeSub = document.querySelector('#wushuShan .ws-tab.active');
  var sub = activeSub ? (activeSub.getAttribute('data-subtab') || 'shan-zhiwu').replace('shan-', '') : 'zhiwu';
  switchShanTab(sub);
}

function initYiTab() {
  var activeSub = document.querySelector('#wushuYi .ws-tab.active');
  var sub = activeSub ? (activeSub.getAttribute('data-subtab') || 'yi-constitution').replace('yi-', '') : 'constitution';
  switchYiTab(sub);
}

function initMingTab() {
  var activeSub = document.querySelector('#wushuMing .ws-tab.active');
  var sub = activeSub ? (activeSub.getAttribute('data-subtab') || 'ming-ziwei').replace('ming-', '') : 'ziwei';
  switchMingTab(sub);
}

function initXiangTab() {
  var activeSub = document.querySelector('#wushuXiang .ws-tab.active');
  var sub = activeSub ? (activeSub.getAttribute('data-subtab') || 'xiang-palm').replace('xiang-', '') : 'palm';
  switchXiangTab(sub);
}

function initBuTab() {
  var activeSub = document.querySelector('#wushuBu .ws-tab.active');
  var sub = activeSub ? (activeSub.getAttribute('data-subtab') || 'bu-tarot').replace('bu-', '') : 'tarot';
  switchBuTab(sub);
}

function ensureTarotLoaded() {
  // TarotDice 在 tarot-dice.js 中已同步加载，无需额外处理
  if (typeof TarotDice === 'undefined') {
    console.warn('塔罗牌模块未加载，请刷新页面');
    return;
  }
}

function ensureHoroscopeLoaded() {
  // DailyHoroscope 在 daily-horoscope.js 中已同步加载，无需额外处理
  if (typeof DailyHoroscope === 'undefined') {
    console.warn('运势模块未加载，请刷新页面');
    return;
  }
  // 首次进入时渲染星座选择器
  var picker = document.getElementById('zodiacPicker');
  if (picker && !picker.innerHTML.trim()) {
    renderZodiacPicker();
  }
}

// 保持旧 switchTab 兼容
function switchTab(tab) {
  var map = { ziwei: 'ming', astrology: 'ming', bazi: 'ming', tarot: 'bu', horoscope: 'bu' };
  var wushu = map[tab] || 'ming';
  switchWushu(wushu);
  if (tab === 'ziwei' || tab === 'bazi' || tab === 'astrology') {
    var subMap = { ziwei: 'ziwei', bazi: 'bazi', astrology: 'astro' };
    switchMingTab(subMap[tab] || 'ziwei');
  } else if (tab === 'tarot') { switchBuTab('tarot'); }
  else if (tab === 'horoscope') { switchBuTab('horoscope'); }
}

function generateChart() {
  var y, m, d;

  // 农历模式：先转换为公历
  if (currentDateType === 'lunar' && typeof lunarToSolar === 'function') {
    var lv = getLunarDateValues();
    var solar = lunarToSolar(lv.year, lv.month, lv.day, lv.isLeap);
    if (!solar) {
      alert('农历日期转换失败，请检查输入');
      return;
    }
    y = solar.year;
    m = solar.month;
    d = solar.day;
    // 同步回公历日期选择器
    document.getElementById('birthDate').value = y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2);
  } else {
    const dateInput = document.getElementById('birthDate').value;
    if (!dateInput) {
      alert('请选择出生日期');
      return;
    }
    [y, m, d] = dateInput.split('-').map(Number);
  }

  const hourVal = document.getElementById('birthHour').value;
  const minuteVal = document.getElementById('birthMinute').value;

  // 日期范围验证（农历数据覆盖1900-2100年）
  if (y < 1900 || y > 2100) {
    alert('日期超出范围，请选择1900年-2100年之间的日期');
    return;
  }

  // 夏令时提醒
  var dstWarn = document.getElementById('dstWarning');
  if (dstWarn) {
    var isDst = (y === 1986 && m >= 5 && m <= 9) ||
                (y === 1987 && m >= 4 && m <= 9) ||
                (y === 1988 && m >= 4 && m <= 9) ||
                (y === 1989 && m >= 4 && m <= 9) ||
                (y === 1990 && m >= 4 && m <= 9) ||
                (y === 1991 && m >= 4 && m <= 9);
    dstWarn.style.display = isDst ? 'block' : 'none';
  }

  const hour = parseInt(hourVal) || 0;
  const minute = parseInt(minuteVal) || 0;

  // 真太阳时选项
  const useTrueSolar = document.getElementById('useTrueSolar').checked;
  let opts = { minute: minute };
  if (useTrueSolar) {
    const longitude = parseFloat(document.getElementById('longitude').value) || 120;
    opts.useTrueSolar = true;
    opts.longitude = longitude;
  }

  // 性别
  const gender = document.getElementById('gender').value;

  // ---- 计算八字 (共享) ----
  const bazi = calculateBaZi(y, m, d, hour, opts);
  currentBazi = bazi;
  currentTrueSolarInfo = bazi.trueSolar;
  _chartResult = { chart: null, bazi: bazi, gender: gender }; // 保存供命Tab各子Tab共享

  // ---- 计算紫微命盘 ----
  var effectiveHour = useTrueSolar && bazi.trueSolar ? bazi.trueSolar.hour : hour;
  var chart = calculateZiWeiChart(y, m, d, effectiveHour, bazi, gender);
  currentChart = chart;
  _chartResult.chart = chart;

  // ---- 计算西洋星盘 ----
  currentAstrologyChart = Astrology.calculateChart(y, m, d, hour, minute);

  // ---- 渲染当前命Tab子页 ----
  renderBaziBar(bazi);
  renderChart(chart, bazi);
  renderDetailPanel(chart, bazi);
  var liuBar = document.getElementById('liuTimeBar');
  if (liuBar) liuBar.style.display = 'flex';
  var modeBar = document.getElementById('ziweiModeBar');
  if (modeBar) modeBar.style.display = 'flex';
  _liuTimeMode = 'benming';
  document.querySelectorAll('#mingZiwei .liu-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-liu') === 'benming');
  });

  // 切换到紫微斗数子Tab
  switchMingTab('ziwei');

  // 更新时辰显示
  onTimeChange();

  // 如果新手教程正停在"输入出生信息"步骤，排盘完成后自动前进到"看懂命盘"步骤
  if (typeof Tutorial !== 'undefined' && Tutorial.isOpen && Tutorial.isOpen()) {
    var stepIdx = Tutorial.getCurrentStep ? Tutorial.getCurrentStep() : -1;
    if (stepIdx === 1 && Tutorial.steps && Tutorial.steps[1] && Tutorial.steps[1].id === 'input') {
      Tutorial.goTo(2);
      // 确保命盘区域可见
      var chartContainer = document.querySelector('.chart-container');
      if (chartContainer) {
        setTimeout(function() { chartContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
      }
    }
  }

  // ---- 检测命盘特殊格局 ----
  if (typeof ZiweiPatterns !== 'undefined') {
    var patterns = ZiweiPatterns.detectAll(chart);
    renderPatterns(patterns);
    _lastPatterns = patterns;
  }

  // ---- 宫位评分 ----
  if (typeof scorePalaces !== 'undefined') {
    _lastPalaceScores = scorePalaces(chart);
    renderPalaceScores(_lastPalaceScores);
  }
}

// ==================== 星盘渲染 ====================
function renderAstrologyTab(astroChart) {
  Astrology.renderSvg(astroChart, 'astroWheel');
  Astrology.renderPlanetTable(astroChart, 'planetList');
  Astrology.renderAspectTable(astroChart, 'aspectList');
  Astrology.renderHouseTable(astroChart, 'houseList');

  // 星盘格局
  var patterns = Astrology.detectPatterns(astroChart);
  var patternHtml = '';
  if (patterns.length > 0) {
    patterns.forEach(function(p) {
      patternHtml += '<div class="pattern-item" style="border-left:3px solid '+p.color+'">';
      patternHtml += '<span class="ptn-name">'+p.name+'</span>';
      patternHtml += '<span class="ptn-desc">'+p.desc+'</span>';
      patternHtml += '</div>';
    });
  } else {
    patternHtml = '<div class="pattern-empty">未检测到特殊格局</div>';
  }
  document.getElementById('patternList').innerHTML = patternHtml;

  // 元素分布
  var elemDist = Astrology.calcElementDist(astroChart);
  var maxElem = Math.max.apply(null, Object.values(elemDist)) || 1;
  var elemHtml = '';
  ['火','土','风','水'].forEach(function(e) {
    var pct = Math.round(elemDist[e] / maxElem * 100);
    var c = {火:'#e06040',土:'#d0a040',风:'#e0c050',水:'#6090d0'}[e];
    elemHtml += '<div class="elem-wrap"><span class="elem-label">'+e+'</span>';
    elemHtml += '<span class="elem-bar"><span class="elem-fill" style="width:'+pct+'%;background:'+c+'"></span></span>';
    elemHtml += '<span class="elem-val">'+elemDist[e]+'</span></div>';
  });
  document.getElementById('elementDist').innerHTML = elemHtml;
}

// ==================== 八字解读渲染 ====================
var _baziFlowYear = new Date().getFullYear();
var _baziFlowMonth = new Date().getMonth() + 1;
var _currentDaYun = [];

function renderBaziTab(bazi, gender) {
  var container = document.getElementById('baziReadingContainer');
  var sections = BaZiReading.fullReading(bazi, gender);
  var ssDist = BaZiReading.calcShiShenDistribution(bazi);

  _baziFlowYear = new Date().getFullYear();
  _baziFlowMonth = new Date().getMonth() + 1;

  var html = '';

  // 流年/流月导航
  html += '<div class="br-flow-nav">';
  html += '<span class="br-flow-label">🔮 流运查询</span>';
  html += '<button class="br-flow-btn" onclick="changeBaziFlowYear(-1)">◀ 上年</button>';
  html += '<span class="br-flow-year" id="brFlowYear">'+_baziFlowYear+'年</span>';
  html += '<button class="br-flow-btn" onclick="changeBaziFlowYear(1)">下年 ▶</button>';
  html += '<button class="br-flow-btn" onclick="changeBaziFlowMonth(-1)">◀ 上月</button>';
  html += '<span class="br-flow-month" id="brFlowMonth">'+_baziFlowMonth+'月</span>';
  html += '<button class="br-flow-btn" onclick="changeBaziFlowMonth(1)">下月 ▶</button>';
  html += '<button class="br-flow-btn br-flow-reset" onclick="resetBaziFlow()">↻ 当前</button>';
  html += '</div>';

  // 四柱详细表 (含纳音、藏干、空亡)
  html += '<div class="br-pillars-table">';
  html += '<table class="br-table"><thead><tr>' +
    '<th></th><th>天干</th><th>地支</th><th>十神(干)</th><th>十神(支)</th><th>纳音</th><th>藏干</th><th>空亡</th>' +
    '</tr></thead><tbody>';
  ssDist.forEach(function(s) {
    var xkNames = (s.xunKong||[]).map(function(idx){return ZHI[idx];}).join('');
    html += '<tr>';
    html += '<td class="brt-label">' + s.label + '</td>';
    html += '<td class="brt-gan">' + s.gan + '</td>';
    html += '<td>' + s.zhi + '</td>';
    html += '<td class="brt-ss">' + s.ganSS + '</td>';
    html += '<td class="brt-ss">' + s.zhiSS + '</td>';
    html += '<td class="brt-najia">' + s.najia + '</td>';
    html += '<td class="brt-canggan">' + s.cangGan + '</td>';
    html += '<td class="brt-xunkong">' + (xkNames||'—') + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  // 五行强度条
  var ws = BaZiReading.calcWuxingStrength(bazi);
  var maxW = Math.max.apply(null, ws) || 1;
  html += '<div class="br-wuxing">';
  BaZiReading.WUXING.forEach(function(w, i) {
    var pct = Math.round(ws[i] / maxW * 100);
    html += '<div class="brw-bar-wrap"><span class="brw-label">' + w + '</span>';
    html += '<span class="brw-bar"><span class="brw-fill" style="width:' + pct + '%;background:' + BaZiReading.WUXING_COLORS[i] + '"></span></span>';
    html += '<span class="brw-val">' + ws[i] + '</span></div>';
  });
  html += '</div>';

  // 解读模块
  sections.forEach(function(s) {
    var extraAttr = '';
    if (s.icon === '⏳') extraAttr = ' id="brFlowBlock"';
    else if (s.icon === '📅') extraAttr = ' id="brYearBlock"';
    html += '<div class="br-block"'+extraAttr+'>';
    html += '<div class="brb-title"><span class="brb-icon">' + s.icon + '</span> ' + s.title + '</div>';
    html += '<div class="brb-text">' + s.content.replace(/\n/g, '<br>') + '</div>';
    html += '</div>';
  });

  // 大运时间线
  var daYun = BaZiReading.calcDaYun(bazi, gender || 'male');
  _currentDaYun = daYun;
  if (daYun.length > 0) {
    html += '<div class="br-block" id="dayunBlock">';
    html += '<div class="brb-title"><span class="brb-icon">📈</span> 大运走势图 <span style="font-size:0.65em;color:#7a7c60;font-weight:normal;">（点击查看详情）</span></div>';
    html += '<div class="dayun-timeline">';
    daYun.forEach(function(d, i) {
      var pct = Math.round((i+1) / daYun.length * 100);
      var wxC = BaZiReading.WUXING_COLORS[4 - (i % 5)];
      html += '<div class="dy-step" onclick="showDaYunDetail('+i+')" title="点击查看大运详情">';
      html += '<div class="dy-bar-wrap"><span class="dy-fill" style="width:'+pct+'%;background:'+wxC+'"></span></div>';
      html += '<span class="dy-label">'+d.startAge+'岁 '+d.label+'</span>';
      html += '<span class="dy-ss">'+d.ss+'</span>';
      html += '</div>';
    });
    html += '</div>';
    // 大运详情弹出区
    html += '<div class="dayun-detail" id="dayunDetail" style="display:none;"></div>';
    html += '</div>';
  }

  // 称骨
  if (BaZiReading.chengGuReading) {
    var cg = BaZiReading.chengGuReading(bazi, gender);
    html += '<div class="br-block">';
    html += '<div class="brb-title"><span class="brb-icon">⚖</span> 袁天罡称骨算命</div>';
    html += '<div class="brb-text">';
    html += '<p style="margin-bottom:6px;"><b style="font-size:1.1em;color:#f0d78c;">' + cg.weight + '</b> <span style="color:#aaa;">（' + cg.level + '）</span></p>';
    html += '<p style="color:#c0b080;margin-bottom:8px;">' + cg.song + '</p>';
    html += '<p style="color:#9a8c6c;">' + cg.desc + '</p>';
    html += '<p style="color:#7a7c60;font-size:0.78em;margin-top:6px;">';
    html += cg.breakdown.year.label + '(' + cg.breakdown.year.qian + '钱) + ';
    html += cg.breakdown.month.label + '(' + cg.breakdown.month.qian + '钱) + ';
    html += cg.breakdown.day.label + '(' + cg.breakdown.day.qian + '钱) + ';
    html += cg.breakdown.hour.label + '(' + cg.breakdown.hour.qian + '钱)';
    html += '</p></div></div>';
  }

  // 免责声明
  html += '<div class="br-disclaimer">以上解读由八字规则引擎自动生成，仅供参考。命理为概率之学，人生之路仍在自己手中。</div>';

  container.innerHTML = html;

  // 合婚面板
  renderHeHunPanel();
}

function changeBaziFlowYear(delta) {
  _baziFlowYear += delta;
  updateBaziFlowDisplay();
}

function changeBaziFlowMonth(delta) {
  _baziFlowMonth += delta;
  if (_baziFlowMonth > 12) { _baziFlowMonth = 1; _baziFlowYear++; }
  if (_baziFlowMonth < 1) { _baziFlowMonth = 12; _baziFlowYear--; }
  updateBaziFlowDisplay();
}

function resetBaziFlow() {
  _baziFlowYear = new Date().getFullYear();
  _baziFlowMonth = new Date().getMonth() + 1;
  updateBaziFlowDisplay();
}

function showDaYunDetail(idx) {
  var dy = _currentDaYun[idx];
  if (!dy) return;
  var detail = document.getElementById('dayunDetail');
  if (!detail) return;

  // Toggle if same one clicked
  var isOpen = detail.style.display === 'block' && detail.getAttribute('data-idx') === String(idx);
  if (isOpen) {
    detail.style.display = 'none';
    return;
  }

  detail.setAttribute('data-idx', idx);
  detail.style.display = 'block';

  var wx = ['木','火','土','金','水'][dy.ganIndex % 5];
  var wxColor = BaZiReading.WUXING_COLORS[dy.ganIndex % 5];
  var najia = dy.najia || BaZiReading.getNajia(dy.ganIndex, dy.zhiIndex);

  detail.innerHTML =
    '<div class="dy-detail-header">' +
    '<span class="dy-detail-age">' + dy.startAge + '~' + dy.endAge + '岁</span>' +
    '<span class="dy-detail-label" style="color:'+wxColor+'">' + dy.label + '</span>' +
    '</div>' +
    '<div class="dy-detail-body">' +
    '<div>天干十神：<b>' + dy.ss + '</b></div>' +
    '<div>五行：<b style="color:'+wxColor+'">' + wx + '</b></div>' +
    '<div>纳音：<b>' + (najia || '—') + '</b></div>' +
    '<div style="margin-top:6px;font-size:0.85em;color:#9a8c6c;">此十年为一大运，运势基调由此干支决定。' +
    '前五年以天干为重，后五年以地支为重。</div>' +
    '</div>';
}

function updateBaziFlowDisplay() {
  if (!currentBazi) return;
  var bazi = currentBazi;

  // Update navigator display
  var yEl = document.getElementById('brFlowYear');
  var mEl = document.getElementById('brFlowMonth');
  if (yEl) yEl.textContent = _baziFlowYear + '年';
  if (mEl) mEl.textContent = _baziFlowMonth + '月';

  // Recompute 流月/流日/流时
  var liuYue = BaZiReading.calcLiuYue(bazi, _baziFlowYear, _baziFlowMonth);
  // 流日: use 15th of the month as reference
  var refDay = 15;
  var jd = gregorianToJDN(_baziFlowYear, _baziFlowMonth, refDay);
  var dayIdx = ((jd + 49) % 60 + 60) % 60;
  var dayG = dayIdx % 10, dayZ = dayIdx % 12;
  var refDayGZ = { gan: GAN[dayG], zhi: ZHI[dayZ], full: GAN[dayG] + ZHI[dayZ] };
  var liuRiSS = BaZiReading.getShiShen(bazi.day.ganIndex, dayG);
  // 流时: use noon (午时) as reference
  var liuShi = BaZiReading.calcLiuShi(bazi, 12);

  var flowBlock = document.getElementById('brFlowBlock');
  if (flowBlock) {
    flowBlock.querySelector('.brb-title').innerHTML = '<span class="brb-icon">⏳</span> 当前流月/流日/流时（'+_baziFlowYear+'年'+_baziFlowMonth+'月'+refDay+'日）';
    flowBlock.querySelector('.brb-text').innerHTML =
      '流月：'+liuYue.full+'（十神：'+liuYue.ss+'）<br>'+
      '流日（参考）：'+refDayGZ.full+'（十神：'+liuRiSS+'）<br>'+
      '流时（参考·午时）：'+liuShi.full+'（十神：'+liuShi.ss+'）<br><br>'+
      '流月主当月运势基调，流日为当日吉凶，流时为当下气运。<br>'+
      '<span style="font-size:0.7em;color:#7a7c60">注：流日流时基于参考日/时，精准查询请使用实际日时。</span>';
  }

  // Recompute 流年
  var liuNian = BaZiReading.analyzeLiuNian(bazi, _baziFlowYear);
  var yearBlock = document.getElementById('brYearBlock');
  if (yearBlock) {
    yearBlock.querySelector('.brb-title').innerHTML = '<span class="brb-icon">📅</span> 当前流年（'+liuNian.yearGan+liuNian.yearZhi+'年）';
    yearBlock.querySelector('.brb-text').innerHTML = '流年天干为'+liuNian.ss+'。<br>'+liuNian.notes.join('<br>');
  }
}

function useCurrentTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  
  document.getElementById('birthDate').value = yyyy + '-' + mm + '-' + dd;
  document.getElementById('birthHour').value = now.getHours();
  document.getElementById('birthMinute').value = now.getMinutes();

  onTimeChange();
  generateChart();
}

// ==================== 悬停提示 Tooltip 系统 ====================

var _tooltipEl = null;
var _tooltipTimer = null;
var _tooltipTarget = null;

function initTooltips() {
  // 创建全局 tooltip 元素（单例）
  _tooltipEl = document.createElement('div');
  _tooltipEl.className = 'tooltip-popup';
  _tooltipEl.id = 'globalTooltip';
  document.body.appendChild(_tooltipEl);

  // 扫描所有带 data-tooltip 属性的元素
  var els = document.querySelectorAll('[data-tooltip]');
  els.forEach(function(el) {
    el.addEventListener('mouseenter', function(e) {
      var text = el.getAttribute('data-tooltip');
      if (!text) return;
      _tooltipTarget = el;
      clearTimeout(_tooltipTimer);
      _tooltipTimer = setTimeout(function() {
        showTooltip(e, text);
      }, 400);
    });
    el.addEventListener('mouseleave', function() {
      _tooltipTarget = null;
      clearTimeout(_tooltipTimer);
      hideTooltip();
    });
  });
}

function showTooltip(e, text) {
  if (!_tooltipEl) return;
  _tooltipEl.textContent = text;
  _tooltipEl.classList.add('visible');

  // 定位：默认在目标元素上方
  var rect = _tooltipTarget ? _tooltipTarget.getBoundingClientRect() : null;
  var x, y;
  if (rect) {
    // 默认显示在元素上方居中
    x = rect.left + rect.width / 2;
    y = rect.top - 10;
  } else {
    x = (e.clientX || 0) + 10;
    y = (e.clientY || 0) - 10;
  }

  var tw = _tooltipEl.offsetWidth;
  var th = _tooltipEl.offsetHeight;

  // 水平居中偏左
  x = Math.max(10, Math.min(x - tw / 2, window.innerWidth - tw - 10));
  // 垂直方向：优先放上方，空间不够放下方
  if (y - th < 10) {
    y = rect ? rect.bottom + 10 : (e.clientY || 0) + 20;
  } else {
    y = y - th;
  }
  y = Math.max(10, Math.min(y, window.innerHeight - th - 10));

  _tooltipEl.style.left = x + 'px';
  _tooltipEl.style.top = y + 'px';
}

function hideTooltip() {
  if (_tooltipEl) {
    _tooltipEl.classList.remove('visible');
  }
}

// ==================== 页面初始化 ====================

window.addEventListener('DOMContentLoaded', () => {
  // 初始化悬停提示
  initTooltips();
  // 初始化城市选择器
  initCitySelect();
  // 显示初始时辰
  onTimeChange();
  // 初始化用户模式 (专业/大众)
  if (typeof UserMode !== 'undefined') {
    UserMode.init();
    // 应用模式 class 到 body，控制高级功能显隐
    if (!UserMode.isProfessional()) {
      document.body.classList.add('mode-nonpro');
    }
    // 更新模式切换按钮图标
    updateModeButton();
  }
  // 页面加载时自动排盘
  generateChart();
  // 刷新命例库列表
  renderCaseList();
});

function updateModeButton() {
  var btn = document.getElementById('btnModeToggle');
  if (!btn) return;
  if (typeof UserMode === 'undefined') return;
  var level = UserMode.getLevel();
  var style = UserMode.getStyle();
  if (level === 'professional') {
    btn.textContent = '🔬';
    btn.title = '当前：专业模式 | 点击切换';
  } else if (level === 'non-professional') {
    var icons = { story: '📖', daily: '🏠', psychology: '🧠' };
    btn.textContent = (icons[style] || '🌟');
    btn.title = '当前：大众模式（' + 
      (style==='story'?'故事化':style==='psychology'?'心理化':'生活化') + 
      '）| 点击切换';
  }
}

// ==================== 命例库 UI ====================

var TAG_PRESETS = ['自己', '家人', '朋友', '客户', '名人', '案例'];
var _activeFilter = '';

function saveCurrentCase() {
  if (!currentBazi || !currentChart) {
    alert('请先完成排盘再保存');
    return;
  }
  showSaveDialog();
}

function showSaveDialog() {
  var dlg = document.getElementById('saveDialog');
  dlg.style.display = 'flex';
  document.getElementById('caseNameInput').value = '';
  document.getElementById('caseTagsInput').value = '';

  var presets = document.getElementById('tagPresets');
  presets.innerHTML = '';
  TAG_PRESETS.forEach(function(t) {
    var chip = document.createElement('span');
    chip.className = 'tag-chip-preset';
    chip.textContent = t;
    chip.onclick = function() { addPresetTag(t); };
    presets.appendChild(chip);
  });
  document.getElementById('caseNameInput').focus();
}

function closeSaveDialog() {
  document.getElementById('saveDialog').style.display = 'none';
  resetSaveDialog();
}

function addPresetTag(tag) {
  var input = document.getElementById('caseTagsInput');
  var current = input.value.replace(/，/g, ',');
  var parts = current.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  if (parts.indexOf(tag) === -1) {
    parts.push(tag);
  }
  input.value = parts.join(', ');
}

function doSaveCase() {
  var name = document.getElementById('caseNameInput').value.trim();
  var raw = document.getElementById('caseTagsInput').value.trim();
  var tags = raw.replace(/，/g, ',').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  CaseDB.save(name, tags);
  closeSaveDialog();
  _activeFilter = '';
  renderCaseList();
  // 闪烁反馈
  var btn = document.getElementById('saveCaseBtn');
  btn.textContent = '✓ 已保存';
  btn.classList.add('btn-saved');
  setTimeout(function() {
    btn.textContent = '保存命例';
    btn.classList.remove('btn-saved');
  }, 1500);
}

function setCaseFilter(tag) {
  _activeFilter = tag;
  renderCaseList();
}

function toggleCasesPanel() {
  var panel = document.getElementById('casesPanel');
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
    renderCaseList();
  } else {
    panel.style.display = 'none';
  }
}

function renderCaseList() {
  var list = document.getElementById('casesList');
  var countEl = document.getElementById('casesCount');
  var allCases = CaseDB.loadAll();

  // 标签筛选
  var cases = allCases;
  if (_activeFilter) {
    cases = allCases.filter(function(c) {
      return (c.tags || []).indexOf(_activeFilter) !== -1;
    });
  }

  countEl.textContent = cases.length > 0 ? '(' + cases.length + ' 条)' : '';

  // 标签筛选栏
  var tagsBar = document.getElementById('casesTagsBar');
  var allTags = CaseDB.getAllTags();
  if (allTags.length > 0) {
    tagsBar.style.display = 'flex';
    var tagHtml = '<span class="filter-tag' + (_activeFilter ? '' : ' active') + '" onclick="setCaseFilter(\'\')">全部</span>';
    allTags.forEach(function(t) {
      tagHtml += '<span class="filter-tag' + (_activeFilter === t ? ' active' : '') + '" onclick="setCaseFilter(\'' + t + '\')">' + t + '</span>';
    });
    tagsBar.innerHTML = tagHtml;
  } else {
    tagsBar.style.display = 'none';
  }

  if (cases.length === 0) {
    list.innerHTML = '<div class="cases-empty">' +
      (_activeFilter ? '该分类下暂无命例' : '暂无保存的命例<br><small>排盘后点击"保存命例"即可存入</small>') +
      '</div>';
    return;
  }

  var html = '';
  cases.forEach(function(c) {
    var datePart = c.date || '';
    var timeStr = (c.hour || 0) + ':' + String(c.minute || 0).padStart(2, '0');
    var genderStr = c.gender === 'female' ? '女' : '男';
    var tsTag = c.useTrueSolar ? ' <span class="case-tag">真太阳时</span>' : '';

    // 名称行
    var nameLine = '';
    if (c.name) {
      nameLine = '<div class="case-name">' + c.name + '</div>';
    }

    // 标签行
    var tagsLine = '';
    if (c.tags && c.tags.length > 0) {
      tagsLine = '<div class="case-tags">';
      c.tags.forEach(function(t) {
        tagsLine += '<span class="case-tag-chip" onclick="event.stopPropagation();setCaseFilter(\'' + t + '\')">' + t + '</span>';
      });
      tagsLine += '</div>';
    }

    var baziLine = '';
    if (c.bazi) {
      baziLine = '<span class="case-bazi">' + c.bazi.year + ' ' + c.bazi.month + ' ' + c.bazi.day + ' ' + c.bazi.hour + '</span>';
    }
    var lunarLine = '';
    if (c.bazi) {
      var m = LUNAR_MONTH_NAMES[c.bazi.lunarMonth] || (c.bazi.lunarMonth + '月');
      var d = LUNAR_DAY_NAMES[c.bazi.lunarDay] || (c.bazi.lunarDay + '日');
      lunarLine = '<span class="case-lunar">' + (c.bazi.isLeap ? '闰' : '') + m + d + '</span>';
    }
    var chartLine = '';
    if (c.chart) {
      chartLine = c.chart.mingGong + ' · ' + c.chart.bureau;
    }

    html += '<div class="case-card" id="case-' + c.id + '">'
      + '<div class="case-main" onclick="loadCaseById(' + c.id + ')">'
      + nameLine
      + '<div class="case-top">'
      + '<span class="case-date">' + datePart + ' ' + timeStr + '</span>'
      + '<span class="case-gender">' + genderStr + '</span>'
      + tsTag
      + '</div>'
      + '<div class="case-mid">' + baziLine + ' <span class="case-chart">' + chartLine + '</span></div>'
      + '<div class="case-bot">' + lunarLine + ' · ' + (c.bazi ? c.bazi.shichen : '') + '</div>'
      + tagsLine
      + '</div>'
      + (function() {
          var notesHtml = '';
          var hasNotes = c.notes && c.notes.trim();
          notesHtml += '<div class="case-notes-section">';
          notesHtml += '<span class="case-notes-toggle" onclick="event.stopPropagation();toggleCaseNotes(' + c.id + ')">📝 ' + (hasNotes ? '查看笔记' : '添加笔记') + '</span>';
          if (hasNotes) {
            notesHtml += '<div class="case-notes-display" id="notesDisplay-' + c.id + '">' + c.notes + '</div>';
          }
          notesHtml += '<div class="case-notes-editor" id="notesEditor-' + c.id + '">';
          notesHtml += '<textarea class="case-notes-input" id="notesInput-' + c.id + '">' + (c.notes || '') + '</textarea>';
          notesHtml += '<div class="case-notes-actions">';
          notesHtml += '<button class="case-notes-save-btn" onclick="event.stopPropagation();saveCaseNotes(' + c.id + ')">保存</button>';
          notesHtml += '</div></div></div>';
          return notesHtml;
        })()
      + '<button class="case-edit-btn" onclick="event.stopPropagation();editCase(' + c.id + ')" title="编辑">⋯</button>'
      + '<button class="btn-del-case" onclick="event.stopPropagation();deleteCaseById(' + c.id + ')" title="删除">✕</button>'
      + '</div>';
  });

  list.innerHTML = html;

  // 更新浮动按钮上的计数
  var floatBtn = document.getElementById('btnFloatCases');
  if (floatBtn) {
    if (allCases.length > 0) {
      floatBtn.setAttribute('data-count', allCases.length);
    } else {
      floatBtn.removeAttribute('data-count');
    }
  }
}

function editCase(id) {
  var cases = CaseDB.loadAll();
  var c = null;
  for (var i = 0; i < cases.length; i++) {
    if (cases[i].id === id) { c = cases[i]; break; }
  }
  if (!c) return;
  document.getElementById('caseNameInput').value = c.name || '';
  document.getElementById('caseTagsInput').value = (c.tags || []).join(', ');
  // 暂存编辑中的 ID
  window._editingCaseId = id;
  showSaveDialog();
  // 改写保存按钮行为
  var dlg = document.getElementById('saveDialog');
  dlg.querySelector('h3').textContent = '编辑命例';
  dlg.querySelector('.btn-primary').textContent = '更新';
  dlg.querySelector('.btn-primary').setAttribute('onclick', 'doUpdateCase()');
}

function doUpdateCase() {
  var id = window._editingCaseId;
  var name = document.getElementById('caseNameInput').value.trim();
  var raw = document.getElementById('caseTagsInput').value.trim();
  var tags = raw.replace(/，/g, ',').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  CaseDB.update(id, name, tags);
  window._editingCaseId = null;
  resetSaveDialog();
  closeSaveDialog();
  _activeFilter = '';
  renderCaseList();
}

function resetSaveDialog() {
  var dlg = document.getElementById('saveDialog');
  dlg.querySelector('h3').textContent = '保存命例';
  dlg.querySelector('.btn-primary').textContent = '保存';
  dlg.querySelector('.btn-primary').setAttribute('onclick', 'doSaveCase()');
}

function loadCaseById(id) {
  CaseDB.restore(id);
  generateChart();
  toggleCasesPanel();
}

function deleteCaseById(id) {
  if (!confirm('确定删除此命例？')) return;
  CaseDB.remove(id);
  renderCaseList();
}

// 点击空白区域关闭星盘弹窗
document.addEventListener('click', function(e) {
  var p = document.getElementById('astroInfoPopup');
  if (p && p.style.display === 'block') {
    // 如果点击的不是 clickable 元素（它们有自己的处理函数）
    if (!e.target.closest('.clickable') && !e.target.closest('.astro-info-popup')) {
      p.style.display = 'none';
    }
  }
});

// ==================== 功能全览 ====================

var FEATURE_CATALOG = [
  {
    icon: '🏮', title: '紫微斗数排盘引擎', tag: 'ziwei',
    items: [
      { name: '命宫与身宫', desc: '寅宫起正月，顺数至生月，逆数至生时 → 命宫；顺数至生时 → 身宫' },
      { name: '五虎遁天干', desc: '年干遁12宫天干（甲己起丙寅，乙庚起戊寅…）' },
      { name: '五行局（纳音）', desc: '水二局 / 木三局 / 金四局 / 土五局 / 火六局，决定紫微位置与大限起运' },
      { name: '紫微星定位', desc: '五行局数 + 农历日数 → 紫微星地支位置' },
      { name: '十四主星排布', desc: '紫微系6星（紫微·天机·太阳·武曲·天同·廉贞）+ 天府系8星（天府·太阴·贪狼·巨门·天相·天梁·七杀·破军）' },
      { name: '星曜亮度（庙旺利陷）', desc: '14主星在12宫位的七级亮度体系：庙 > 旺 > 得 > 利 > 平 > 不 > 陷，影响星曜吉凶' },
      { name: '14辅星排布', desc: '左辅·右弼·文昌·文曲·天魁·天钺·禄存·擎羊·陀罗·火星·铃星·天马·地空·地劫' },
      { name: '40+小星排布', desc: '天喜·恩光·天贵·龙池·凤阁·红鸾·天哭·天虚·孤辰·寡宿·蜚廉·天刑·天姚·咸池·华盖·劫煞·天月·阴煞·三台·八座·封诰·天德·月德·龙德·天官·天福·天厨·天巫·解神·年解·天寿·天空·台辅·破碎·截空·旬空·大耗·天才·天使·天伤 等' },
      { name: '生年四化', desc: '年干定四化：禄·权·科·忌，作用于特定主星（★为宫干自化/飞宫四化提供基础）' },
      { name: '宫干飞宫四化', desc: '各宫天干对同宫星曜 → 离心自化↓ + 对宫化入 → 向心自化↑，完整飞星系统' },
      { name: '神煞排布（36种）', desc: '岁前12星 + 将前12星 + 十二长生 + 太岁12星，覆盖全盘神煞信息' },
      { name: '大限推算', desc: '阳男阴女顺行/阴男阳女逆行；五行局数 = 起运岁数；每宫10年 × 12宫 = 120年' },
      { name: '小限计算', desc: '男顺女逆从戌宫起生年，逐年流变，支持1-99岁完整遍历' },
      { name: '流年推算', desc: '逐年顺行以太岁地支为标的，动态覆盖流年十二宫分布' },
      { name: '命主/身主', desc: '命主(命宫地支定守护星) + 身主(生年地支定守护星)，各12种组合' },
      { name: '子年斗君', desc: '生月+生时 → 流年指针起点，推算每年流年十二宫方位' },
      { name: '来因宫', desc: '宫干与年干相同的宫位 = 人生核心课题，命盘重点宫位' },
      { name: '4×4 命盘渲染', desc: '12地支宫位映射到4行4列网格，中心4格显示命宫核心信息' },
      { name: '命宫/身宫/来因宫高亮', desc: '红/蓝/金三色高亮标识三种特殊宫位' },
      { name: '四化标记渲染', desc: '🟢禄·🟠权·🔵科·🟣忌 + ↓离心↑向心方向标记' }
    ]
  },
  {
    icon: '📖', title: '星曜与宫位百科全书', tag: 'encyclopedia',
    items: [
      { name: '十四主星百科', desc: '紫微·天机·太阳·武曲·天同·廉贞·天府·太阴·贪狼·巨门·天相·天梁·七杀·破军（含阴阳/五行/四化/类别/特质/详解/关键词）' },
      { name: '辅星百科（14颗）', desc: '左辅·右弼·文昌·文曲·天魁·天钺·禄存·擎羊·陀罗·火星·铃星·天马·地空·地劫' },
      { name: '小星百科（20+颗）', desc: '天喜·红鸾·恩光·天贵·三台·八座·龙池·凤阁·天哭·天虚·孤辰·寡宿·蜚廉·天刑·天姚·咸池·华盖·劫煞·天月·阴煞 等' },
      { name: '命盘术语百科', desc: '五行局·命主·身主·斗君·来因宫·命身同宫·命宫，每种含特质/详解/关键词' },
      { name: '十二宫位百科', desc: '命宫·兄弟·夫妻·子女·财帛·疾厄·迁移·交友·官禄·田宅·福德·父母，每宫含类别/特质/详解/关键词' },
      { name: '点击弹窗查阅', desc: '点击任意星曜/宫位/中心信息项 → 弹出百科卡片，含属性行 + 详解 + 关键词标签' }
    ]
  },
  {
    icon: '🔢', title: '八字排盘引擎', tag: 'bazi-engine',
    items: [
      { name: '农历数据（1900-2100）', desc: '200年农历查表，含闰月标注和大小月编码' },
      { name: '公历→农历转换', desc: '儒略日算法，精确推算农历月日及闰月判定' },
      { name: '干支系统', desc: '十天干(甲乙丙丁戊己庚辛壬癸) + 十二地支(子丑寅卯辰巳午未申酉戌亥)' },
      { name: '24节气计算', desc: '查表法精确计算节气儒略日，用于确定月柱年柱分界' },
      { name: '立春分年', desc: '年柱以立春为界，立春前用上一年干支' },
      { name: '四柱八字', desc: '年柱·月柱·日柱·时柱 — 完整的四柱推演' },
      { name: '时辰系统', desc: '12时辰(子丑寅卯辰巳午未申酉戌亥) + 精确起止时间范围' },
      { name: '生肖计算', desc: '12生肖(鼠牛虎兔龙蛇马羊猴鸡狗猪)' },
      { name: '真太阳时校正', desc: '经纬度+时区 → 真太阳时调整，支持省市县三级联动 + 手动输入经度' },
      { name: '藏干系统', desc: '12地支的本气/中气/余气三层藏干，完整的人元体系' },
      { name: '纳音五行', desc: '60甲子纳音表（海中金~大海水），四柱每柱对应纳音' },
      { name: '空亡/旬空', desc: '6旬每旬空2地支，自动判定四柱空亡' },
      { name: '十神系统', desc: '比肩/劫财/食神/伤官/正财/偏财/正官/七杀/正印/偏印 — 天干地支双重十神' }
    ]
  },
  {
    icon: '📜', title: '八字深度解读', tag: 'bazi-reading',
    items: [
      { name: '日主总论', desc: '日干五行+阴阳+纳音+旺衰综合判断' },
      { name: '性格特质', desc: '10天干×阴阳 = 20种详尽的性格描述' },
      { name: '十神分布表', desc: '年柱/月柱/日柱/时柱 × 十神/纳音/空亡/藏干 完整表格' },
      { name: '五行旺衰量化', desc: '天干权重3 + 地支本气2/中气1/余气1 → 可视图表' },
      { name: '用神喜忌', desc: '日主旺衰 → 用神 + 喜神 + 忌神判定' },
      { name: '神煞分析', desc: '天乙贵人·文昌·学堂·驿马·华盖·桃花(咸池)·羊刃·劫煞·孤辰' },
      { name: '事业方向', desc: '十神分布+五行 → 职业建议' },
      { name: '财运分析', desc: '正偏财+劫财 → 财运算命' },
      { name: '婚姻分析', desc: '日支十神+桃花神煞 → 婚姻解读' },
      { name: '健康分析', desc: '过旺/过弱五行 → 脏腑健康建议' },
      { name: '大运推算', desc: '阳男阴女顺排/阴男阳女逆排；每10年一大运，共8运80年' },
      { name: '大运时间线UI', desc: '可视化走势图，逐年运势一目了然' },
      { name: '流年分析', desc: '当年干支+十神 → 流年运势解读' },
      { name: '综合解读报告', desc: '10大板块全方位八字解读，从日主到大运完整呈现' }
    ]
  },
  {
    icon: '🌟', title: '西洋占星星盘', tag: 'astrology',
    items: [
      { name: '10行星位置计算', desc: '太阳·月亮·水星·金星·火星·木星·土星·天王星·海王星·冥王星 的精确黄经' },
      { name: '四轴计算', desc: '上升(ASC)·下降(DES)·中天(MC)·天底(IC)' },
      { name: '12宫位（等宫制）', desc: '每30°一宫，完整的12宫分布' },
      { name: '行星落座解读', desc: '10行星 × 12星座 = 120种落座含义' },
      { name: '相位计算', desc: '合(0°)·六合(60°)·刑(90°)·三合(120°)·冲(180°) + 容许度' },
      { name: '相位解读', desc: '20+种常见行星组合的特殊相位含义' },
      { name: 'SVG星盘渲染', desc: '圆形星盘图：星座环·宫位扇形·相位连线·行星符号·四轴标签·中心度数' },
      { name: '行星列表', desc: '符号/名称/星座/度数/元素/模式 完整表格' },
      { name: '相位表', desc: '相位符号/行星对/容许度/解读' },
      { name: '宫位含星表', desc: '12宫号/宫头星座/宫内行星' },
      { name: '格局检测', desc: '星群(Stellium)·大三角(Grand Trine)·T三角(T-Square)·大十字(Grand Cross)' },
      { name: '元素分布', desc: '火/土/风/水四元素数量统计 + 可视化条形图' },
      { name: '点击交互弹窗', desc: '点击行星/宫位/四轴/中心度数 → 详细解读弹窗' }
    ]
  },
  {
    icon: '🤖', title: 'AI 智能解读', tag: 'ai',
    items: [
      { name: '个性分析', desc: '命宫主星×亮度 → 14主星×7级亮度 = 98种性格描述；命宫无主星借对宫解读' },
      { name: '双主星分析', desc: '命宫同时有2颗主星时的性格融合解读' },
      { name: '财运分析', desc: '财帛宫主星+辅星+四化 → 全方位财运解读' },
      { name: '事业分析', desc: '官禄宫主星+辅星+四化 → 职业方向建议' },
      { name: '婚姻分析', desc: '夫妻宫主星+辅星+四化 → 感情婚姻解读' },
      { name: '迁移分析', desc: '迁移宫星曜+天马 → 外出运判断' },
      { name: '健康分析', desc: '疾厄宫煞星(擎羊·陀罗·火星·铃星·天月) → 健康提示' },
      { name: '四化专项解读', desc: '生年禄·权·科·忌在不同宫位的详细含义' },
      { name: '格局检测', desc: '紫府同宫·辅弼拱主·铃昌陀武·火贪格·禄马交驰·命身同宫·空劫夹命·杀破狼 等' },
      { name: '身宫分析', desc: '身宫所在宫位 → 中晚年人生重心提示' },
      { name: '来因宫分析', desc: '来因宫所在 → 人生核心课题解读' },
      { name: '五行局解读', desc: '水二/木三/金四/土五/火六局的性格特质' },
      { name: '吉煞分布统计', desc: '吉星(辅弼昌曲魁钺禄存) vs 煞星(羊陀火铃空劫) 数量统计' },
      { name: '大限提示', desc: '起运年龄分析，大限流向判断' },
      { name: '个性化建议', desc: '根据命宫星曜组合 + 整体命盘给出发展方向建议' }
    ]
  },
  {
    icon: '💾', title: '命例库系统', tag: 'cases',
    items: [
      { name: 'localStorage持久化', desc: '全部命例保存到浏览器本地存储，离线可用' },
      { name: '保存命例', desc: '序列化输入状态+八字+命盘摘要 → 一键保存' },
      { name: '加载命例', desc: '一键恢复命例到输入表单（含省市选择器自动恢复）' },
      { name: '删除/编辑命例', desc: '支持修改名称和标签，支持删除' },
      { name: '标签系统', desc: '预设标签(自己/家人/朋友/客户/名人/案例) + 自定义标签' },
      { name: '标签筛选', desc: '按标签分类快速筛选命例列表' },
      { name: '断事笔记', desc: '每个命例可添加独立文本笔记，支持编辑和保存' },
      { name: '命例卡片', desc: '显示名称/日期/时间/性别/八字/农历/命宫/标签' },
      { name: '命例计数角标', desc: '浮动按钮上实时显示命例数量' },
      { name: '侧边面板', desc: '命例库从右侧滑出，点击外部关闭' }
    ]
  },
  {
    icon: '⏳', title: '紫微斗数 · 流年流月系统', tag: 'ziwei-flow',
    items: [
      { name: '流年盘 (太岁)', desc: '以斗君为起点每年移一位，含流年四化和叠宫显示' },
      { name: '流月盘', desc: '寅宫起正月顺数至流月，逆数至生时 → 流月命宫' },
      { name: '流日盘', desc: '流月命宫起初一，顺数至流日' },
      { name: '流时盘', desc: '流日命宫起子时，顺数至流时' },
      { name: '小限', desc: '男顺女逆从戌宫起生年，支持1~99岁完整遍历' },
      { name: '叠宫显示', desc: '本命/大限/流年三重宫位叠加，同步显示各层宫位名' },
      { name: '博士十二神', desc: '禄存→博士顺排：博士·力士·青龙·小耗·将军·奏书·飞廉·喜神·病符·大耗·伏兵·官符' },
      { name: '将前十二神', desc: '将星·攀鞍·岁驿·息神·华盖·劫煞·灾煞·天煞·指背·咸池·月煞·亡神' },
      { name: '长生十二神', desc: '长生·沐浴·冠带·临官·帝旺·衰·病·死·墓·绝·胎·养' },
      { name: '岁前十二神', desc: '岁建·晦气·丧门·贯索·官符·小耗·岁破·龙德·白虎·天德·吊客·病符' }
    ]
  },
  {
    icon: '🔮', title: '西洋占星 · 推运系统', tag: 'astro-pro',
    items: [
      { name: '行运盘 (Transit)', desc: '实时行星 vs 本命行星相位，行运过宫分析' },
      { name: '太阳返照盘 (Solar Return)', desc: '太阳回归时刻星盘 → 年度运势主题' },
      { name: '月亮返照盘 (Lunar Return)', desc: '月亮回归时刻星盘 → 月度运势' },
      { name: '太阳弧推运 (Solar Arc)', desc: 'SA行星与本命行星/四轴的精准相位预测' },
      { name: '法达星限 (Firdaria)', desc: '古典占星主运/子运周期，7大行星+南北交' },
      { name: '次限盘 (Secondary Prog)', desc: '1天=1年，主要用于中长程运势' },
      { name: '三限盘 (Tertiary Prog)', desc: '1天=1月，精确到月份的推运' },
      { name: '比较盘 (Synastry)', desc: '双方本命行星的相位互动 → 缘分评分' },
      { name: '组合盘 (Composite)', desc: '中点法合成"关系星盘"，显示两人关系本质' },
      { name: '时空盘 (Time-Space)', desc: '时间+空间中点合成，预测关系走向' },
      { name: '马克思盘 (Marks)', desc: '基于比较盘+组合盘的深度关系分析' }
    ]
  },
  {
    icon: '🃏', title: '塔罗牌 & 占星骰子', tag: 'tarot',
    items: [
      { name: '塔罗22张大阿卡纳', desc: '愚者→世界完整22张大牌，正逆位解读' },
      { name: '5种牌阵', desc: '单张指引 · 三张(过去现在未来) · 感情 · 事业 · 凯尔特十字' },
      { name: '关键词标签', desc: '每张牌附带关键词标签，快速理解核心含义' },
      { name: '占星骰子', desc: '行星+星座+宫位 = 三要素骰子占卜' },
      { name: '多枚骰子', desc: '支持单枚/三枚骰子同时投掷，多角度解读' },
      { name: '小六壬掌诀', desc: '月上起日·日上起时·时上查掌诀，六掌诀完整断辞（大安/留连/速喜/赤口/小吉/空亡）' },
      { name: '三数占法', desc: '输入任意三个数字即可占卜，数字随机占' },
      { name: '当前时间一键占', desc: '一键填入当前农历月日时辰，即时起卦' }
    ]
  },
  {
    icon: '📅', title: '星座运势 & 性格 & 万年历', tag: 'horoscope',
    items: [
      { name: '每日运势', desc: '综合/爱情/事业/财运/健康 五维星级评分 + 每日建议' },
      { name: '每周运势', desc: '连续7天每日运势详尽播报' },
      { name: '年度运势', desc: '全年主题运势概览，分领域解读' },
      { name: '星座性格', desc: '12星座完整性格档案：特质+爱情+事业+关键词' },
      { name: '星座元素/模式', desc: '火土风水四元素 + 基本固定变动三模式' },
      { name: '幸运色/数字/星座', desc: '每日幸运指引：颜色+数字+速配星座' },
      { name: '万年历', desc: '公历月视图，清晰展示每月日期排布' },
      { name: '星座日期范围', desc: '12星座精确的太阳黄经日期边界' }
    ]
  },
  {
    icon: '🖱', title: '交互与体验设计', tag: 'ux',
    items: [
      { name: '三Tab切换', desc: '🏮紫微斗数 / 🌟西洋星盘 / 📜八字解读 — 一键切换，共享排盘数据' },
      { name: '八字信息栏', desc: '年柱·月柱·日柱·时柱·农历·生肖·真太阳时 一排展示' },
      { name: '星曜/宫位百科弹窗', desc: '点击星曜或宫位 → 弹出百科详情（属性+详解+关键词）' },
      { name: '占星弹窗', desc: '点击行星/宫位/四轴 → 落座解读弹窗' },
      { name: '弹窗自适应定位', desc: 'requestAnimationFrame 精确计算弹窗位置，防止溢出屏幕' },
      { name: '点击外部关闭', desc: '点击弹窗外部空白区域自动关闭' },
      { name: '图例说明', desc: '主星/辅星/命宫/身宫/四化符号 颜色说明' },
      { name: '详情面板', desc: '命盘概要 + AI解读按钮，可展开/折叠' },
      { name: '当前时间按钮', desc: '一键填充当前日期时间' },
      { name: '时辰自动推导', desc: '输入小时自动显示对应时辰名称' },
      { name: '真太阳时开关', desc: '复选框切换 → 展开省市县三级联动选择器' },
      { name: '保存反馈动画', desc: '保存按钮 ✓ 已保存 1.5秒闪烁反馈' },
      { name: '日期范围校验', desc: '1900-2100年范围校验，超限弹窗提示' },
      { name: '页面自动排盘', desc: '页面加载时自动按默认信息排盘' },
      { name: '免责声明', desc: '命理为概率之学，人生之路仍在自己手中' }
    ]
  }
];

function _buildFeatureCatalogHTML() {
  var html = '';
  // 搜索
  html += '<div class="feature-search-wrap"><input class="feature-search-input" id="featureSearchInput" placeholder="🔍 搜索功能…" oninput="onFeatureSearch()"></div>';

  FEATURE_CATALOG.forEach(function(section, i) {
    // 统计条目总数
    var count = section.items.length;
    var openClass = i < 3 ? ' open' : ''; // 前三组默认展开
    html += '<div class="feature-section' + openClass + '" data-tag="' + section.tag + '">';
    html += '<div class="feature-section-header" onclick="toggleFeatureSection(this)">';
    html += '<span class="feature-section-icon">' + section.icon + '</span>';
    html += '<span class="feature-section-title">' + section.title + '</span>';
    html += '<span class="feature-section-count">' + count + ' 项</span>';
    html += '<span class="feature-section-arrow">▶</span>';
    html += '</div>';
    html += '<div class="feature-section-content">';
    section.items.forEach(function(item) {
      html += '<div class="feature-item" data-keywords="' + section.title + ' ' + item.name + ' ' + item.desc + '">';
      html += '<span class="feature-item-name">' + item.name + '</span>';
      html += '<span class="feature-item-desc">' + item.desc + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  return html;
}

function openFeatureOverview() {
  var overlay = document.getElementById('featureOverlay');
  var body = document.getElementById('featureBody');
  if (!overlay || !body) return;
  body.innerHTML = _buildFeatureCatalogHTML();
  overlay.style.display = 'flex';
  setTimeout(function() {
    var inp = document.getElementById('featureSearchInput');
    if (inp) inp.focus();
  }, 100);
}

function closeFeatureOverview() {
  var overlay = document.getElementById('featureOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ==================== 八字合婚 ====================

function renderHeHunPanel() {
  var panel = document.getElementById('hehunPanel');
  if (!currentBazi) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';

  // 填充命例选择器（排除当前命例）
  var sel = document.getElementById('hehunSelect');
  var allCases = CaseDB.loadAll();
  var opts = '<option value="">-- 从命例库选择 --</option>';
  allCases.forEach(function(c) {
    if (c.bazi) {
      opts += '<option value="' + c.id + '">' + (c.name || c.label || c.id) + ' — ' + c.bazi.year + ' ' + c.bazi.month + ' ' + c.bazi.day + ' ' + c.bazi.hour + '</option>';
    }
  });
  sel.innerHTML = opts;
  document.getElementById('hehunResult').innerHTML = '<div class="hehun-empty">请从命例库中选择一个命例进行合婚分析</div>';
}

function onHeHunSelect() {
  var sel = document.getElementById('hehunSelect');
  var id = parseInt(sel.value);
  if (!id || !currentBazi) { document.getElementById('hehunResult').innerHTML = ''; return; }

  // 加载对方命例的八字
  var allCases = CaseDB.loadAll();
  var otherCase = null;
  for (var i = 0; i < allCases.length; i++) {
    if (allCases[i].id === id) { otherCase = allCases[i]; break; }
  }
  if (!otherCase || !otherCase.bazi) {
    document.getElementById('hehunResult').innerHTML = '<div class="hehun-empty">命例数据不完整，无法合婚</div>';
    return;
  }

  // 重建对方八字对象
  try {
    var bz = otherCase.bazi;
    if (!bz.year || !bz.month || !bz.day || !bz.hour) throw new Error('八字数据不完整');
    var bazi2 = {
      year: { ganIndex: Math.max(0, GAN.indexOf(bz.year[0])), zhiIndex: Math.max(0, ZHI.indexOf(bz.year[1])), full: bz.year, animal: SHENGXIAO[Math.max(0, ZHI.indexOf(bz.year[1]))] || '' },
      month: { ganIndex: Math.max(0, GAN.indexOf(bz.month[0])), zhiIndex: Math.max(0, ZHI.indexOf(bz.month[1])), full: bz.month },
      day: { ganIndex: Math.max(0, GAN.indexOf(bz.day[0])), zhiIndex: Math.max(0, ZHI.indexOf(bz.day[1])), full: bz.day },
      hour: { ganIndex: Math.max(0, GAN.indexOf(bz.hour[0])), zhiIndex: Math.max(0, ZHI.indexOf(bz.hour[1])), full: bz.hour, shichenIdx: Math.max(0, ZHI.indexOf(bz.hour[1])), shichenName: SHICHEN_NAME[Math.max(0, ZHI.indexOf(bz.hour[1]))] || '' },
      lunar: { lunarMonth: bz.lunarMonth || 1 }
    };

    var gender1 = document.getElementById('gender').value;
    var gender2 = otherCase.gender || 'male';

    var result = BaZiReading.heHun(currentBazi, bazi2, gender1, gender2);
  } catch(e) {
    document.getElementById('hehunResult').innerHTML = '<div class="hehun-empty">合婚计算出错：' + e.message + '</div>';
    return;
  }

  // 色阶
  var scoreColor = result.score >= 80 ? '#6fcf6f' : result.score >= 60 ? '#e8c850' : result.score >= 40 ? '#e08850' : '#cc6666';

  var html = '<div class="hehun-score">';
  html += '<div class="hehun-score-num" style="color:' + scoreColor + '">' + result.score + '<span style="font-size:0.4em"> / ' + result.maxScore + '</span></div>';
  html += '<div class="hehun-score-level" style="color:' + scoreColor + '">' + result.level + '</div>';
  html += '</div>';
  html += '<div style="font-size:0.75em;color:#7a7c60;margin-bottom:8px;text-align:center">' + result.bazi1Summary + '  <span style="color:#c9a84c">⇌</span>  ' + result.bazi2Summary + '</div>';
  result.details.forEach(function(d) {
    html += '<div class="hehun-detail-item">' + d + '</div>';
  });
  html += '<div style="margin-top:10px;font-size:0.7em;color:#6a6c50;text-align:center">以上分析由八字合婚规则引擎生成，仅供参考。</div>';

  document.getElementById('hehunResult').innerHTML = html;
}

// ==================== 紫微盘面模式切换 ====================

var ziweiMode = 'sanhe'; // 'sanhe' | 'feixing' | 'sihua'

function switchZiweiMode(mode) {
  ziweiMode = mode;
  document.querySelectorAll('.zm-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });
  document.querySelectorAll('.palace-cell').forEach(function(cell) {
    cell.classList.remove('feixing-mode', 'sihua-mode');
    if (mode === 'feixing') cell.classList.add('feixing-mode');
    if (mode === 'sihua') cell.classList.add('sihua-mode');
  });

  // 飞星模式: 高亮显示宫干四化
  if (mode === 'feixing') {
    highlightFlyingStars();
  } else {
    clearFlyingHighlights();
  }

  // 四化模式: 突出显示生年四化
  if (mode === 'sihua') {
    highlightSiHuaOnly();
  }
}

function highlightFlyingStars() {
  document.querySelectorAll('.star-item').forEach(function(item) {
    item.style.transition = 'all 0.3s';
  });
  // 飞星模式下离心/向心四化用动画脉冲
  document.querySelectorAll('.sihua-badge.centrifugal').forEach(function(b) {
    b.style.animation = 'pulseDown 1.5s ease-in-out infinite';
  });
  document.querySelectorAll('.sihua-badge.centripetal').forEach(function(b) {
    b.style.animation = 'pulseUp 1.5s ease-in-out infinite';
  });
}

function clearFlyingHighlights() {
  document.querySelectorAll('.sihua-badge.centrifugal, .sihua-badge.centripetal').forEach(function(b) {
    b.style.animation = '';
  });
}

function highlightSiHuaOnly() {
  // 四化模式下所有四化标记发光
  document.querySelectorAll('.sihua-badge').forEach(function(b) {
    b.style.boxShadow = '0 0 8px currentColor';
  });
}

// ==================== 断事笔记 ====================

function toggleCaseNotes(caseId) {
  var editor = document.getElementById('notesEditor-' + caseId);
  var display = document.getElementById('notesDisplay-' + caseId);
  if (!editor) return;
  var isOpen = editor.classList.contains('open');
  if (isOpen) {
    editor.classList.remove('open');
    if (display) display.style.display = '';
  } else {
    editor.classList.add('open');
    if (display) display.style.display = 'none';
    var input = document.getElementById('notesInput-' + caseId);
    if (input) input.focus();
  }
}

function saveCaseNotes(caseId) {
  var input = document.getElementById('notesInput-' + caseId);
  if (!input) return;
  var notes = input.value.trim();
  CaseDB.updateNotes(caseId, notes);
  toggleCaseNotes(caseId);
  renderCaseList();
}

function toggleFeatureSection(headerEl) {
  var section = headerEl.parentElement;
  section.classList.toggle('open');
}

function onFeatureSearch() {
  var q = (document.getElementById('featureSearchInput').value || '').toLowerCase();
  var sections = document.querySelectorAll('.feature-section');
  sections.forEach(function(section) {
    var items = section.querySelectorAll('.feature-item');
    var matchCount = 0;
    items.forEach(function(item) {
      var kw = (item.getAttribute('data-keywords') || '').toLowerCase();
      if (!q || kw.indexOf(q) !== -1) {
        item.style.display = '';
        matchCount++;
      } else {
        item.style.display = 'none';
      }
    });
    // 搜索时展开所有匹配的分类
    if (q && matchCount > 0) {
      section.classList.add('open');
    }
    if (q && matchCount === 0) {
      section.style.display = 'none';
    } else {
      section.style.display = '';
    }
  });
}

// ==================== 流年/流月/流日/流时切换 ====================

var _liuTimeMode = 'benming'; // 'benming'|'daxian'|'liunian'|'liuyue'|'liuri'|'liushi'
var _liuTimeData = null;

function switchLiuTime(mode) {
  _liuTimeMode = mode;
  document.querySelectorAll('.liu-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-liu') === mode);
  });
  onLiuTimeChange();
}

function onLiuTimeChange() {
  if (!currentChart || !currentBazi) return;
  var y = parseInt(document.getElementById('liuYear').value) || new Date().getFullYear();
  var m = parseInt(document.getElementById('liuMonth').value) || 6;
  var d = parseInt(document.getElementById('liuDay').value) || 15;
  var s = parseInt(document.getElementById('liuShichen').value) || 6;
  var gender = document.getElementById('gender').value;

  var data = getFullTimelineCharts(currentChart, currentBazi, gender, y, m, d, s);
  _liuTimeData = data;

  document.getElementById('liuXiaoXianDisplay').textContent =
    '虚岁：' + data.virtualAge + ' | 小限命宫：' + ZHI[data.xiaoXianMingGong] + ' | 流年：' + data.liuNian.yearGanZhi;

  if (_liuTimeMode === 'benming') {
    renderOverlayMode(currentChart, currentBazi, '本命盘', null, null);
  } else if (_liuTimeMode === 'daxian') {
    renderOverlayMode(currentChart, currentBazi, '大限', null, null);
  } else if (_liuTimeMode === 'liunian') {
    renderOverlayMode(currentChart, currentBazi, '流年 ' + data.liuNian.yearGanZhi, data.liuNian, null);
  } else if (_liuTimeMode === 'liuyue') {
    renderOverlayMode(currentChart, currentBazi, '流月 ' + y + '年' + m + '月', data.liuYue, null);
  } else if (_liuTimeMode === 'liuri') {
    renderOverlayMode(currentChart, currentBazi, '流日 ' + y + '年' + m + '月' + d + '日', data.liuRi, null);
  } else if (_liuTimeMode === 'liushi') {
    var sName = SHICHEN_NAME[s] || '';
    renderOverlayMode(currentChart, currentBazi, '流时 ' + sName, data.liuShi, null);
  }

  var infoEl = document.getElementById('liuTimeInfo');
  if (infoEl) {
    var labels = { benming: '当前：本命盘', daxian: '当前：大限盘', liunian: '叠宫模式', liuyue: '叠宫模式', liuri: '叠宫模式', liushi: '叠宫模式' };
    infoEl.textContent = labels[_liuTimeMode] || '叠宫模式';
  }
}

function resetLiuTime() {
  var now = new Date();
  document.getElementById('liuYear').value = now.getFullYear();
  document.getElementById('liuMonth').value = now.getMonth() + 1;
  document.getElementById('liuDay').value = now.getDate();
  document.getElementById('liuShichen').value = Math.floor((now.getHours() + 1) % 24 / 2);
  switchLiuTime('liunian');
}

function renderOverlayMode(baseChart, bazi, label, liuNianChart, liuYueChart) {
  var grid = document.getElementById('chartGrid');
  grid.innerHTML = '';

  var overlayName = label;
  var flowChart = liuNianChart || liuYueChart;

  baseChart.palaces.forEach(function(palace, idx) {
    var pos = getGridPosition(palace.zhiIndex);
    var cell = document.createElement('div');
    cell.className = 'palace-cell' + (ziweiMode === 'feixing' ? ' feixing-mode' : '') + (ziweiMode === 'sihua' ? ' sihua-mode' : '');

    if (palace.zhiIndex === baseChart.mingGong.zhiIndex) cell.classList.add('ming-gong');
    if (palace.isShenGong) cell.classList.add('shen-gong');
    if (baseChart.laiyinZhi !== undefined && palace.zhiIndex === baseChart.laiyinZhi) cell.classList.add('laiyin-gong');

    cell.style.gridRow = pos.row;
    cell.style.gridColumn = pos.col;

    // 宫位头
    var header = document.createElement('div');
    header.className = 'palace-header';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'palace-name';
    // 叠宫显示
    var displayName = palace.name;
    if (flowChart) {
      var flowPalace = null;
      for (var fp = 0; fp < flowChart.palaces.length; fp++) {
        if (flowChart.palaces[fp].zhiIndex === palace.zhiIndex) { flowPalace = flowChart.palaces[fp]; break; }
      }
      if (flowPalace && flowPalace.name !== palace.name) {
        displayName = flowPalace.name + '<span class="overlay-badge">' + palace.name + '</span>';
      }
    }
    nameSpan.innerHTML = displayName;
    nameSpan.onclick = function(e) { e.stopPropagation(); showPalacePopup(palace.name, e); };

    var ganzhiSpan = document.createElement('span');
    ganzhiSpan.className = 'palace-ganzhi';
    ganzhiSpan.textContent = flowChart && flowChart.palaces ? (function() {
      var fp2 = null;
      for (var fq = 0; fq < flowChart.palaces.length; fq++) {
        if (flowChart.palaces[fq].zhiIndex === palace.zhiIndex) { fp2 = flowChart.palaces[fq]; break; }
      }
      return fp2 ? fp2.ganZhi : palace.ganZhi;
    })() : palace.ganZhi;

    header.appendChild(nameSpan);
    header.appendChild(ganzhiSpan);

    // 命宫/身宫标记
    if (palace.zhiIndex === baseChart.mingGong.zhiIndex) {
      var badge = document.createElement('span');
      badge.className = 'palace-badge ming';
      badge.textContent = '命';
      header.appendChild(badge);
    }
    if (palace.isShenGong) {
      var badge2 = document.createElement('span');
      badge2.className = 'palace-badge shen';
      badge2.textContent = '身';
      header.appendChild(badge2);
    }
    if (baseChart.laiyinZhi !== undefined && palace.zhiIndex === baseChart.laiyinZhi) {
      var badge3 = document.createElement('span');
      badge3.className = 'palace-badge laiyin';
      badge3.textContent = '来因';
      header.appendChild(badge3);
    }

    cell.appendChild(header);

    // 星曜列表
    var starList = document.createElement('div');
    starList.className = 'star-list';

    var sortedMainStars = [...palace.stars].sort(function(a, b) {
      return (BRIGHTNESS_ORDER[b.brightness] || 0) - (BRIGHTNESS_ORDER[a.brightness] || 0);
    });

    sortedMainStars.forEach(function(star) {
      var starItem = document.createElement('div');
      starItem.className = 'star-item main-star';
      if (star.brightness) {
        var bs = document.createElement('span');
        bs.className = 'star-brightness ' + (BRIGHTNESS_CSS[star.brightness] || '');
        bs.textContent = star.brightness;
        starItem.appendChild(bs);
      }
      var ns = document.createElement('span');
      ns.className = 'star-item-name';
      ns.textContent = star.name;
      ns.onclick = function(e) { e.stopPropagation(); showStarPopup(star.name, e); };
      starItem.appendChild(ns);

      var sihuaArr = palace.sihua || [];
      for (var si = 0; si < sihuaArr.length; si++) {
        if (sihuaArr[si].starName === star.name) {
          var sh = sihuaArr[si];
          var sihuaSpan = document.createElement('span');
          sihuaSpan.className = 'sihua-badge ' + getSihuaCss(sh.type) + (sh.source === '向心' ? ' centripetal' : '') + (sh.source === '离心' ? ' centrifugal' : '');
          sihuaSpan.textContent = (sh.source === '向心' ? '↑' : (sh.source === '离心' ? '↓' : '')) + sh.type;
          starItem.appendChild(sihuaSpan);
        }
      }
      starList.appendChild(starItem);
    });

    palace.auxStars.forEach(function(star) {
      var si = document.createElement('div');
      si.className = 'star-item aux-star';
      var ns = document.createElement('span');
      ns.className = 'star-item-name';
      ns.textContent = star.name;
      ns.onclick = function(e) { e.stopPropagation(); showStarPopup(star.name, e); };
      si.appendChild(ns);
      starList.appendChild(si);
    });

    if (palace.minorStars && palace.minorStars.length > 0) {
      palace.minorStars.forEach(function(star) {
        var si = document.createElement('div');
        si.className = 'star-item minor-star';
        var ns = document.createElement('span');
        ns.className = 'star-item-name';
        ns.textContent = star.name;
        si.appendChild(ns);
        starList.appendChild(si);
      });
    }

    // 神煞行（增强版：博士十二神/将前十二神/长生十二神/岁前十二神）
    var shenParts = [];
    if (palace.shenSha && palace.shenSha.suiQian) shenParts.push(palace.shenSha.suiQian);
    if (palace.shenSha && palace.shenSha.jiangQian) shenParts.push(palace.shenSha.jiangQian);
    if (palace.shenSha && palace.shenSha.changSheng) shenParts.push(palace.shenSha.changSheng);
    if (palace.shenSha && palace.shenSha.taiSui) shenParts.push(palace.shenSha.taiSui);
    if (palace.daXian) shenParts.push(palace.daXian.startAge + '~' + palace.daXian.endAge + '岁');

    // 流年叠宫增加博士十二神
    if (_liuTimeData && _liuTimeMode === 'liunian') {
      var boshiName = _liuTimeData.boshiStars[ZHI[palace.zhiIndex]];
      if (boshiName) shenParts.unshift(boshiName);
    }

    if (shenParts.length > 0) {
      var shenLine = document.createElement('div');
      shenLine.className = 'shensha-line';
      shenLine.textContent = shenParts.join(' · ');
      starList.appendChild(shenLine);
    }

    cell.appendChild(starList);
    cell.onclick = function(e) { e.stopPropagation(); showPalacePopup(palace.name, e); };
    grid.appendChild(cell);
  });

  // 中心信息（增强版：显示流年/小限信息）
  var center = document.createElement('div');
  center.className = 'center-empty';
  center.style.gridRow = '2 / 4';
  center.style.gridColumn = '2 / 4';

  var ci = document.createElement('div');
  ci.className = 'center-info';

  var cl = document.createElement('div');
  cl.className = 'center-label';
  cl.textContent = label;

  var cn = document.createElement('div');
  cn.className = 'center-name';
  cn.textContent = baseChart.mingGong.ganZhi;

  var cb = document.createElement('div');
  cb.className = 'center-bureau';
  cb.textContent = baseChart.bureauName;

  var ca = document.createElement('div');
  ca.className = 'center-info-item';
  ca.textContent = bazi.year.animal + '年';

  ci.appendChild(cl); ci.appendChild(cn); ci.appendChild(cb); ci.appendChild(ca);

  var mzsz = document.createElement('div');
  mzsz.className = 'center-info-item';
  mzsz.textContent = '命主' + baseChart.mingZhu + ' · 身主' + baseChart.shenZhu;
  ci.appendChild(mzsz);

  var dj = document.createElement('div');
  dj.className = 'center-info-item';
  dj.textContent = '斗君' + ZHI[baseChart.ziNianDouJun];
  ci.appendChild(dj);

  // 小限/流年信息
  if (_liuTimeData) {
    var xl = document.createElement('div');
    xl.className = 'center-info-item';
    xl.style.color = '#88ddaa';
    xl.textContent = '小限 ' + ZHI[_liuTimeData.xiaoXianMingGong] + ' · 虚岁' + _liuTimeData.virtualAge;
    ci.appendChild(xl);
    if (_liuTimeMode === 'liunian') {
      var ln = document.createElement('div');
      ln.className = 'center-info-item';
      ln.style.color = '#d4a84c';
      ln.textContent = '流年 ' + _liuTimeData.liuNian.yearGanZhi + '年';
      ci.appendChild(ln);
    }
  }

  if (baseChart.shenGong.zhiIndex === baseChart.mingGong.zhiIndex) {
    var sl = document.createElement('div');
    sl.className = 'center-info-item';
    sl.style.color = '#88bbff';
    sl.textContent = '命身同宫';
    ci.appendChild(sl);
  }

  center.appendChild(ci);
  grid.appendChild(center);

  // 显示紫微盘面模式切换
  var modeBar = document.getElementById('ziweiModeBar');
  if (modeBar) modeBar.style.display = 'flex';
  switchZiweiMode(ziweiMode);
}

// ==================== 塔罗牌 ====================

var _tarotSpreadType = 'three';

function selectTarotSpread(type) {
  _tarotSpreadType = type;
  document.querySelectorAll('.tarot-spread-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-spread') === type);
  });
}

function drawTarotCards() {
  var spread = TarotDice.drawTarotSpread(_tarotSpreadType);
  var interp = TarotDice.interpretSpread(spread);

  var html = '';

  // 牌阵标题与说明
  html += '<div class="tarot-spread-header">';
  html += '<h4>📖 ' + interp.spreadInfo.name + ' · 综合解读</h4>';
  html += '<p class="tarot-spread-desc">' + interp.spreadInfo.desc + '</p>';
  html += '</div>';

  // 每张牌
  html += '<div class="tarot-cards-row">';
  spread.cards.forEach(function(item, idx) {
    var c = item.card.card;
    var rev = item.card.reversed;
    var cr = interp.cardReadings[idx];
    html += '<div class="tarot-card-item' + (rev ? ' reversed' : '') + '">';
    html += '<div class="tarot-card-pos">' + item.position + '</div>';
    html += '<div class="tarot-card-name">' + item.card.displayName + '</div>';
    html += '<div class="tarot-card-id">' + (c.rank ? (c.suit + ' · ' + c.suitEn) : ((c.id < 10 ? '0' : '') + c.id + ' · ' + c.en)) + '</div>';
    html += '<div class="tarot-card-desc">' + item.card.desc + '</div>';
    html += '<div class="tarot-card-pos-guide">📍 ' + cr.posGuide + '</div>';
    html += '<div class="tarot-card-kw">';
    c.keywords.forEach(function(k) { html += '<span class="tarot-kw-tag">' + k + '</span>'; });
    html += '</div></div>';
  });
  html += '</div>';

  // 综合解读
  html += '<div class="tarot-overall-reading">';
  html += '<h5>🔮 牌阵综合解读</h5>';
  html += '<p>' + interp.overallReading + '</p>';
  html += '<div class="tarot-stats">';
  html += '<span>总牌数：<b>' + interp.stats.totalCards + '</b> 张</span>';
  html += '<span>逆位牌：<b>' + interp.stats.reversedCount + '</b> 张</span>';
  html += '</div>';
  html += '<p class="tarot-disclaimer">以上解读由塔罗规则引擎生成，仅供参考，请以理性态度看待占卜结果。</p>';
  html += '</div>';

  document.getElementById('tarotResult').innerHTML = html;
}

function rollAstroDice() {
  var result = TarotDice.rollDice();
  var html = '<div class="dice-display">';
  html += '<div class="dice-item"><span class="dice-glyph planet" style="color:' + result.planet.color + '">' + result.planet.glyph + '</span><span class="dice-label">' + result.planet.name + '</span></div>';
  html += '<div class="dice-item"><span class="dice-glyph sign">' + result.sign.symbol + '</span><span class="dice-label">' + result.sign.name + '</span></div>';
  html += '<div class="dice-item"><span class="dice-glyph house">🏠</span><span class="dice-label">' + result.house.name + '</span></div>';
  html += '</div>';
  html += '<div class="dice-interp">' + result.interpretation + '</div>';

  // 增强解读
  html += '<div class="dice-enhanced-interp">';
  html += '<h5>🔮 骰子详解</h5>';
  html += '<p><b>' + result.planet.name + '</b>：' + result.planet.meaning + '</p>';
  html += '<p><b>' + result.sign.name + '（' + result.sign.element + '象）</b>：' + result.sign.meaning + '</p>';
  html += '<p><b>' + result.house.name + '</b>：' + result.house.meaning + '</p>';
  html += '<div>';
  html += '<span class="dice-tag">' + result.planet.name + '</span>';
  html += '<span class="dice-tag">' + result.sign.name + '</span>';
  html += '<span class="dice-tag">' + result.house.name + '</span>';
  html += '</div>';
  html += '<p style="font-size:0.65em;color:#5a5c40;margin-top:6px;text-align:center;font-style:italic;">以上解读由占星骰子规则引擎生成，仅供参考。</p>';
  html += '</div>';

  document.getElementById('diceResult').innerHTML = html;
}

function rollAstroDiceMulti(n) {
  var results = TarotDice.rollDiceMulti(n);
  var html = '';
  results.forEach(function(r, i) {
    html += '<div class="dice-multi-item"><span class="dice-multi-idx">#' + (i+1) + '</span>';
    html += '<span class="dice-glyph planet" style="color:' + r.planet.color + '">' + r.planet.glyph + '</span> ';
    html += '<span class="dice-glyph sign">' + r.sign.symbol + '</span> 🏠';
    html += '<span class="dice-label">' + r.planet.name + ' · ' + r.sign.name + ' · ' + r.house.name + '</span>';
    html += '<div class="dice-interp">' + r.interpretation + '</div>';
    html += '<div class="dice-enhanced-interp" style="margin-top:6px;">';
    html += '<p style="font-size:0.72em;"><b>' + r.planet.name + '</b>：' + r.planet.meaning + ' | <b>' + r.sign.name + '</b>：' + r.sign.meaning + ' | <b>' + r.house.name + '</b>：' + r.house.meaning + '</p>';
    html += '</div>';
    html += '</div>';
  });
  html += '<p style="font-size:0.65em;color:#5a5c40;margin-top:6px;text-align:center;font-style:italic;">以上解读由占星骰子规则引擎生成，仅供参考。</p>';
  document.getElementById('diceResult').innerHTML = html;
}

// ==================== 小六壬 ====================

function doXiaoLiuRen() {
  var m = parseInt(document.getElementById('xlrMonth').value) || 1;
  var d = parseInt(document.getElementById('xlrDay').value) || 1;
  var s = parseInt(document.getElementById('xlrShichen').value) || 0;
  var result = XiaoLiuRen.calculate(m, d, s);
  renderXiaoLiuRenResult(result);
}

function onXlrChange() {
  doXiaoLiuRen();
}

function onXlrNow() {
  var now = new Date();
  // 估算农历：用公历日期近似传入
  var bazi = calculateBaZi(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
  var lunarMonth = bazi.lunar.lunarMonth;
  var lunarDay = bazi.lunar.lunarDay;
  var shichenIdx = bazi.hour.shichenIdx;

  document.getElementById('xlrMonth').value = lunarMonth;
  document.getElementById('xlrDay').value = lunarDay;
  document.getElementById('xlrShichen').value = shichenIdx;
  doXiaoLiuRen();
}

function doXiaoLiuRenFromNumbers() {
  var n1 = parseInt(document.getElementById('xlrNum1').value) || 1;
  var n2 = parseInt(document.getElementById('xlrNum2').value) || 1;
  var n3 = parseInt(document.getElementById('xlrNum3').value) || 1;
  var result = XiaoLiuRen.calculateFromNumbers(n1, n2, n3);
  renderXiaoLiuRenResult(result);
}

function renderXiaoLiuRenResult(result) {
  var pos = result.position;
  var info = pos;
  var inputs = result.inputs;

  var html = '<div class="xlr-card" style="border-left:4px solid ' + info.color + '">';
  html += '<div class="xlr-card-header">';
  html += '<span class="xlr-big-glyph" style="color:' + info.color + '">' + info.glyph + '</span>';
  html += '<div class="xlr-card-title">';
  html += '<span class="xlr-name" style="color:' + info.color + '">' + info.name + '</span>';
  html += '<span class="xlr-trait">' + info.trait + '</span>';
  html += '</div></div>';

  // 掌诀属性行
  html += '<div class="xlr-props">';
  html += '<span>五行：<b>' + info.element + '</b></span> · ';
  html += '<span>方位：<b>' + info.direction + '</b></span> · ';
  html += '<span>地支：<b>' + info.zodiac + '</b></span> · ';
  html += '<span>掌位：<b>' + info.finger + '</b></span>';
  html += '</div>';

  // 推算过程
  if (result.steps && result.steps.formula) {
    html += '<div class="xlr-formula">推算：' + result.steps.formula + '</div>';
  }

  // 输入信息
  if (inputs.lunarMonth) {
    html += '<div class="xlr-input-display">';
    html += '<span>农历 ' + inputs.lunarMonth + '月' + inputs.lunarDay + '日 · ' + inputs.shichenName + '</span>';
    html += '</div>';
  } else if (inputs.num1) {
    html += '<div class="xlr-input-display">';
    html += '<span>三数占：' + inputs.num1 + ' · ' + inputs.num2 + ' · ' + inputs.num3 + '</span>';
    html += '</div>';
  }

  // 断辞
  html += '<div class="xlr-sections">';

  html += '<div class="xlr-sec"><h5>📖 掌诀总断</h5><p>' + info.overall.replace(/\n/g, '<br>') + '</p></div>';
  html += '<div class="xlr-sec"><h5>💕 感情</h5><p>' + info.love + '</p></div>';
  html += '<div class="xlr-sec"><h5>💼 事业</h5><p>' + info.career + '</p></div>';
  html += '<div class="xlr-sec"><h5>💰 财运</h5><p>' + info.wealth + '</p></div>';
  html += '<div class="xlr-sec"><h5>🏥 健康</h5><p>' + info.health + '</p></div>';
  html += '<div class="xlr-sec"><h5>✈ 出行</h5><p>' + info.travel + '</p></div>';
  html += '<div class="xlr-sec"><h5>🔍 失物</h5><p>' + info.lost + '</p></div>';
  html += '<div class="xlr-sec"><h5>⚖ 诉讼</h5><p>' + info.lawsuit + '</p></div>';

  html += '</div>';

  // 关键词
  html += '<div class="xlr-keywords">';
  info.keywords.forEach(function(k) {
    html += '<span class="xlr-kw-tag">' + k + '</span>';
  });
  html += '</div>';

  // 六掌全览
  html += '<div class="xlr-all-positions">';
  html += '<h5>🖐 六掌速览</h5>';
  html += '<div class="xlr-positions-row">';
  XiaoLiuRen.PALM_POSITIONS.forEach(function(p, i) {
    var active = p.id === info.id ? ' active' : '';
    html += '<div class="xlr-pos-chip' + active + '" style="border-left:3px solid ' + p.color + '" onclick="renderXiaoLiuRenChip(' + i + ')">';
    html += '<span class="xlr-pos-glyph">' + p.glyph + '</span>';
    html += '<span class="xlr-pos-name">' + p.name + '</span>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '</div>';

  document.getElementById('xlrResult').innerHTML = html;
}

function renderXiaoLiuRenChip(idx) {
  var pos = XiaoLiuRen.PALM_POSITIONS[idx];
  var result = {
    position: pos,
    steps: {},
    inputs: { lunarMonth: '—', lunarDay: '—', shichenName: '—' }
  };
  renderXiaoLiuRenResult(result);
}

// ==================== 星座运势 ====================

var _horoZodiacIdx = -1;

function renderZodiacPicker() {
  var html = '';
  DailyHoroscope.ZODIAC_ALL.forEach(function(z, i) {
    html += '<span class="zodiac-chip' + (_horoZodiacIdx === i ? ' active' : '') + '" onclick="selectHoroZodiac(' + i + ')">' +
      DailyHoroscope.ZODIAC_SYM[i] + ' ' + z + '</span>';
  });
  document.getElementById('zodiacPicker').innerHTML = html;
}

function selectHoroZodiac(idx) {
  _horoZodiacIdx = idx;
  renderZodiacPicker();
  renderHoroscopePage(idx);
}

function renderHoroscopePage(zIdx) {
  var z = DailyHoroscope.ZODIAC_ALL[zIdx];
  var sym = DailyHoroscope.ZODIAC_SYM[zIdx];
  var elem = DailyHoroscope.ZODIAC_ELEM[zIdx];
  var profile = DailyHoroscope.getZodiacProfile(zIdx);
  var daily = DailyHoroscope.getDailyHoroscope(zIdx);
  var yearly = DailyHoroscope.getYearlyHoroscope(zIdx);

  var html = '';

  // 星座性格
  html += '<div class="horo-profile">';
  html += '<div class="horo-profile-header"><span class="horo-big-sym">' + sym + '</span><div><h3>' + z + '座</h3>';
  html += '<span class="horo-meta">' + elem + '象 · ' + profile.mode + ' · 守护星：' + profile.ruler + ' · ' + profile.dateRange + '</span></div></div>';
  html += '<div class="horo-profile-body">';
  html += '<div class="hp-section"><h4>性格特质</h4><p>' + profile.trait + '</p></div>';
  html += '<div class="hp-section"><h4>爱情</h4><p>' + profile.love + '</p></div>';
  html += '<div class="hp-section"><h4>事业</h4><p>' + profile.career + '</p></div>';
  html += '<div class="hp-kw">';
  profile.keywords.forEach(function(k) { html += '<span class="hp-kw-tag">' + k + '</span>'; });
  html += '</div></div></div>';

  // 每日运势
  html += '<div class="horo-daily">';
  html += '<h4>📅 今日运势 (' + daily.date + ')</h4>';
  html += '<div class="horo-ratings">';
  ['综合','爱情','事业','财运','健康'].forEach(function(cat) {
    var stars = '';
    for (var s = 0; s < 5; s++) stars += s < daily.ratings[cat] ? '★' : '☆';
    html += '<div class="horo-rating-item"><span class="horo-cat">' + cat + '</span><span class="horo-stars">' + stars + '</span><span class="horo-advice">' + daily.advice[cat] + '</span></div>';
  });
  html += '<div class="horo-lucky">幸运色：<b>' + daily.luckyColor + '</b> · 幸运数字：<b>' + daily.luckyNumber + '</b> · 速配星座：<b>' + daily.luckyZodiac + '</b></div>';
  html += '</div>';

  // 年度运势
  html += '<div class="horo-yearly">';
  html += '<h4>📆 ' + yearly.year + '年运势</h4>';
  html += '<p>' + yearly.overall.text + '</p>';
  html += '</div>';

  document.getElementById('horoBody').innerHTML = html;

  // 万年历
  var now = new Date();
  var cal = DailyHoroscope.getCalendarMonth(now.getFullYear(), now.getMonth());
  var calHtml = '<div class="horo-calendar"><h4>🗓 万年历 (' + cal.year + '年' + (cal.month + 1) + '月)</h4>';
  calHtml += '<div class="cal-grid">';
  calHtml += '<div class="cal-header">一</div><div class="cal-header">二</div><div class="cal-header">三</div><div class="cal-header">四</div><div class="cal-header">五</div><div class="cal-header">六</div><div class="cal-header">日</div>';
  cal.weeks.forEach(function(week) {
    week.forEach(function(day) {
      if (day) {
        calHtml += '<div class="cal-day">' + day.day + '</div>';
      } else {
        calHtml += '<div class="cal-day empty"></div>';
      }
    });
  });
  calHtml += '</div></div>';
  document.getElementById('horoCalendar').innerHTML = calHtml;
}

// ==================== 占卜/运势标签加载 ====================

function ensureTarotLoaded() {
  if (document.getElementById('tarotResult').innerHTML.indexOf('tarot-placeholder') !== -1) {
    selectTarotSpread('three');
  }
}

function ensureHoroscopeLoaded() {
  renderZodiacPicker();
  if (_horoZodiacIdx < 0) {
    document.getElementById('horoBody').innerHTML = '<div class="horo-placeholder">请选择你的星座查看详细运势和性格分析</div>';
  }
  var now = new Date();
  var cal = DailyHoroscope.getCalendarMonth(now.getFullYear(), now.getMonth());
  var calHtml = '<div class="horo-calendar"><h4>🗓 万年历 (' + cal.year + '年' + (cal.month + 1) + '月)</h4>';
  calHtml += '<div class="cal-grid"><div class="cal-header">一</div><div class="cal-header">二</div><div class="cal-header">三</div><div class="cal-header">四</div><div class="cal-header">五</div><div class="cal-header">六</div><div class="cal-header">日</div>';
  cal.weeks.forEach(function(week) {
    week.forEach(function(day) {
      if (day) { calHtml += '<div class="cal-day">' + day.day + '</div>'; }
      else { calHtml += '<div class="cal-day empty"></div>'; }
    });
  });
  calHtml += '</div>';
  document.getElementById('horoCalendar').innerHTML = calHtml;
}

// ==================== 五术初始化 ====================

function initShanTab() { switchShanTab('zhiwu'); }
function initYiTab() { switchYiTab('constitution'); }
function initMingTab() {}
function initXiangTab() { switchXiangTab('palm'); }
function initBuTab() { switchBuTab('tarot'); }

// ==================== 山 — 子午流注 ====================

function renderShanZhiwu() {
  var m = ShanShu.getCurrentMeridian();
  var h = new Date().getHours();
  var nowCard = document.getElementById('shanNowCard');
  nowCard.innerHTML =
    '<div class="shan-now-inner">' +
    '<span class="shan-now-time">现在 ' + h + ':00</span>' +
    '<span class="shan-now-meridian" style="color:' + m.color + '">' + m.name + ' (' + m.organ + '经) · ' + m.shichenName + ' ' + m.time + '</span>' +
    '<span class="shan-now-element">五行属' + m.element + '</span>' +
    '<p class="shan-now-tip">' + m.tip + '</p>' +
    '</div>';

  var table = document.getElementById('shanMeridianTable');
  var html = '<h4>十二经络流注全表</h4><div class="shan-meridian-grid">';
  ShanShu.getMeridianTable().forEach(function(mr, i) {
    var isNow = mr.shichen === Math.floor(((h + 1) % 24) / 2);
    html += '<div class="shan-mer-item' + (isNow ? ' active' : '') + '" style="border-left-color:' + mr.color + '">';
    html += '<span class="sm-name">' + mr.name + '</span>';
    html += '<span class="sm-organ">' + mr.organ + '</span>';
    html += '<span class="sm-time">' + mr.shichenName + ' ' + mr.time + '</span>';
    html += '<span class="sm-element">' + mr.element + '</span>';
    html += '<span class="sm-tip">' + mr.tip + '</span>';
    html += '</div>';
  });
  html += '</div>';
  table.innerHTML = html;
}

// ==================== 山 — 五行养生 ====================

var _shanWuxingSelected = '';

function renderShanWuxing() {
  var picker = document.getElementById('shanWuxingPicker');
  var els = ['木','火','土','金','水'];
  var names = ['木行', '火行', '土行', '金行', '水行'];
  var cols = ['#66bb66','#ee5555','#dd9944','#aaaaaa','#5577cc'];
  var html = '<h4>选择五行</h4><div class="sw-picker-row">';
  els.forEach(function(e, i) {
    html += '<div class="sw-pick-chip' + (_shanWuxingSelected === e ? ' active' : '') + '" style="border-color:' + cols[i] + ';color:' + cols[i] + '" onclick="selectShanWuxing(\'' + e + '\')">' + names[i] + '</div>';
  });
  html += '</div>';
  picker.innerHTML = html;

  if (!_shanWuxingSelected) _shanWuxingSelected = '木';
  renderShanWuxingDetail(_shanWuxingSelected);
}

function selectShanWuxing(element) {
  _shanWuxingSelected = element;
  renderShanWuxing();
  renderShanWuxingDetail(element);
}

function renderShanWuxingDetail(element) {
  var w = ShanShu.getWuxingForElement(element);
  if (!w) return;
  var detail = document.getElementById('shanWuxingDetail');
  var html = '<div class="sw-detail" style="border-top:3px solid ' + w.color + '">';
  html += '<h3 style="color:' + w.color + '">' + element + '行养生</h3>';
  html += '<div class="sw-props">';
  html += '<span>脏腑：<b>' + w.organ + '</b>（腑：' + w.fu + '）</span> · ';
  html += '<span>季节：<b>' + w.season + '</b></span> · ';
  html += '<span>方向：<b>' + w.direction + '</b></span> · ';
  html += '<span>五味：<b>' + w.taste + '</b></span> · ';
  html += '<span>情志：<b>' + w.emotion + '</b></span> · ';
  html += '<span>外候：<b>' + w.bodyPart + '</b></span>';
  html += '</div>';
  html += '<p class="sw-desc">' + w.desc + '</p>';
  html += '<div class="sw-avoid">⚠ ' + w.avoid + '</div>';
  html += '<div class="sw-foods"><h5>宜食</h5><div class="sw-food-tags">';
  w.food.forEach(function(f) { html += '<span class="sw-food-tag">' + f + '</span>'; });
  html += '</div></div>';
  html += '<div class="sw-tips"><h5>养生要点</h5><ul>';
  w.tips.forEach(function(t) { html += '<li>' + t + '</li>'; });
  html += '</ul></div></div>';
  detail.innerHTML = html;
}

// ==================== 山 — 打坐冥想 ====================

function renderShanMeditation() {
  var list = document.getElementById('shanMeditationList');
  var html = '';
  ShanShu.MEDITATION_GUIDES.forEach(function(g) {
    html += '<div class="med-card">';
    html += '<div class="med-header"><h4>' + g.title + '</h4><span class="med-meta">⏱ ' + g.time + ' · ' + g.level + '</span></div>';
    html += '<ol class="med-steps">';
    g.steps.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<p class="med-tip">💡 ' + g.tip + '</p>';
    html += '</div>';
  });
  list.innerHTML = html;
}

// ==================== 山 — 五脏排毒 ====================

function renderShanDetox() {
  var table = document.getElementById('shanDetoxTable');
  var h = new Date().getHours();
  var html = '<h4>五脏排毒时间表</h4><div class="detox-grid">';
  var HEADERS = ['时间','脏腑','活动','建议'];
  html += HEADERS.map(function(x) { return '<b>' + x + '</b>'; }).join('');
  ShanShu.DETOX_SCHEDULE.forEach(function(d) {
    var timeRange = d.time.split('-');
    var startH = parseInt(timeRange[0].split(':')[0]);
    var endH = parseInt(timeRange[1].split(':')[0]);
    var isNow = (h >= startH || (endH < startH && h < endH)) && (h < endH || (endH < startH && (h < endH || h >= startH)));
    if (endH < startH) isNow = h >= startH || h < endH;
    html += '<span class="detox-time' + (isNow ? ' active' : '') + '">' + d.time + '</span>';
    html += '<span>' + d.organ + '</span>';
    html += '<span>' + d.activity + '</span>';
    html += '<span class="detox-advice">' + d.advice + '</span>';
  });
  html += '</div>';
  table.innerHTML = html;
}

// ==================== 医 — 体质辨识 ====================

var _yiSelectedConstitution = '';

function renderYiConstitution() {
  var intro = document.getElementById('yiConstIntro');
  intro.innerHTML = '<p class="yi-intro-text">中医体质学将人体体质分为九种基本类型，通过了解自身体质，进行有针对性的调养。点击下方体质卡片查看详情。</p>';

  var list = document.getElementById('yiConstList');
  var html = '<div class="yi-const-cards">';
  YiShu.CONSTITUTIONS.forEach(function(c, i) {
    html += '<div class="yi-const-card' + (_yiSelectedConstitution === c.id ? ' active' : '') + '" style="border-left:4px solid ' + c.color + '" onclick="selectYiConstitution(\'' + c.id + '\')">';
    html += '<span class="yic-emoji">' + c.emoji + '</span>';
    html += '<div class="yic-info"><span class="yic-name" style="color:' + c.color + '">' + c.name + '</span><span class="yic-trait">' + c.trait + '</span></div>';
    html += '</div>';
  });
  html += '</div>';
  if (_yiSelectedConstitution) {
    html += renderConstitutionDetail(_yiSelectedConstitution);
  }
  list.innerHTML = html;
}

function selectYiConstitution(id) {
  _yiSelectedConstitution = id;
  renderYiConstitution();
}

function renderConstitutionDetail(id) {
  var c = YiShu.getConstitutionById(id);
  var html = '<div class="yi-const-detail" style="border-top:3px solid ' + c.color + '">';
  html += '<h3>' + c.emoji + ' ' + c.name + '</h3>';
  html += '<p class="yid-trait">' + c.trait + '</p>';
  html += '<p class="yid-desc">' + c.desc + '</p>';
  html += '<div class="yid-row"><b>形体特征</b>：' + c.body + '</div>';
  html += '<div class="yid-row"><b>心理特征</b>：' + c.psych + '</div>';
  html += '<div class="yid-row"><b>发病倾向</b>：' + c.risk + '</div>';
  html += '<div class="yid-care"><h5>✅ 调养建议</h5><ul>';
  c.care.forEach(function(t) { html += '<li>' + t + '</li>'; });
  html += '</ul></div>';
  if (c.avoid && c.avoid.length > 0) {
    html += '<div class="yid-avoid"><h5>⚠ 注意事项</h5><ul>';
    c.avoid.forEach(function(t) { html += '<li>' + t + '</li>'; });
    html += '</ul></div>';
  }
  html += '</div>';
  return html;
}

// ==================== 医 — 五行脏腑 ====================

function renderYiZangfu() {
  var grid = document.getElementById('yiZangfuGrid');
  var els = ['木','火','土','金','水'];
  var html = '<div class="yzf-grid">';
  els.forEach(function(e) {
    var z = YiShu.WUXING_ZANGFU[e];
    html += '<div class="yzf-card" style="border-top:3px solid ' + z.color + '">';
    html += '<h4 style="color:' + z.color + '">' + e + ' — ' + z.zang + '·' + z.fu + '</h4>';
    html += '<p class="yzf-desc">' + z.desc + '</p>';
    html += '<p class="yzf-imb">⚠ ' + z.imbalance + '</p>';
    html += '<div class="yzf-meta">季节' + z.season + ' · 方' + z.direction + ' · 窍' + z.sense + ' · 体' + z.tissue + ' · 志' + z.emotion + ' · 味' + z.taste + '</div>';
    html += '<div class="yzf-foods">';
    z.foods.forEach(function(f) { html += '<span class="yzf-food-tag">' + f + '</span>'; });
    html += '</div></div>';
  });
  html += '</div>';
  grid.innerHTML = html;
}

// ==================== 医 — 节气养生 ====================

function renderYiJieqi() {
  var term = YiShu.getCurrentSolarTerm();
  var current = document.getElementById('yiJieqiCurrent');
  current.innerHTML =
    '<div class="yj-now-card" style="border-left:4px solid ' + ({春:'#66bb66',夏:'#ee6666',秋:'#aaaaaa',冬:'#6688cc'}[term.season]||'#888') + '">' +
    '<span class="yj-now-name">🌾 当前节气：<b>' + term.name + '</b></span>' +
    '<span class="yj-now-meta">' + term.season + '季 · 五行属' + term.element + '</span>' +
    '<p class="yj-now-advice">' + term.advice + '</p></div>';

  var all = document.getElementById('yiJieqiAll');
  var html = '<h4>二十四节气养生</h4><div class="yj-all-grid">';
  YiShu.SOLAR_TERMS.forEach(function(t) {
    html += '<div class="yj-term-chip" style="border-left:3px solid ' + ({春:'#66bb66',夏:'#ee6666',秋:'#aaaaaa',冬:'#6688cc'}[t.season]||'#888') + '">';
    html += '<span class="yjt-name">' + t.name + '</span>';
    html += '<span class="yjt-season">' + t.season + ' · ' + t.element + '</span>';
    html += '<span class="yjt-advice">' + t.advice + '</span>';
    html += '</div>';
  });
  html += '</div>';
  all.innerHTML = html;
}

// ==================== 相 — 手相 ====================

function renderXiangPalm() {
  var lines = document.getElementById('xiangPalmLines');
  var html = '<h4>三大主线</h4><div class="xp-lines">';
  ['life','head','heart'].forEach(function(key) {
    var l = XiangShu.PALM_LINES[key];
    html += '<div class="xp-line-card" style="border-top:3px solid ' + l.color + '">';
    html += '<h4>' + l.icon + ' ' + l.name + '</h4>';
    html += '<p class="xp-desc">' + l.desc + '</p>';
    html += '<div class="xp-readings">';
    Object.keys(l.readings).forEach(function(rk) {
      html += '<div class="xp-reading-item"><span class="xpr-key">' + rk + '</span><span class="xpr-val">' + l.readings[rk] + '</span></div>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  lines.innerHTML = html;

  var hills = document.getElementById('xiangPalmHills');
  var hHtml = '<h4>七大掌丘</h4><div class="xp-hills">';
  Object.keys(XiangShu.PALM_HILLS).forEach(function(k) {
    var h = XiangShu.PALM_HILLS[k];
    hHtml += '<div class="xp-hill-card"><h5>' + h.name + '</h5><span class="xph-pos">' + h.position + '</span><span class="xph-meaning">' + h.meaning + '</span><span class="xph-trait">' + h.trait + '</span></div>';
  });
  hHtml += '</div>';
  hills.innerHTML = hHtml;
}

// ==================== 相 — 面相 ====================

function renderXiangFace() {
  var grid = document.getElementById('xiangFaceGrid');
  var html = '<div class="xf-grid">';
  XiangShu.FACE_PALACES.forEach(function(p) {
    html += '<div class="xf-palace-card">';
    html += '<h5>' + p.name + '</h5>';
    html += '<span class="xf-pos">' + p.position + '</span>';
    html += '<span class="xf-meaning">' + p.meaning + '</span>';
    html += '<div class="xf-good">✅ ' + p.good + '</div>';
    html += '<div class="xf-bad">⚠ ' + p.bad + '</div>';
    html += '</div>';
  });
  html += '</div>';
  grid.innerHTML = html;
}

// ==================== 相 — 风水九宫飞星 ====================

function renderFengShuiStars() {
  var y = parseInt(document.getElementById('xiangFsYear').value) || 2025;
  var grid = document.getElementById('xiangFsGrid');
  var stars = XiangShu.calcFlyingStars(y);
  var html = '<h4>' + y + '年 流年紫白飞星图</h4><div class="xfs-grid">';
  stars.forEach(function(s) {
    var st = s.star;
    html += '<div class="xfs-cell" style="border-left:3px solid ' + st.color + '">';
    html += '<span class="xfs-star">' + st.star + '</span>';
    html += '<span class="xfs-name">' + st.name + '</span>';
    html += '<span class="xfs-pos">' + s.position.name + '</span>';
    html += '<span class="xfs-nature" style="color:' + st.color + '">' + st.nature + '</span>';
    html += '<span class="xfs-desc">' + st.desc + '</span>';
    html += '</div>';
  });
  html += '</div>';
  grid.innerHTML = html;
}

// ==================== 梅花易数 ====================

function doMeiHuaQiGua() {
  var year = parseInt(document.getElementById('mhYear').value) || new Date().getFullYear();
  var month = parseInt(document.getElementById('mhMonth').value) || (new Date().getMonth() + 1);
  var day = parseInt(document.getElementById('mhDay').value) || new Date().getDate();
  var result = MeiHua.divinate(year, month, day);
  result.numbers = [year, month, day];
  document.getElementById('mhResult').innerHTML = MeiHua.buildMeiHuaHTML(result);
}

function doMeiHuaFromNumbers() {
  var n1 = parseInt(document.getElementById('mhNum1').value) || 1;
  var n2 = parseInt(document.getElementById('mhNum2').value) || 1;
  var n3 = parseInt(document.getElementById('mhNum3').value) || 1;
  var result = MeiHua.divinate(n1, n2, n3);
  result.numbers = [n1, n2, n3];
  document.getElementById('mhResult').innerHTML = MeiHua.buildMeiHuaHTML(result);
}

function renderMeiHuaResult(result) {
  document.getElementById('mhResult').innerHTML = MeiHua.buildMeiHuaHTML(result);
}

// ==================== 六爻起卦 ====================

function doLiuYaoToss() {
  var result = LiuYao.cast();
  document.getElementById('lyResult').innerHTML = LiuYao.buildLiuYaoHTML(result);
}

function renderLiuYaoResult(result) {
  document.getElementById('lyResult').innerHTML = LiuYao.buildLiuYaoHTML(result);
}

// ==================== 格局展示 ====================
var _lastPatterns = [];
var _lastPalaceScores = [];

function renderPatterns(patterns) {
  var container = document.getElementById('patternsContainer');
  if (!container) return;
  if (!patterns || patterns.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';
  var html = '<div style="color:#d4a84c;font-weight:700;margin-bottom:8px">🏷️ 命盘格局 (' + patterns.length + ')</div><div class="patterns-grid">';
  patterns.forEach(function(p) {
    var catColor = p.category.indexOf('凶') >= 0 ? '#e06050' :
                   p.category.indexOf('富') >= 0 ? '#e0c050' :
                   p.category.indexOf('贵') >= 0 ? '#d4a84c' :
                   p.category.indexOf('文') >= 0 ? '#8899cc' :
                   p.category.indexOf('武') >= 0 ? '#e0a050' :
                   p.category.indexOf('特殊') >= 0 ? '#a080cc' : '#88bb88';
    html += '<div class="pattern-card" style="border-left:3px solid ' + catColor + '" title="' + p.desc + '">';
    html += '<span class="pattern-name">' + p.name + '</span>';
    html += '<span class="pattern-cat" style="color:' + catColor + '">' + p.category + '</span>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderPalaceScores(scores) {
  var container = document.getElementById('scoresContainer');
  if (!container || !scores) return;
  container.style.display = 'block';
  var html = '<div style="color:#88bbff;font-weight:700;margin-bottom:8px">📊 宫位评分</div><div class="scores-grid">';
  scores.forEach(function(s) {
    var barColor = s.level === '强宫' ? '#4caf50' : s.level === '中上' ? '#8bc34a' :
                   s.level === '中等' ? '#ffc107' : s.level === '偏弱' ? '#ff9800' : '#f44336';
    html += '<div class="score-item">';
    html += '<span class="score-name">' + s.name + '</span>';
    html += '<div class="score-bar-bg"><div class="score-bar-fill" style="width:' + s.score + '%;background:' + barColor + '"></div></div>';
    html += '<span class="score-val" style="color:' + barColor + '">' + s.score + ' ' + s.level + '</span>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ==================== 三方四正分析弹窗 ====================
function showSanFangPopup(zhiIndex, event) {
  if (!currentChart) return;
  if (typeof Tutorial !== 'undefined' && Tutorial.isOpen && Tutorial.isOpen()) return;

  var triads = [(zhiIndex + 4) % 12, (zhiIndex + 8) % 12];
  var opposite = (zhiIndex + 6) % 12;
  var allZhis = [zhiIndex].concat(triads).concat([opposite]);
  var allPalaces = allZhis.map(function(z) {
    return findPalaceByZhiIdx(z);
  }).filter(Boolean);

  var popup = document.getElementById('starPopup');
  document.getElementById('popupStarName').textContent = '三方四正分析';

  var html = '';
  allPalaces.forEach(function(p, i) {
    var label = '';
    if (p.zhiIndex === zhiIndex) label = '【本宫】';
    else if (triads.indexOf(p.zhiIndex) !== -1) label = '【三合】';
    else label = '【对宫】';

    html += '<div class="sf-palace-item" style="margin-bottom:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px">';
    html += '<span class="sf-label">' + label + ' ' + p.name + ' (' + p.ganZhi + ')</span>';
    if (p.stars.length > 0) {
      html += '<div style="margin-top:4px">';
      p.stars.forEach(function(s) {
        html += '<span class="sp-kw-tag" style="margin:2px">' + s.name + (s.brightness ? ' [' + s.brightness + ']' : '') + '</span>';
      });
      html += '</div>';
    }
    if (p.auxStars.length > 0) {
      html += '<div style="margin-top:4px;font-size:0.85em;color:#aaa">';
      html += p.auxStars.map(function(a) { return a.name; }).join(' · ');
      html += '</div>';
    }
    if (p.sihua && p.sihua.length > 0) {
      html += '<div style="margin-top:4px;font-size:0.85em">';
      p.sihua.forEach(function(sh) {
        var c = sh.type === '禄' ? '#4caf50' : sh.type === '权' ? '#ff9800' : sh.type === '科' ? '#2196f3' : '#f44336';
        html += '<span style="color:' + c + ';margin-right:6px">' + sh.source + sh.type + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  document.getElementById('popupStarBody').innerHTML = html;
  popup.style.display = 'block';
  var x = event.clientX, y = event.clientY;
  requestAnimationFrame(function() {
    var pw = popup.offsetWidth, ph = popup.offsetHeight;
    var ww = window.innerWidth, wh = window.innerHeight;
    if (x + pw + 10 > ww) x = ww - pw - 10;
    if (y + ph + 10 > wh) y = wh - ph - 10;
    if (x < 10) x = 10; if (y < 10) y = 10;
    popup.style.left = x + 'px'; popup.style.top = y + 'px';
  });
}

function findPalaceByZhiIdx(zhi) {
  if (!currentChart) return null;
  for (var i = 0; i < currentChart.palaces.length; i++) {
    if (currentChart.palaces[i].zhiIndex === zhi) return currentChart.palaces[i];
  }
  return null;
}

// ==================== 紫微合盘 ====================
var _synastryChart = null;
function showSynastryPanel() {
  var panel = document.getElementById('synastryPanel');
  if (!panel) return;
  var isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen && !_synastryChart && typeof casesModule !== 'undefined') {
    refreshSynastryPicker();
  }
}

function refreshSynastryPicker() {
  var sel = document.getElementById('synastrySelect');
  if (!sel || typeof casesModule === 'undefined') return;
  var cases = casesModule.listAll ? casesModule.listAll() : [];
  sel.innerHTML = '<option value="">-- 选择命例对比 --</option>';
  cases.forEach(function(c, i) {
    sel.innerHTML += '<option value="' + i + '">' + (c.name || '未命名') + '</option>';
  });
}

function runSynastry() {
  var sel = document.getElementById('synastrySelect');
  if (!sel || !sel.value && sel.value !== '0') return;
  if (!currentChart || !currentBazi) { alert('请先完成排盘'); return; }
  if (typeof casesModule === 'undefined') { alert('命例库模块未加载'); return; }
  var cases = casesModule.listAll();
  var caseData = cases[parseInt(sel.value)];
  if (!caseData || !caseData.chart) { alert('命例数据不完整'); return; }

  if (typeof calculateZiWeiSynastry === 'undefined') { alert('合盘引擎未加载'); return; }
  var result = calculateZiWeiSynastry(currentChart, caseData.chart, currentBazi, caseData.bazi);

  var container = document.getElementById('synastryResult');
  var html = '<div style="margin-top:12px">';
  html += '<div style="font-size:1.2em;font-weight:700;margin-bottom:8px;color:#d4a84c">';
  html += '🔗 合盘结果：' + result.verdict + ' (' + result.totalScore + '/' + result.maxScore + '分)</div>';
  result.scores.forEach(function(s) {
    var pct = s.max > 0 ? Math.round(s.score / s.max * 100) : 0;
    html += '<div style="margin:4px 0"><span style="display:inline-block;width:120px">' + s.name + '</span>';
    html += '<span style="display:inline-block;width:80px;text-align:right">' + s.score + '/' + s.max + '</span>';
    html += '<span style="margin-left:8px;font-size:0.8em;color:#aaa">' + s.detail + '</span></div>';
  });
  result.details.forEach(function(d) {
    html += '<div style="margin-top:6px;font-size:0.9em;color:#ccc">• ' + d + '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ==================== 三盘同参（本命+大限+流年） ====================
function toggleThreePanel() {
  var panel = document.getElementById('threePanel');
  if (!panel) return;
  if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
  if (!currentChart || !_lvChart) { alert('请先排盘并切换到大限或流年盘'); return; }
  renderThreePanel();
  panel.style.display = 'block';
}

function renderThreePanel() {
  var container = document.getElementById('threePanelContent');
  if (!container) return;
  var bp = currentChart;   // 本命
  var dp = _dxChart;       // 大限 (may be null)
  var lp = _lvChart;       // 流年

  var html = '<table style="width:100%;font-size:0.85em;border-collapse:collapse">';
  html += '<tr style="color:#d4a84c"><th>宫位</th><th>本命</th><th>大限</th><th>流年</th></tr>';
  for (var i = 0; i < 12; i++) {
    var bpP = findPalaceByZhiIdxIn(bp, i);
    var dpP = dp ? findPalaceByZhiIdxIn(dp, (i - _dxOffset + 12) % 12) : null;
    var lpP = lp ? findPalaceByZhiIdxIn(lp, (i - _lvOffset + 12) % 12) : null;

    html += '<tr>';
    html += '<td style="white-space:nowrap;padding:2px 4px">' + (bpP ? bpP.name : '') + '</td>';
    html += '<td style="padding:2px 4px">' + (bpP ? bpP.stars.map(function(s){return s.name;}).join(' ') : '-') + '</td>';
    html += '<td style="padding:2px 4px">' + (dpP ? dpP.stars.map(function(s){return s.name;}).join(' ') : '-') + '</td>';
    html += '<td style="padding:2px 4px">' + (lpP ? lpP.stars.map(function(s){return s.name;}).join(' ') : '-') + '</td>';
    html += '</tr>';
  }
  html += '</table>';
  container.innerHTML = html;
}

var _dxChart = null, _dxOffset = 0;
var _lvChart = null, _lvOffset = 0;

function findPalaceByZhiIdxIn(chart, zhi) {
  if (!chart) return null;
  for (var i = 0; i < chart.palaces.length; i++) {
    if (chart.palaces[i].zhiIndex === zhi) return chart.palaces[i];
  }
  return null;
}

// ==================== 命盘导出 ====================
function exportChartImage() {
  var chartEl = document.querySelector('.chart-container');
  if (!chartEl) { alert('请先完成排盘'); return; }

  // 使用 canvas 方式导出
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var rect = chartEl.getBoundingClientRect();
  var scale = 2;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  ctx.scale(scale, scale);

  // 创建临时SVG捕获
  var html = '<html><head><meta charset="utf-8"><style>';
  var sheets = document.styleSheets;
  for (var i = 0; i < sheets.length; i++) {
    try {
      var rules = sheets[i].cssRules || sheets[i].rules;
      for (var j = 0; j < rules.length; j++) {
        html += rules[j].cssText;
      }
    } catch(e) {}
  }
  html += '</style></head><body style="background:#1a1a2e">';
  html += chartEl.outerHTML;
  html += '</body></html>';

  var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'wenmo-ziwei-' + new Date().toISOString().slice(0,10) + '.html';
  a.click();
  URL.revokeObjectURL(url);
}

function exportChartImagePng() {
  var chartEl = document.querySelector('.chart-container');
  if (!chartEl) { alert('请先完成排盘'); return; }

  // 简单方式：用 html2canvas 库如果可用
  if (typeof html2canvas !== 'undefined') {
    html2canvas(chartEl, { backgroundColor: '#1a1a2e', scale: 2 }).then(function(canvas) {
      var link = document.createElement('a');
      link.download = 'wenmo-ziwei-' + new Date().toISOString().slice(0,10) + '.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  } else {
    // fallback: export as HTML
    exportChartImage();
  }
}

// ==================== 姓名分析 ====================
function analyzeName() {
  var input = document.getElementById('nameInput');
  var resultDiv = document.getElementById('nameResult');
  if (!input || !resultDiv) return;
  var name = (input.value || '').trim();
  if (!name) { resultDiv.innerHTML = '<p style="color:#e06050">请输入中文姓名</p>'; return; }
  if (typeof NameReading === 'undefined') { resultDiv.innerHTML = '<p style="color:#e06050">姓名学模块未加载</p>'; return; }

  var result = NameReading.analyze(name);
  if (result.error) { resultDiv.innerHTML = '<p style="color:#e06050">' + result.error + '</p>'; return; }

  var html = '<div style="margin-top:12px">';
  html += '<div style="font-size:1.2em;font-weight:700;margin-bottom:8px;color:#d4a84c">';
  html += result.name + ' · ' + result.verdict + ' (' + result.totalScore + '分)</div>';

  result.grids.forEach(function(g) {
    var clr = g.luck === '大吉' ? '#4caf50' : g.luck === '中吉' ? '#8bc34a' : g.luck === '中凶' ? '#ff9800' : '#f44336';
    html += '<div style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px">';
    html += '<span style="font-weight:600">' + g.name + '</span> ';
    html += '<span style="margin-left:8px">' + g.strokes + '画</span> ';
    html += '<span style="color:' + clr + ';margin-left:8px">' + g.luck + ' · ' + g.name + '</span>';
    html += '<div style="font-size:0.85em;color:#aaa;margin-top:4px">' + g.desc + '</div>';
    html += '<div style="font-size:0.8em;color:#888">' + g.meaning + '</div>';
    html += '</div>';
  });

  html += '<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px">';
  html += '<span style="font-weight:600">三才配置：</span>';
  html += '<span style="color:' + (result.sanCai.isGood ? '#4caf50' : '#ff9800') + '">' + result.sanCai.config + '</span>';
  html += '<div style="font-size:0.85em;color:#aaa">' + result.sanCai.desc + '</div>';
  html += '</div>';

  html += '<p style="font-size:0.8em;color:#666;margin-top:8px">以上分析基于三才五格法，仅供参考。笔画为估算值，精确分析需查康熙字典。</p>';
  html += '</div>';
  resultDiv.innerHTML = html;
}

// ==================== 奇门遁甲渲染 ====================

function renderQiMen() {
  var resultDiv = document.getElementById('qmResult');
  if (!resultDiv) return;

  if (typeof QiMen === 'undefined') {
    resultDiv.innerHTML = '<p style="color:#e06040;">奇门遁甲模块未加载</p>';
    return;
  }

  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate();
  var hour = now.getHours(), minute = now.getMinutes();

  // Try using chart data if available
  if (currentChart && currentBazi) {
    var birthDate = document.getElementById('birthDate');
    if (birthDate && birthDate.value) {
      var parts = birthDate.value.split('-').map(Number);
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
    hour = parseInt(document.getElementById('birthHour').value) || new Date().getHours();
    minute = parseInt(document.getElementById('birthMinute').value) || 0;
  }

  var result = QiMen.compute(year, month, day, hour, minute);
  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

  var html = '';
  html += '<div class="qm-info">';
  html += '<span>🕐 '+year+'-'+month+'-'+day+' '+GAN[result.dayGanIdx]+ZHI[result.dayZhiIdx]+'日 '+GAN[result.shiGanIdx]+ZHI[result.shiZhiIdx]+'时</span>';
  html += '<span> | '+result.bureau.dun+'遁'+result.bureau.ju+'局 · '+result.bureau.yuan+' · '+result.bureau.jieqi+'</span>';
  html += '</div>';

  // 九宫格
  html += '<div class="qm-grid">';
  var luoshuOrder = [4,9,2,3,5,7,8,1,6];
  var gridHtml = ['','','','','','','','',''];

  result.luoshuPalaces.forEach(function(p) {
    var luoIdx = luoshuOrder.indexOf(p.gong);
    if (luoIdx < 0) return;
    var cellHtml = '<div class="qm-cell'+(p.gong===5?' qm-cell-center':'')+'">';
    cellHtml += '<div class="qm-gong-name">'+p.gua+'宫('+p.gong+')</div>';
    if (p.spirit) cellHtml += '<div class="qm-spirit">'+p.spirit+'</div>';
    if (p.star) cellHtml += '<div class="qm-star" style="color:'+p.star.color+'">'+p.star.name+'</div>';
    if (p.door) cellHtml += '<div class="qm-door">'+p.door.name+'</div>';
    cellHtml += '<div class="qm-qiyi">'+p.earthQiYi+'</div>';
    cellHtml += '<div class="qm-gua-yi">'+p.guaYi+'</div>';
    cellHtml += '</div>';
    gridHtml[luoIdx] = cellHtml;
  });

  for (var i = 0; i < 9; i++) {
    html += gridHtml[i] || '<div class="qm-cell"></div>';
  }
  html += '</div>';

  // 星门神含义
  html += '<div class="qm-legend">';
  var shownStars = {};
  result.luoshuPalaces.forEach(function(p) {
    if (p.star && p.door) {
      html += '<div class="qm-legend-item">';
      html += '<b style="color:'+p.star.color+'">'+p.star.name+'</b> + <b>'+p.door.name+'</b> @ '+p.gua+'宫';
      html += '<span style="color:#888"> — '+p.door.desc+'</span>';
      html += '</div>';
    }
  });
  html += '</div>';

  resultDiv.innerHTML = html;
}

function useQiMenNow() {
  // Clear date/time to current
  if (currentBazi) {
    // Reset input fields to now
    document.getElementById('birthDate').value = '';
    document.getElementById('birthHour').value = 12;
    document.getElementById('birthMinute').value = 0;
  }
  renderQiMen();
}

// ==================== 择日渲染 ====================

function renderZeRiCalendar() {
  var resultDiv = document.getElementById('zrResult');
  if (!resultDiv) return;

  var now = new Date();
  var yearEl = document.getElementById('zrYear');
  var monthEl = document.getElementById('zrMonth');
  var year = parseInt(yearEl && yearEl.value ? yearEl.value : now.getFullYear());
  var month = parseInt(monthEl && monthEl.value ? monthEl.value : now.getMonth() + 1);

  if (!yearEl.value) yearEl.value = year;
  if (!monthEl.value) monthEl.value = month;

  if (typeof ZeRi === 'undefined') {
    resultDiv.innerHTML = '<p style="color:#e06040;">择日模块未加载</p>';
    return;
  }

  var calendar = ZeRi.generateMonthCalendar(year, month);
  var activity = (document.getElementById('zrActivity')||{}).value || '';
  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var WEEKDAY = ['日','一','二','三','四','五','六'];

  var html = '';
  html += '<div class="zr-cal-header">📅 '+calendar.monthName+'</div>';

  // 图例
  html += '<div class="zr-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;font-size:0.78em;">';
  html += '<span style="color:#4caf50">🟢 吉日</span><span style="color:#ff9800">🟡 平日</span><span style="color:#e06040">🔴 凶日</span>';
  if (activity) html += '<span style="color:#f0d78c">⭐ 宜'+activity+'</span>';
  html += '</div>';

  html += '<div class="zr-cal-grid">';
  // Day of week header
  for (var w = 0; w < 7; w++) {
    html += '<div class="zr-day-header">周'+WEEKDAY[w]+'</div>';
  }

  // Find first day of week offset
  var firstDay = new Date(year, month-1, 1).getDay();
  // Fill blank cells before first day
  for (var b = 0; b < firstDay; b++) {
    html += '<div class="zr-day zr-day-empty"></div>';
  }

  calendar.days.forEach(function(d) {
    var cls = 'zr-day';
    var badge = '';
    var tooltip = '';

    if (d.jianChuJiXiong === '吉') cls += ' zr-day-ji';
    else if (d.jianChuJiXiong === '凶') cls += ' zr-day-xiong';

    if (d.isToday) cls += ' zr-day-today';

    if (activity && d.yi.indexOf(activity) >= 0) {
      badge += ' ⭐';
      cls += ' zr-day-match';
    }

    if (d.bigTaboo) {
      badge += ' ⚠';
      cls += ' zr-day-taboo';
    }

    var yiStr = d.yi.slice(0, 3).join('·');
    var jiStr = d.ji.slice(0, 2).join('·');

    html += '<div class="'+cls+'" title="'+d.ganzhi+' '+d.jianChu+' '+yiStr+'">';
    html += '<div class="zr-day-num">'+d.solarDay+badge+'</div>';
    html += '<div class="zr-day-lunar">'+d.lunarMonth+'/'+d.lunarDay+'</div>';
    html += '<div class="zr-day-jc">'+d.jianChu+'</div>';
    html += '<div class="zr-day-gz">'+d.ganzhi+'</div>';
    html += '</div>';
  });

  html += '</div>';
  resultDiv.innerHTML = html;
}

function findZeRiBest() {
  var resultDiv = document.getElementById('zrResult');
  if (!resultDiv) return;

  var now = new Date();
  var yearEl = document.getElementById('zrYear');
  var monthEl = document.getElementById('zrMonth');
  var year = parseInt(yearEl && yearEl.value ? yearEl.value : now.getFullYear());
  var month = parseInt(monthEl && monthEl.value ? monthEl.value : now.getMonth() + 1);
  var activity = (document.getElementById('zrActivity')||{}).value || '嫁娶';

  if (typeof ZeRi === 'undefined') return;

  var best = ZeRi.findBestDates(year, month, activity, 3);

  var html = '';
  html += '<div style="padding:12px;background:rgba(240,215,140,0.06);border-radius:6px;margin-top:12px;">';
  html += '<h4 style="color:#f0d78c;margin-bottom:8px;">🔍 适宜<b>'+activity+'</b>的最佳日期（'+year+'年'+month+'月）</h4>';
  best.forEach(function(b) {
    var d = b.day;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(240,215,140,0.08);">';
    html += '<span><b style="color:#f0d78c;">'+year+'-'+month+'-'+d.solarDay+'</b> '+d.ganzhi+' '+d.jianChu+'</span>';
    html += '<span style="font-size:0.78em;color:#888;">匹配度: <b style="color:#4caf50">'+b.score+'分</b></span>';
    html += '<span style="font-size:0.78em;color:#aaa;">宜: '+d.yi.slice(0,3).join('·')+'</span>';
    html += '</div>';
  });
  if (best.length === 0) html += '<p style="color:#888;">本月暂无特别适合的日期</p>';
  html += '</div>';
  resultDiv.innerHTML = resultDiv.innerHTML + html;
}

// ==================== 风水罗盘渲染 ====================

function renderLuoPan() {
  var resultDiv = document.getElementById('lpResult');
  if (!resultDiv) return;

  if (typeof FengShuiLuopan === 'undefined') {
    resultDiv.innerHTML = '<p style="color:#e06040;">风水罗盘模块未加载</p>';
    return;
  }

  var now = new Date();
  var year = parseInt(document.getElementById('lpYear').value) || now.getFullYear();
  if (!document.getElementById('lpYear').value) document.getElementById('lpYear').value = year;

  var yearStars = FengShuiLuopan.computeYearStars(year);
  var yun = FengShuiLuopan.getCurrentYun(year);

  // Luoshu positions for grid
  var LUOSHU_POS = {4:{r:0,c:0},9:{r:0,c:1},2:{r:0,c:2},3:{r:1,c:0},5:{r:1,c:1},7:{r:1,c:2},8:{r:2,c:0},1:{r:2,c:1},6:{r:2,c:2}};
  var GONG_NAMES = {1:'坎·北',2:'坤·西南',3:'震·东',4:'巽·东南',5:'中宫',6:'乾·西北',7:'兑·西',8:'艮·东北',9:'离·南'};
  var gridCells = ['','','','','','','','',''];

  yearStars.forEach(function(s) {
    var pos = LUOSHU_POS[s.gong];
    if (!pos) return;
    var idx = pos.r * 3 + pos.c;
    var star = s.star;
    var bg = star.ji ? 'rgba(76,175,80,0.08)' : 'rgba(224,96,64,0.08)';
    var borderColor = star.ji ? 'rgba(76,175,80,0.3)' : 'rgba(224,96,64,0.3)';
    if (s.gong === 5) { bg = 'rgba(224,96,64,0.15)'; borderColor = 'rgba(224,96,64,0.5)'; }

    var cellHtml = '<div style="background:'+bg+';border:1px solid '+borderColor+';border-radius:4px;padding:8px;text-align:center;">';
    cellHtml += '<div style="font-size:0.7em;color:#888;">'+GONG_NAMES[s.gong]+'</div>';
    cellHtml += '<div style="font-size:1.4em;font-weight:700;color:'+star.color+';">'+star.name+'</div>';
    cellHtml += '<div style="font-size:0.7em;color:'+(star.ji?'#4caf50':'#e06040')+';">'+(star.ji?'吉':'凶')+'</div>';
    cellHtml += '<div style="font-size:0.68em;color:#888;margin-top:2px;">'+star.desc+'</div>';
    cellHtml += '</div>';
    gridCells[idx] = cellHtml;
  });

  var html = '';
  html += '<div style="margin-bottom:8px;color:#ccc;">🏠 <b>'+year+'年</b>飞星图 · <span style="color:#f0d78c;">下元'+yun.name+'</span>（'+yun.range+'）</div>';
  html += '<div class="lp-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;max-width:500px;">';
  gridCells.forEach(function(c) { html += c || '<div></div>'; });
  html += '</div>';

  // 廿四山罗盘
  html += '<div style="margin-top:16px;">';
  html += '<div style="margin-bottom:8px;color:#ccc;">🧭 <b>廿四山方位</b></div>';
  html += '<div class="lp-24shan" style="display:flex;flex-wrap:wrap;gap:2px;max-width:500px;">';
  FengShuiLuopan.MOUNTAINS.forEach(function(m) {
    var bg = m.wx === '金' ? 'rgba(212,192,128,0.12)' : m.wx === '木' ? 'rgba(90,168,90,0.12)' : m.wx === '水' ? 'rgba(96,144,208,0.12)' : m.wx === '火' ? 'rgba(224,96,64,0.12)' : 'rgba(208,160,64,0.12)';
    var color = m.wx === '金' ? '#d4c080' : m.wx === '木' ? '#5da85d' : m.wx === '水' ? '#6090d0' : m.wx === '火' ? '#e06040' : '#d0a040';
    html += '<span style="padding:2px 4px;font-size:0.68em;background:'+bg+';color:'+color+';border-radius:2px;cursor:default;" title="'+m.full+' '+m.dir+' '+m.deg+'° '+m.wx+' '+m.yinYang+'">'+m.name+'</span>';
  });
  html += '</div></div>';

  resultDiv.innerHTML = html;
}

// ==================== AI LLM 对话 ====================
function openAIChat() {
  if (!currentChart || !currentBazi) {
    alert('请先排盘再使用 AI 对话功能');
    return;
  }
  var existing = document.getElementById('aiChatPanel');
  if (existing) existing.remove();
  AILLM.openChat(currentChart, currentBazi);
}

function toggleChartAnalysis() {
  var panel = document.getElementById('chartAnalysisPanel');
  if (panel.style.display === 'none' || !panel.style.display) {
    if (!currentChart || !currentBazi) {
      alert('请先排盘再查看数据图表');
      return;
    }
    panel.innerHTML = '';
    panel.appendChild(ChartAnalysis.renderAll(currentChart, currentBazi));
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
  } else {
    panel.style.display = 'none';
  }
}

// ==================== 导出命盘到剪贴板 ====================
function copyChartToClipboard() {
  if (!currentChart || !currentBazi) {
    alert('请先排盘');
    return;
  }
  var text = AILLM.exportStructuredChart(currentChart, currentBazi);
  navigator.clipboard.writeText(text).then(function() {
    alert('命盘文本已复制到剪贴板，可粘贴到任何 AI 聊天工具中');
  }).catch(function() {
    alert('复制失败，请手动选择复制');
  });
}
