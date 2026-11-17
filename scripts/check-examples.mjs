import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const approx = (actual, expected, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < tolerance,
    'expected ' + expected + ', observed ' + actual);
};
const chapters = JSON.parse(fs.readFileSync('chapters.json', 'utf8'));
let imageReferences = 0;

// Every Markdown image reference must point to an existing, repository-local asset.
// Also verify generated HTML uses the same accessible image links.
for (const chapter of chapters) {
  const file = path.resolve('src/chapters', chapter.slug + '.md');
  const source = fs.readFileSync(file, 'utf8');
  const html = fs.readFileSync('dist/chapters/' + chapter.slug + '.html', 'utf8');
  for (const match of source.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) {
    const [, alt, href] = match;
    assert.ok(alt.trim().length >= 12, chapter.slug + ': diagram needs descriptive alt text');
    assert.ok(!href.includes('://'), chapter.slug + ': use local assets');
    const target = path.resolve(path.dirname(file), href);
    assert.ok(target.startsWith(path.resolve('src/assets') + path.sep),
      chapter.slug + ': image points outside assets');
    assert.ok(fs.existsSync(target), chapter.slug + ': missing image ' + href);
    const published = path.resolve('dist/chapters', href);
    assert.ok(fs.existsSync(published), chapter.slug + ': image not published ' + href);
    assert.ok(html.includes('src="' + href + '"'), chapter.slug + ': HTML link missing');
    imageReferences++;
  }
}
assert.ok(imageReferences >= 3, 'Expected at least 3 textbook illustrations');

// Independently compute the ANOVA example in chapter 24 using raw observations.
// The expected values are derived from the six raw observations, not from the text.
const groups = [[2, 4], [4, 6], [8, 10]];
const all = groups.flat();
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const grandMean = mean(all);
const ssWithin = groups.reduce((total, g) =>
  total + g.reduce((a, x) => a + (x - mean(g)) ** 2, 0), 0);
const ssBetween = groups.reduce((total, g) =>
  total + g.length * (mean(g) - grandMean) ** 2, 0);
const ssTotal = all.reduce((a, x) => a + (x - grandMean) ** 2, 0);
const F = (ssBetween / (groups.length - 1)) / (ssWithin / (all.length - groups.length));
approx(grandMean, 17 / 3);
approx(ssWithin, 6);
approx(ssBetween, 112 / 3);
approx(ssTotal, 130 / 3);
approx(ssWithin + ssBetween, ssTotal);
approx(F, 28 / 3);
const anova = fs.readFileSync('src/chapters/24.md', 'utf8');
assert.match(anova, /\\frac\{34\}\{6\}=\\frac\{17\}\{3\}/);
assert.match(anova, /SS_B=2\(3-17\/3\)/);
assert.match(anova, /F=\\frac\{\(112\/3\)\/2\}/);
assert.doesNotMatch(anova, /30\/6=5|SS_B=2\(3-5\)|F=\\frac\{40\/2\}/);

// The sampling-distribution figure must match the chapter 8 exact probabilities.
const probabilities = [0.25, 0.5, 0.25];
approx(probabilities.reduce((a, p) => a + p, 0), 1);
approx(probabilities.reduce((a, p, i) => a + p * i, 0), 1);
approx(probabilities.reduce((a, p, i) => a + p * (i - 1) ** 2, 0), 0.5);

// The interval-coverage illustration depicts 19 out of 20 ranges covering
// a fixed mean. Count geometric inclusion instead of trusting the labels.
const coverage = fs.readFileSync('src/assets/confidence-coverage.svg', 'utf8');
const ranges = [...coverage.matchAll(/<line x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="\2" stroke="(#[0-9a-f]+)" stroke-width="5"/g)];
assert.equal(ranges.length, 20, 'Expected exactly 20 interval lines');
assert.equal(ranges.filter(([, x1, , x2]) => Number(x1) <= 455 && Number(x2) >= 455).length, 19);
assert.equal(ranges.filter(([, x1, , x2, color]) =>
  (Number(x1) <= 455 && Number(x2) >= 455) === (color === '#287c75')).length, 20,
'Interval inclusion and illustration color disagree');

// Independent worked-example arithmetic for chapters 21-23.
const quadratic = x => 10 + 4 * x - 0.5 * x * x;
approx(quadratic(1), 13.5);
approx(quadratic(2), 16);
approx(quadratic(3), 17.5);
approx(quadratic(4), 18);
approx(quadratic(4) - quadratic(3), 0.5);
approx(4 - 4, 0); // derivative at the maximum
const aic = (k, logLikelihood) => 2 * k - 2 * logLikelihood;
approx(aic(2, -50), 104);
approx(aic(4, -46), 100);
approx(aic(3, -75), 156);
approx(aic(5, -72), 154);

// School fixed-effect example: first differences cancel time-invariant effects.
const schools = [
  { x0: 1, x1: 2, y0: 60, y1: 66 },
  { x0: 2, x1: 3, y0: 70, y1: 76 }
];
for (const school of schools) {
  const dx = school.x1 - school.x0;
  const dy = school.y1 - school.y0;
  approx(dx, 1);
  approx(dy / dx, 6);
}
approx((68 - 60) - (72 - 70), 6);

// Hedonic regression: differences in conditional log prices and retransformation.
const logPrice = (area, age) => 7 + .012 * area - .020 * age;
approx(logPrice(65, 12) - logPrice(60, 10), .02);
approx(Math.exp(.012 * 10), 1.1274968515793757);
approx(Math.exp(-.020 * 5), .9048374180359595);
approx(Math.exp(.02), 1.0202013400267558);
const logNormalMean = (eta, variance) => Math.exp(eta + variance / 2);
approx(logNormalMean(7, .25) / Math.exp(7), Math.exp(.125));
const textbook21 = fs.readFileSync('src/chapters/21.md', 'utf8');
const textbook22 = fs.readFileSync('src/chapters/22.md', 'utf8');
const textbook23 = fs.readFileSync('src/chapters/23.md', 'utf8');
for (const [num, source] of [[21, textbook21], [22, textbook22], [23, textbook23]]) {
  assert.match(source, /^## (?:21|22|23)\.\d+ 演習/m, 'Chapter ' + num + ' lacks numbered exercises');
  assert.match(source, /^## (?:21|22|23)\.\d+ 演習の解答/m, 'Chapter ' + num + ' lacks numbered answers');
}
assert.match(textbook23, /E\[P\\mid X=x\]/);
assert.match(textbook23, /e\^\{\\eta\(x\)\+\\sigma\^2\/2\}/);

console.log('Checked ' + imageReferences + ' image references, 20 coverage intervals, '
  + 'the exact sample-mean probabilities, ANOVA, and chapter 21-23 example calculations.');
