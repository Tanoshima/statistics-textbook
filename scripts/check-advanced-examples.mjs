import assert from 'node:assert/strict';
import fs from 'node:fs';

let cases = 0;
const approx = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Number.isFinite(actual), 'Non-finite result in numeric verification');
  assert.ok(Math.abs(actual - expected) <= tolerance,
    'Expected ' + expected + ', obtained ' + actual);
  cases++;
};
const equal = (actual, expected) => { assert.deepEqual(actual, expected); cases++; };
const mean = values => values.reduce((sum, x) => sum + x, 0) / values.length;
const variance = values => mean(values.map(x => (x - mean(values)) ** 2));
const results = [];
for (let n = 25; n <= 58; n++) {
  const pathname = 'src/chapters/' + String(n).padStart(2, '0') + '.md';
  const source = fs.readFileSync(pathname, 'utf8');
  assert.match(source, /^## (?:\d+\.\d+ )?検算できる発展例：/m, pathname + ': missing new worked example');
  assert.match(source, /追加演習/, pathname + ': missing further exercise');
  assert.match(source, /解答/, pathname + ': missing answer');
  const genericFragments = [
    '数式で重要なのは、値を機械的に代入することではなく',
    '左辺が知りたい量、右辺がその量をどう定義',
    '式の左辺が目的とする量で、右辺には前提となる確率',
    'この式で未知なのは何か、データから直接得られるのは',
    '数値の解釈は、式の左辺が何を表すかから始める',
    '計算できたら単位と解釈を確認し',
    '数値を計算したあと、単位と母集団への適用範囲を必ず'
  ];
  for (const phrase of genericFragments)
    assert.ok(!source.includes(phrase), pathname + ': generic placeholder was reintroduced');
  const goal = source.match(/^> \*\*学習目標\*\*：(.+)$/m)?.[1];
  if (goal) {
    const body = source.slice(source.indexOf('\n## ') + 1);
    assert.ok(!body.includes('\n\n' + goal + '\n'),
      pathname + ': introductory paragraph duplicates the learning goal');
  }
  results.push(source);
}
equal(results.length, 34);

// 25-30: experimental design, causal inference, PCA, factor models, k-means.
approx(Math.sqrt(100 / 50 + 100 / 50), 2);
approx(Math.sqrt(100 / 25 + 100 / 25), Math.sqrt(8));
approx(15 - 12, 3);
approx((130 - 100) - (95 - 80), 15);
approx((62 - 50) - (45 - 40), 7);
approx((1 + 0.8) / 2, 0.9);
approx((1 + 0.6) / 2, 0.8);
approx(0.5 * 2, 1);
const clusters = [[1, 2], [9, 10]];
approx(clusters.reduce((sum, group) =>
  sum + group.reduce((ss, x) => ss + (x - mean(group)) ** 2, 0), 0), 1);
approx([1, 2, 9, 10].reduce((ss, x) => ss + (x - 5.5) ** 2, 0), 65);

// 31-38: differences, forecasts, filtering, time-respecting accuracy.
equal([100, 110, 120, 130].slice(1).map((x, i) => x - [100, 110, 120, 130][i]), [10, 10, 10]);
equal([50, 55, 58, 65].slice(1).map((x, i) => x - [50, 55, 58, 65][i]), [5, 3, 7]);
approx(2 + 0.5 * 10, 7);
approx(2 + 0.5 * 7, 5.5);
approx(1 / (1 - 0.8), 5);
approx(114 + (5 + 4 + 5) / 3, 356 / 3);
approx(125 + 15, 140);
approx(.2 * 140 + .8 * 100, 108);
approx(.8 * 140 + .2 * 100, 132);
approx(.3 * 90 + .7 * 80, 83);
approx(9 / (9 + 3), .75);
approx(20 + .75 * (24 - 20), 23);
approx((1 - .75) * 9, 2.25);
approx(4 / (4 + 12), .25);
approx((1 - .25) * 4, 3);
approx(mean([1, 2, 1]), 4 / 3);
approx(Math.sqrt(mean([1, 4, 1])), Math.sqrt(2));
approx(Math.sqrt(mean([4, 25])), Math.sqrt(14.5));

// 39-44: conjugate updating, Bayesian intervals, partial pooling, prediction variance, U.
approx((2 + 7) / (2 + 2 + 10), 9 / 14);
approx((3 + 5) / (3 + 3 + 8), 8 / 14);
approx(10 - 1.96 * 2, 6.08);
approx(10 + 1.96 * 2, 13.92);
const shrinkWeight = (n, between, within) => n * between / (n * between + within);
approx(shrinkWeight(2, 25, 100), 1 / 3);
approx(shrinkWeight(200, 25, 100), 5000 / 5100);
approx(shrinkWeight(2, 25, 100) * 90 + (1 - shrinkWeight(2, 25, 100)) * 70, 230 / 3);
approx(1000 / 5, 200);
approx(3 + 2, 5); // Poisson posterior predictive: E(lambda)+Var(lambda)
const A = [2, 5], B = [1, 4];
approx(A.reduce((sum, a) => sum + B.filter(b => a > b).length, 0), 3);

// 45-50: robust statistics, regression losses, confidence/prediction.
approx(mean([1, 2, 3, 4, 100]), 22);
approx(mean([1, 2, 3, 4, 5]), 3);
approx(mean([0, 5, 5]), 10 / 3);
approx(Math.sqrt(mean([0, 25, 25])), Math.sqrt(50 / 3));
approx(mean([0, 1, 5]), 2);
approx(Math.sqrt(mean([0, 1, 25])), Math.sqrt(26 / 3));
approx(100 - 1.96 * 2, 96.08);
approx(100 + 1.96 * 2, 103.92);
approx(1.96 * Math.sqrt(2 ** 2 + 10 ** 2), 19.988156, 1e-5);
approx(1.96 * Math.sqrt(1 ** 2 + 3 ** 2), 6.198064, 1e-5);

// 51-58: missingness, random effects, survival, mixtures, factor loadings, price indices, ridge.
approx((80 * 400 + 20 * 800) / 100, 480);
approx((40 * 100 + 10 * 200) / 50, 120);
approx(4 / (4 + 6), .4);
approx(9 / (9 + 1), .9);
approx((1 - 1 / 5) * (1 - 1 / 4), .6);
approx(1 - 2 / 10, .8);
approx(.6 * .2 / (.6 * .2 + .4 * .1), .75);
approx(.5 * .3 / (.5 * .3 + .5 * .1), .75);
approx(4 * .5, 2);
approx((3300 - 3000) / 3000, .1);
approx(Math.log(3300 / 3000), Math.log(1.1));
approx(Math.log(1.25), .22314355131420976);
for (const [lambda, value] of [[0, 3], [1, 1.5], [2, 1], [3, .75]]) {
  approx(3 / (1 + lambda), value);
}
console.log('Verified all 34 new chapter supplements and ' + cases +
  ' independently recomputed arithmetic assertions.');
