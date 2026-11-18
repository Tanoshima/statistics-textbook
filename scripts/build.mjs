import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
// Protect TeX from Markdown's emphasis, typography and escaping rules.
md.inline.ruler.before('emphasis', 'tex_inline', (state, silent) => {
  const start = state.pos;
  if (state.src[start] !== '$' || state.src[start + 1] === '$') return false;
  let close = start + 1;
  while (close < state.posMax) {
    if (state.src[close] === '\n') return false;
    if (state.src[close] === '$') {
      let slashes = 0;
      for (let i = close - 1; i > start && state.src[i] === '\\'; i--) slashes++;
      if (slashes % 2 === 0) break;
    }
    close++;
  }
  if (close >= state.posMax || close === start + 1) return false;
  if (!silent) {
    const token = state.push('tex_inline', 'span', 0);
    token.content = state.src.slice(start, close + 1);
  }
  state.pos = close + 1;
  return true;
});
md.renderer.rules.tex_inline = (tokens, i) =>
  '<span class="tex-inline">' + md.utils.escapeHtml(tokens[i].content) + '</span>';

// Our authored display equations use $$ on separate lines.
md.block.ruler.before('fence', 'tex_block', (state, start, end, silent) => {
  if (state.sCount[start] - state.blkIndent >= 4) return false;
  const line = i => state.src.slice(state.bMarks[i] + state.tShift[i], state.eMarks[i]).trim();
  if (line(start) !== '$$') return false;
  let close = start + 1;
  while (close < end && line(close) !== '$$') close++;
  if (close === end) return false;
  if (!silent) {
    const token = state.push('tex_block', 'div', 0);
    token.block = true;
    token.content = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[close]);
    token.map = [start, close + 1];
  }
  state.line = close + 1;
  return true;
});
md.renderer.rules.tex_block = (tokens, i) =>
  '<div class="tex-block">' + md.utils.escapeHtml(tokens[i].content) + '</div>\n';

const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
const siteName = '考え方から理解する現代統計学';
const dest = 'dist';
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.join(dest, 'chapters'), { recursive: true });
fs.mkdirSync(path.join(dest, 'assets'), { recursive: true });
fs.copyFileSync('src/assets/style.css', path.join(dest, 'assets/style.css'));
for (const name of ['sampling-distribution.svg', 'confidence-coverage.svg', 'anova-decomposition.svg']) {
  fs.copyFileSync(path.join('src', 'assets', name), path.join(dest, 'assets', name));
}

const exists = chapter => fs.existsSync(path.join('src', 'chapters', chapter.slug + '.md'));
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const url = (chapter, nested) => (nested ? '' : 'chapters/') + chapter.slug + '.html';
function page(title, body, active = null) {
  const nested = !!active;
  const home = nested ? '../index.html' : 'index.html';
  const links = chapters.map(ch => '<li>' + (exists(ch)
    ? '<a href="' + url(ch, nested) + '"' + (active === ch.slug ? ' aria-current="page"' : '') + '>' + esc(ch.number + '. ' + ch.title) + '</a>'
    : '<span class="muted">' + esc(ch.number + '. ' + ch.title) + '</span>') + '</li>').join('');
  // Disclose AI assistance on every chapter page, not just on the homepage.
  const editorialNotice = active
    ? '<section class="editorial-notice" aria-label="制作目的とAI利用について"><strong>制作目的とAI利用について</strong><p>本書は制作者が私的な学習・復習のために制作した教材です。本文・数式・例題・演習の生成や改訂に生成AI（ChatGPT）を利用しています。私的学習用として一通り完成しています。誤りが残る可能性があるため、必要に応じて随時修正します。研究や重要な用途では原典等も確認してください。</p></section>'
    : '';
  return '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="description" content="統計手法の発想と数式の意味を体系的に学ぶ日本語の教科書">'
    + '<title>' + esc(title) + ' | ' + siteName + '</title><link rel="stylesheet" href="' + (nested ? '../' : '') + 'assets/style.css">'
    + '<script>window.MathJax=' + JSON.stringify({ tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] }, options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] } }) + ';</script>'
    + '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js" integrity="sha384-AHAnt9ZhGeHIrydA1Kp1L7FN+2UosbF7RQg6C+9Is/a7kDpQ1684C2iH2VWil6r4" crossorigin="anonymous"></script></head><body>'
    + '<a class="skip-link" href="#main-content">本文へスキップ</a><header><a href="' + home + '"><strong>' + siteName + '</strong></a><a href="' + home + '#toc">目次</a><a href="' + (nested ? '../' : '') + 'glossary.html">用語集</a><a href="' + (nested ? '../' : '') + 'references.html">参考資料</a><a href="' + (nested ? '../' : '') + 'reproduce.html">計算例</a></header>'
    + '<div class="wrap"><main class="book" id="main-content">' + editorialNotice + body + '</main><aside aria-label="章目次"><strong>目次</strong><ol>' + links + '</ol></aside></div></body></html>';
}
let toc = '';
let currentPart = 0;
for (const chapter of chapters) {
  if (chapter.part !== currentPart) {
    if (currentPart !== 0) toc += '</ol>';
    currentPart = chapter.part;
    toc += '<h2>第' + currentPart + '部 ' + esc(chapter.partTitle) + '</h2><ol start="' + chapter.number + '">';
  }
  toc += '<li>' + (exists(chapter) ? '<a href="' + url(chapter, false) + '">' + esc(chapter.title) + '</a>'
      : esc(chapter.title) + ' <span class="muted">（準備中）</span>') + '</li>';
}
toc += '</ol>';
const intro = md.render(fs.readFileSync('src/index.md', 'utf8')).replace('<h2>目次</h2>', '<h2 id="toc">目次</h2>');
fs.writeFileSync(path.join(dest, 'index.html'), page('目次', intro + toc));
const glossary = md.render(fs.readFileSync('src/glossary.md', 'utf8'));
fs.writeFileSync(path.join(dest, 'glossary.html'), page('用語集', glossary));
const references = md.render(fs.readFileSync('src/references.md', 'utf8'));
fs.writeFileSync(path.join(dest, 'references.html'), page('参考資料', references));
const reproduce = md.render(fs.readFileSync('src/reproduce.md', 'utf8'));
fs.writeFileSync(path.join(dest, 'reproduce.html'), page('再現可能な計算例', reproduce));
const published = chapters.filter(exists);
for (let i = 0; i < published.length; i++) {
  const ch = published[i];
  const prev = published[i - 1];
  const next = published[i + 1];
  const nav = '<nav class="chapter-nav">' + (prev ? '<a href="' + prev.slug + '.html">← 第' + prev.number + '章</a>' : '<a href="../index.html">← 目次</a>')
    + (next ? '<a href="' + next.slug + '.html">第' + next.number + '章 →</a>' : '<span class="muted">次章：準備中</span>') + '</nav>';
  const source = fs.readFileSync(path.join('src', 'chapters', ch.slug + '.md'), 'utf8');
  fs.writeFileSync(path.join(dest, 'chapters', ch.slug + '.html'), page('第' + ch.number + '章 ' + ch.title, md.render(source) + nav, ch.slug));
}
fs.writeFileSync(path.join(dest, '.nojekyll'), '');
console.log('Built ' + published.length + ' chapters / ' + chapters.length + ' chapter outline.');
