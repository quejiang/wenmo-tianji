#!/usr/bin/env node
// 山医命相卜 · 本地开发服务器（支持 gzip 压缩）
// 用法: node server.js [端口，默认 8080]

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.argv[2]) || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const CACHE = { '.js': 3600, '.css': 3600, '.png': 86400, '.svg': 86400, '.ico': 86400, '.woff2': 86400 };

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  filePath = path.normalize(filePath);
  if (!filePath.startsWith(ROOT)) { res.statusCode = 403; res.end(); return; }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const maxAge = CACHE[ext] || 0;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      res.end();
      return;
    }

    res.setHeader('Content-Type', mime);
    if (maxAge) res.setHeader('Cache-Control', `public, max-age=${maxAge}`);

    const enc = req.headers['accept-encoding'] || '';
    if (/\bgzip\b/.test(enc) && data.length > 1024) {
      res.setHeader('Content-Encoding', 'gzip');
      zlib.gzip(data, (gzErr, gzData) => {
        if (gzErr) { res.setHeader('Content-Encoding', 'identity'); res.end(data); return; }
        res.end(gzData);
      });
    } else {
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}  (gzip enabled)`);
  console.log(`知识库: ${fs.existsSync(path.join(ROOT, 'js/kb-preload.json')) ? '✅' : '❌ 未构建'}`);
});
