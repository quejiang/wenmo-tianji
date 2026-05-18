const CACHE = 'wenmo-v1';
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
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
