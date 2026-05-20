/**
 * UserMode — 专业/非专业模式管理
 * 存储于 localStorage，控制星曜解释风格 & 功能显隐
 */
var UserMode = (function() {
  'use strict';

  var STORAGE_KEY = 'wm_mode';

  var _state = {
    level: '',        // 'professional' | 'non-professional'
    style: '',        // 'story' | 'daily' | 'psychology' (仅非专业)
    chosen: false
  };

  // ============ 解释风格定义 ============

  var STYLES = [
    { id: 'story',    name: '故事化',   icon: '📖', desc: '用引人入胜的故事讲解星曜含义，像读小说一样轻松', example: '紫微星就像一位威严的帝王，坐在命宫...' },
    { id: 'daily',    name: '生活化',   icon: '🏠', desc: '用日常场景和生活语言解释，贴近您的真实人生',       example: '紫微星在命宫，你天生就有领导范儿，朋友都听你的...' },
    { id: 'psychology', name: '心理化', icon: '🧠', desc: '从现代心理学视角解读，揭示内在人格与行为模式',     example: '紫微星代表自我实现需求，驱动你追求卓越...' }
  ];

  function isProfessional() { return _state.level === 'professional'; }

  function getLevel() { return _state.level; }
  function getStyle() { return _state.style; }
  function isChosen() { return _state.chosen; }

  // ============ 术语简化映射 ============

  var TERM_MAP = {
    '命宫': '代表你的本命宫',
    '兄弟宫': '兄弟姐妹/人际宫',
    '夫妻宫': '婚姻感情宫',
    '子女宫': '子女/创意宫',
    '财帛宫': '财富收入宫',
    '疾厄宫': '健康运势宫',
    '迁移宫': '出行/变化宫',
    '交友宫': '交友/下属宫',
    '官禄宫': '事业工作宫',
    '田宅宫': '房产家庭宫',
    '福德宫': '精神享受宫',
    '父母宫': '父母长辈宫',
    '命主': '本命守护星',
    '身主': '后天重心星',
    '五行局': '五行属性',
    '四化': '能量转化',
    '禄': '好运增益',
    '权': '掌控力量',
    '科': '学识名声',
    '忌': '需注意的挑战',
    '三方四正': '相关联的宫位',
    '对宫': '正对面的宫位',
    '庙旺': '能量最强',
    '陷落': '能量偏弱',
    '大限': '十年大运',
    '流年': '当年运势',
    '飞星': '星曜能量流动',
    '三合': '三方组合盘',
    '禄存': '财运星',
    '擎羊': '冲劲星',
    '陀罗': '拖延星',
    '火星': '爆发星',
    '铃星': '暗涌星',
    '地劫': '波折星',
    '地空': '幻想星',
    '天魁': '贵人星',
    '天钺': '贵人星',
    '文昌': '文才星',
    '文曲': '才艺星',
    '左辅': '帮手星',
    '右弼': '帮手星'
  };

  /**
   * 简化星曜详情（非专业模式）
   */
  function simplifyText(text, style) {
    if (!text) return text;

    var result = text;

    // 如果故事化或生活化，替换术语并加口语化
    if (style === 'story' || style === 'daily') {
      for (var term in TERM_MAP) {
        var re = new RegExp(term, 'g');
        // 只在第一次出现时替换带说明
        result = result.replace(re, function(match, offset) {
          // 如果是行首或者逗号句号后第一次出现，替换为带解释的形式
          return '<abbr title="' + TERM_MAP[term] + '">' + match + '</abbr>';
        });
      }
    }

    return result;
  }

  /**
   * 根据模式获取星曜解读
   */
  function getStarReading(starName, encyclopediaInfo) {
    if (!encyclopediaInfo) return null;

    if (_state.level === 'professional') {
      return encyclopediaInfo.detail || '';
    }

    // 非专业模式：基于风格返回不同解读
    var style = _state.style || 'daily';

    // 优先使用 encyclopedia 的 simplified 字段
    if (style === 'story' && encyclopediaInfo.storyTelling) {
      return simplifyText(encyclopediaInfo.storyTelling, style);
    }
    if (style === 'psychology' && encyclopediaInfo.psychology) {
      return simplifyText(encyclopediaInfo.psychology, style);
    }
    if (encyclopediaInfo.simplified) {
      return simplifyText(encyclopediaInfo.simplified, style);
    }

    // fallback: 简化原始 detail
    return simplifyText(encyclopediaInfo.detail || '', style);
  }

  /**
   * 根据模式决定是否显示高级功能
   */
  function showAdvancedFeatures() {
    return _state.level === 'professional';
  }

  // ============ 持久化 ============

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.level) _state.level = parsed.level;
        if (parsed.style) _state.style = parsed.style;
        _state.chosen = true;
      }
    } catch(e) {}
  }

  function setLevel(level) {
    _state.level = level;
    if (level === 'professional') _state.style = '';
    _state.chosen = true;
    save();
  }

  function setStyle(style) {
    _state.style = style;
    save();
  }

  function reset() {
    _state = { level: '', style: '', chosen: false };
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  }

  // ============ 欢迎弹窗 ============

  function showWelcomeModal() {
    if (_state.chosen) return;

    var overlay = document.createElement('div');
    overlay.id = 'modeWelcomeOverlay';
    overlay.className = 'mode-welcome-overlay';
    overlay.innerHTML = getWelcomeHTML();
    document.body.appendChild(overlay);

    // 绑定事件
    setTimeout(function() {
      overlay.style.opacity = '1';
    }, 50);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    // 按 Escape 关闭
    var escHandler = function(e) { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
  }

  function getWelcomeHTML() {
    var html = '';
    html += '<div class="mode-welcome-box" id="modeWelcomeBox">';
    html += '<h2 class="mode-welcome-title">✨ 欢迎使用山医命相卜</h2>';
    html += '<p class="mode-welcome-sub">请选择适合您的使用模式</p>';

    // 步骤1：选择专业/非专业
    html += '<div class="mode-choice-row" id="modeChoiceRow">';
    html += '<div class="mode-card mode-card-pro" onclick="UserMode.selectProMode()">';
    html += '<div class="mode-card-icon">🔬</div>';
    html += '<h3>专业模式</h3>';
    html += '<p>完整技术术语<br>深度命理解读<br>适合命理研究者</p>';
    html += '</div>';
    html += '<div class="mode-card mode-card-nonpro" onclick="UserMode.selectNonProMode()">';
    html += '<div class="mode-card-icon">🌟</div>';
    html += '<h3>大众模式</h3>';
    html += '<p>通俗易懂解说<br>生活化解读<br>适合易经爱好者</p>';
    html += '</div>';
    html += '</div>';

    // 步骤2：选择解释风格（默认隐藏）
    html += '<div class="mode-choice-row" id="modeStyleRow" style="display:none;">';
    html += '<h3 class="mode-style-title">🎨 请选择您喜欢的解读风格</h3>';
    html += '<p class="mode-style-sub">不同风格用不同方式帮你理解命理知识</p>';
    STYLES.forEach(function(s) {
      html += '<div class="mode-style-card" onclick="UserMode.selectStyle(\'' + s.id + '\')">';
      html += '<div class="mode-style-icon">' + s.icon + '</div>';
      html += '<div class="mode-style-info">';
      html += '<h4>' + s.name + '</h4>';
      html += '<p>' + s.desc + '</p>';
      html += '<p class="mode-style-example">💬 ' + s.example + '</p>';
      html += '</div>';
      html += '</div>';
    });
    html += '<button class="btn btn-sm mode-back-btn" onclick="UserMode.backToModeChoice()" style="margin-top:12px;">← 返回重新选择</button>';
    html += '</div>';

    html += '<p class="mode-footer-hint">可随时在页面右上角切换模式</p>';
    html += '</div>';

    return html;
  }

  function selectProMode() {
    setLevel('professional');
    closeModal();
    document.body.classList.remove('mode-nonpro');
    if (typeof updateModeButton === 'function') updateModeButton();
    if (typeof switchMingTab === 'function') {
      switchMingTab('ziwei');
    }
  }

  function selectNonProMode() {
    document.getElementById('modeChoiceRow').style.display = 'none';
    document.getElementById('modeStyleRow').style.display = 'block';
    var box = document.getElementById('modeWelcomeBox');
    if (box) box.classList.add('mode-welcome-box-wide');
  }

  function selectStyle(styleId) {
    setLevel('non-professional');
    setStyle(styleId);
    closeModal();
    document.body.classList.add('mode-nonpro');
    if (typeof updateModeButton === 'function') updateModeButton();
    if (typeof switchMingTab === 'function') {
      switchMingTab('ziwei');
    }
  }

  function backToModeChoice() {
    document.getElementById('modeStyleRow').style.display = 'none';
    document.getElementById('modeChoiceRow').style.display = 'flex';
    var box = document.getElementById('modeWelcomeBox');
    if (box) box.classList.remove('mode-welcome-box-wide');
  }

  function closeModal() {
    var overlay = document.getElementById('modeWelcomeOverlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
  }

  function toggleMode() {
    if (!_state.chosen) { showWelcomeModal(); return; }
    reset();
    document.body.classList.remove('mode-nonpro');
    if (typeof updateModeButton === 'function') updateModeButton();
    showWelcomeModal();
  }

  // ============ 初始化 ============

  function init() {
    load();
    if (!_state.chosen) {
      // 延迟显示，确保DOM就绪
      setTimeout(showWelcomeModal, 500);
    }
  }

  return {
    init: init,
    isProfessional: isProfessional,
    getLevel: getLevel,
    getStyle: getStyle,
    isChosen: isChosen,
    getStarReading: getStarReading,
    showAdvancedFeatures: showAdvancedFeatures,
    selectProMode: selectProMode,
    selectNonProMode: selectNonProMode,
    selectStyle: selectStyle,
    backToModeChoice: backToModeChoice,
    toggleMode: toggleMode,
    reset: reset,
    STYLES: STYLES,
    simplifyText: simplifyText
  };

})();
