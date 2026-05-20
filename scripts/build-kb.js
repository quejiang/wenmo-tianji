/**
 * 山医命相卜 · 知识库构建脚本
 *
 * 用法: node scripts/build-kb.js
 *
 * 递归扫描 books/ 和 videos/ 的所有子目录，提取纯文本 → 输出 js/kb-preload.json。
 * 存储全文，客户端在浏览器中按需分块搜索，大幅减小文件体积。
 *
 * 支持格式:
 *   .txt .md .srt .vtt  → 直接读取
 *   .pdf                 → npm install pdf-parse
 *   .docx                → npm install mammoth
 *   .epub                → npm install jszip
 *   .doc (旧格式)        → 需先用 Word/LibreOffice 另存为 .docx 或 .pdf
 *
 * 依赖安装: npm install pdf-parse mammoth jszip
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, 'books');
const VIDEOS_DIR = path.join(ROOT, 'videos');
const OUTPUT = path.join(ROOT, 'js', 'kb-preload.json');

const TEXT_EXTS = new Set(['.txt', '.md', '.srt', '.vtt']);
const PDF_EXTS = new Set(['.pdf']);
const DOCX_EXTS = new Set(['.docx']);
const EPUB_EXTS = new Set(['.epub']);
const DOC_EXTS = new Set(['.doc']);
const SUPPORTED_EXTS = new Set([...TEXT_EXTS, ...PDF_EXTS, ...DOCX_EXTS, ...EPUB_EXTS]);

const MEDIA_EXTS = new Set([
  '.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.wma',
  '.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.flv', '.wmv'
]);

// ==================== 主流程 ====================

(async function main() {
  const docs = [];

  // 扫描 books/
  if (fs.existsSync(BOOKS_DIR)) {
    const allFiles = walkDir(BOOKS_DIR);
    const bookFiles = allFiles.filter(f => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()));
    const docFiles = allFiles.filter(f => DOC_EXTS.has(path.extname(f).toLowerCase()));
    const mediaFiles = allFiles.filter(f => MEDIA_EXTS.has(path.extname(f).toLowerCase()));

    if (bookFiles.length > 0) {
      console.log(`📚 books/ — ${bookFiles.length} 个可处理文件\n`);
      for (const relPath of bookFiles) {
        const doc = await processFile(BOOKS_DIR, relPath);
        if (doc) docs.push(doc);
      }
    }

    if (docFiles.length > 0) {
      console.log(`\n⚠️  books/ 中有 ${docFiles.length} 个旧版 .doc 文件（需先转换）:\n`);
      docFiles.forEach(f => console.log(`     books/${f}`));
      console.log('  👉 请用 Word 或 LibreOffice 另存为 .docx 或 .pdf\n');
    }

    if (mediaFiles.length > 0) {
      console.log(`\n⚠️  books/ 中有 ${mediaFiles.length} 个音频/视频文件（需先转文字）:\n`);
      mediaFiles.forEach(f => console.log(`     books/${f}`));
      console.log('  👉 请用 MacWhisper 转文字并导出 .txt 到同目录\n');
    }
  }

  // 扫描 videos/
  if (fs.existsSync(VIDEOS_DIR)) {
    const allFiles = walkDir(VIDEOS_DIR);
    const textFiles = allFiles.filter(f => TEXT_EXTS.has(path.extname(f).toLowerCase()));
    const mediaFiles = allFiles.filter(f => MEDIA_EXTS.has(path.extname(f).toLowerCase()));

    if (textFiles.length > 0) {
      console.log(`🎬 videos/ — ${textFiles.length} 个文字文件\n`);
      for (const relPath of textFiles) {
        const doc = await processFile(VIDEOS_DIR, relPath);
        if (doc) docs.push(doc);
      }
    }

    if (mediaFiles.length > 0) {
      console.log(`\n⚠️  videos/ 中有 ${mediaFiles.length} 个音频/视频文件（需先转文字）:\n`);
      mediaFiles.forEach(f => console.log(`     videos/${f}`));
      console.log('  👉 请用 MacWhisper 转文字并导出 .txt 到同目录\n');
    }
  }

  if (docs.length === 0) {
    console.log('\n❌ 没有成功处理的文档。');
    console.log('\n💡 使用方法:');
    console.log('   1. 把 PDF/DOCX/TXT 放入 books/（支持子目录）');
    console.log('   2. 旧版 .doc 先用 Word/LibreOffice 另存为 .pdf');
    console.log('   3. 运行: npm install pdf-parse mammoth jszip');
    console.log('   4. 再运行: node scripts/build-kb.js');
    process.exit(0);
  }

  // 按分类排序
  docs.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.title.localeCompare(b.title);
  });

  // 分片写入（每片最大约 3M 原始字符）
  const SHARD_MAX_CHARS = 3_000_000;
  const shards = [];
  let shardDocs = [], shardChars = 0, shardIdx = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    shardDocs.push(doc);
    shardChars += doc.totalChars;
    if (shardChars >= SHARD_MAX_CHARS || i === docs.length - 1) {
      const shardFile = `kb-shard-${String(shardIdx).padStart(3, '0')}.json`;
      fs.writeFileSync(path.join(ROOT, 'js', shardFile), JSON.stringify(shardDocs), 'utf-8');
      shards.push({ file: shardFile, docs: shardDocs.length, chars: shardChars });
      shardDocs = []; shardChars = 0; shardIdx++;
    }
  }

  // 索引文件（只含元数据，不含全文）
  const index = docs.map(d => ({
    id: d.id,
    title: d.title,
    fileName: d.fileName,
    category: d.category,
    subcategory: d.subcategory,
    relPath: d.relPath,
    totalChars: d.totalChars,
    addedAt: d.addedAt
  }));
  fs.writeFileSync(OUTPUT, JSON.stringify(index), 'utf-8');

  console.log(`\n🎉 完成！`);
  console.log(`   js/kb-preload.json — 索引（${docs.length} 个文档）`);
  console.log(`   js/kb-shard-*.json — ${shards.length} 个分片`);
  const totalChars = docs.reduce((sum, d) => sum + d.totalChars, 0);
  console.log(`   总字数: ${totalChars.toLocaleString()}`);
  shards.forEach(s => {
    const mb = (fs.statSync(path.join(ROOT, 'js', s.file)).size / 1024 / 1024).toFixed(1);
    console.log(`     ${s.file}: ${s.docs} 篇, ${(s.chars/10000).toFixed(0)} 万字, ${mb} MB`);
  });

  process.exit(0);
})();

// ==================== 递归目录扫描 ====================

function walkDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const sub of walkDir(fullPath)) {
        results.push(path.join(entry.name, sub));
      }
    } else {
      results.push(entry.name);
    }
  }
  return results;
}

// ==================== 文件处理 ====================

async function processFile(baseDir, relPath) {
  const filePath = path.join(baseDir, relPath);
  const ext = path.extname(relPath).toLowerCase();
  const displayPath = path.relative(ROOT, filePath);
  process.stdout.write(`  📖 ${displayPath} ...`);

  try {
    let text = '';

    if (TEXT_EXTS.has(ext)) {
      text = fs.readFileSync(filePath, 'utf-8');
      if (ext === '.srt' || ext === '.vtt') {
        text = cleanSubtitles(text);
      }
    } else if (PDF_EXTS.has(ext)) {
      text = await extractPDF(filePath);
    } else if (DOCX_EXTS.has(ext)) {
      text = await extractDOCX(filePath);
    } else if (EPUB_EXTS.has(ext)) {
      text = await extractEPUB(filePath);
    }

    if (!text || text.trim().length < 50) {
      console.log(' ⚠️ 内容过短，跳过');
      return null;
    }

    // 清洗文本：合并 PDF 断行、去冗余空白
    const cleanedText = cleanText(text);
    const savedPct = text.length > 0 ? ((1 - cleanedText.length / text.length) * 100).toFixed(0) : 0;
    if (savedPct > 0) process.stdout.write(` -${savedPct}%`);
    console.log(` ✅ ${cleanedText.length.toLocaleString()} 字`);

    // 稳定的文档 ID（基于相对路径）
    const id = crypto.createHash('md5').update(relPath).digest('hex').slice(0, 12);

    // 从路径提取分类层级
    const parts = relPath.split(path.sep);
    const category = parts.length > 1 ? parts[0] : '';
    const subcategory = parts.length > 2 ? parts.slice(1, -1).join('/') : '';

    return {
      id,
      title: path.basename(relPath, ext).replace(/^\d+[-_.\s]*/, ''),
      fileName: path.basename(relPath),
      category,
      subcategory,
      relPath,
      text: cleanedText,
      totalChars: cleanedText.length,
      addedAt: new Date().toISOString()
    };
  } catch (err) {
    console.log(` ❌ ${err.message}`);
    return null;
  }
}

