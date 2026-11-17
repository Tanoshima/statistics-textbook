import assert from 'node:assert/strict';
import fs from 'node:fs';

const intro = fs.readFileSync('dist/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const chapterList = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
let checked = 0;

for (const [name, text] of [['README', readme], ['site index', intro]]) {
  assert.match(text, /私的な学習/, name + ' lacks purpose disclosure');
  assert.match(text, /生成AI/, name + ' lacks AI disclosure');
}
assert.match(readme, /58章/);
assert.match(intro, /id="toc"/);
assert.equal(chapterList.length, 58);
const glossary = fs.readFileSync('dist/glossary.html', 'utf8');
assert.match(glossary, /生成AI/);
assert.match(glossary, /私的な学習/);
assert.match(glossary, /chapters\/58\.html/);
assert.match(glossary, /第8章/);
assert.match(intro, /href="glossary\.html"/);
const references = fs.readFileSync('dist/references.html', 'utf8');
assert.match(references, /私的な学習/);
assert.match(references, /生成AI/);
assert.match(references, /online\.stat\.psu\.edu\/stat501/);
assert.match(references, /openstax\.org/);
assert.match(intro, /href="references\.html"/);

for (const chapter of chapterList) {
  const html = fs.readFileSync('dist/chapters/' + chapter.slug + '.html', 'utf8');
  const name = 'chapter ' + chapter.slug;
  assert.match(html, /lang="ja"/, name + ' lacks lang');
  assert.match(html, /class="editorial-notice"/, name + ' lacks visible notice');
  assert.match(html, /私的な学習/, name + ' lacks purpose disclosure');
  assert.match(html, /生成AI（ChatGPT）/, name + ' lacks AI disclosure');
  assert.match(html, /専門家による査読/, name + ' lacks review caveat');
  assert.match(html, /mathjax@3\.2\.2/, name + ' lacks MathJax');
  assert.match(html, /class="chapter-nav"/, name + ' lacks navigation');
  assert.match(html, /href="\.\.\/glossary\.html"/, name + ' lacks glossary navigation');
  assert.match(html, /href="\.\.\/references\.html"/, name + ' lacks references navigation');
  assert.match(html, /<h1>/, name + ' lacks chapter title');
  assert.match(html, /class="skip-link" href="#main-content"/, name + ' lacks skip link');
  assert.match(html, /id="main-content"/, name + ' lacks main content target');

  const cfg = html.match(/<script>window\.MathJax=([\s\S]*?);<\/script>/);
  assert.ok(cfg, name + ' lacks MathJax config');
  const config = JSON.parse(cfg[1]);
  assert.deepEqual(config.tex.inlineMath, [['$', '$'], ['\\(', '\\)']],
    name + ' has incorrect inline delimiters');
  assert.deepEqual(config.tex.displayMath, [['$$', '$$'], ['\\[', '\\]']],
    name + ' has incorrect display delimiters');
  checked++;
}

// Independent arithmetic checks for selected textbook examples.
// Assertions are intentionally simple and dependency-free.
const approx = (a, b, eps = 1e-8) => assert.ok(Math.abs(a - b) < eps, a + ' != ' + b);
approx((0 * .1 + 1 * .3 + 2 * .4 + 3 * .2), 1.7);
approx((0 * .1 + 1 * .3 + 4 * .4 + 9 * .2) - 1.7 ** 2, .81);
approx(1 - Math.pow(.95, 100), .994079470779666);
approx((1 - 1 / 5) * (1 - 1 / 4), .6);
approx(3 / (1 + 3), .75);
approx(Math.exp(.2) - 1, .2214027581601699);
approx(8 / 14, 4 / 7);
approx(1 - (1 / 6) / (14 / 3), 27 / 28);

console.log('Verified rendered disclosures, MathJax configuration and navigation for '
  + checked + ' chapters, plus 8 arithmetic checks.');
