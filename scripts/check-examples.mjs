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
// This is a regression test for a previously incorrect grand mean and F statistic.
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
approx(grandMean, 5);
approx(ssWithin, 6);
approx(ssBetween, 40);
approx(ssTotal, 46);
approx(ssWithin + ssBetween, ssTotal);
approx(F, 10);
const anova = fs.readFileSync('src/chapters/24.md', 'utf8');
assert.match(anova, /30\/6=5/);
assert.match(anova, /SS_B=2\(3-5\)/);
assert.match(anova, /F=\\frac\{40\/2\}/);
assert.doesNotMatch(anova, /112\/3|28\}\/\{3\}|34\/6/);

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

console.log('Checked ' + imageReferences + ' image references, 20 coverage intervals, '
  + 'the exact sample-mean probabilities and the ANOVA arithmetic.');
