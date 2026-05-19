const CACHE = 'wenmo-v17';
const FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/lunar.js',
  './js/ziwei.js',
  './js/ziwei-flow.js',
  './js/ziwei-patterns.js',
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
  './js/name-reading.js',
  './js/bu-shu-extra.js',
  './js/tutorial.js',
  './js/lang.js',
  './js/app.js',
  './js/qimen.js',
  './js/zeri.js',
  './js/luopan.js',
  './js/user-mode.js',
];

// 安装完成后立即激活，不等待旧 SW 释放
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
});

// 激活后立即接管所有窗口，并清理旧缓存
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

// 缓存优先，回退网络
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(resp) {
      return resp || fetch(e.request);
    })
  );
});
