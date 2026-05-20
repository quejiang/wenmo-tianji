/**
 * 山医命相卜 · 本地 AI 大模型
 *
 * 基于 WebLLM + RAG 知识库，完全在浏览器中运行，无需任何外部 API。
 *
 * 能力：
 *   1. 本地 LLM 对话（WebGPU 加速）
 *   2. 文档学习（PDF / TXT / EPUB 上传 → 分块 → 索引）
 *   3. RAG 检索增强生成（基于知识库回答问题）
 *   4. 多模型支持（Llama / Gemma / Phi / Qwen / SmolLM）
 *
 * 限制：
 *   - 需要 Chrome 113+ / Edge 113+（WebGPU）
 *   - 首次加载模型需下载 1-5 GB（后续从缓存读取）
 *   - 视频学习不可行（需 ASR + 视觉模型，浏览器不支持）
 *
 * 架构：
 *   WebLLM (推理) + IndexedDB (文档存储) + 关键词检索 (RAG)
 */

var LocalAI = (function() {
  'use strict';

  // ==================== 配置 ====================

  var DEFAULT_MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

  // 按体积从小到大排列，1k 变体更省显存
  var MODEL_OPTIONS = [
    { id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',   label: 'SmolLM2 360M (极小/约200MB)',   size: '~200MB' },
    { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',label: 'TinyLlama 1.1B (轻量/约500MB)',  size: '~500MB' },
    { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC-1k',label:'TinyLlama 1.1B·1k (最轻/约480MB)',size:'~480MB' },
    { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',    label: 'Qwen2.5 0.5B (推荐·中文/约600MB)', size: '~600MB' },
    { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',    label: 'Llama 3.2 1B (均衡/约880MB)',  size: '~880MB' },
    { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',    label: 'Qwen2.5 1.5B (强中文/约1.2GB)', size: '~1.2GB' },
    { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',    label: 'SmolLM2 1.7B (轻量/约1.3GB)', size: '~1.3GB' },
    { id: 'Gemma-2-2B-it-q4f16_1-MLC',            label: 'Gemma 2 2B (Google/约1.5GB)',  size: '~1.5GB' },
    { id: 'Gemma-2-2B-it-q4f16_1-MLC-1k',         label: 'Gemma 2 2B·1k (约1.2GB)',     size: '~1.2GB' },
    { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',    label: 'Phi 3.5 Mini (Microsoft/约2.5GB)', size: '~2.5GB' },
    { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC-1k', label: 'Phi 3.5 Mini·1k (约1.7GB)',   size: '~1.7GB' }
  ];

  // ==================== 状态 ====================

  var engine = null;
  var isLoading = false;
  var loadProgress = { text: '', percent: 0 };
  var currentModelId = '';
  var chatHistory = [];
  var knowledgeBase = [];       // { id, title, text, totalChars, category, ... }
  var kbIndex = [];             // 知识库索引（快速加载，仅元数据）
  var kbChunkCache = {};        // 预分块缓存 { docId: { chunks: [...], updatedAt } }
  var kbShardsLoaded = 0;       // 已加载分片数
  var kbShardFiles = [];        // 分片文件名列表
  var KB_CHUNK_SIZE = 600;      // 搜索时分块大小
  var KB_CHUNK_OVERLAP = 150;
  var MAX_HISTORY_SEND = 8;     // 每次送入模型的历史消息数
  var MAX_TOKENS = 512;         // 最大生成 token 数
  var systemPrompt = '你是山医命相卜 AI 助手，精通紫微斗数、八字、奇门遁甲等玄学五术。请用中文简洁回答，引经据典。可参考知识库内容。';

  // ==================== 初始化 ====================

  function init() {
    loadChatHistory();
    loadKnowledgeBase();
    preloadBuiltInKnowledge();
    renderModelSelector();
    updateStatusBadge();
  }

  function isWebGPUSupported() {
    return typeof navigator !== 'undefined' && navigator.gpu;
  }

  function updateStatusBadge() {
    var badge = document.getElementById('aiStatusBadge');
    if (!badge) return;
    if (engine) {
      badge.textContent = '已就绪';
      badge.className = 'ai-status-badge ai-ready';
    } else if (isLoading) {
      badge.textContent = '加载中 ' + Math.round(loadProgress.percent) + '%';
      badge.className = 'ai-status-badge ai-loading';
    } else if (!isWebGPUSupported()) {
      badge.textContent = '浏览器不支持WebGPU';
      badge.className = 'ai-status-badge ai-error';
    } else {
      badge.textContent = '未加载';
      badge.className = 'ai-status-badge ai-idle';
    }
  }

  // ==================== 模型管理 ====================

  function renderModelSelector() {
    var sel = document.getElementById('aiModelSelect');
    if (!sel) return;
    sel.innerHTML = MODEL_OPTIONS.map(function(m) {
      return '<option value="' + m.id + '"' + (m.id === DEFAULT_MODEL ? ' selected' : '') + '>' + m.label + '</option>';
    }).join('');
    sel.onchange = function() { currentModelId = ''; };
  }

  function getSelectedModel() {
    var sel = document.getElementById('aiModelSelect');
    return sel ? sel.value : DEFAULT_MODEL;
  }

  async function loadModel() {
    if (isLoading) {
      appendSystemMessage('模型正在加载中，请等待...');
      return;
    }
    if (engine && currentModelId === getSelectedModel()) {
      appendSystemMessage('模型已加载，可以直接对话。');
      return;
    }

    if (!isWebGPUSupported()) {
      appendSystemMessage('你的浏览器不支持 WebGPU。请使用 Chrome 113+ 或 Edge 113+。');
      return;
    }

    // 卸载旧模型
    if (engine) {
      try { engine.unload(); } catch(e) {}
      engine = null;
    }

    isLoading = true;
    currentModelId = getSelectedModel();
    loadProgress = { text: '正在下载模型...', percent: 0 };
    updateStatusBadge();
    appendSystemMessage('开始加载模型: ' + currentModelId);
    appendSystemMessage('首次下载约需 1-5 分钟，后续将使用缓存秒开。');

    try {
      var webllm = await import('https://esm.run/@mlc-ai/web-llm');

      engine = await webllm.CreateMLCEngine(currentModelId, {
        initProgressCallback: function(p) {
          loadProgress.text = p.text || '';
          loadProgress.percent = (p.progress || 0) * 100;
          updateStatusBadge();
          updateProgressBar();
        }
      });

      isLoading = false;
      updateStatusBadge();
      updateProgressBar();
      appendSystemMessage('模型加载完成！现在可以对话了。试试上传一本命理书籍让我学习。');
    } catch (err) {
      isLoading = false;
      updateStatusBadge();
      updateProgressBar();
      appendSystemMessage('模型加载失败: ' + (err.message || err));
      console.error(err);
    }
  }

  function unloadModel() {
    if (engine) {
      try { engine.unload(); } catch(e) {}
      engine = null;
    }
    currentModelId = '';
    isLoading = false;
    loadProgress = { text: '', percent: 0 };
    updateStatusBadge();
    updateProgressBar();
    appendSystemMessage('模型已卸载。');
  }

  function updateProgressBar() {
    var bar = document.getElementById('aiProgressBar');
    var text = document.getElementById('aiProgressText');
    if (!bar || !text) return;
    if (isLoading) {
      bar.style.display = 'block';
      bar.querySelector('.ai-progress-fill').style.width = loadProgress.percent + '%';
      text.textContent = loadProgress.text || '下载中...';
    } else {
      bar.style.display = 'none';
    }
  }

  // ==================== 聊天 ====================

  async function sendMessage() {
    var input = document.getElementById('aiChatInput');
    if (!input) return;
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    if (!engine) {
      appendSystemMessage('请先加载 AI 模型。在上方选择一个模型，然后点击「加载模型」。');
      return;
    }

    // 添加用户消息
    appendMessage('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    saveChatHistory();

    // 检索知识库
    var contexts = searchKnowledgeBase(msg, 2);
    var ragContext = '';
    if (contexts.length > 0) {
      ragContext = '\n\n[知识库参考内容]\n' + contexts.map(function(c) {
        var src = c.category ? '《' + c.title + '》（' + c.category + '）' : '《' + c.title + '》';
        return '— 来自' + src + '：' + c.text;
      }).join('\n') + '\n[/知识库参考内容]';
    }

    // 构建消息 + token 预算
    var messages = [
      { role: 'system', content: systemPrompt + ragContext }
    ];
    var recentHistory = chatHistory.slice(-MAX_HISTORY_SEND);
    messages = messages.concat(recentHistory);
    messages = trimMessagesToBudget(messages);

    // 创建 AI 消息气泡
    var aiBubble = appendMessage('assistant', '');
    var aiContent = '';

    try {
      var chunks = await engine.chat.completions.create({
        messages: messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
        stream: true,
        stream_options: { include_usage: true }
      });

      for await (var chunk of chunks) {
        var delta = chunk.choices[0]?.delta?.content || '';
        aiContent += delta;
        aiBubble.textContent = aiContent;
        scrollChatBottom();
      }
    } catch (err) {
      aiBubble.textContent = '生成失败: ' + (err.message || err);
      console.error(err);
    }

    chatHistory.push({ role: 'assistant', content: aiContent });
    saveChatHistory();
  }

  function appendMessage(role, content) {
    var container = document.getElementById('aiChatMessages');
    if (!container) return null;
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + role;
    div.textContent = content;
    container.appendChild(div);
    scrollChatBottom();
    return div;
  }

  function appendSystemMessage(text) {
    var container = document.getElementById('aiChatMessages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-system';
    div.textContent = text;
    container.appendChild(div);
    scrollChatBottom();
  }

  function scrollChatBottom() {
    var container = document.getElementById('aiChatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function clearChat() {
    chatHistory = [];
    saveChatHistory();
    var container = document.getElementById('aiChatMessages');
    if (container) container.innerHTML = '';
    appendSystemMessage('对话已清空。');
  }

  // ==================== 对话持久化 ====================

  function saveChatHistory() {
    try {
      localStorage.setItem('ziwei_ai_chat', JSON.stringify(chatHistory.slice(-100)));
    } catch(e) {}
  }

  function loadChatHistory() {
    try {
      var raw = localStorage.getItem('ziwei_ai_chat');
      if (raw) {
        chatHistory = JSON.parse(raw);
        // 恢复 UI
        chatHistory.forEach(function(m) {
          appendMessage(m.role, m.content);
        });
      }
    } catch(e) {}
  }

  // ==================== 知识库 / RAG ====================

  function loadKnowledgeBase() {
    try {
      var raw = localStorage.getItem('ziwei_ai_kb');
      if (raw) knowledgeBase = JSON.parse(raw);
    } catch(e) { knowledgeBase = []; }
  }

  function saveKnowledgeBase() {
    try {
      // 仅持久化用户上传的文档（built-in 文档不存 localStorage）
      var userDocs = knowledgeBase.filter(function(d) { return !d._builtin; });
      localStorage.setItem('ziwei_ai_kb', JSON.stringify(userDocs));
    } catch(e) {}
  }

  /**
   * 预加载内置知识库（分片架构）
   * 1. 先加载索引（~200KB，秒加载）
   * 2. 后台逐片加载全文分片
   */
  function preloadBuiltInKnowledge() {
    fetch('js/kb-preload.json')
      .then(function(res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function(index) {
        if (!index || index.length === 0) return;
        kbIndex = index;
        // 计算分片文件列表
        kbShardFiles = findKBShardFiles(index.length);
        renderKnowledgeBaseList();
        // 后台加载所有分片
        loadAllKBShards();
      })
      .catch(function() { /* kb-preload.json 不存在 */ });
  }

  function findKBShardFiles(totalDocs) {
    var files = [];
    var idx = 0;
    while (true) {
      var f = 'js/kb-shard-' + String(idx).padStart(3, '0') + '.json';
      files.push(f);
      idx++;
      // 安全上限：最多 50 个分片
      if (idx > 50) break;
    }
    return files;
  }

  async function loadAllKBShards() {
    var builtinIds = new Set();
    knowledgeBase.forEach(function(d) { if (d._builtin) builtinIds.add(d.id); });

    for (var i = 0; i < kbShardFiles.length; i++) {
      try {
        var res = await fetch(kbShardFiles[i]);
        if (!res.ok) break; // 分片不存在，停止
        var docs = await res.json();
        kbShardsLoaded++;
        docs.forEach(function(d) {
          d._builtin = true;
          if (!builtinIds.has(d.id)) {
            builtinIds.add(d.id);
            knowledgeBase.push(d);
          }
        });
        // 预分块缓存（内置典籍加载完成后构建）
        docs.forEach(function(d) { buildKBChunkCache(d); });
        renderKnowledgeBaseList();
      } catch(e) {
        break; // 网络错误，停止加载后续分片
      }
    }
    if (kbShardsLoaded > 0) {
      appendSystemMessage('知识库加载完成：' + knowledgeBase.length + ' 篇典籍（' + kbShardsLoaded + ' 个分片）');
    }
  }

  /**
   * 上传文档并建立索引
   */
  function uploadDocument() {
    var input = document.getElementById('aiDocInput');
    if (!input) return;
    input.click();
  }

  function handleDocumentSelected(event) {
    var file = event.target.files[0];
    if (!file) return;

    var ext = (file.name.split('.').pop() || '').toLowerCase();
    appendSystemMessage('正在处理: ' + file.name + ' ...');

    var reader = new FileReader();
    reader.onload = async function(e) {
      var text = '';

      if (ext === 'pdf') {
        text = await extractPDFText(e.target.result);
      } else if (ext === 'epub') {
        text = await extractEPUBText(e.target.result);
      } else if (ext === 'txt' || ext === 'md') {
        text = e.target.result;
      } else {
        appendSystemMessage('不支持的文件格式: .' + ext + '（支持 .txt .pdf .md .epub）');
        return;
      }

      if (!text || text.trim().length < 50) {
        appendSystemMessage('文件内容为空或过短，无法建立知识库。');
        return;
      }

      var doc = {
        id: 'u' + Date.now(),
        title: file.name.replace(/\.(pdf|txt|md|epub)$/i, ''),
        fileName: file.name,
        category: '用户上传',
        subcategory: '',
        relPath: file.name,
        text: text,
        totalChars: text.length,
        _builtin: false,
        addedAt: new Date().toISOString()
      };

      knowledgeBase.unshift(doc);
      // 预分块缓存
      buildKBChunkCache(doc);
      // 最多保留 20 个用户文档
      var userDocs = knowledgeBase.filter(function(d) { return !d._builtin; });
      if (userDocs.length > 20) {
        var toRemove = userDocs.slice(20);
        toRemove.forEach(function(d) {
          removeKBChunkCache(d.id);
          knowledgeBase = knowledgeBase.filter(function(x) { return x.id !== d.id; });
        });
      }

      saveKnowledgeBase();
      renderKnowledgeBaseList();
      appendSystemMessage('已学习《' + doc.title + '》— ' + text.length.toLocaleString() + ' 字。');
    };

    if (ext === 'pdf' || ext === 'epub') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }

    event.target.value = '';
  }

  /**
   * 从 PDF 提取文字（使用 pdf.js）
   */
  async function extractPDFText(arrayBuffer) {
    try {
      var pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      var texts = [];
      for (var i = 1; i <= pdf.numPages; i++) {
        var page = await pdf.getPage(i);
        var content = await page.getTextContent();
        var pageText = content.items.map(function(item) { return item.str; }).join(' ');
        texts.push(pageText);
      }
      return texts.join('\n');
    } catch (err) {
      appendSystemMessage('PDF 解析失败: ' + err.message + '。请尝试 .txt 格式。');
      return '';
    }
  }

  /**
   * 从 EPUB 提取文字（使用 JSZip 解压 + DOMParser 解析 HTML）
   * EPUB 本质是一个 ZIP 压缩包，内含 XHTML/HTML 章节文件
   */
  async function extractEPUBText(arrayBuffer) {
    try {
      // 动态加载 JSZip（CDN 按需加载，不使用时不下载）
      if (typeof JSZip === 'undefined') {
        await new Promise(function(resolve, reject) {
          var s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          s.onload = resolve;
          s.onerror = function() { reject(new Error('JSZip 加载失败')); };
          document.head.appendChild(s);
        });
      }

      var zip = await JSZip.loadAsync(arrayBuffer);
      var files = Object.keys(zip.files);

      // 1. 找到 container.xml → OPF 文件路径
      var containerFile = zip.files['META-INF/container.xml'];
      if (!containerFile) {
        appendSystemMessage('EPUB 格式异常：缺少 META-INF/container.xml');
        return '';
      }

      var containerXml = await containerFile.async('string');
      var opfMatch = containerXml.match(/full-path="([^"]+)"/);
      if (!opfMatch) {
        appendSystemMessage('EPUB 格式异常：无法找到 OPF 文件路径');
        return '';
      }

      var opfPath = opfMatch[1];
      var opfFile = zip.files[opfPath];
      if (!opfFile) {
        appendSystemMessage('EPUB 格式异常：OPF 文件不存在');
        return '';
      }

      // 2. 解析 OPF 获取 spine（阅读顺序）和 manifest
      var opfXml = await opfFile.async('string');
      var basePath = opfPath.replace(/[^/]+$/, '');

      // 解析 spine: <itemref idref="..."/>
      var idrefs = [];
      var idrefRe = /<itemref[^>]*idref="([^"]+)"/g;
      var m;
      while ((m = idrefRe.exec(opfXml)) !== null) {
        idrefs.push(m[1]);
      }

      // 解析 manifest: <item id="..." href="..." media-type="..."/>
      var manifest = {};
      var itemRe = /<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"/g;
      while ((m = itemRe.exec(opfXml)) !== null) {
        manifest[m[1]] = { href: m[2], mediaType: m[3] };
      }

      // 3. 按 spine 顺序提取每个章节的文本
      var allText = [];
      var chapterCount = 0;

      for (var i = 0; i < idrefs.length; i++) {
        var item = manifest[idrefs[i]];
        if (!item) continue;

        var href = item.href;
        var fullPath = basePath + href;
        // 处理相对路径中的 ../
        fullPath = fullPath.replace(/\/\.\.\//g, '/').replace(/\/\.\//g, '/');

        var chapterFile = zip.files[fullPath];
        // 有时 href 是相对路径 without base
        if (!chapterFile) {
          for (var k = 0; k < files.length; k++) {
            if (files[k].endsWith('/' + href) || files[k] === href) {
              chapterFile = zip.files[files[k]];
              break;
            }
          }
        }

        if (!chapterFile || chapterFile.dir) continue;

        try {
          var html = await chapterFile.async('string');
          // 解析 HTML 提取纯文本
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');

          // 移除 script/style/nav 等无关元素
          var removeTags = doc.querySelectorAll('script, style, nav, head, ruby, rt, rp, [epub|type="footnote"]');
          var rmArr = Array.prototype.slice.call(removeTags, 0);
          rmArr.forEach(function(el) { el.parentNode.removeChild(el); });

          var body = doc.body || doc.documentElement;
          var chapterText = body.textContent || '';

          // 清理多余空白
          chapterText = chapterText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

          if (chapterText.length > 20) {
            chapterCount++;
            allText.push(chapterText);
          }
        } catch (e) {
          // 跳过解析失败的章节
        }
      }

      if (allText.length === 0) {
        appendSystemMessage('EPUB 解析完成但未提取到有效文本（共 ' + idrefs.length + ' 个章节，' + chapterCount + ' 个有效）。');
        return '';
      }

      appendSystemMessage('EPUB 解析完成：提取了 ' + chapterCount + '/' + idrefs.length + ' 个章节。');
      return allText.join('\n\n');
    } catch (err) {
      appendSystemMessage('EPUB 解析失败: ' + (err.message || err) + '。请尝试 .txt 格式。');
      return '';
    }
  }

  /**
   * 文本分块：按段落 + 句子边界，支持重叠
   */
  function chunkText(text, chunkSize, overlap) {
    overlap = overlap || 150;
    chunkSize = chunkSize || 600;

    var paragraphs = text.split(/\n{2,}/);
    var chunks = [];

    paragraphs.forEach(function(para) {
      para = para.trim();
      if (!para) return;

      if (para.length <= chunkSize) {
        chunks.push(para);
        return;
      }

      var sentences = para.split(/(?<=[。！？.!?])\s*/);
      var current = '';
      sentences.forEach(function(s) {
        if ((current + s).length > chunkSize && current.length > 0) {
          chunks.push(current.trim());
          current = current.slice(-overlap) + s;
        } else {
          current += s;
        }
      });
      if (current.trim()) chunks.push(current.trim());
    });

    return chunks;
  }

  /**
   * 搜索知识库：使用预分块缓存 + 关键词评分。
   * 优先从 kbChunkCache 取预分块，未命中时动态分块（fallback）。
   */
  function searchKnowledgeBase(query, topK) {
    topK = topK || 2;
    if (knowledgeBase.length === 0) return [];

    var queryTerms = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
    var results = [];

    knowledgeBase.forEach(function(doc) {
      var text = doc.text || '';
      if (!text) return;

      // 优先使用预分块缓存
      var cached = kbChunkCache[doc.id];
      var chunks = (cached && cached.chunks)
        ? cached.chunks
        : chunkText(text, KB_CHUNK_SIZE, KB_CHUNK_OVERLAP);

      chunks.forEach(function(chunk) {
        var score = 0;
        var lowerText = chunk.toLowerCase();

        queryTerms.forEach(function(term) {
          var safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var count = (lowerText.match(new RegExp(safe, 'g')) || []).length;
          score += count;
        });

        if (lowerText.indexOf(query.toLowerCase()) !== -1) score += 15;
        if (doc.title && doc.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) score += 5;

        if (score > 0) {
          results.push({
            title: doc.title,
            text: chunk.substring(0, 600),
            category: doc.category || '',
            score: score
          });
        }
      });
    });

    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, topK);
  }

  /**
   * 预分块缓存：文档加载/上传后调用，存储 chunks 供后续搜索使用
   */
  function buildKBChunkCache(doc) {
    if (!doc || !doc.text) return;
    if (!doc.id) doc.id = 'd' + Date.now() + Math.random().toString(36).slice(2, 8);
    kbChunkCache[doc.id] = {
      chunks: chunkText(doc.text, KB_CHUNK_SIZE, KB_CHUNK_OVERLAP),
      updatedAt: Date.now()
    };
  }

  function removeKBChunkCache(docId) {
    delete kbChunkCache[docId];
  }

  /**
   * Token 预算管理。
   * Qwen2.5-0.5B context=4096 token，中文约 1 字≈1.5 token。
   * 预留 512 token 给输出，system+RAG 最多 800 字，剩余给历史。
   * 超出预算时按"system > 最新 2 轮 > 更早"优先级裁剪。
   */
  function trimMessagesToBudget(messages) {
    var CONTEXT = 4096;
    var OUTPUT_RESERVE = 512;
    var SYS_MAX_CHARS = 800;
    var BUDGET = CONTEXT - OUTPUT_RESERVE;
    var TOKEN_PER_CHAR = 1.5;

    // 1. 裁剪 system message 超长部分
    if (messages.length > 0 && messages[0].role === 'system') {
      var sysText = messages[0].content || '';
      if (sysText.length > SYS_MAX_CHARS) {
        var head = Math.floor(SYS_MAX_CHARS * 0.4);
        var tail = Math.floor(SYS_MAX_CHARS * 0.6);
        messages[0].content = sysText.substring(0, head) +
          '\n...\n' + sysText.substring(sysText.length - tail);
      }
    }

    // 2. 从最新消息往前累加，超出预算则丢弃旧消息
    var used = 0;
    var keep = [];
    for (var i = messages.length - 1; i >= 0; i--) {
      var cost = (messages[i].content || '').length * TOKEN_PER_CHAR;
      if (used + cost <= BUDGET || keep.length === 0) {
        keep.unshift(messages[i]);
        used += cost;
      } else if (i === 0 && messages[i].role === 'system') {
        // system 必须保留
        keep.unshift(messages[i]);
      } else {
        break;
      }
    }

    return keep;
  }

  /**
   * 删除知识库文档（仅用户上传的）
   */
  function removeDocument(id) {
    var doc = knowledgeBase.find(function(d) { return d.id === id; });
    if (doc && doc._builtin) {
      appendSystemMessage('内置典籍不可删除。');
      return;
    }
    removeKBChunkCache(id);
    knowledgeBase = knowledgeBase.filter(function(d) { return d.id !== id; });
    saveKnowledgeBase();
    renderKnowledgeBaseList();
  }

  /**
   * 清空知识库（仅用户上传的）
   */
  function clearKnowledgeBase() {
    var userDocs = knowledgeBase.filter(function(d) { return !d._builtin; });
    if (userDocs.length === 0) {
      appendSystemMessage('没有用户上传的文档。');
      return;
    }
    if (!confirm('确定清空所有用户上传的文档（' + userDocs.length + ' 篇）？内置典籍不受影响。')) return;
    userDocs.forEach(function(d) { removeKBChunkCache(d.id); });
    knowledgeBase = knowledgeBase.filter(function(d) { return d._builtin; });
    saveKnowledgeBase();
    renderKnowledgeBaseList();
    appendSystemMessage('已清空用户文档。');
  }

  /**
   * 渲染知识库列表
   */
  function renderKnowledgeBaseList() {
    var container = document.getElementById('aiKnowledgeList');
    if (!container) return;

    var totalDocs = knowledgeBase.length;
    var indexDocs = kbIndex.length;

    if (totalDocs === 0 && indexDocs === 0) {
      container.innerHTML = '<div class="ai-kb-empty">暂无知识库文档<br><small>上传 .txt / .pdf / .epub 文件<br>或将书籍放入 books/ 文件夹运行<br><code>node scripts/build-kb.js</code></small></div>';
      return;
    }

    var html = '';
    if (indexDocs > 0) {
      html += '<div class="ai-kb-section-header">📚 内置典籍 ' + indexDocs + ' 篇';
      if (kbShardsLoaded > 0) {
        html += ' <span class="ai-kb-loaded">已加载 ' + kbShardsLoaded + ' 分片</span>';
      } else {
        html += ' <span class="ai-kb-loading">加载中...</span>';
      }
      html += '</div>';

      // 显示前 5 个内置典籍标题
      kbIndex.slice(0, 5).forEach(function(d) {
        html += '<div class="ai-kb-item ai-kb-builtin">' +
          '<span class="ai-kb-title">' + escapeHTML(d.title) + '</span>' +
          '<span class="ai-kb-meta">' + (d.totalChars / 10000).toFixed(1) + ' 万字</span>' +
          '</div>';
      });
      if (indexDocs > 5) {
        html += '<div class="ai-kb-more">... 还有 ' + (indexDocs - 5) + ' 篇</div>';
      }
    }

    var userDocs = knowledgeBase.filter(function(d) { return !d._builtin; });
    if (userDocs.length > 0) {
      html += '<div class="ai-kb-section-header">📤 用户上传 ' + userDocs.length + ' 篇</div>';
      userDocs.forEach(function(doc) {
        html += '<div class="ai-kb-item">' +
          '<span class="ai-kb-title">' + escapeHTML(doc.title) + '</span>' +
          '<span class="ai-kb-meta">' + (doc.totalChars / 10000).toFixed(1) + ' 万字 · ' + (doc.addedAt || '').slice(0, 10) + '</span>' +
          '<button class="ai-kb-del" onclick="LocalAI.removeDocument(\'' + doc.id + '\')">✕</button>' +
          '</div>';
      });
    }

    if (totalDocs === 0) {
      html += '<div class="ai-kb-empty">知识库分片加载中...<br><small>请等待加载完成后搜索</small></div>';
    }

    container.innerHTML = html;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== UI 开关 ====================

  function togglePanel() {
    var panel = document.getElementById('aiLocalPanel');
    if (!panel) return;
    var isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
      renderKnowledgeBaseList();
      renderModelSelector();
      updateStatusBadge();
      scrollChatBottom();
    }
  }

  function handleChatKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // ==================== 公开 API ====================

  return {
    init: init,
    loadModel: loadModel,
    unloadModel: unloadModel,
    sendMessage: sendMessage,
    clearChat: clearChat,
    togglePanel: togglePanel,
    uploadDocument: uploadDocument,
    handleDocumentSelected: handleDocumentSelected,
    handleChatKeydown: handleChatKeydown,
    removeDocument: removeDocument,
    clearKnowledgeBase: clearKnowledgeBase,
    renderKnowledgeBaseList: renderKnowledgeBaseList,
    isReady: function() { return !!engine; },
    getStatus: function() {
      return engine ? 'ready' : isLoading ? 'loading' : 'idle';
    }
  };
})();
