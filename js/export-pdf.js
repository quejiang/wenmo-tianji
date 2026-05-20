/**
 * PDF 导出 — 将当前命盘导出为可打印报告
 * 使用浏览器 window.print() 生成 PDF
 */
var ExportPDF = (function() {
  'use strict';

  function exportChart() {
    var chart = window._currentChart;
    if (!chart) { alert('请先排盘再导出'); return; }

    var bazi = window._currentBazi || {};

    var popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) { alert('请允许弹出窗口以导出 PDF'); return; }

    var GAN = '甲乙丙丁戊己庚辛壬癸';
    var ZHI = '子丑寅卯辰巳午未申酉戌亥';
    var ZODIAC = '鼠牛虎兔龙蛇马羊猴鸡狗猪';

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>山医命相卜 · 命盘报告</title>';
    html += '<style>';
    html += 'body{font-family: "PingFang SC","Microsoft YaHei",sans-serif;background:#fff;color:#333;padding:30px;line-height:1.8}';
    html += 'h1{text-align:center;color:#8b4513;border-bottom:2px solid #8b4513;padding-bottom:10px}';
    html += 'h2{color:#8b4513;margin-top:24px}';
    html += 'table{width:100%;border-collapse:collapse;margin:12px 0}';
    html += 'th,td{border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:0.9em}';
    html += 'th{background:#f5e6d0}';
    html += '.footer{text-align:center;color:#999;margin-top:30px;font-size:0.8em}';
    html += '@media print{.page-break{page-break-before:always}}';
    html += '</style></head><body>';

    html += '<h1>山医命相卜 · 命盘报告</h1>';
    html += '<p style="text-align:center;color:#666">生成时间: ' + new Date().toLocaleString('zh-CN') + '</p>';

    // 基本信息
    html += '<h2>📋 基本信息</h2>';
    html += '<table><tr><th>项目</th><th>内容</th></tr>';
    html += '<tr><td>八字</td><td>' + GAN[bazi.yearGan||0]+ZHI[bazi.yearZhi||0]+' '+GAN[bazi.monthGan||0]+ZHI[bazi.monthZhi||0]+' '+GAN[bazi.dayGan||0]+ZHI[bazi.dayZhi||0]+' '+GAN[bazi.hourGan||0]+ZHI[bazi.hourZhi||0]+'</td></tr>';
    if (bazi.lunar) {
      html += '<tr><td>农历</td><td>' + bazi.lunar.lunarYear + '年' + bazi.lunar.lunarMonth + '月' + bazi.lunar.lunarDay + '日' + (bazi.lunar.isLeap ? '(闰月)' : '') + '</td></tr>';
    }
    html += '<tr><td>生肖</td><td>' + ZODIAC[(bazi.yearZhi||0)] + '</td></tr>';
    html += '<tr><td>纳音</td><td>' + (bazi.nayin||'') + '</td></tr>';
    html += '</table>';

    // 紫微宫位表格
    if (chart.palaces && chart.palaces.length > 0) {
      html += '<h2>🏮 十二宫位</h2>';
      html += '<table><tr><th>宫位</th><th>天干</th><th>地支</th><th>主星</th></tr>';
      var PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
      for (var i = 0; i < chart.palaces.length; i++) {
        var p = chart.palaces[i];
        var stars = (p.stars || []).slice(0, 2).map(function(s) { return s.name || ''; }).join('、');
        html += '<tr><td>' + PALACE_NAMES[i] + '</td><td>' + (p.gan || '') + '</td><td>' + (p.zhi || '') + '</td><td>' + stars + '</td></tr>';
      }
      html += '</table>';
    }

    html += '<div class="footer">山医命相卜 · 五术玄学 — 仅供娱乐参考，命理为概率之学</div>';
    html += '</body></html>';

    popup.document.write(html);
    popup.document.close();
    setTimeout(function() { popup.print(); }, 500);
  }

  return { exportChart: exportChart };
})();
