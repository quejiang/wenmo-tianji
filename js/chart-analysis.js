/**
 * 文墨天机 · 命盘数据可视化分析
 * 十二宫能量雷达图 | 大限走势折线图 | 五行分布饼图 | 星曜分布热力图
 * 纯 Canvas 实现，无外部依赖
 */

var ChartAnalysis = (function() {
  'use strict';

  // ==================== 工具函数 ====================
  var COLORS = {
    primary: '#f0d78c',
    accent: '#c9a84c',
    good: '#8bc34a',
    warn: '#ff9800',
    bad: '#e06050',
    blue: '#5b9bd5',
    purple: '#a78bfa',
    cyan: '#22d3ee',
    grid: 'rgba(240,215,140,0.1)',
    text: '#b0a080',
    bg: '#1a1a2e'
  };

  function createCanvas(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    return canvas;
  }

  // ==================== 1. 十二宫能量雷达图 ====================
  function renderRadarChart(chart, width, height) {
    width = width || 420;
    height = height || 420;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    var cx = width / 2;
    var cy = height / 2;
    var radius = Math.min(cx, cy) - 50;
    var levels = 5;

    // 获取十二宫评分
    var scores = typeof scorePalaces === 'function' ? scorePalaces(chart) : [];
    if (scores.length === 0) {
      // 简单评分
      scores = chart.palaces.map(function(p) {
        var s = 50;
        p.stars.forEach(function(st) {
          if (st.brightness === '庙') s += 15;
          else if (st.brightness === '旺') s += 10;
          else if (st.brightness === '陷') s -= 15;
          else if (st.brightness === '不') s -= 10;
        });
        p.auxStars.forEach(function(a) {
          if (['左辅','右弼','文昌','文曲','天魁','天钺','禄存'].indexOf(a.name) >= 0) s += 8;
          if (['擎羊','陀罗','火星','铃星','地空','地劫'].indexOf(a.name) >= 0) s -= 8;
        });
        return { name: p.name, score: Math.max(10, Math.min(95, s)) };
      });
    }

    // 绘制网格
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (var l = 1; l <= levels; l++) {
      ctx.beginPath();
      for (var i = 0; i < 12; i++) {
        var angle = (Math.PI * 2 / 12) * i - Math.PI / 2;
        var r = (radius / levels) * l;
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 轴线
    for (var a = 0; a < 12; a++) {
      var angle2 = (Math.PI * 2 / 12) * a - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle2) * radius, cy + Math.sin(angle2) * radius);
      ctx.stroke();
    }

    // 数据多边形
    ctx.beginPath();
    for (var d = 0; d < 12; d++) {
      var angle3 = (Math.PI * 2 / 12) * d - Math.PI / 2;
      var r3 = (scores[d].score / 100) * radius;
      var x3 = cx + Math.cos(angle3) * r3;
      var y3 = cy + Math.sin(angle3) * r3;
      if (d === 0) ctx.moveTo(x3, y3);
      else ctx.lineTo(x3, y3);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(240,215,140,0.15)';
    ctx.fill();
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 数据点 + 标签
    for (var s = 0; s < 12; s++) {
      var angle4 = (Math.PI * 2 / 12) * s - Math.PI / 2;
      var r4 = (scores[s].score / 100) * radius;
      var x4 = cx + Math.cos(angle4) * r4;
      var y4 = cy + Math.sin(angle4) * r4;

      ctx.beginPath();
      ctx.arc(x4, y4, 4, 0, Math.PI * 2);
      ctx.fillStyle = scores[s].score >= 60 ? COLORS.good : scores[s].score >= 40 ? COLORS.warn : COLORS.bad;
      ctx.fill();

      // 标签
      var labelR = radius + 22;
      var lx = cx + Math.cos(angle4) * labelR;
      var ly = cy + Math.sin(angle4) * labelR;
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(scores[s].name, lx, ly);
    }

    // 标题
    ctx.fillStyle = COLORS.primary;
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('十二宫能量分布', cx, 18);

    return canvas;
  }

  // ==================== 2. 大限走势折线图 ====================
  function renderDaXianLineChart(chart, bazi, width, height) {
    width = width || 600;
    height = height || 280;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    var dxData = [];
    chart.palaces.forEach(function(p) {
      if (p.daXian) {
        dxData.push({
          age: p.daXian.startAge,
          name: p.name,
          score: estimatePalaceScore(p)
        });
      }
    });
    dxData.sort(function(a, b) { return a.age - b.age; });

    var pad = { top: 30, bottom: 50, left: 50, right: 20 };
    var plotW = width - pad.left - pad.right;
    var plotH = height - pad.top - pad.bottom;

    // 背景
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // 网格
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gy = pad.top + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(width - pad.right, gy);
      ctx.stroke();
    }

    // 中线
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(240,215,140,0.3)';
    ctx.lineWidth = 1;
    ctx.moveTo(pad.left, pad.top + plotH / 2);
    ctx.lineTo(width - pad.right, pad.top + plotH / 2);
    ctx.stroke();

    // 数据线
    ctx.beginPath();
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    for (var d = 0; d < dxData.length; d++) {
      var dx = pad.left + (d / (dxData.length - 1)) * plotW;
      var dy = pad.top + ((100 - dxData[d].score) / 100) * plotH;
      if (d === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.stroke();

    // 填充
    ctx.lineTo(pad.left + plotW, pad.top + plotH / 2);
    ctx.lineTo(pad.left, pad.top + plotH / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(240,215,140,0.08)';
    ctx.fill();

    // 数据点
    for (var p = 0; p < dxData.length; p++) {
      var px = pad.left + (p / (dxData.length - 1)) * plotW;
      var py = pad.top + ((100 - dxData[p].score) / 100) * plotH;

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = dxData[p].score >= 60 ? COLORS.good : dxData[p].score >= 40 ? COLORS.warn : COLORS.bad;
      ctx.fill();
      ctx.strokeStyle = COLORS.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // X轴标签
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dxData[p].age + '岁', px, pad.top + plotH + 16);

      // 宫位标签
      ctx.fillText(dxData[p].name, px, pad.top + plotH + 34);
    }

    // Y轴标签
    ctx.textAlign = 'right';
    for (var y = 0; y <= 4; y++) {
      var yVal = 100 - y * 20;
      var yy = pad.top + (plotH / 4) * y;
      ctx.fillText(yVal, pad.left - 8, yy + 4);
    }

    // 标题
    ctx.fillStyle = COLORS.primary;
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('大限走势 · 宫位能量变化', width / 2, 16);

    return canvas;
  }

  function estimatePalaceScore(palace) {
    var s = 50;
    palace.stars.forEach(function(st) {
      if (st.brightness === '庙') s += 15;
      else if (st.brightness === '旺') s += 10;
      else if (st.brightness === '陷') s -= 15;
      else if (st.brightness === '不') s -= 10;
    });
    (palace.sihua || []).forEach(function(sh) {
      if (sh.source === '生年') {
        if (sh.type === '禄') s += 12;
        else if (sh.type === '权') s += 8;
        else if (sh.type === '科') s += 6;
        else if (sh.type === '忌') s -= 12;
      }
    });
    return Math.max(10, Math.min(95, s));
  }

  // ==================== 3. 五行分布饼图 ====================
  function renderElementPieChart(chart, width, height) {
    width = width || 300;
    height = height || 280;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    // 统计五行
    var elemCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    var starElements = {
      ziwei: '土', tianji: '木', taiyang: '火', wuqu: '金', tiantong: '水',
      lianzhen: '火', tianfu: '土', taiyin: '水', tanlang: '木', jumen: '水',
      tianxiang: '水', tianliang: '土', qisha: '金', pojund: '水'
    };

    chart.palaces.forEach(function(p) {
      p.stars.forEach(function(s) {
        var elem = starElements[s.key];
        if (elem) elemCount[elem]++;
      });
    });

    var total = Object.values(elemCount).reduce(function(a, b) { return a + b; }, 0) || 1;

    var cx = width / 2;
    var cy = height / 2 - 10;
    var radius = Math.min(cx, cy) - 10;

    var elemColors = { '木': '#8bc34a', '火': '#e06050', '土': '#f0d78c', '金': '#ffcc80', '水': '#5b9bd5' };
    var elemNames = ['木', '火', '土', '金', '水'];

    var startAngle = -Math.PI / 2;
    elemNames.forEach(function(elem) {
      var slice = (elemCount[elem] / total) * Math.PI * 2;
      if (slice < 0.01) return;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = elemColors[elem];
      ctx.fill();

      // 标签
      var midAngle = startAngle + slice / 2;
      var labelR = radius * 0.65;
      var lx = cx + Math.cos(midAngle) * labelR;
      var ly = cy + Math.sin(midAngle) * labelR;
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(elem + ' ' + elemCount[elem], lx, ly);

      startAngle += slice;
    });

    // 标题
    ctx.fillStyle = COLORS.primary;
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('主星五行分布', cx, height - 4);

    return canvas;
  }

  // ==================== 4. 星曜分布热力图 ====================
  function renderHeatmap(chart, width, height) {
    width = width || 480;
    height = height || 300;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    var palaceNames = chart.palaces.map(function(p) { return p.name; });
    var starCategories = [
      { key: 'main', label: '主星', getter: function(p) { return p.stars.length; } },
      { key: 'aux', label: '辅星', getter: function(p) { return p.auxStars.length; } },
      { key: 'ji', label: '吉星', getter: function(p) {
        return p.auxStars.filter(function(s) {
          return ['左辅','右弼','文昌','文曲','天魁','天钺','禄存'].indexOf(s.name) >= 0;
        }).length;
      }},
      { key: 'sha', label: '煞星', getter: function(p) {
        return p.auxStars.filter(function(s) {
          return ['擎羊','陀罗','火星','铃星','地空','地劫'].indexOf(s.name) >= 0;
        }).length;
      }},
      { key: 'sihua', label: '四化', getter: function(p) { return (p.sihua || []).length; }}
    ];

    var pad = { top: 10, bottom: 80, left: 50, right: 10 };
    var cellW = (width - pad.left - pad.right) / 12;
    var cellH = (height - pad.top - pad.bottom) / starCategories.length;

    // 热度颜色映射
    function heatColor(count, max) {
      if (count === 0) return 'rgba(255,255,255,0.03)';
      var t = Math.min(count / (max || 1), 1);
      var r = Math.round(240 + 15 * (1 - t));
      var g = Math.round(180 + 20 * (1 - t));
      var b = Math.round(60 + 80 * (1 - t));
      return 'rgba(' + r + ',' + g + ',' + b + ',' + (0.25 + t * 0.4) + ')';
    }

    // 计算每列最大值
    var maxes = starCategories.map(function(cat) {
      var max = 1;
      chart.palaces.forEach(function(p) { max = Math.max(max, cat.getter(p)); });
      return max;
    });

    // 绘制格子
    starCategories.forEach(function(cat, ri) {
      chart.palaces.forEach(function(p, ci) {
        var x = pad.left + ci * cellW;
        var y = pad.top + ri * cellH;
        var val = cat.getter(p);

        ctx.fillStyle = heatColor(val, maxes[ri]);
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        ctx.fillStyle = val > 0 ? '#f0d78c' : '#555';
        ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val || '-', x + cellW / 2, y + cellH / 2);
      });
    });

    // X轴标签
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    chart.palaces.forEach(function(p, ci) {
      var x = pad.left + ci * cellW + cellW / 2;
      ctx.fillText(p.name, x, pad.top + starCategories.length * cellH + 14);
    });

    // Y轴标签
    ctx.textAlign = 'right';
    starCategories.forEach(function(cat, ri) {
      var y = pad.top + ri * cellH + cellH / 2;
      ctx.fillText(cat.label, pad.left - 8, y);
    });

    // 标题
    ctx.fillStyle = COLORS.primary;
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('星曜分布热力图', width / 2, height - 4);

    return canvas;
  }

  // ==================== 5. 吉凶比例环形图 ====================
  function renderJiXiongRing(chart, width, height) {
    width = width || 280;
    height = height || 280;
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    var jiCount = 0, shaCount = 0;
    chart.palaces.forEach(function(p) {
      p.auxStars.forEach(function(s) {
        if (['左辅','右弼','文昌','文曲','天魁','天钺','禄存'].indexOf(s.name) >= 0) jiCount++;
        if (['擎羊','陀罗','火星','铃星','地空','地劫'].indexOf(s.name) >= 0) shaCount++;
      });
      (p.sihua || []).forEach(function(sh) {
        if (sh.source === '生年') {
          if (sh.type === '禄' || sh.type === '权' || sh.type === '科') jiCount++;
          else if (sh.type === '忌') shaCount++;
        }
      });
    });

    var total = jiCount + shaCount || 1;
    var cx = width / 2;
    var cy = height / 2;
    var outerR = Math.min(cx, cy) - 8;
    var innerR = outerR * 0.55;

    // 吉星弧
    var jiAngle = (jiCount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, -Math.PI / 2, -Math.PI / 2 + jiAngle);
    ctx.arc(cx, cy, innerR, -Math.PI / 2 + jiAngle, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = COLORS.good;
    ctx.fill();

    // 煞星弧
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, -Math.PI / 2 + jiAngle, -Math.PI / 2 + Math.PI * 2);
    ctx.arc(cx, cy, innerR, -Math.PI / 2 + Math.PI * 2, -Math.PI / 2 + jiAngle, true);
    ctx.closePath();
    ctx.fillStyle = COLORS.bad;
    ctx.fill();

    // 中心文字
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 20px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var ratio = Math.round((jiCount / (total || 1)) * 100);
    ctx.fillText(ratio + '%', cx, cy - 6);

    ctx.fillStyle = COLORS.text;
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('吉星占比', cx, cy + 18);

    // 图例
    var legendY = cy + outerR + 16;
    ctx.fillStyle = COLORS.good;
    ctx.fillRect(cx - 50, legendY, 10, 10);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';
    ctx.fillText('吉(' + jiCount + ')', cx - 36, legendY + 9);

    ctx.fillStyle = COLORS.bad;
    ctx.fillRect(cx + 10, legendY, 10, 10);
    ctx.fillText('煞(' + shaCount + ')', cx + 24, legendY + 9);

    // 标题
    ctx.fillStyle = COLORS.primary;
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('吉煞比例', cx, 16);

    return canvas;
  }

  // ==================== 主入口 ====================
  function renderAll(chart, bazi) {
    var container = document.createElement('div');
    container.className = 'chart-analysis-container';

    var sections = [
      { title: '🏮 十二宫能量雷达图', content: renderRadarChart(chart) },
      { title: '📈 大限走势分析', content: renderDaXianLineChart(chart, bazi) },
      { title: '🪐 五行分布', content: renderElementPieChart(chart) },
      { title: '⚖️ 吉煞比例', content: renderJiXiongRing(chart) },
      { title: '🔥 星曜分布热力图', content: renderHeatmap(chart) }
    ];

    sections.forEach(function(sec) {
      var section = document.createElement('div');
      section.className = 'chart-analysis-section';

      var title = document.createElement('h4');
      title.className = 'chart-analysis-title';
      title.textContent = sec.title;
      section.appendChild(title);

      section.appendChild(sec.content);
      container.appendChild(section);
    });

    return container;
  }

  return {
    renderAll: renderAll,
    renderRadarChart: renderRadarChart,
    renderDaXianLineChart: renderDaXianLineChart,
    renderElementPieChart: renderElementPieChart,
    renderHeatmap: renderHeatmap,
    renderJiXiongRing: renderJiXiongRing
  };
})();
