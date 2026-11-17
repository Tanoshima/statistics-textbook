import fs from 'node:fs';

const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
const errors = [];
const warnings = [];
const chaptersOnDisk = fs.readdirSync('src/chapters').filter(x => x.endsWith('.md')).sort();
if (chapters.length !== 58 || chaptersOnDisk.length !== 58) errors.push('Expected 58 indexed Markdown chapters');
for (const [i, chapter] of chapters.entries()) {
  const filename = 'src/chapters/' + chapter.slug + '.md';
  if (chapter.number !== i + 1 || chapter.slug !== String(i + 1).padStart(2, '0'))
    errors.push(filename + ': chapter index mismatch');
  if (!fs.existsSync(filename)) {
    errors.push(filename + ': missing');
    continue;
  }
  const source = fs.readFileSync(filename, 'utf8');
  const title = source.match(/^# (.+)$/m)?.[1];
  if (title !== '第' + chapter.number + '章　' + chapter.title)
    errors.push(filename + ': heading/title mismatch');
  if (!/^## (?:\d+(?:\.\d+)?\s+)?演習(?:\s|$)/m.test(source)) errors.push(filename + ': missing exercise heading');
  if (!/解答|解説/.test(source)) errors.push(filename + ': missing answers');

  // Ignore fenced code and inline code spans while scanning math.
  let fence = false;
  const lines = source.split('\n').map(line => {
    if (/^\s*(?:\x60{3,}|~{3,})/.test(line)) { fence = !fence; return ''; }
    if (fence) return '';
    return line.replace(/\x60[^\x60]*\x60/g, '');
  });
  const plain = lines.join('\n');
  let state = '';
  let expression = '';
  let start = 0;
  for (let j = 0; j < plain.length; j++) {
    if (plain[j] !== '$') {
      if (state) expression += plain[j];
      continue;
    }
    let slashes = 0;
    for (let k = j - 1; k >= 0 && plain[k] === '\\'; k--) slashes++;
    if (slashes % 2) { if (state) expression += '$'; continue; }
    const delimiter = plain[j + 1] === '$' ? '$$' : '$';
    if (delimiter === '$$') j++;
    if (!state) { state = delimiter; expression = ''; start = j; continue; }
    if (state !== delimiter) { errors.push(filename + ': mixed math delimiters around character ' + start); state = ''; continue; }
    if (!expression.trim()) errors.push(filename + ': empty math expression at ' + start);
    let depth = 0;
    for (let p = 0; p < expression.length; p++) {
      let bslashes = 0;
      for (let k = p - 1; k >= 0 && expression[k] === '\\'; k--) bslashes++;
      if (bslashes % 2) continue;
      if (expression[p] === '{') depth++;
      if (expression[p] === '}') depth--;
      if (depth < 0) { errors.push(filename + ': unexpected closing brace at ' + start); break; }
    }
    if (depth > 0) errors.push(filename + ': unclosed brace at ' + start);
    if (/\\\\(?:frac|sqrt|sum|operatorname|alpha|beta|mu|sigma|theta|lambda|log|geq|leq|begin|end)\b/.test(expression))
      errors.push(filename + ': TeX command has doubled backslash at ' + start);
    if (/(?:Xge|Xle|Pge|Ple)\d/.test(expression))
      warnings.push(filename + ': possible missing comparator at ' + start);
    state = ''; expression = '';
  }
  if (state) errors.push(filename + ': unclosed ' + state + ' around character ' + start);
}
warnings.forEach(x => console.warn('WARNING ' + x));
errors.forEach(x => console.error('ERROR ' + x));
console.log('Checked ' + chapters.length + ' chapters: ' + errors.length + ' error(s), ' + warnings.length + ' warning(s).');
if (errors.length) process.exitCode = 1;
