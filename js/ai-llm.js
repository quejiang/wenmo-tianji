/**
 * 文墨天机 · AI 大模型集成引擎
 * 支持: DeepSeek / OpenAI / 通义千问
 * 功能: 结构化命盘导出 + LLM 对话解盘
 */

var AILLM = (function() {
  'use strict';

  // ==================== 配置 ====================
  var DEFAULT_API_CONFIG = {
    provider: 'deepseek',  // deepseek | openai | qwen
    apiKey: '',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    temperature: 0.7,
    maxTokens: 4096
  };

  var PROVIDER_PRESETS = {
    deepseek: { model: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1' },
    openai: { model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
    qwen: { model: 'qwen-turbo', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' }
  };

  var currentConfig = null;
  var conversationHistory = [];

  // ==================== 配置管理 ====================
  function loadConfig() {
    try {
      var saved = localStorage.getItem('ai_llm_config');
      if (saved) {
        currentConfig = JSON.parse(saved);
      } else {
        currentConfig = Object.assign({}, DEFAULT_API_CONFIG);
      }
    } catch (e) {
      currentConfig = Object.assign({}, DEFAULT_API_CONFIG);
    }
    return currentConfig;
  }

  function saveConfig(config) {
    currentConfig = Object.assign({}, config);
    localStorage.setItem('ai_llm_config', JSON.stringify(currentConfig));
  }

  function getConfig() {
    if (!currentConfig) loadConfig();
    return currentConfig;
  }

  // ==================== 结构化命盘导出 ====================
  function exportStructuredChart(chart, bazi, includeFlow) {
    var GAN = '甲乙丙丁戊己庚辛壬癸';
    var ZHI = '子丑寅卯辰巳午未申酉戌亥';
    var ZODIAC = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
    var lines = [];

    lines.push('# 紫微斗数命盘 - 结构化分析数据');
    lines.push('');

    // 基本信息
    lines.push('## 基本信息');
    lines.push('- 八字: ' + GAN[bazi.year.ganIndex] + ZHI[bazi.year.zhiIndex] + ' '
      + GAN[bazi.month.ganIndex] + ZHI[bazi.month.zhiIndex] + ' '
      + GAN[bazi.day.ganIndex] + ZHI[bazi.day.zhiIndex] + ' '
      + GAN[bazi.hour.ganIndex] + ZHI[bazi.hour.zhiIndex]);
    lines.push('- 农历: ' + (bazi.lunar ? bazi.lunar.lunarYear + '年' + bazi.lunar.lunarMonth + '月' + bazi.lunar.lunarDay + '日' : ''));
    lines.push('- 生肖: ' + ZODIAC[bazi.year.zhiIndex]);
    lines.push('- 性别: ' + (bazi.gender === 'male' ? '男' : '女'));
    lines.push('- 五行局: ' + chart.bureauName);
    lines.push('- 命主: ' + chart.mingZhu + ' / 身主: ' + chart.shenZhu);
    lines.push('');

    // 十二宫
    lines.push('## 十二宫位详情');
    chart.palaces.forEach(function(p) {
      var flag = [];
      if (p.zhiIndex === chart.mingGong.zhiIndex) flag.push('命宫');
      if (p.isShenGong) flag.push('身宫');
      if (p.zhiIndex === chart.laiyinZhi) flag.push('来因宫');
      var flagStr = flag.length > 0 ? ' [' + flag.join('|') + ']' : '';

      lines.push('### ' + p.name + '宫 — ' + p.ganZhi + flagStr);

      // 主星（带亮度）
      p.stars.forEach(function(s) {
        lines.push('- 主星: ' + s.name + '（' + (s.brightness || '得') + '）');
        // 四化标记
        (p.sihua || []).forEach(function(sh) {
          if (sh.starName === s.name) {
            var src = sh.source === '生年' ? '年干四化' : (sh.source === '离心' ? '离心自化↓' : '向心自化↑');
            lines.push('  - ' + src + ': ' + sh.type);
          }
        });
      });

      // 辅星
      var auxNames = p.auxStars.map(function(s) { return s.name; });
      if (auxNames.length > 0) {
        lines.push('- 辅星: ' + auxNames.join('、'));
      }

      // 小星
      if (p.minorStars && p.minorStars.length > 0) {
        var minorNames = p.minorStars.map(function(s) { return s.name; });
        lines.push('- 小星: ' + minorNames.join('、'));
      }

      // 神煞
      if (p.shenSha) {
        var shaParts = [];
        if (p.shenSha.changSheng) shaParts.push('长生:' + p.shenSha.changSheng);
        if (p.shenSha.suiQian) shaParts.push(p.shenSha.suiQian);
        if (p.shenSha.jiangQian) shaParts.push(p.shenSha.jiangQian);
        if (p.shenSha.taiSui) shaParts.push(p.shenSha.taiSui);
        if (shaParts.length > 0) lines.push('- 神煞: ' + shaParts.join(' · '));
      }

      // 大限
      if (p.daXian) {
        lines.push('- 大限: ' + p.daXian.startAge + '~' + p.daXian.endAge + '岁');
      }
      lines.push('');
    });

    // 生年四化
    lines.push('## 生年四化');
    lines.push('- 禄: ' + getSiHuaStarName(chart.sihua.lu, chart));
    lines.push('- 权: ' + getSiHuaStarName(chart.sihua.quan, chart));
    lines.push('- 科: ' + getSiHuaStarName(chart.sihua.ke, chart));
    lines.push('- 忌: ' + getSiHuaStarName(chart.sihua.ji, chart));
    lines.push('');

    // 特殊格局
    if (typeof ZiweiPatterns !== 'undefined') {
      var patterns = ZiweiPatterns.detectAll(chart);
      if (patterns && patterns.length > 0) {
        lines.push('## 检测到的特殊格局');
        patterns.forEach(function(p) {
          lines.push('- ' + p.name + '（' + p.category + '）: ' + p.desc);
        });
        lines.push('');
      }
    }

    // 宫位评分
    if (typeof scorePalaces === 'function') {
      var scores = scorePalaces(chart);
      lines.push('## 宫位能量评分（0-100）');
      scores.forEach(function(s) {
        var bar = '';
        for (var i = 0; i < Math.round(s.score / 5); i++) bar += '█';
        lines.push('- ' + s.name + ': ' + bar + ' ' + s.score + '分');
      });
      lines.push('');
    }

    // 流年（可选）
    if (includeFlow && includeFlow.palaces) {
      lines.push('## ' + (includeFlow.year || '') + '年流年盘');
      includeFlow.palaces.forEach(function(p) {
        lines.push('- ' + p.name + '宫: ' + p.ganZhi);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  function getSiHuaStarName(key, chart) {
    if (STAR_NAMES && STAR_NAMES[key]) return STAR_NAMES[key];
    if (AUX_STAR_NAMES && AUX_STAR_NAMES[key]) return AUX_STAR_NAMES[key];
    return key;
  }

  // ==================== LLM 调用 ====================
  function buildSystemPrompt() {
    return '你是一位精通紫微斗数的命理师，拥有30年实战经验。你擅长三合派、飞星派和钦天派的分析方法。\n'
      + '请基于用户提供的紫微斗数命盘数据，进行专业、深入、有洞察力的分析。\n'
      + '要求：\n'
      + '1. 使用专业术语但解释清楚含义\n'
      + '2. 分析要具体，不要泛泛而谈\n'
      + '3. 结合星曜亮度、三方四正、四化飞星进行综合判断\n'
      + '4. 给出切实可行的人生建议\n'
      + '5. 用中文回答，语气温和专业';
  }

  function buildChatMessages(chartText, userQuestion) {
    var messages = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: '以下是我的紫微斗数命盘数据，请先理解：\n\n' + chartText }
    ];

    // 恢复对话历史（最近10轮）
    var recentHistory = conversationHistory.slice(-20);
    messages = messages.concat(recentHistory);

    if (userQuestion) {
      messages.push({ role: 'user', content: userQuestion });
    } else {
      messages.push({ role: 'user', content: '请给我一份全面的命盘解读，包括性格特质、事业财运、感情婚姻、健康状况以及重要的人生建议。' });
    }

    return messages;
  }

  function callLLM(chartText, userQuestion, onChunk, onDone, onError) {
    var config = getConfig();
    if (!config.apiKey) {
      onError('请先配置 API Key。点击下方的「API 设置」按钮进行配置。');
      return;
    }

    var messages = buildChatMessages(chartText, userQuestion);
    var url = config.baseUrl.replace(/\/$/, '') + '/chat/completions';

    var body = {
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify(body)
    })
    .then(function(resp) { return callAndTranslateError(resp); })
    .then(function(data) {
      var reply = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : '（未获取到回复）';

      // 保存对话历史
      if (userQuestion) {
        conversationHistory.push({ role: 'user', content: userQuestion });
      }
      conversationHistory.push({ role: 'assistant', content: reply });

      if (onChunk) onChunk(reply);
      if (onDone) onDone(reply);
    })
    .catch(function(err) {
      onError(err.message);
    });
  }

  // ==================== 错误翻译 ====================
  function translateError(status, message) {
    // 将原始错误转成用户能看懂的中文
    var raw = (message || '').toLowerCase();

    if (status === 402 || raw.indexOf('insufficient') !== -1 || raw.indexOf('balance') !== -1) {
      return '账户余额不足，请充值后再使用。\n\n' +
        '👉 DeepSeek 用户：访问 platform.deepseek.com → 充值中心\n' +
        '👉 通义千问用户：访问 dashscope.aliyun.com → 账户充值\n' +
        '👉 OpenAI 用户：访问 platform.openai.com → Billing';
    }
    if (status === 401 || raw.indexOf('invalid api key') !== -1 || raw.indexOf('incorrect api key') !== -1) {
      return 'API Key 无效或已过期。请检查 Key 是否正确，或重新生成一个。';
    }
    if (status === 403 || raw.indexOf('access denied') !== -1 || raw.indexOf('not allowed') !== -1) {
      return 'API Key 没有权限访问该模型。请检查：\n' +
        '① API Key 是否已开通此模型\n' +
        '② Base URL 是否与供应商匹配\n' +
        '③ 模型名称是否正确';
    }
    if (status === 429 || raw.indexOf('rate limit') !== -1) {
      return '请求太频繁，请稍等片刻再试。';
    }
    if (status === 503 || status === 502) {
      return 'AI 服务暂时不可用，请稍后重试。';
    }
    // 兜底
    return 'HTTP ' + status + (message ? ': ' + message : '');
  }

  function callAndTranslateError(resp) {
    if (!resp.ok) {
      return resp.json().then(function(err) {
        var msg = err.error ? err.error.message : '';
        throw new Error(translateError(resp.status, msg));
      }).catch(function(e) {
        // 如果 JSON 解析失败，直接用状态码
        if (e.message && e.message.indexOf('HTTP ') !== 0) throw e;
        throw new Error(translateError(resp.status, ''));
      });
    }
    return Promise.resolve(resp);
  }

  // ==================== API 连接测试 ====================
  function testConnection(config, onSuccess, onError) {
    var url = config.baseUrl.replace(/\/$/, '') + '/chat/completions';
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: '你好，请回复"连接成功"这两个字。' }],
        max_tokens: 20
      })
    })
    .then(function(resp) { return callAndTranslateError(resp); })
    .then(function() { onSuccess(); })
    .catch(function(err) { onError(err.message); });
  }

  // ==================== 对话管理 ====================
  function clearHistory() {
    conversationHistory = [];
  }

  function getHistory() {
    return conversationHistory;
  }

  // ==================== 快捷问题生成 ====================
  function getQuickQuestions() {
    return [
      { label: '💰 财运分析', question: '请详细分析我的财运，包括正财偏财、适合的行业、理财建议以及需要注意的财务风险。' },
      { label: '💼 事业发展', question: '请分析我的事业发展方向，适合什么样的职业和行业，何时是事业上升期，需要注意什么。' },
      { label: '💕 婚姻感情', question: '请分析我的婚姻感情运势，配偶特征，何时婚缘较旺，婚姻中需要注意什么。' },
      { label: '🏥 健康运势', question: '请分析我的健康状况，先天体质弱点，容易出现的健康问题，以及养生建议。' },
      { label: '🧠 性格深度', question: '请深入分析我的性格特质，优势与短板，以及如何在人生中扬长避短。' },
      { label: '🌟 格局解读', question: '请解读我命盘中的特殊格局，这些格局会给我的人生带来什么影响。' },
      { label: '⏳ 大限走势', question: '请分析我的大限走势，每个十年大运的吉凶重点，以及如何把握机遇、规避风险。' },
      { label: '🔗 人际关系', question: '请分析我的交友宫和兄弟宫，看看我的人际关系和贵人运如何。' }
    ];
  }

  // ==================== UI 渲染 ====================
  function renderConfigPanel() {
    var config = getConfig();
    var presets = PROVIDER_PRESETS;

    var html = '<div class="ai-config-panel">';
    html += '<h3>🤖 AI 模型配置</h3>';

    // 供应商选择
    html += '<div class="ai-config-row"><label>AI 供应商</label><select id="aiProvider" onchange="AILLM.onProviderChange()">';
    Object.keys(presets).forEach(function(key) {
      var labels = { deepseek: 'DeepSeek (推荐·免费额度)', openai: 'OpenAI (GPT-4o-mini)', qwen: '通义千问' };
      html += '<option value="' + key + '"' + (config.provider === key ? ' selected' : '') + '>' + labels[key] + '</option>';
    });
    html += '</select></div>';

    // API Key
    html += '<div class="ai-config-row"><label>API Key</label>';
    html += '<input type="password" id="aiApiKey" value="' + (config.apiKey || '') + '" placeholder="输入你的 API Key">';
    html += '</div>';

    // Model
    html += '<div class="ai-config-row"><label>模型</label>';
    html += '<input type="text" id="aiModel" value="' + config.model + '" placeholder="模型名称">';
    html += '</div>';

    // Base URL
    html += '<div class="ai-config-row"><label>API 地址</label>';
    html += '<input type="text" id="aiBaseUrl" value="' + config.baseUrl + '" placeholder="API Base URL">';
    html += '</div>';

    // 按钮
    html += '<div class="ai-config-actions">';
    html += '<button class="btn btn-sm" onclick="AILLM.testAndSave()">🔗 测试连接并保存</button>';
    html += '<button class="btn btn-sm" onclick="AILLM.closeConfig()">取消</button>';
    html += '</div>';

    html += '<div class="ai-config-hint">';
    html += '<p>💡 <b>不知道如何获取 API Key？</b> <a href="javascript:AIGuide.open()" style="color:#8bc34a;cursor:pointer;">📖 点击查看手把手教程</a></p>';
    html += '<p>💡 <b>免费获取 DeepSeek API Key:</b> 访问 <a href="https://platform.deepseek.com" target="_blank">platform.deepseek.com</a> 注册即送免费额度。</p>';
    html += '<p>💡 <b>OpenAI:</b> 访问 <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></p>';
    html += '</div>';

    html += '<div id="aiConfigStatus"></div>';
    html += '</div>';

    return html;
  }

  function onProviderChange() {
    var sel = document.getElementById('aiProvider');
    var preset = PROVIDER_PRESETS[sel.value];
    if (preset) {
      document.getElementById('aiModel').value = preset.model;
      document.getElementById('aiBaseUrl').value = preset.baseUrl;
    }
  }

  function testAndSave() {
    var config = {
      provider: document.getElementById('aiProvider').value,
      apiKey: document.getElementById('aiApiKey').value.trim(),
      model: document.getElementById('aiModel').value.trim(),
      baseUrl: document.getElementById('aiBaseUrl').value.trim(),
      temperature: 0.7,
      maxTokens: 4096
    };

    if (!config.apiKey) {
      document.getElementById('aiConfigStatus').innerHTML = '<span style="color:#e06050">请输入 API Key</span>';
      return;
    }

    document.getElementById('aiConfigStatus').innerHTML = '<span style="color:#f0d78c">⏳ 正在测试连接...</span>';

    var self = this;
    testConnection(config, function() {
      saveConfig(config);
      document.getElementById('aiConfigStatus').innerHTML = '<span style="color:#8bc34a">✅ 连接成功！配置已保存</span>';
      setTimeout(function() {
        var chatPanel = document.getElementById('aiChatPanel');
        if (chatPanel) chatPanel.style.display = 'none';
        AILLM.openChat();
      }, 800);
    }, function(err) {
      document.getElementById('aiConfigStatus').innerHTML = '<span style="color:#e06050">❌ ' + err.replace(/\n/g, '<br>') + '</span>';
    });
  }

  function closeConfig() {
    var panel = document.getElementById('aiConfigPanel');
    if (panel) panel.style.display = 'none';
  }

  // ==================== 聊天UI ====================
  function openChat(chart, bazi) {
    var chartText = '';
    if (chart && bazi) {
      chartText = exportStructuredChart(chart, bazi);
    }

    var existingPanel = document.getElementById('aiChatPanel');
    if (existingPanel) {
      existingPanel.style.display = 'block';
      existingPanel.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    var panel = document.createElement('div');
    panel.id = 'aiChatPanel';
    panel.className = 'ai-chat-panel';
    panel.innerHTML = renderChatHTML(chartText);
    document.body.appendChild(panel);

    // 未配置则自动弹出设置
    var config = getConfig();
    if (!config.apiKey) {
      AILLM.showConfig(panel);
    }

    panel.scrollIntoView({ behavior: 'smooth' });
  }

  function renderChatHTML(chartText) {
    var config = getConfig();
    var hasKey = !!config.apiKey;
    var providerLabel = { deepseek: 'DeepSeek', openai: 'OpenAI', qwen: '通义千问' }[config.provider] || 'AI';

    var html = '<div class="ai-chat-header">';
    html += '<h3>🤖 AI 命盘解读 <span class="ai-provider-badge">' + providerLabel + '</span></h3>';
    html += '<div class="ai-chat-header-actions">';
    html += '<button class="btn btn-sm ai-chat-guide-btn" onclick="AIGuide.open()">📖 API 教程</button>';
    html += '<button class="btn btn-sm" onclick="AILLM.copyChartText()">📋 复制命盘文本</button>';
    html += '<button class="btn btn-sm" onclick="AILLM.showConfig()">⚙️ API 设置</button>';
    html += '<button class="btn btn-sm" onclick="AILLM.clearChat()">🔄 清空对话</button>';
    html += '<button class="btn btn-sm" onclick="document.getElementById(\'aiChatPanel\').style.display=\'none\'">✕ 关闭</button>';
    html += '</div>';
    html += '</div>';

    // 隐藏的命盘数据
    html += '<textarea id="aiChartText" style="display:none" readonly>' + (chartText || '') + '</textarea>';

    // 快捷问题
    html += '<div class="ai-quick-questions">';
    getQuickQuestions().forEach(function(q) {
      html += '<button class="ai-quick-btn" onclick="AILLM.askQuick(\'' + q.question.replace(/'/g, "\\'") + '\')">' + q.label + '</button>';
    });
    html += '</div>';

    // 对话区
    html += '<div class="ai-messages" id="aiMessages">';
    html += '<div class="ai-msg ai-msg-system">👋 你好！请点击上方快捷问题开始，或输入你的问题。我会基于你的命盘数据给出专业解读。</div>';
    html += '</div>';

    // 输入区
    html += '<div class="ai-input-row">';
    html += '<textarea id="aiUserInput" rows="2" placeholder="输入你的问题...（例如:我的财运如何？适合创业吗？）" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();AILLM.sendMessage()}"></textarea>';
    html += '<button class="btn btn-primary" onclick="AILLM.sendMessage()">发送</button>';
    html += '</div>';

    // 配置面板
    html += '<div class="ai-config-wrap" id="aiConfigPanel" style="display:none"></div>';

    // 状态
    html += '<div id="aiStatusBar" class="ai-status-bar"></div>';

    return html;
  }

  function showConfig(container) {
    var configPanel = document.getElementById('aiConfigPanel');
    if (!configPanel) return;
    configPanel.innerHTML = renderConfigPanel();
    configPanel.style.display = 'block';
  }

  function sendMessage() {
    var input = document.getElementById('aiUserInput');
    var question = input.value.trim();
    if (!question) return;

    var chartText = document.getElementById('aiChartText').value;
    if (!chartText) {
      addMessage('system', '⚠️ 请先在紫微斗数面板中完成排盘，命盘数据丢失。');
      return;
    }

    var config = getConfig();
    if (!config.apiKey) {
      AILLM.showConfig();
      addMessage('system', '⚠️ 请先配置 API Key 后再提问。');
      return;
    }

    addMessage('user', question);
    input.value = '';

    var statusBar = document.getElementById('aiStatusBar');
    if (statusBar) statusBar.innerHTML = '⏳ AI 思考中...';

    callLLM(chartText, question, null, function(reply) {
      addMessage('assistant', reply);
      if (statusBar) statusBar.innerHTML = '';
    }, function(err) {
      addMessage('system', '❌ ' + err);
      if (statusBar) statusBar.innerHTML = '';
    });
  }

  function askQuick(question) {
    document.getElementById('aiUserInput').value = question;
    sendMessage();
  }

  function addMessage(role, content) {
    var messagesDiv = document.getElementById('aiMessages');
    if (!messagesDiv) return;

    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + role;
    // 将 markdown 风格的换行转为 HTML
    var html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/### (.*)/g, '<h4>$1</h4>')
      .replace(/## (.*)/g, '<h3>$1</h3>');
    div.innerHTML = '<p>' + html + '</p>';
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function copyChartText() {
    var textarea = document.getElementById('aiChartText');
    if (!textarea || !textarea.value) {
      alert('暂无命盘数据，请先排盘。');
      return;
    }
    navigator.clipboard.writeText(textarea.value).then(function() {
      var bar = document.getElementById('aiStatusBar');
      if (bar) bar.innerHTML = '✅ 命盘文本已复制到剪贴板，可粘贴到任何 AI 聊天工具中使用。';
    }).catch(function() {
      textarea.style.display = 'block';
      textarea.select();
      document.execCommand('copy');
      textarea.style.display = 'none';
      var bar = document.getElementById('aiStatusBar');
      if (bar) bar.innerHTML = '✅ 命盘文本已复制到剪贴板。';
    });
  }

  function clearChat() {
    var messagesDiv = document.getElementById('aiMessages');
    if (messagesDiv) {
      messagesDiv.innerHTML = '<div class="ai-msg ai-msg-system">对话已清空。请提问。</div>';
    }
    clearHistory();
  }

  // ==================== 导出 ====================
  return {
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    getConfig: getConfig,
    exportStructuredChart: exportStructuredChart,
    callLLM: callLLM,
    clearHistory: clearHistory,
    getHistory: getHistory,
    getQuickQuestions: getQuickQuestions,
    renderConfigPanel: renderConfigPanel,
    onProviderChange: onProviderChange,
    testAndSave: testAndSave,
    closeConfig: closeConfig,
    openChat: openChat,
    showConfig: showConfig,
    sendMessage: sendMessage,
    askQuick: askQuick,
    addMessage: addMessage,
    copyChartText: copyChartText,
    clearChat: clearChat,
    testConnection: testConnection,
    PROVIDER_PRESETS: PROVIDER_PRESETS
  };
})();
