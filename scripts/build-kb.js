/**
 * 山医命相卜 · 知识库构建脚本
 *
 * 用法: node scripts/build-kb.js
 *
 * 扫描 books/ 和 videos/ 目录，提取纯文本 → 分块 → 输出 js/kb-preload.json。
 *
 * 支持格式:
 *   books/   → .txt .md .pdf .epub
 *   videos/  → .txt .srt .vtt（先用 MacWhisper 转视频为文字）
 *
 * 视频转文字:
 *   1. 把视频文件放入 videos/
 *   2. 用 MacWhisper 打开视频，点击 Transcribe
 *   3. Export → Text，保存到 videos/（同目录、同文件名 .txt）
 *   4. 再运行本脚本即可
 *
 * PDF 依赖: npm install pdf-parse
 * EPUB 依赖: npm install jszip
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, 'books');
const VIDEOS_DIR = path.join(ROOT, 'videos');
const OUTPUT = path.join(ROOT, 'js', 'kb-preload.json');
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

// ==================== 主流程 ====================

(async function main() {
  const docs = [];

  // 扫描 books/
  const bookFiles = scanDir(BOOKS_DIR, ['.txt', '.md', '.pdf', '.epub']);
  if (bookFiles.length > 0) {
    console.log(`📚 books/ — ${bookFiles.length} 个文件\n`);
    for (const f of bookFiles) {
      const doc = await processFile(BOOKS_DIR, f);
      if (doc) docs.push(doc);
    }
  }

  // 扫描 videos/
  checkVideoDir();

  const videoTextFiles = scanDir(VIDEOS_DIR, ['.txt', '.srt', '.vtt']);
  if (videoTextFiles.length > 0) {
    console.log(`🎬 videos/ — ${videoTextFiles.length} 个文字文件\n`);
    for (const f of videoTextFiles) {
      const doc = await processFile(VIDEOS_DIR, f);
      if (doc) docs.push(doc);
    }
  }

  if (docs.length === 0) {
    console.log('没有成功处理的文档。');
    console.log('\n💡 提示:');
    console.log('   - 书籍放入 books/ 文件夹');
    console.log('   - 视频先用 MacWhisper 转文字后放入 videos/');
    console.log('   - 然后重新运行: node scripts/build-kb.js');
    process.exit(0);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(docs, null, 2), 'utf-8');
  console.log(`\n🎉 完成！已输出 js/kb-preload.json（${docs.length} 个文档）`);
})();

// ==================== 目录扫描 ====================

function scanDir(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => exts.includes(path.extname(f).toLowerCase()));
}

function checkVideoDir() {
  if (!fs.existsSync(VIDEOS_DIR)) return;
  const videoExts = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.flv', '.wmv'];
  const videoFiles = fs.readdirSync(VIDEOS_DIR).filter(f => videoExts.includes(path.extname(f).toLowerCase()));

  if (videoFiles.length > 0) {
    console.log(`\n⚠️  videos/ 中有 ${videoFiles.length} 个视频文件尚未转文字:\n`);
    videoFiles.forEach(f => console.log(`     ${f}`));
    console.log(`\n  👉 请用 MacWhisper 逐个转录并导出 .txt 到 videos/，然后重新运行本脚本。\n`);
  }
}

// ==================== 文件处理 ====================

async function processFile(dir, file) {
  const filePath = path.join(dir, file);
  const ext = path.extname(file).toLowerCase();
  process.stdout.write(`  📖 ${file} ...`);

  try {
    let text = '';

    if (ext === '.txt' || ext === '.md' || ext === '.srt' || ext === '.vtt') {
      text = fs.readFileSync(filePath, 'utf-8');
      // 清理 SRT/VTT 时间戳
      if (ext === '.srt' || ext === '.vtt') {
        text = cleanSubtitles(text);
      }
    } else if (ext === '.pdf') {
      text = await extractPDF(filePath);
    } else if (ext === '.epub') {
      text = await extractEPUB(filePath);
    }

    if (!text || text.trim().length < 50) {
      console.log(` ⚠️ 内容过短，跳过`);
      return null;
    }

    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
    console.log(` ✅ ${chunks.length} 块，${text.length} 字`);

    return {
      id: Date.now() + Math.random(),
      title: file.replace(/\.(pdf|txt|md|epub|srt|vtt)$/i, ''),
      source: file,
      chunks: chunks,
      addedAt: new Date().toISOString()
    };
  } catch (err) {
    console.log(` ❌ ${err.message}`);
    return null;
  }
}

// ==================== SRT/VTT 字幕清洗 ====================

function cleanSubtitles(text) {
  // 移除序号行、时间戳行、VTT 头部
  return text
    .split('\n')
    .filter(line => {
      line = line.trim();
      if (!line) return false;
      if (/^\d+$/.test(line)) return false;                    // 序号
      if (/^\d{2}:\d{2}:\d{2}[.,]\d{3}.*-->/.test(line)) return false; // 时间戳
      if (/^WEBVTT$/i.test(line)) return false;                // VTT 头
      if (/^NOTE\s/.test(line)) return false;                  // VTT 注释
      if (/^{.*}$/.test(line)) return false;                   // JSON 元数据
      return true;
    })
    .join('\n')
    .replace(/([。！？.!?])\n/g, '$1')   // 合并断句
    .replace(/\n{2,}/g, '\n\n');
}

// ==================== PDF 提取 ====================

async function extractPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error('pdf-parse 未安装，执行: npm install pdf-parse');
    }
    throw err;
  }
}

// ==================== EPUB 提取 ====================

async function extractEPUB(filePath) {
  const JSZip = require('jszip');
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);

  const containerFile = zip.files['META-INF/container.xml'];
  if (!containerFile) throw new Error('缺少 META-INF/container.xml');

  const containerXml = await containerFile.async('string');
  const opfMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!opfMatch) throw new Error('无法找到 OPF 路径');

  const opfPath = opfMatch[1];
  const opfFile = zip.files[opfPath];
  if (!opfFile) throw new Error('OPF 文件不存在');

  const opfXml = await opfFile.async('string');
  const basePath = opfPath.replace(/[^/]+$/, '');

  const idrefs = [];
  const idrefRe = /<itemref[^>]*idref="([^"]+)"/g;
  let m;
  while ((m = idrefRe.exec(opfXml)) !== null) idrefs.push(m[1]);

  const manifest = {};
  const itemRe = /<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"/g;
  while ((m = itemRe.exec(opfXml)) !== null) {
    manifest[m[1]] = { href: m[2], mediaType: m[3] };
  }

  const allText = [];
  for (const idref of idrefs) {
    const item = manifest[idref];
    if (!item) continue;

    let fullPath = basePath + item.href;
    let chapterFile = zip.files[fullPath];
    if (!chapterFile) {
      const found = Object.keys(zip.files).find(k => k.endsWith('/' + item.href) || k === item.href);
      if (found) chapterFile = zip.files[found];
    }
    if (!chapterFile || chapterFile.dir) continue;

    try {
      const html = await chapterFile.async('string');
      let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<ruby[^>]*>[\s\S]*?<\/ruby>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#?\w+;/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (text.length > 20) allText.push(text);
    } catch (e) { /* skip */ }
  }

  if (allText.length === 0) throw new Error('未提取到有效章节文本');
  return allText.join('\n\n');
}

// ==================== 分块 ====================

function chunkText(text, chunkSize, overlap) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];

  paragraphs.forEach(para => {
    para = para.trim();
    if (!para) return;
    if (para.length <= chunkSize) { chunks.push(para); return; }

    const sentences = para.split(/(?<=[。！？.!?])\s*/);
    let current = '';
    sentences.forEach(s => {
      if ((current + s).length > chunkSize && current.length > 0) {
        chunks.push(current.trim());
        current = current.slice(-overlap) + s;
      } else {
        current += s;
      }
    });
    if (current.trim()) chunks.push(current.trim());
  });

  return chunks.map((text, i) => ({ text, index: i }));
}
