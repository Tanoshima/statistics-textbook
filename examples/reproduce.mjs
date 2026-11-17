// Reproducible, self-contained teaching examples (synthetic data).
// Node.js 26+, no dependencies or external data requests.
import assert from 'node:assert/strict';

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance,
    'Expected ' + expected + ', got ' + actual);
const average = x => x.reduce((a, b) => a + b, 0) / x.length;

// Example 1: ordinary least squares with an intercept.
const x = [1, 2, 3, 4, 5];
const y = [2, 3, 5, 4, 6];
const xbar = average(x);
const ybar = average(y);
const ssx = x.reduce((s, xi) => s + (xi - xbar) ** 2, 0);
const slope = x.reduce((s, xi, i) => s + (xi - xbar) * (y[i] - ybar), 0) / ssx;
const intercept = ybar - slope * xbar;
const fitted = x.map(xi => intercept + slope * xi);
const residuals = y.map((yi, i) => yi - fitted[i]);
const sse = residuals.reduce((s, e) => s + e ** 2, 0);
const sst = y.reduce((s, yi) => s + (yi - ybar) ** 2, 0);
const r2 = 1 - sse / sst;
near(slope, .9);
near(intercept, 1.3);
near(sse, 1.9);
near(r2, .81);
near(residuals.reduce((a, b) => a + b, 0), 0);
console.log('OLS: y_hat = ' + intercept.toFixed(2) + ' + '
  + slope.toFixed(2) + ' x, R^2=' + r2.toFixed(2));

// Example 2: one-way ANOVA from six independent synthetic observations.
const groups = [[2, 4], [4, 6], [8, 10]];
const values = groups.flat();
const grand = average(values);
const within = groups.reduce((sum, g) =>
  sum + g.reduce((s, item) => s + (item - average(g)) ** 2, 0), 0);
const between = groups.reduce((sum, g) =>
  sum + g.length * (average(g) - grand) ** 2, 0);
const total = values.reduce((sum, v) => sum + (v - grand) ** 2, 0);
const F = (between / (groups.length - 1)) / (within / (values.length - groups.length));
near(grand, 17 / 3);
near(within, 6);
near(between, 112 / 3);
near(total, 130 / 3);
near(total, within + between);
near(F, 28 / 3);
console.log('ANOVA: SSB=' + between.toFixed(4) + ', SSW='
  + within.toFixed(4) + ', F=' + F.toFixed(4));

// Example 3: difference-in-differences. Arithmetic, not causal identification.
const treated = { pre: 100, post: 130 };
const control = { pre: 80, post: 95 };
const did = (treated.post - treated.pre) - (control.post - control.pre);
near(did, 15);
console.log('DiD: ' + did + ' (causal interpretation requires parallel trends)');

// Example 4: nonparametric bootstrap with a fixed deterministic seed.
let seed = 123456789;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 2 ** 32;
};
const observations = [2, 4, 6, 8, 10];
const B = 2000;
const means = Array.from({ length: B }, () => average(
  Array.from({ length: observations.length },
    () => observations[Math.floor(random() * observations.length)])
)).sort((a, b) => a - b);
const bootMean = average(means);
const bootSe = Math.sqrt(means.reduce((sum, z) => sum + (z - bootMean) ** 2, 0) / (B - 1));
const ci = [means[Math.floor(.025 * B)], means[Math.ceil(.975 * B) - 1]];
assert.ok(bootSe > 0 && bootSe < 4);
assert.ok(ci[0] <= average(observations) && average(observations) <= ci[1]);
console.log('Bootstrap: sample mean=' + average(observations)
  + ', SE=' + bootSe.toFixed(4) + ', percentile interval=[' + ci.join(', ') + ']');

// Example 5: ridge shrinkage in a one-coefficient toy objective.
const ridge = lambda => 3 / (1 + lambda);
near(ridge(0), 3);
near(ridge(1), 1.5);
near(ridge(3), .75);
console.log('Ridge: beta(lambda=3)=' + ridge(3).toFixed(2));

// Observed count versus expectation: an expected count can be fractional.
const distribution = [{ count: 0, probability: .1 }, { count: 1, probability: .3 },
  { count: 2, probability: .4 }, { count: 3, probability: .2 }];
const expectedCount = distribution.reduce((s, x) => s + x.count * x.probability, 0);
near(expectedCount, 1.7);
assert.ok(distribution.every(x => Number.isInteger(x.count)));
console.log('Count: observed values are integers; expectation=' + expectedCount.toFixed(1));

console.log('All deterministic example assertions passed.');
