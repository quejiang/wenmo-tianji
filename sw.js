const CACHE = 'wenmo-v3';
const FILES = [
  './index.html',
  './css/style.css',
  './js/lunar.js',
  './js/ziwei.js',
  './js/ziwei-flow.js',
  './js/encyclopedia.js',
  './js/ai-analysis.js',
  './js/astrology.js',
  './js/astrology-pro.js',
  './js/bazi-reading.js',
  './js/cases.js',
  './js/tarot-dice.js',
  './js/xiao-liuren.js',
  './js/daily-horoscope.js',
  './js/shan-shu.js',
  './js/yi-shu.js',
  './js/xiang-shu.js',
  './js/bu-shu-extra.js',
  './js/app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 去除 URL 中的查询参数，确保 ?v=16 等版本号不影响缓存匹配
function stripQuery(url) {
  var i = url.indexOf('?');
  return i === -1 ? url : url.substring(0, i);
}

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }));
  // 新 SW 立即激活
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // 清除旧版本缓存
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // 只处理同源请求
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // 去除查询参数后的 URL 作为缓存键
  var strippedUrl = stripQuery(e.request.url);

  e.respondWith(
    caches.match(strippedUrl).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // 只缓存成功的 GET 响应
        if (response && response.status === 200 && e.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) {
            c.put(strippedUrl, clone);
          });
        }
        return response;
      });
    })
  );
});
