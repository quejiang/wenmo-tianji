/**
 * 山医命相卜 · 高级功能
 * 三方四正 · 暗合拱照 · 八字十神 · 用神 · 五行强弱 · 四化飞星图 · 截图导出
 */

// ==================== 1. 三方四正 & 暗合拱照 ====================

var _selectedPalaceIdx = -1;

function toggleTriadHighlight(palaceIdx) {
  if (_selectedPalaceIdx === palaceIdx) {
    clearTriadHighlight();
    return;
  }
  _selectedPalaceIdx = palaceIdx;
  var cells = document.querySelectorAll('.palace-cell');

  // 三方：命宫三合方 + 对宫（四正）
  var triad = [
    palaceIdx,
    (palaceIdx + 4) % 12,  // 三合1
    (palaceIdx + 8) % 12,  // 三合2
    (palaceIdx + 6) % 12   // 四正（对宫）
  ];

  // 暗合：地支六合
  var sixHeMap = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
  var anhe = sixHeMap[palaceIdx];

  // 拱照（见光不见星）：对宫拱照
  var arch = (palaceIdx + 6) % 12;

  cells.forEach(function(c, i) {
    c.classList.remove('triad-highlight', 'triad-opposite', 'triad-anhe');
  });

  triad.forEach(function(t) {
    var zhiIdx = _getCellZhiIdx(cells[t]);
    if (zhiIdx !== null) {
      if (t === palaceIdx) cells[t].classList.add('triad-highlight');
      else if (t === (palaceIdx + 6) % 12) cells[t].classList.add('triad-opposite');
      else cells[t].classList.add('triad-highlight');
    }
  });

  if (anhe !== undefined && anhe !== (palaceIdx + 6) % 12) {
    cells[anhe].classList.add('triad-anhe');
  }
}

function _getCellZhiIdx(cell) {
  // map row/col back to zhiIndex
  var row = parseInt(cell.style.gridRow);
  var col = parseInt(cell.style.gridColumn);
  for (var z = 0; z < 12; z++) {
    var pos = getGridPosition(z);
    if (pos.row === row && pos.col === col) return z;
  }
  return null;
}

function clearTriadHighlight() {
  _selectedPalaceIdx = -1;
  document.querySelectorAll('.palace-cell').forEach(function(c) {
    c.classList.remove('triad-highlight', 'triad-opposite', 'triad-anhe');
  });
}

function showTriadInfo(palaceName, palaceIdx) {
  var triadNames = [
    PALACE_NAMES[palaceIdx],
    PALACE_NAMES[(palaceIdx + 4) % 12],
    PALACE_NAMES[(palaceIdx + 8) % 12]
  ];
  var oppositeName = PALACE_NAMES[(palaceIdx + 6) % 12];
  var sixHeMap = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
  var anHeIdx = sixHeMap[palaceIdx];
  var anHeName = PALACE_NAMES[anHeIdx];

  var infoEl = document.getElementById('triadInfoBar');
  if (!infoEl) return;

  infoEl.innerHTML =
    '<span class="triad-label">三方：</span>' +
    '<span class="triad-name">' + triadNames.join(' · ') + '</span>' +
    '<span class="triad-divider">|</span>' +
    '<span class="triad-label">对宫：</span>' +
    '<span class="triad-name triad-opp">' + oppositeName + '</span>' +
    '<span class="triad-divider">|</span>' +
    '<span class="triad-label">暗合：</span>' +
    '<span class="triad-name triad-anh">' + anHeName + '</span>' +
    '<span class="triad-divider">|</span>' +
    '<span class="triad-name triad-click">（点击宫格查看三方四正，再点取消）</span>';
  infoEl.style.display = 'flex';
}


// ==================== 2. 八字十神表 + 用神 + 五行强弱 ====================

