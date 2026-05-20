/**
 * 山医命相卜 — 功能全览 & 使用指南
 *
 * 两个入口：
 *   1. 点击"📋 功能全览" → 打开功能目录（面向探索）
 *   2. 点击"❓"         → 打开使用指南（面向操作流程）
 */

var HELP_SECTIONS = [
  {
    id: 'quickstart',
    icon: '🚀',
    title: '快速上手（3 步排盘）',
    content: [
      { subtitle: '第 1 步：输入出生信息',
        text: '在「命」面板中填写：<br>'
          + '• <b>出生日期</b> — 点击日期选择器，或切换到「农历」标签输入农历<br>'
          + '• <b>出生时辰</b> — 选择小时（0-23）和分钟<br>'
          + '• <b>性别</b> — 男/女，决定大限顺逆行<br>'
          + '• <b>流派</b> — 中州派（默认）/ 钦天派 / 飞星派，影响四化规则' },
      { subtitle: '第 2 步：可选设置',
        text: '• <b>真太阳时</b> — 勾选后自动显示省市县选择器，根据出生地经度修正时辰<br>'
          + '• 夏令时提醒会在 1986-1991 年间自动弹出' },
      { subtitle: '第 3 步：点击"开始排盘"',
        text: '排盘后你将看到：<br>'
          + '• <b>命盘 12 宫格</b> — 命宫/身宫高亮，点击星曜查看百科<br>'
          + '• <b>八字柱条</b> — 年/月/日/时四柱 + 藏干<br>'
          + '• <b>小限面板</b> — 命盘下方，输入虚岁查看当年小限 12 宫分布<br>'
          + '• <b>详细面板</b> — 格局、四化、身宫、来因宫等' }
    ]
  },
  {
    id: 'wushu-tabs',
    icon: '🏷️',
    title: '五大功能面板（山医命相卜）',
    content: [
      { subtitle: '⛰️ 山 — 风水堪舆',
        text: '• <b>择日</b>：根据八字选吉日<br>• <b>罗盘</b>：电子罗盘工具' },
      { subtitle: '⚕️ 医 — 养生调理',
        text: '• 中医体质分析与养生建议' },
      { subtitle: '⭐ 命 — 命理排盘（核心）',
        text: '包含三个子标签：<br>'
          + '• <b>紫微斗数</b> — 12 宫命盘 + 大限 + 流年/流月/流日/流时<br>'
          + '• <b>八字</b> — 四柱排盘 + 十神 + 用神 + 大运 + 流年<br>'
          + '• <b>西洋星盘</b> — 12 星座 + 宫位 + 相位' },
      { subtitle: '🔮 相 — 相术',
        text: '• <b>姓名学</b>：三才五格 + 五行分析' },
      { subtitle: '🎲 卜 — 占卜',
        text: '• <b>奇门遁甲</b>：时家转盘奇门<br>'
          + '• <b>六爻起卦</b>：手动摇卦 + 自动起卦<br>'
          + '• <b>梅花易数</b>：数字/时间/物象起卦<br>'
          + '• <b>塔罗骰子</b>：在线占卜<br>'
          + '• <b>小六壬</b>：掌诀推算<br>'
          + '• <b>每日运势</b>：日柱运势' }
    ]
  },
  {
    id: 'schools',
    icon: '🎓',
    title: '多流派支持（新增）',
    content: [
      { subtitle: '如何切换流派？',
        text: '在「命」面板的排盘表单中，找到<b>「流派」</b>下拉框（性别下方），选择：<br>'
          + '• <b>中州派</b>（默认）— 王亭之先生所传，四化以年干为主<br>'
          + '• <b>钦天派</b> — 强调飞宫四化，宫干自化与对宫向心化<br>'
          + '• <b>飞星派</b> — 梁若瑜先生所传，宫星四化三位一体' },
      { subtitle: '切换后有什么变化？',
        text: '切换流派后，点击「开始排盘」即可用新流派的规则重新生成命盘。' }
    ]
  },
  {
    id: 'timeline',
    icon: '🕐',
    title: '小限 / 流年 / 流分（新增）',
    content: [
      { subtitle: '在哪里查看？',
        text: '排盘完成后，命盘 12 宫格下方会自动出现<b>「小限 · 流年 · 流分」</b>面板。' },
      { subtitle: '如何使用？',
        text: '• 面板中的<b>虚岁输入框</b>默认为 25 岁，修改数字后实时刷新<br>'
          + '• 每一行显示：<b>宫位名称 → 地支 → 该宫主星</b><br>'
          + '• 小限命宫位置高亮显示' },
      { subtitle: '什么是小限？',
        text: '小限是紫微斗数中代表当年运势的命宫位置。男顺女逆，从戌宫起生年，每过一年移一位。' }
    ]
  },
  {
    id: 'cases',
    icon: '💾',
    title: '命例库管理（增强）',
    content: [
      { subtitle: '保存命例',
        text: '排盘后点击<b>「保存命例」</b>按钮 → 输入名称和标签 → 保存。' },
      { subtitle: '打开命例库',
        text: '右下角浮动按钮 <b>📋</b>，或命面板底部"命例库"区域。' },
      { subtitle: '搜索命例（新增）',
        text: '命例库面板顶部的<b>搜索框</b>，可按名称、日期、八字、标签实时过滤。' },
      { subtitle: '标签筛选',
        text: '点击命例库中的标签即可筛选该分类。' },
      { subtitle: '导入/导出（新增）',
        text: '命例库面板右上角：<br>'
          + '• <b>📤 导出</b> — 将所有命例下载为 JSON 文件备份<br>'
          + '• <b>📥 导入</b> — 选择之前导出的 JSON 文件恢复命例<br>'
          + '重复的命例自动跳过，不会覆盖已有数据。' },
      { subtitle: '删除命例',
        text: '每条命例右下角有 🗑 删除按钮。' }
    ]
  },
  {
    id: 'synastry',
    icon: '💞',
    title: '合盘 & 八字合婚（增强）',
    content: [
      { subtitle: '紫微合盘',
        text: '保存至少两条命例后，在命例库中选择两条进行合盘分析。<br>'
          + '评分维度：命宫主星五行 / 夫妻宫和谐度 / 四化互动 / 地支合度 / 命主星互动 / 身宫和谐度。<br>'
          + '满分 100 分，≥80 为"天作之合"。' },
      { subtitle: '八字合婚（新增）',
        text: '基于双方八字六维度评分：<br>'
          + '• <b>日柱天干五合</b>（30 分）— 甲己/乙庚/丙辛/丁壬/戊癸合<br>'
          + '• <b>日支六合/三合</b>（20 分）— 子丑/寅亥/卯戌/辰酉/巳申/午未合<br>'
          + '• <b>年柱纳音</b>（15 分）— 纳音五行相生<br>'
          + '• <b>月柱五行互补</b>（15 分）<br>'
          + '• <b>生肖匹配</b>（10 分）<br>'
          + '• <b>命宫互动</b>（10 分）' }
    ]
  },
  {
    id: 'more',
    icon: '🔧',
    title: '更多实用功能',
    content: [
      { subtitle: '三方四正（新增）',
        text: '点击任意宫格，自动高亮其<b>三方</b>（三合宫）和<b>四正</b>（对宫），并显示暗合宫位。<br>'
          + '三方：每宫与其他两宫相隔 4 位形成三合局（如申子辰、寅午戌）<br>'
          + '对宫：与本宫相隔 6 位（如命宫↔迁移宫）<br>'
          + '暗合：地支六合关系' },
      { subtitle: '四化飞星图（新增）',
        text: '排盘后点击<b>「🔗 四化飞星图」</b>按钮，在命盘下方弹窗中查看四化分布图。<br>'
          + '绿色=禄（机遇），橙色=权（掌控），蓝色=科（文采），红色=忌（障碍）' },
      { subtitle: '八字十神表（新增）',
        text: '排盘后命盘下方显示完整<b>八字十神表</b>：年/月/日/时四柱天干、地支、十神、藏干。<br>'
          + '同时展示<b>用神分析</b>（喜用神/忌神/调候）和<b>五行强弱图</b>。' },
      { subtitle: '截图导出（新增）',
        text: '排盘后点击<b>「📸 截图导出」</b>按钮，将命盘保存为 PNG 图片分享给好友。' },
      { subtitle: '导出 PDF',
        text: '排盘后可将命盘导出为 PDF 文件保存或打印。' },
      { subtitle: '复制到剪贴板',
        text: '将命盘结构化文本复制到剪贴板，可直接粘贴到 ChatGPT/Claude 等 AI 中分析。' },
      { subtitle: 'AI 分析',
        text: '内置 AI 对话面板，配置 API Key 后可用 AI 解读命盘。' },
      { subtitle: '简繁切换',
        text: '顶部「繁」按钮一键切换简体/繁体中文。' },
      { subtitle: '专业/大众模式',
        text: '顶部「🔬」按钮切换：专业模式显示完整术语，大众模式简化描述。' },
      { subtitle: '星曜百科',
        text: '点击命盘中任意星曜，弹出详细百科介绍。' },
      { subtitle: '新手教程',
        text: '顶部「🎓 新手教程」按钮，引导式学习排盘流程。' },
      { subtitle: 'PWA 离线支持',
        text: '首次访问后数据缓存到本地，断网也能使用。' },
      { subtitle: '当前时间',
        text: '点击排盘表单中的「当前时间」按钮快速填充当前日期和时间。' }
    ]
  },
  {
    id: 'local-ai',
    icon: '🤖',
    title: '本地 AI 大模型（新增 · 完全离线）',
    content: [
      { subtitle: '如何使用？',
        text: '点击顶部 <b>「🤖 AI」</b>按钮，在右侧面板中：<br>'
          + '1. 选择模型（推荐 Llama 3.2 1B，约 1GB）<br>'
          + '2. 点击「加载模型」，首次需下载 1-5 分钟，后续秒开<br>'
          + '3. 在输入框输入问题，按 Enter 发送' },
      { subtitle: '支持哪些模型？',
        text: '• Llama 3.2 1B/3B（Meta）<br>'
          + '• SmolLM2 1.7B（HuggingFace）<br>'
          + '• Gemma 2 2B（Google）<br>'
          + '• Phi 3.5 Mini（Microsoft）<br>'
          + '• Qwen2 1.5B（通义千问）' },
      { subtitle: '如何让 AI 学习书籍？',
        text: '1. 准备 .txt / .pdf / .epub 格式的命理书籍<br>'
          + '2. 在 AI 面板点击「📤 上传文档」<br>'
          + '3. 系统自动分块索引，完成后即可提问书中内容' },
      { subtitle: '完全离线 · 无需 API',
        text: '所有推理和数据均在浏览器本地完成，不会上传到任何服务器。' },
      { subtitle: '浏览器要求',
        text: '需要 <b>Chrome 113+</b> 或 <b>Edge 113+</b>（需支持 WebGPU）。<br>'
          + 'Safari / Firefox 目前不支持 WebLLM。' },
      { subtitle: '关于视频学习',
        text: '浏览器端不支持视频/音频的 AI 学习（需 ASR 语音识别 + 视觉模型，计算量和模型尺寸远超浏览器承载能力）。<br>'
          + '建议将视频内容整理为文字文档后上传。' }
    ]
  },
  {
    id: 'tech',
    icon: '⚙️',
    title: '技术特性',
    content: [
      { subtitle: '节气算法：Meeus 天文公式 + 牛顿迭代',
        text: '太阳视黄经计算误差 < 1 分钟，远超传统线性近似。' },
      { subtitle: '真太阳时',
        text: '根据出生地经度修正时辰，120°E 以东加时、以西减时。' },
      { subtitle: '农历支持',
        text: '支持 1900-2100 年农历 ↔ 公历互转，含闰月处理。' },
      { subtitle: '错误边界',
        text: '任何 JS 报错不再白屏，弹出友好提示 + 刷新按钮。' },
      { subtitle: '懒加载',
        text: '非核心模块延迟加载，首屏仅加载排盘核心（lunar + ziwei），秒开。' }
    ]
  }
];

