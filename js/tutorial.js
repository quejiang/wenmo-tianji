/**
 * 文墨天机 · 新手教程模块
 * 为完全不懂的小白提供通俗易懂的紫微斗数入门引导
 */

var Tutorial = (function() {
  'use strict';

  // ==================== 教程步骤定义 ====================
  var steps = [
    {
      id: 'welcome',
      title: '欢迎来到紫微斗数的世界 🌌',
      emoji: '🏮',
      content: [
        '<strong>紫微斗数</strong>是中国古代的一门命理学，已经有上千年的历史。',
        '简单来说，它就是根据你<mark>出生的年、月、日、时</mark>，排出一张"命盘"（就像一张人生的地图），然后通过分析这张图来了解你的<strong>性格、事业、财运、感情</strong>等各个方面。',
        '你可以把它理解为：<em>古代的大数据分析工具</em> 📊',
        '别担心，你不需要懂任何专业知识，跟着教程一步步来就好！'
      ]
    },
    {
      id: 'input',
      title: '第一步：输入你的出生信息 📝',
      emoji: '🎂',
      highlight: '.input-panel',
      content: [
        '在这个面板中，你需要填入4个信息：',
        '<strong>① 出生日期</strong>：公历（阳历）的年月日，比如 1990年6月15日',
        '<strong>② 出生时间</strong>：几点几分出生，越精确越好',
        '<strong>③ 性别</strong>：男或女（这会影响命盘的排法哦）',
        '<strong>④ 真太阳时</strong>：如果你知道出生地的经度可以勾选，小白可以先不管它',
        '填好之后点击<strong>"开始排盘"</strong>按钮，你的专属命盘就生成啦！'
      ]
    },
    {
      id: 'chart-basics',
      title: '第二步：看懂你的命盘 🗺️',
      emoji: '🔍',
      highlight: '.chart-container',
      content: [
        '命盘看起来像一个方形棋盘，分成<strong>12个格子</strong>，每个格子叫做一个<strong>"宫位"</strong>。',
        '中间的方块显示你的<strong>命宫</strong>（最重要的宫位，代表你自己）。',
        '红色边框的格子 = <span style="color:#ff8888">命宫</span>（代表你这个人）',
        '蓝色边框的格子 = <span style="color:#88bbff">身宫</span>（代表你的后半生重心）',
        '每个格子里面的文字就是<strong>"星曜"</strong>，不同星曜代表不同的能量和特质。',
        '💡 <strong>小技巧</strong>：点击任意星曜或宫位名称，会弹出百科解释哦！'
      ]
    },
    {
      id: 'palaces',
      title: '十二宫位：人生的十二个维度 🏠',
      emoji: '📐',
      content: [
        '12个宫位就像人生的12个房间，每个房间管不同的事情：',
        '<strong>🏠 命宫</strong> — 你自己（性格、长相、气质）',
        '<strong>👥 兄弟宫</strong> — 兄弟姐妹、亲近的朋友',
        '<strong>💕 夫妻宫</strong> — 配偶、感情婚姻',
        '<strong>👶 子女宫</strong> — 孩子、创造力、娱乐',
        '<strong>💰 财帛宫</strong> — 赚钱能力、花钱方式',
        '<strong>🏥 疾厄宫</strong> — 身体健康、疾病',
        '<strong>✈️ 迁移宫</strong> — 外出、旅行、外在形象',
        '<strong>🤝 交友宫</strong> — 朋友、同事、下属',
        '<strong>💼 官禄宫</strong> — 事业、工作、学业',
        '<strong>🏡 田宅宫</strong> — 房产、家庭环境',
        '<strong>🧘 福德宫</strong> — 精神享受、兴趣爱好',
        '<strong>👨‍👩‍👧 父母宫</strong> — 父母、长辈、上司'
      ]
    },
    {
      id: 'stars',
      title: '十四主星：你命盘中的主角 ⭐',
      emoji: '🌟',
      content: [
        '命盘中最重要的是<strong>14颗主星</strong>，它们就像是住在你命盘里的角色：',
        '<strong>紫微</strong> — 皇帝，天生的领导者，自尊心强',
        '<strong>天机</strong> — 军师，聪明灵活，善于策划',
        '<strong>太阳</strong> — 太阳，热情大方，乐于助人',
        '<strong>武曲</strong> — 将军，果断刚毅，善于理财',
        '<strong>天同</strong> — 小孩，温和善良，知足常乐',
        '<strong>廉贞</strong> — 检察官，认真执着，爱恨分明',
        '<strong>天府</strong> — 宰相，稳重包容，善于管理',
        '<strong>太阴</strong> — 月亮，温柔细腻，情感丰富',
        '<strong>贪狼</strong> — 交际花，多才多艺，魅力四射',
        '<strong>巨门</strong> — 律师，口才好，善于分析',
        '<strong>天相</strong> — 秘书，公正无私，善于辅助',
        '<strong>天梁</strong> — 长者，成熟稳重，乐于助人',
        '<strong>七杀</strong> — 将军，勇猛果断，独立自主',
        '<strong>破军</strong> — 改革者，敢于打破常规，创新求变'
      ]
    },
    {
      id: 'sihua',
      title: '四化：星星的能量变化 ✨',
      emoji: '🔀',
      content: [
        '四化就是给星星"变脸"，一共有4种变化：',
        '<strong>🟢 禄</strong> — 好运、增加、顺利（好事变多）',
        '<strong>🟠 权</strong> — 权力、掌控、主导（想要掌控）',
        '<strong>🔵 科</strong> — 名声、优雅、得人欣赏（被人喜欢）',
        '<strong>🟣 忌</strong> — 执着、收敛、需要注意（需要小心的方面）',
        '在命盘里，你会看到星曜旁边有彩色的小标记（禄权科忌），',
        '它们告诉你哪些星的能量被<strong>加强</strong>或<strong>改变</strong>了。',
        '💡 禄在哪，好运就在哪；忌在哪，需要注意的地方就在哪。'
      ]
    },
    {
      id: 'pan-modes',
      title: '盘面模式：三合盘 vs 飞星盘 vs 四化盘 🔄',
      emoji: '🎛️',
      highlight: '#ziweiModeBar',
      content: [
        '排盘完成后，命盘上方会出现<strong>三种盘面模式</strong>切换按钮：',
        '<strong>🔺 三合盘（默认）</strong>：最传统的紫微斗数盘面。以<mark>三方四正</mark>的关系来看各宫位的互动。适合初学者，展示的信息最全面。',
        '<strong>🔄 飞星盘</strong>：重点展示<mark>宫位之间的飞化关系</mark>（如命宫化禄入夫妻宫等）。适合有一定基础后做深度分析。飞星告诉你"能量往哪里流动"。',
        '<strong>✨ 四化盘</strong>：聚焦<mark>禄权科忌四化的分布</mark>，单独列出每一颗参与四化的星曜。适合快速定位人生中"好运（禄）"和"需要注意（忌）"的领域。',
        '💡 <strong>建议</strong>：新手先看三合盘了解全貌，熟练后再切换到飞星盘和四化盘深入研究。',
        '将鼠标悬停在这些按钮上也会弹出简短的解释哦~'
      ]
    },
    {
      id: 'liu-time',
      title: '时间层级：本命盘 → 大限 → 流年... 🕐',
      emoji: '⏳',
      highlight: '#liuTimeBar',
      content: [
        '命盘下方有<strong>六个时间层级</strong>按钮，让你看到不同时间段的运势变化：',
        '<strong>🔵 本命盘</strong>：你出生那一刻的原始命盘，是<mark>一生的"出厂设置"</mark>。所有分析的基础。',
        '<strong>🟢 大限</strong>：每十年为一个"大限"，比如20-29岁走「兄弟宫大限」。告诉你<mark>这十年的人生重心</mark>在哪个领域。',
        '<strong>🟡 流年</strong>：每年的运势盘。可以通过年份输入框切换不同年份。告诉你<mark>今年会发生什么</mark>，适合做年度规划。',
        '<strong>🟠 流月</strong>：每个月的运势，可以配合年月日输入框精确到某个月。',
        '<strong>🔴 流日</strong>：每天的运势，适合看近期具体日子的吉凶。',
        '<strong>🟣 流时</strong>：每两个小时的运势波动，最精细的时间颗粒。',
        '💡 <strong>怎么用</strong>：先看本命盘了解自己 → 再看大限知道当前十年重点 → 最后看流年把握今年方向。',
        '小技巧：点击<mark>"↻ 重置"</mark>可以一键回到当前时间的流年盘哦~'
      ]
    },
    {
      id: 'ai',
      title: 'AI智能解读：让分析更简单 🤖',
      emoji: '📊',
      highlight: '.detail-panel',
      content: [
        '如果你觉得看星曜太复杂，没关系！',
        '排盘完成后，页面下方会出现<strong>"命盘概要"</strong>面板，',
        '点击<strong>"🤖 AI 命盘解读"</strong>按钮，',
        '系统会自动为你生成个性化的命盘分析报告，包括：',
        '• 你的性格特点',
        '• 财运和事业方向',
        '• 感情婚姻建议',
        '• 健康注意事项',
        '这是最简单直接的方式，适合完全不懂命理的小白！'
      ]
    },
    {
      id: 'tips',
      title: '小白必备技巧 💡',
      emoji: '🎯',
      content: [
        '<strong>① 先看命宫</strong>：命宫是你自己，先从了解自己开始',
        '<strong>② 再看身宫</strong>：身宫代表你后半生的重心所在',
        '<strong>③ 关注四化</strong>：禄权科忌标记的星曜，是重点中的重点',
        '<strong>④ 善用百科</strong>：点击任何不懂的星曜或宫位名称，会弹出详细解释',
        '<strong>⑤ 使用AI解读</strong>：排盘后点"AI解读"按钮，自动生成报告',
        '<strong>⑥ 命理是参考</strong>：命盘展示的是"趋势"和"可能性"，不是绝对的命运。人生之路，仍在自己手中 ✨'
      ]
    }
  ];

  var currentStep = 0;
  var overlayEl = null;
  var isOpen = false;

  // ==================== 创建教程UI ====================

  function createOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'tutorial-overlay';
    overlayEl.id = 'tutorialOverlay';
    overlayEl.onclick = function(e) {
      if (e.target === overlayEl) close();
    };

    overlayEl.innerHTML =
      '<div class="tutorial-dialog" id="tutorialDialog">' +
        '<div class="tutorial-header">' +
          '<div class="tutorial-step-indicator" id="tutorialSteps"></div>' +
          '<button class="tutorial-close" onclick="Tutorial.close()">✕</button>' +
        '</div>' +
        '<div class="tutorial-body">' +
          '<div class="tutorial-emoji" id="tutorialEmoji"></div>' +
          '<h2 class="tutorial-title" id="tutorialTitle"></h2>' +
          '<div class="tutorial-content" id="tutorialContent"></div>' +
        '</div>' +
        '<div class="tutorial-footer">' +
          '<button class="tutorial-btn tutorial-btn-prev" id="tutorialPrev" onclick="Tutorial.prev()">◀ 上一步</button>' +
          '<span class="tutorial-progress" id="tutorialProgress"></span>' +
          '<button class="tutorial-btn tutorial-btn-next" id="tutorialNext" onclick="Tutorial.next()">下一步 ▶</button>' +
          '<button class="tutorial-btn tutorial-btn-finish" id="tutorialFinish" onclick="Tutorial.close()" style="display:none;">🎉 完成教程</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlayEl);
  }

  function renderStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[index];

    // 更新步骤指示器
    var stepsHtml = '';
    for (var i = 0; i < steps.length; i++) {
      var cls = i === index ? ' active' : (i < index ? ' done' : '');
      stepsHtml += '<span class="tutorial-dot' + cls + '" onclick="Tutorial.goTo(' + i + ')"></span>';
    }
    document.getElementById('tutorialSteps').innerHTML = stepsHtml;

    // 更新内容
    document.getElementById('tutorialEmoji').textContent = step.emoji;
    document.getElementById('tutorialTitle').textContent = step.title;
    document.getElementById('tutorialContent').innerHTML = step.content.join('');

    // 进度
    document.getElementById('tutorialProgress').textContent = (index + 1) + ' / ' + steps.length;

    // 按钮状态
    var prevBtn = document.getElementById('tutorialPrev');
    var nextBtn = document.getElementById('tutorialNext');
    var finishBtn = document.getElementById('tutorialFinish');

    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
    if (index === steps.length - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'inline-block';
      finishBtn.style.display = 'none';
    }

    // 高亮目标元素
    clearHighlight();
    if (step.highlight) {
      highlightElement(step.highlight);
    }

    // 输入步骤允许穿透点击（用户需要操作表单和"开始排盘"按钮）
    // 非输入步骤恢复拦截（防止误操作页面元素）
    if (overlayEl) {
      if (step.id === 'input') {
        overlayEl.style.pointerEvents = 'none';
        var dlg = document.getElementById('tutorialDialog');
        if (dlg) dlg.style.pointerEvents = 'auto';
      } else {
        overlayEl.style.pointerEvents = '';
        var dlg = document.getElementById('tutorialDialog');
        if (dlg) dlg.style.pointerEvents = '';
      }
    }

    // 滚动教程对话框到顶部
    var dialog = document.getElementById('tutorialDialog');
    if (dialog) dialog.scrollTop = 0;
  }

  function highlightElement(selector) {
    try {
      var el = document.querySelector(selector);
      if (!el) return;
      el.classList.add('tutorial-highlight');
      // 滚动到可见区域
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch(e) {}
  }

  function clearHighlight() {
    var els = document.querySelectorAll('.tutorial-highlight');
    els.forEach(function(el) { el.classList.remove('tutorial-highlight'); });
  }

  // ==================== 公共API ====================

  function open() {
    createOverlay();
    overlayEl.style.display = 'flex';
    isOpen = true;
    currentStep = 0;
    renderStep(0);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlayEl) overlayEl.style.display = 'none';
    isOpen = false;
    clearHighlight();
    document.body.style.overflow = '';
  }

  function next() {
    if (currentStep < steps.length - 1) {
      renderStep(currentStep + 1);
    }
  }

  function prev() {
    if (currentStep > 0) {
      renderStep(currentStep - 1);
    }
  }

  function goTo(index) {
    renderStep(index);
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function isTutorialOpen() {
    return isOpen;
  }

  function getCurrentStep() {
    return currentStep;
  }

  return {
    open: open,
    close: close,
    next: next,
    prev: prev,
    goTo: goTo,
    toggle: toggle,
    steps: steps,
    isOpen: isTutorialOpen,
    getCurrentStep: getCurrentStep
  };
})();