function renderBaziAdvanced(bazi) {
  var container = document.getElementById('baziAdvancedPanel');
  if (!container || !bazi) return;

  // 十神表
  var dayGan = bazi.day.ganIndex;
  var shiShenTable = buildShiShenTable(dayGan, bazi);
  // 用神
  var yongShen = calcYongShen(bazi);
  // 五行强弱
  var wuXingStrength = calcWuXingStrength(bazi);

  var html = '<div class="bazi-adv-wrap">';

  // === 十神表 ===
  html += '<div class="bazi-adv-section"><h4>📊 八字十神</h4>';
  html += '<table class="bazi-shishen-table">' +
    '<thead><tr><th></th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th></tr></thead>' +
    '<tbody>' +
    '<tr><td class="ss-label">天干</td>' +
      '<td>' + bazi.year.gan + '</td><td>' + bazi.month.gan + '</td>' +
      '<td class="ss-day">' + bazi.day.gan + '</td><td>' + bazi.hour.gan + '</td></tr>' +
    '<tr><td class="ss-label">地支</td>' +
      '<td>' + bazi.year.zhi + '</td><td>' + bazi.month.zhi + '</td>' +
      '<td class="ss-day">' + bazi.day.zhi + '</td><td>' + bazi.hour.zhi + '</td></tr>' +
    '<tr><td class="ss-label">十神</td>' +
      shiShenTable.map(function(ss) { return '<td class="ss-val">' + ss.gan + '</td>'; }).join('') +
      '</tr>' +
    '<tr><td class="ss-label">藏干</td>' +
      shiShenTable.map(function(ss) { return '<td class="ss-cang">' + ss.cangGan.join(' ') + '</td>'; }).join('') +
      '</tr>' +
    '</tbody></table></div>';

  // === 用神 ===
  html += '<div class="bazi-adv-section"><h4>🔮 用神分析</h4>';
  html += '<div class="yongshen-card">' +
    '<div class="yongshen-item"><span class="ys-label">日主</span><span class="ys-val">' + WU_XING_NAMES[yongShen.dayMaster] + '（' + bazi.day.gan + '）</span></div>' +
    '<div class="yongshen-item"><span class="ys-label">喜用神</span><span class="ys-val ys-good">' + yongShen.prefer.join(' · ') + '</span></div>' +
    '<div class="yongshen-item"><span class="ys-label">忌神</span><span class="ys-val ys-bad">' + yongShen.avoid.join(' · ') + '</span></div>' +
    '<div class="yongshen-item"><span class="ys-label">调候</span><span class="ys-val">' + yongShen.tiaoHou + '</span></div>' +
    '<div class="yongshen-item"><span class="ys-label">简析</span><span class="ys-val ys-desc">' + yongShen.desc + '</span></div>' +
    '</div></div>';

  // === 五行强弱 ===
  html += '<div class="bazi-adv-section"><h4>⚖️ 五行强弱</h4>';
  html += '<div class="wuxing-bars">';
  var maxVal = Math.max.apply(null, Object.values(wuXingStrength)) || 1;
  WU_XING_ORDER.forEach(function(wx) {
    var val = wuXingStrength[wx] || 0;
    var pct = Math.round(val / maxVal * 100);
    html += '<div class="wx-bar-row"><span class="wx-name">' + WU_XING_NAMES[wx] + '</span>' +
      '<div class="wx-bar-track"><div class="wx-bar-fill wx-' + wx + '" style="width:' + pct + '%"></div></div>' +
      '<span class="wx-score">' + val + '</span></div>';
  });
  html += '</div>';
  html += '<div class="wx-summary">' + getWuXingSummary(wuXingStrength) + '</div>';
  html += '</div></div>';

  container.innerHTML = html;
  container.style.display = 'block';
}