function openFeatureOverview() { openGuide('features'); }
function openHelpGuide()      { openGuide('help'); }

function openGuide(mode) {
  var overlay = document.getElementById('featureOverlay');
  var titleEl = document.getElementById('featureOverlayTitle');
  var bodyEl  = document.getElementById('featureBody');

  titleEl.textContent = mode === 'help' ? '❓ 使用指南 · 从入门到精通' : '📋 功能全览';

  var html = '';

  if (mode === 'help') {
    // 使用指南模式 — 按操作流程组织
    html += '<div class="guide-intro">';
    html += '<p>欢迎使用 <b>山医命相卜</b>！以下按操作流程介绍所有功能，帮你快速上手。</p>';
    html += '<p style="color:#8bc34a;font-size:13px">💡 提示：任何时候点击右上角 <b>❓</b> 按钮即可回到本指南。</p>';
    html += '</div>';
  }

  // 渲染所有 section
  HELP_SECTIONS.forEach(function(s, i) {
    var isOpen = i < 2; // 前两个默认展开
    html += '<div class="guide-section' + (isOpen ? ' open' : '') + '">';
    html += '<div class="guide-section-header" onclick="this.parentElement.classList.toggle(\'open\')">';
    html += '<span class="guide-section-icon">' + s.icon + '</span>';
    html += '<span class="guide-section-title">' + s.title + '</span>';
    html += '<span class="guide-section-arrow">▼</span>';
    html += '</div>';
    html += '<div class="guide-section-body">';
    s.content.forEach(function(c) {
      html += '<div class="guide-item">';
      if (c.subtitle) {
        html += '<div class="guide-item-subtitle">' + c.subtitle + '</div>';
      }
      html += '<div class="guide-item-text">' + c.text + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  });

  bodyEl.innerHTML = html;
  overlay.style.display = 'flex';
}

function closeFeatureOverview() {
  document.getElementById('featureOverlay').style.display = 'none';
}