// ==================== SRT/VTT 字幕清洗 ====================

function cleanSubtitles(text) {
  return text
    .split('\n')
    .filter(line => {
      line = line.trim();
      if (!line) return false;
      if (/^\d+$/.test(line)) return false;
      if (/^\d{2}:\d{2}:\d{2}[.,]\d{3}.*-->/.test(line)) return false;
      if (/^WEBVTT$/i.test(line)) return false;
      if (/^NOTE\s/.test(line)) return false;
      if (/^{.*}$/.test(line)) return false;
      return true;
    })
    .join('\n')
    .replace(/([。！？.!?])\n/g, '$1')
    .replace(/\n{2,}/g, '\n\n');
}

// ==================== 通用文本清洗 ====================
// PDF 提取的文本常有三大问题：
//   1. 行中换行 → "幽\n默" → "幽默"
//   2. 大量连续空行 → "\n\n\n\n\n" → "\n\n"
//   3. 首尾冗余空白
// 清洗后可缩减 5-15% 体积，同时提升搜索命中率和 LLM 阅读体验

function cleanText(text) {
  // 1. 保护真正的段落分隔（连续两个以上换行）
  text = text.replace(/\n{2,}/g, '\x00PARA\x00');
  // 2. 合并剩余单换行（PDF 的行内断行）
  text = text.replace(/\n/g, '');
  // 3. 恢复段落分隔
  text = text.replace(/\x00PARA\x00/g, '\n\n');
  // 4. 合并多余空格/制表符
  text = text.replace(/[ \t]{2,}/g, ' ');
  // 5. 去除首尾空白
  text = text.trim();
  // 6. 压缩连续空行（可能由替换产生）
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
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
      throw new Error('pdf-parse 未安装 → npm install pdf-parse');
    }
    throw err;
  }
}

// ==================== DOCX 提取 ====================

async function extractDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error('mammoth 未安装 → npm install mammoth');
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
