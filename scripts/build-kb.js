/**
 * 山医命相卜 · 知识库构建脚本
 *
 * 用法: node scripts/build-kb.js
 *
 * 读取 books/ 目录下所有 .txt .md .pdf .epub 文件，
 * 提取纯文本 → 分块 → 输出为 js/kb-preload.json。
 *
 * PDF 依赖: npm install pdf-parse (需 Java/无头浏览器备选)
 * EPUB 依赖: npm install jszip (已安装)
 *
 * 浏览器运行时直接 fetch 这个 JSON，无需用户手动上传。
 */

const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '..', 'books');
const OUTPUT = path.join(__dirname, '..', 'js', 'kb-preload.json');
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

// ==================== 主流程 ====================

(async function main() {
  if (!fs.existsSync(BOOKS_DIR)) {
    console.log('books/ 目录不存在，跳过。');
    process.exit(0);
  }

  const files = fs.readdirSync(BOOKS_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.txt', '.md', '.pdf', '.epub'].includes(ext);
  });

  if (files.length === 0) {
    console.log('books/ 目录为空，跳过。');
    process.exit(0);
  }

  console.log(`找到 ${files.length} 个文件，开始处理...\n`);

  const docs = [];

  for (const file of files) {
    const filePath = path.join(BOOKS_DIR, file);
    const ext = path.extname(file).toLowerCase();
    console.log(`  📖 ${file} ...`);

    try {
      let text = '';

      if (ext === '.txt' || ext === '.md') {
        text = fs.readFileSync(filePath, 'utf-8');
      } else if (ext === '.pdf') {
        text = await extractPDF(filePath);
      } else if (ext === '.epub') {
        text = await extractEPUB(filePath);
      }

      if (!text || text.trim().length < 50) {
        console.log(`    ⚠️ 内容过短，跳过`);
        continue;
      }

      const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
      const doc = {
        id: Date.now() + files.indexOf(file),
        title: file.replace(/\.(pdf|txt|md|epub)$/i, ''),
        source: file,
        chunks: chunks,
        addedAt: new Date().toISOString()
      };

      docs.push(doc);
      console.log(`    ✅ ${chunks.length} 个知识块，${text.length} 字`);
    } catch (err) {
      console.log(`    ❌ 失败: ${err.message}`);
    }
  }

  if (docs.length === 0) {
    console.log('\n没有成功处理的文档，跳过输出。');
    process.exit(0);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(docs, null, 2), 'utf-8');
  console.log(`\n🎉 完成！已输出 ${OUTPUT}（${docs.length} 个文档）`);
})();

// ==================== PDF 提取 ====================

async function extractPDF(filePath) {
  // 优先使用 pdf-parse (Node.js native)
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('    ⚠️ pdf-parse 未安装，跳过 PDF。安装: npm install pdf-parse');
      return '';
    }
    throw err;
  }
}

// ==================== EPUB 提取 ====================

async function extractEPUB(filePath) {
  try {
    const JSZip = require('jszip');
    const data = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(data);

    // 1. container.xml → OPF 路径
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

    // 2. 解析 spine
    const idrefs = [];
    const idrefRe = /<itemref[^>]*idref="([^"]+)"/g;
    let m;
    while ((m = idrefRe.exec(opfXml)) !== null) {
      idrefs.push(m[1]);
    }

    // 3. 解析 manifest
    const manifest = {};
    const itemRe = /<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"/g;
    while ((m = itemRe.exec(opfXml)) !== null) {
      manifest[m[1]] = { href: m[2], mediaType: m[3] };
    }

    // 4. 提取所有章节
    const allText = [];
    let chapterCount = 0;

    for (const idref of idrefs) {
      const item = manifest[idref];
      if (!item) continue;

      let fullPath = basePath + item.href;

      let chapterFile = zip.files[fullPath];
      if (!chapterFile) {
        // 尝试其他可能的路径
        const found = Object.keys(zip.files).find(k => k.endsWith('/' + item.href) || k === item.href);
        if (found) chapterFile = zip.files[found];
      }

      if (!chapterFile || chapterFile.dir) continue;

      try {
        const html = await chapterFile.async('string');

        // 简单 HTML 标签清理 (Node 环境无 DOMParser，用正则)
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

        if (text.length > 20) {
          chapterCount++;
          allText.push(text);
        }
      } catch (e) {
        // 跳过
      }
    }

    if (allText.length === 0) throw new Error('未提取到有效章节文本');
    return allText.join('\n\n');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('    ⚠️ jszip 未安装，跳过 EPUB。安装: npm install jszip');
      return '';
    }
    throw err;
  }
}

// ==================== 分块 ====================

function chunkText(text, chunkSize, overlap) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];

  paragraphs.forEach(para => {
    para = para.trim();
    if (!para) return;

    if (para.length <= chunkSize) {
      chunks.push(para);
      return;
    }

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
