import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const htmlFiles = ['index.html', 'glossary.html', 'references.html',
  ...JSON.parse(fs.readFileSync('chapters.json', 'utf8'))
    .map(chapter => 'chapters/' + chapter.slug + '.html')];
let linkCount = 0;
let errors = [];
for (const relativeFile of htmlFiles) {
  const file = path.join(root, relativeFile);
  assert.ok(fs.existsSync(file), 'Missing generated HTML: ' + relativeFile);
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(href)) continue;
    const [pathname, fragment] = href.split('#', 2);
    if (!pathname) continue;
    let decoded;
    try { decoded = decodeURIComponent(pathname.split('?')[0]); }
    catch { errors.push(relativeFile + ': invalid URL encoding in ' + href); continue; }
    const destination = path.resolve(path.dirname(file), decoded);
    if (!destination.startsWith(root + path.sep) && destination !== root) {
      errors.push(relativeFile + ': local link leaves dist: ' + href);
      continue;
    }
    if (!fs.existsSync(destination)) {
      errors.push(relativeFile + ': missing target: ' + href);
      continue;
    }
    if (fragment && (decoded.endsWith('.html') || path.extname(decoded) === '')) {
      const target = fs.readFileSync(destination, 'utf8');
      const id = decodeURIComponent(fragment);
      if (!target.includes('id="' + id + '"') && !target.includes("id='" + id + "'"))
        errors.push(relativeFile + ': missing fragment in ' + href);
    }
    linkCount++;
  }
}
errors.forEach(message => console.error('ERROR ' + message));
console.log('Checked ' + htmlFiles.length + ' generated HTML pages and '
  + linkCount + ' internal links/assets: ' + errors.length + ' error(s).');
if (errors.length) process.exitCode = 1;
