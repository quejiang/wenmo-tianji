const CACHE = 'shan-yi-ming-xiang-bu-v11';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './css/style.css',
  './js/lunar.js',
  './js/ziwei-schools.js',
  './js/ziwei.js',
  './js/ziwei-flow.js',
  './js/ziwei-patterns.js',
  './js/encyclopedia.js',
  './js/ai-analysis.js',
  './js/astrology.js',
  './js/astrology-pro.js',
  './js/bazi-reading.js',
  './js/cases.js',
  './js/qimen.js',
  './js/zeri.js',
  './js/luopan.js',
  './js/user-mode.js',
  './js/tarot-dice.js',
  './js/xiao-liuren.js',
  './js/daily-horoscope.js',
  './js/shan-shu.js',
  './js/yi-shu.js',
  './js/xiang-shu.js',
  './js/name-reading.js',
  './js/bu-shu-extra.js',
  './js/liuyao.js',
  './js/meihua.js',
  './js/bazi-advanced.js',
  './js/export-pdf.js',
  './js/ai-llm.js',
  './js/ai-tutorial.js',
  './js/chart-analysis.js',
  './js/tutorial.js',
  './js/ziwei-course.js',
  './js/lang.js',
  './js/feature-guide.js',
  './js/advanced-features.js',
  './js/local-ai.js',
  './js/kb-preload.json',
  './js/app.js',
];

// 安装时预缓存核心文件，完成后立即激活
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 激活后清理旧缓存，接管所有页面
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ============================================================
// 网络优先策略（Network First）
//
// 为什么不用缓存优先？
//   - 软件更新频繁，缓存优先导致用户永远看不到新版本
//   - 每次升级 SW 版本号虽能触发重新安装，但用户仍需刷新
//     两次才能看到新内容（第一次刷新安装新 SW，第二次才生效）
//
// 网络优先逻辑：
//   1. 先请求网络
//   2. 成功 → 返回最新内容，同时后台静默更新缓存
//   3. 失败（离线/超时）→ 回退缓存
//
// 这样：更新只需发布新文件 + bump sw.js 版本号即可，
// 用户下次打开页面就能看到最新版。
// ============================================================

self.addEventListener('fetch', function(e) {
  var req = e.request;

  // 只处理 GET 请求
  if (req.method !== 'GET') return;

  // 跳过非 HTTP(S) 请求（chrome-extension:// 等）
  if (!/^https?:/.test(req.url)) return;

  e.respondWith(networkFirst(req));
});

function networkFirst(req) {
  return fetch(req, { redirect: 'follow' }).then(function(netResp) {
    // 网络成功 — 克隆一份异步写入缓存
    try {
      var cloned = netResp.clone();
      caches.open(CACHE).then(function(cache) {
        cache.put(req, cloned);
      });
    } catch (ignore) {}
    return netResp;
  }).catch(function() {
    // 网络失败 — 回退缓存
    return caches.match(req);
  });
}
