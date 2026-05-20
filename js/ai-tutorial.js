/**
 * 文墨天机 · AI 大模型设置向导
 * 手把手教用户获取 API Key 并配置 AI 解读
 */

var AIGuide = (function() {
  'use strict';

  var steps = [
    {
      id: 'intro',
      title: 'AI 命盘解读 · 快速入门',
      emoji: '🤖',
      content: [
        '<p>本软件接入了 <strong>DeepSeek / OpenAI / 通义千问</strong> 三大 AI 大模型，',
        '可以基于你的命盘数据，用自然语言对话的方式为你解读财运、事业、感情、健康、流年走势等。</p>',
        '<p>因为 AI 调用需要消耗服务器资源，各平台都要求你提供一个 <mark>API Key</mark>（密钥）来验证身份。',
        '就像你登录微信需要密码一样，API Key 就是你的"AI 通行证"。</p>',
        '<p><strong>好消息：</strong>每个平台都有免费额度，新手注册即送，日常使用完全够用，不用担心花钱！</p>',
        '<p>下来我会一步步教你，<strong>5 分钟</strong>就能搞定~</p>'
      ]
    },
    {
      id: 'choose-provider',
      title: '第一步：选择 AI 供应商',
      emoji: '🏪',
      content: [
        '<p>三家 AI 供应商各有特点，选一个你喜欢的：</p>',
        '<div class="aguide-provider-cards">',
        '  <div class="aguide-pcard aguide-recommend">',
        '    <div class="aguide-pcard-badge">⭐ 推荐</div>',
        '    <h4>🟢 DeepSeek</h4>',
        '    <p>国产大模型，中文能力强，<br>注册即送 <b>500 万 tokens</b> 免费额度</p>',
        '    <p class="aguide-pcard-price">💰 免费额度 ≈ 日常用 2-3 个月</p>',
        '  </div>',
        '  <div class="aguide-pcard">',
        '    <h4>🔵 OpenAI</h4>',
        '    <p>全球最强模型，回答质量高，<br>新用户注册送 <b>$5 免费额度</b></p>',
        '    <p class="aguide-pcard-price">💰 免费额度 ≈ 日常用 1-2 个月</p>',
        '  </div>',
        '  <div class="aguide-pcard">',
        '    <h4>🟣 通义千问</h4>',
        '    <p>阿里自研模型，国内免费额度多，<br>注册即送 <b>100 万 tokens/月</b></p>',
        '    <p class="aguide-pcard-price">💰 每月都有免费额度，长期使用</p>',
        '  </div>',
        '</div>',
        '<p style="margin-top:12px">👇 选好供应商后，看对应步骤操作：</p>'
      ]
    },
    {
      id: 'deepseek-guide',
      title: '路径 A：注册 DeepSeek（推荐）',
      emoji: '🟢',
      content: [
        '<div class="aguide-step-num">第 1 步</div>',
        '<p>打开浏览器，访问 <a href="https://platform.deepseek.com" target="_blank" class="aguide-link">https://platform.deepseek.com</a></p>',
        '<p>点击右上角 <b>"注册/登录"</b>，可以用手机号或微信直接注册。</p>',
        '',
        '<div class="aguide-step-num">第 2 步</div>',
        '<p>登录后，左侧菜单找到 <b>"API Keys"</b>（或直接访问 <a href="https://platform.deepseek.com/api_keys" target="_blank" class="aguide-link">platform.deepseek.com/api_keys</a>）</p>',
        '',
        '<div class="aguide-step-num">第 3 步</div>',
        '<p>点击 <b>"创建 API Key"</b>，随便输入一个名称（比如"文墨天机"），点确定。</p>',
        '<p>系统会生成一串类似 <code style="word-break:break-all">sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code> 的密钥。</p>',
        '<p><mark>⚠️ 重要：立即点"复制"保存！</mark> 这个密钥只显示一次，关闭后就看不到了。</p>',
        '',
        '<div class="aguide-step-num">第 4 步</div>',
        '<p>回到本软件，在 AI 配置面板中粘贴密钥，选择 DeepSeek，点击 <b>"测试连接并保存"</b> 即可。</p>'
      ]
    },
    {
      id: 'openai-guide',
      title: '路径 B：注册 OpenAI',
      emoji: '🔵',
      content: [
        '<div class="aguide-step-num">第 1 步</div>',
        '<p>访问 <a href="https://platform.openai.com" target="_blank" class="aguide-link">https://platform.openai.com</a></p>',
        '<p>点击 <b>"Sign Up"</b> 注册账号。需要邮箱和手机号验证（<mark>注意：OpenAI 不支持中国大陆手机号</mark>，需要用海外号码或用第三方接码平台）。</p>',
        '',
        '<div class="aguide-step-num">第 2 步</div>',
        '<p>登录后，左侧菜单进入 <a href="https://platform.openai.com/api-keys" target="_blank" class="aguide-link">API Keys</a></p>',
        '',
        '<div class="aguide-step-num">第 3 步</div>',
        '<p>点击 <b>"Create new secret key"</b>，命名后点击创建。</p>',
        '<p>立即复制密钥（只会显示一次）。</p>',
        '',
        '<div class="aguide-step-num">第 4 步</div>',
        '<p>回到本软件，AI 配置面板选择 OpenAI，粘贴密钥，测试并保存。</p>',
        '',
        '<div class="aguide-warning">',
        '  <b>⚠️ 注意事项：</b>',
        '  <ul>',
        '    <li>国内用户可能需要科学上网才能访问</li>',
        '    <li>新用户有 $5 免费额度，用完后需要充值</li>',
        '    <li>API 按使用量计费，gpt-4o-mini 很便宜（约 ¥0.1/次对话）</li>',
        '  </ul>',
        '</div>'
      ]
    },
    {
      id: 'qwen-guide',
      title: '路径 C：注册通义千问',
      emoji: '🟣',
      content: [
        '<div class="aguide-step-num">第 1 步</div>',
        '<p>访问 <a href="https://dashscope.aliyun.com" target="_blank" class="aguide-link">https://dashscope.aliyun.com</a></p>',
        '<p>用阿里云账号登录（没有的话可用支付宝/淘宝直接登录）。</p>',
        '',
        '<div class="aguide-step-num">第 2 步</div>',
        '<p>登录后，点击右上角头像 → <b>"API-KEY 管理"</b></p>',
        '',
        '<div class="aguide-step-num">第 3 步</div>',
        '<p>点击 <b>"创建 API-KEY"</b>，系统会生成密钥。立即复制保存。</p>',
        '',
        '<div class="aguide-step-num">第 4 步</div>',
        '<p>回到本软件，AI 配置面板选择 <b>通义千问</b>，粘贴密钥，测试并保存。</p>',
        '',
        '<div class="aguide-tip">',
        '  <b>💡 提示：</b>通义千问每月免费 100 万 tokens，日常使用完全够用。价格也很便宜，超额后 qwen-turbo 约 ¥0.008/千 tokens。',
        '</div>'
      ]
    },
    {
      id: 'config-app',
      title: '最后一步：在软件中配置',
      emoji: '⚙️',
      highlight: '.btn-ai-chat',
      content: [
        '<p>密钥拿到手了，现在回到软件配置：</p>',
        '<div class="aguide-step-num">操作步骤</div>',
        '<p><b>①</b> 先在紫微斗数面板中排一个盘（必须的，AI 需要命盘数据）</p>',
        '<p><b>②</b> 点击页面中的 <b>"💬 AI 对话"</b> 按钮</p>',
        '<p><b>③</b> 在弹出的对话面板中，点击 <b>"⚙️ API 设置"</b> 按钮</p>',
        '<p><b>④</b> 选择你的 AI 供应商，粘贴你的 API Key</p>',
        '<p><b>⑤</b> 点击 <b>"🔗 测试连接并保存"</b>，看到 ✅ 成功提示就 OK 了！</p>',
        '<p><b>⑥</b> 点击快捷问题（如"💰 财运分析"）或输入你的问题，AI 就开始为你解读了~</p>',
        '',
        '<div class="aguide-faq">',
        '<h4>🙋 常见问题</h4>',
        '<p><b>Q: API Key 安全吗？</b><br>A: 密钥保存在你浏览器的本地存储中，只有你能访问，不会上传到任何服务器。</p>',
        '<p><b>Q: 会花很多钱吗？</b><br>A: 一次命盘解读约消耗 2000-4000 tokens。DeepSeek 免费额度够用 1000+ 次，通义千问每月免费 100 万 tokens 约够 250+ 次。日常使用完全免费。</p>',
        '<p><b>Q: 哪个 AI 最好？</b><br>A: 中文命理分析我们测试下来 DeepSeek 综合表现最好，中文理解力强、免费额度也充足。</p>',
        '<p><b>Q: AI 回答准确吗？</b><br>A: AI 是基于你真实的命盘数据进行分析，但它提供的是"解读参考"，命理本身是概率和趋势，最终的判断权在你手中。</p>',
        '</div>'
      ]
    }
  ];

  var currentStep = 0;
  var overlayEl = null;
  var isOpen = false;

  // ==================== UI 构建 ====================

  function createOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'aguide-overlay';
    overlayEl.id = 'aiGuideOverlay';
    overlayEl.onclick = function(e) {
      if (e.target === overlayEl) close();
    };

    overlayEl.innerHTML =
      '<div class="aguide-dialog" id="aiGuideDialog">' +
        '<div class="aguide-header">' +
          '<div class="aguide-step-dots" id="aiGuideDots"></div>' +
          '<button class="aguide-close" onclick="AIGuide.close()">✕</button>' +
        '</div>' +
        '<div class="aguide-body">' +
          '<div class="aguide-emoji" id="aiGuideEmoji"></div>' +
          '<h2 class="aguide-title" id="aiGuideTitle"></h2>' +
          '<div class="aguide-content" id="aiGuideContent"></div>' +
        '</div>' +
        '<div class="aguide-footer">' +
          '<button class="aguide-btn aguide-btn-prev" id="aiGuidePrev" onclick="AIGuide.prev()">◀ 上一步</button>' +
          '<span class="aguide-progress" id="aiGuideProgress"></span>' +
          '<button class="aguide-btn aguide-btn-next" id="aiGuideNext" onclick="AIGuide.next()">下一步 ▶</button>' +
          '<button class="aguide-btn aguide-btn-finish" id="aiGuideFinish" onclick="AIGuide.finish()" style="display:none;">🎉 开始 AI 解读</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlayEl);
  }

  function renderStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[index];

    // 步骤点
    var dotsHtml = '';
    for (var i = 0; i < steps.length; i++) {
      var cls = i === index ? ' active' : (i < index ? ' done' : '');
      dotsHtml += '<span class="aguide-dot' + cls + '" onclick="AIGuide.goTo(' + i + ')"></span>';
    }
    document.getElementById('aiGuideDots').innerHTML = dotsHtml;

    document.getElementById('aiGuideEmoji').textContent = step.emoji;
    document.getElementById('aiGuideTitle').textContent = step.title;
    document.getElementById('aiGuideContent').innerHTML = step.content.join('');

    document.getElementById('aiGuideProgress').textContent = (index + 1) + ' / ' + steps.length;

    var prevBtn = document.getElementById('aiGuidePrev');
    var nextBtn = document.getElementById('aiGuideNext');
    var finishBtn = document.getElementById('aiGuideFinish');

    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
    if (index === steps.length - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'inline-block';
      finishBtn.style.display = 'none';
    }

    clearHighlight();
    if (step.highlight) {
      highlightElement(step.highlight);
    }

    // 滚动对话框到顶部
    var dialog = document.getElementById('aiGuideDialog');
    if (dialog) dialog.scrollTop = 0;
  }

  function highlightElement(selector) {
    try {
      var el = document.querySelector(selector);
      if (!el) return;
      el.classList.add('aguide-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch(e) {}
  }

  function clearHighlight() {
    var els = document.querySelectorAll('.aguide-highlight');
    els.forEach(function(el) { el.classList.remove('aguide-highlight'); });
  }

  // ==================== API ====================

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

  function finish() {
    close();
    // 尝试打开 AI 聊天面板
    if (typeof AILLM !== 'undefined' && AILLM.openChat) {
      AILLM.openChat();
    }
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

  return {
    open: open,
    close: close,
    finish: finish,
    next: next,
    prev: prev,
    goTo: goTo
  };
})();
