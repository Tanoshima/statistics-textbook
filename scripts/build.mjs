import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
const siteName = '考え方から理解する現代統計学';
const dest = 'dist';
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.join(dest, 'chapters'), { recursive: true });
fs.mkdirSync(path.join(dest, 'assets'), { recursive: true });
fs.copyFileSync('src/assets/style.css', path.join(dest, 'assets/style.css'));

const exists = chapter => fs.existsSync(path.join('src', 'chapters', chapter.slug + '.md'));
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const url = (chapter, nested) => (nested ? '' : 'chapters/') + chapter.slug + '.html';
function page(title, body, active = null) {
  const nested = !!active;
  const home = nested ? '../index.html' : 'index.html';
  const links = chapters.map(ch => '<li>' + (exists(ch)
    ? '<a href="' + url(ch, nested) + '"' + (active === ch.slug ? ' aria-current="page"' : '') + '>' + esc(ch.number + '. ' + ch.title) + '</a>'
    : '<span class="muted">' + esc(ch.number + '. ' + ch.title) + '</span>') + '</li>').join('');
  return '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="description" content="統計手法の発想と数式の意味を体系的に学ぶ日本語の教科書">'
    + '<title>' + esc(title) + ' | ' + siteName + '</title><link rel="stylesheet" href="' + (nested ? '../' : '') + 'assets/style.css">'
    + '<script>window.MathJax=' + JSON.stringify({ tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] }, options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] } }) + ';</script>'
    + '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js"></script></head><body>'
    + '<header><a href="' + home + '"><strong>' + siteName + '</strong></a><a href="' + home + '#toc">目次</a></header>'
    + '<div class="wrap"><main class="book">' + body + '</main><aside aria-label="章目次"><strong>目次</strong><ol>' + links + '</ol></aside></div></body></html>';
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