var WU_XING_NAMES = { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' };
var WU_XING_ORDER = ['木', '火', '土', '金', '水'];

function buildShiShenTable(dayGan, bazi) {
  var pillars = [
    { gan: bazi.year.ganIndex, zhi: bazi.year.zhiIndex },
    { gan: bazi.month.ganIndex, zhi: bazi.month.zhiIndex },
    { gan: bazi.day.ganIndex, zhi: bazi.day.zhiIndex },
    { gan: bazi.hour.ganIndex, zhi: bazi.hour.zhiIndex }
  ];

  return pillars.map(function(p) {
    return {
      gan: getShiShen(dayGan, p.gan),
      cangGan: getCangGan(p.zhi).map(function(g) { return GAN[g] + '(' + getShiShen(dayGan, g) + ')'; })
    };
  });
}

function getShiShen(dayGan, otherGan) {
  // 十神：同我者比劫，我生者食伤，我克者财，克我者官杀，生我者印
  var dayYin = dayGan % 2; // 0=阳干 1=阴干
  var othYin = otherGan % 2;
  var diff = (otherGan - dayGan + 10) % 10;

  var sameEle = [[0,5],[1,6],[2,7],[3,8],[4,9]]; // 甲乙木, 丙丁火, 戊己土, 庚辛金, 壬癸水
  var dayEle = Math.floor(dayGan / 2);
  var othEle = Math.floor(otherGan / 2);

  var rel = (othEle - dayEle + 5) % 5; // 0=same, 1=child, 2=grandchild, 3=grandparent, 4=parent
  
  if (rel === 0) return dayYin === othYin ? '比肩' : '劫财';
  if (rel === 1) return dayYin === othYin ? '食神' : '伤官';
  if (rel === 2) return dayYin === othYin ? '偏财' : '正财';
  if (rel === 3) return dayYin === othYin ? '正官' : '七杀';
  return dayYin === othYin ? '偏印' : '正印';
}

function getCangGan(zhiIndex) {
  var cang = [
    [5],                     // 子：癸
    [5,7,1],                 // 丑：己癸辛
    [0,2,4],                 // 寅：甲丙戊
    [1],                     // 卯：乙
    [4,1,5],                 // 辰：戊乙癸
    [2,4,6],                 // 巳：丙戊庚
    [3,5],                   // 午：丁己
    [5,3,1],                 // 未：己丁乙
    [6,4,8],                 // 申：庚戊壬
    [7],                     // 酉：辛
    [4,7,3],                 // 戌：戊辛丁
    [8,0]                    // 亥：壬甲
  ];
  return cang[zhiIndex] || [];
}

function calcYongShen(bazi) {
  var dayMaster = Math.floor(bazi.day.ganIndex / 2); // 0木1火2土3金4水
  var monthZhi = bazi.month.zhiIndex;
  var season = Math.floor(monthZhi / 3); // 0春1夏2秋3冬 (rough)
  var dayGan = bazi.day.ganIndex;

  var WX_CHARS = [
    ['木', '乙'], ['木', '甲'], // 甲乙
    ['火', '丙'], ['火', '丁'], // 丙丁
    ['土', '戊'], ['土', '己'], // 戊己
    ['金', '庚'], ['金', '辛'], // 庚辛
    ['水', '壬'], ['水', '癸']  // 壬癸
  ];

  var prefer = [], avoid = [];

  // 简化用神规则
  if (dayMaster === 0) { // 木日主
    if (season === 0) { prefer = ['火', '土']; avoid = ['金', '水']; }
    else if (season === 1) { prefer = ['水', '火']; avoid = ['土', '金']; }
    else if (season === 2) { prefer = ['火', '水']; avoid = ['金', '木']; }
    else { prefer = ['火', '土']; avoid = ['金', '水']; }
  } else if (dayMaster === 1) { // 火日主
    if (season === 0) { prefer = ['木', '火']; avoid = ['水', '金']; }
    else if (season === 1) { prefer = ['水', '金']; avoid = ['木', '火']; }
    else if (season === 2) { prefer = ['木', '火']; avoid = ['水', '金']; }
    else { prefer = ['木', '火']; avoid = ['水', '金']; }
  } else if (dayMaster === 2) { // 土日主
    prefer = ['火', '土']; avoid = ['木', '水'];
  } else if (dayMaster === 3) { // 金日主
    if (season === 0) { prefer = ['土', '金']; avoid = ['火', '木']; }
    else if (season === 1) { prefer = ['水', '土']; avoid = ['火', '木']; }
    else if (season === 2) { prefer = ['土', '金']; avoid = ['火', '水']; }
    else { prefer = ['火', '土']; avoid = ['水', '金']; }
  } else { // 水日主
    if (season === 0) { prefer = ['金', '水']; avoid = ['土', '火']; }
    else if (season === 1) { prefer = ['金', '水']; avoid = ['火', '土']; }
    else if (season === 2) { prefer = ['木', '火']; avoid = ['土', '金']; }
    else { prefer = ['木', '火']; avoid = ['土', '金']; }
  }

  var tiaoHou = season === 1 ? '宜补水调候' : season === 3 ? '宜补火调候' : '无需特别调候';
  var desc = '日主' + WU_XING_NAMES[WX_CHARS[dayGan][0]] + '生于' + 
    ['春','夏','秋','冬'][season] + '季，喜' + prefer.join('/') + '，忌' + avoid.join('/');

  return { dayMaster: WX_CHARS[dayGan][0], prefer: prefer, avoid: avoid, tiaoHou: tiaoHou, desc: desc };
}

function calcWuXingStrength(bazi) {
  var score = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  var wuXingMap = {0:'木',1:'木',2:'火',3:'火',4:'土',5:'土',6:'金',7:'金',8:'水',9:'水'};

  var pillars = [
    { gan: bazi.year.ganIndex, zhi: bazi.year.zhiIndex },
    { gan: bazi.month.ganIndex, zhi: bazi.month.zhiIndex },
    { gan: bazi.day.ganIndex, zhi: bazi.day.zhiIndex },
    { gan: bazi.hour.ganIndex, zhi: bazi.hour.zhiIndex }
  ];

  pillars.forEach(function(p) {
    score[wuXingMap[p.gan]] = (score[wuXingMap[p.gan]] || 0) + 2;
    // 地支主气
    var cang = getCangGan(p.zhi);
    if (cang.length > 0) score[wuXingMap[cang[0]]] = (score[wuXingMap[cang[0]]] || 0) + 1.5;
    if (cang.length > 1) score[wuXingMap[cang[1]]] = (score[wuXingMap[cang[1]]] || 0) + 0.5;
  });

  return score;
}

function getWuXingSummary(strength) {
  var entries = Object.entries(strength).sort(function(a, b) { return b[1] - a[1]; });
  if (entries.length === 0) return '';
  var strongest = entries[0][0];
  var weakest = entries[entries.length - 1][0];
  var gap = entries[0][1] - entries[entries.length - 1][1];
  if (gap < 2) return '⚖️ 五行较为均衡';
  return '💪 五行偏' + strongest + '，需补' + weakest;
}


// ==================== 3. 四化飞星图 ====================

var _sihuaChartVisible = false;

function toggleSihuaChart() {
  _sihuaChartVisible = !_sihuaChartVisible;
  if (_sihuaChartVisible) {
    renderSihuaOverlay();
  } else {
    var el = document.getElementById('sihuaOverlay');
    if (el) el.style.display = 'none';
  }
}

function renderSihuaOverlay() {
  var overlay = document.getElementById('sihuaOverlay');
  if (!overlay || !currentChart) return;

  // 找出所有四化
  var allSihua = [];
  var allGongWei = []; // position data

  currentChart.palaces.forEach(function(palace, pi, pArr) {
    var pos = getGridPosition(palace.zhiIndex);
    allGongWei.push({ idx: pi, zhi: palace.zhiIndex, name: palace.name, row: pos.row, col: pos.col });

    (palace.sihua || []).forEach(function(s) {
      allSihua.push({
        fromPalace: pi,
        fromZhi: palace.zhiIndex,
        starName: s.starName,
        type: s.type,
        source: s.source || '生年'
      });
    });
  });

  var html = '<div class="sihua-chart-inner">';
  html += '<h4>🔗 四化飞星图</h4>';
  html += '<div class="sihua-legend">';
  html += '<span class="sihua-leg sihua-lu">禄</span>';
  html += '<span class="sihua-leg sihua-quan">权</span>';
  html += '<span class="sihua-leg sihua-ke">科</span>';
  html += '<span class="sihua-leg sihua-ji">忌</span>';
  html += '</div>';

  // SVG
  html += '<svg viewBox="0 0 500 500" class="sihua-svg">';
  // 12 palace centers
  var centers = [];
  allGongWei.forEach(function(gw) {
    var cx = 60 + (gw.col - 1) * 190;
    var cy = 60 + (gw.row - 1) * 190;
    centers.push({ idx: gw.idx, cx: cx, cy: cy, name: gw.name });
    html += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" class="sihua-gong-text">' + gw.name + '</text>';
  });

  allSihua.forEach(function(s) {
    // Source palace -> find the target (simplified: draw line from source to center)
    var src = centers[0]; // default to center
    var dst = centers[0];
    // This is simplified — real implementation would map sihua to target palace
    // For now show sihua on the source palace
    var p = allGongWei[s.fromPalace];
    if (!p) return;
    var colorMap = { '禄': '#4caf50', '权': '#ff9800', '科': '#2196f3', '忌': '#f44336' };
    html += '<text x="' + (60 + (p.col - 1) * 190) + '" y="' + (60 + (p.row - 1) * 190 + 15) +
      '" text-anchor="middle" class="sihua-label" fill="' + (colorMap[s.type] || '#fff') +
      '" font-size="11">' + s.type + '</text>';
  });

  html += '</svg>';
  html += '<p style="text-align:center;color:#888;font-size:12px;margin-top:12px;">四化分布示意图（箭头版待后续优化）</p>';
  html += '</div>';
  html += '<button class="feature-close" onclick="toggleSihuaChart()" style="position:absolute;top:12px;right:12px;">✕</button>';

  overlay.innerHTML = html;
  overlay.style.display = 'flex';
}


// ==================== 4. 命盘截图导出 PNG ====================

function exportChartPNG() {
  var chartEl = document.getElementById('chartGrid');
  if (!chartEl || !currentChart) { alert('请先排盘'); return; }

  // Capture via canvas
  var rect = chartEl.getBoundingClientRect();
  var canvas = document.createElement('canvas');
  var scale = 2; // 2x for Retina
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  var ctx = canvas.getContext('2d');

  // Draw white background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Use foreignObject rendering approach — simpler: screenshot via html2canvas-like inline SVG
  // For simplicity, use a basic DOM-to-canvas approach
  try {
    // Serialize chart DOM to SVG foreignObject
    var serializer = new XMLSerializer();
    var chartClone = chartEl.cloneNode(true);
    chartClone.style.transform = 'scale(' + scale + ')';
    chartClone.style.transformOrigin = 'top left';

    var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:system-ui">' +
      chartClone.outerHTML +
      '</div></foreignObject></svg>';

    var img = new Image();
    var blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);

    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(function(blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ziwei-chart-' + new Date().toISOString().slice(0, 10) + '.png';
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    };
    img.src = url;
  } catch (e) {
    alert('截图失败: ' + e.message + '。可尝试浏览器截图快捷键。');
  }
}


// ==================== 5. 总开关 ====================

function initAdvancedFeatures() {
  // Hook into renderChart to add triad click handlers
  var origRenderChart = renderChart;
  renderChart = function(chart, bazi) {
    origRenderChart(chart, bazi);

    // Add click handlers to palace cells for triad
    var cells = document.querySelectorAll('.palace-cell');
    cells.forEach(function(cell, i) {
      cell.style.cursor = 'pointer';
      cell.onclick = function() {
        var r = parseInt(cell.style.gridRow);
        var co = parseInt(cell.style.gridColumn);
        for (var z = 0; z < 12; z++) {
          var pos = getGridPosition(z);
          if (pos.row === r && pos.col === co) {
            toggleTriadHighlight(z);
            var name = PALACE_NAMES[z];
            showTriadInfo(name, z);
            return;
          }
        }
        clearTriadHighlight();
      };
    });

    // Render bazi advanced panel
    if (bazi && document.getElementById('baziAdvancedPanel')) {
      renderBaziAdvanced(bazi);
    }

    // Hide sihua overlay on re-render
    var so = document.getElementById('sihuaOverlay');
    if (so) so.style.display = 'none';
    _sihuaChartVisible = false;
  };

  // Hide triad info on click outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.palace-cell')) {
      clearTriadHighlight();
      var infoEl = document.getElementById('triadInfoBar');
      if (infoEl) infoEl.style.display = 'none';
    }
  });
}
