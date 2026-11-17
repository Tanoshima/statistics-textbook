# 参考資料と検証の進め方

本書は**私的な学習・復習のために生成AI（ChatGPT）を利用して制作した教材**です。以下は、学習した概念や式の意味を**独立に確認するための外部資料**です。本文の一つ一つの式がこれらの資料によって査読・検証済みという意味ではありません。また、本文は原則としてオリジナルの説明として構成しており、外部教材を長文転載していません。

## 公開されている主要な参考資料

| 資料 | 特に役立つ分野 | 本書の対象 |
|---|---|---|
| [OpenStax, *Introductory Statistics 2e*](https://openstax.org/books/introductory-statistics-2e/pages/1-introduction) | 記述統計、確率、推測統計、信頼区間、検定 | 第1〜15章 |
| [Penn State, STAT 501: Regression Methods](https://online.stat.psu.edu/stat501/) | 最小二乗法、回帰診断、変数変換、ロジスティック回帰 | 第16〜23章 |
| [Penn State, STAT 510: Applied Time Series Analysis](https://online.stat.psu.edu/stat510/) | 自己相関、ARIMA、平滑化、予測評価 | 第31〜38章 |
| [NIST/SEMATECH e-Handbook of Statistical Methods](https://www.nist.gov/publications/handbook-151-nistsematech-e-handbook-statistical-methods) | 実験計画、計測、分散分析、回帰、品質管理 | 第13〜27章など |

これらの資料は公開元が維持する外部サイトであり、本文とは別のコンテンツです。各資料のライセンスは各提供元の記載を参照してください。

## 分野別に参照できる追加資料

以下の資料については、公開元のページを確認しました。本文のすべての章・主張を一つずつ照合したという意味ではありません。

| 資料 | 確認できる内容 | 本書の関連章 |
|---|---|---|
| [Hyndman & Athanasopoulos, *Forecasting: Principles and Practice*（第3版）](https://otexts.com/fpp3/) | 時系列の探索、ARIMA、指数平滑、予測の評価 | 第31〜38章 |
| [Stan User's Guide: Posterior and Prior Predictive Checks](https://mc-stan.org/docs/stan-users-guide/posterior-predictive-checks.html) | 観測した分布の特徴と、事後予測から生成したデータを比較する方法 | 第39〜43章 |
| [Stan: MCMC診断と警告](https://mc-stan.org/learn-stan/diagnostics-warnings.html) | 分割R-hat、実効サンプルサイズ、発散などの診断 | 第42章 |
| [scikit-learn: Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls) | 前処理のデータ漏洩、訓練・テストの分離、Pipelineの適切な利用 | 第38章、第48〜50章 |

## 参考資料で確認する順番

1. **定義を照合する**：標本分布・推定量・信頼区間など、数式で使う量の意味が合っているか。
2. **仮定を照合する**：独立性、等分散性、正規性、定常性などが式の導出に必要か。
3. **小さな計算例を再計算する**：元データから計算し、本文の値をただ写して検算しない。
4. **推定対象を確認する**：例えば $E[\log P\mid X]$ と $E[P\mid X]$ を取り違えていないか。
5. **ソフトウェアで比較する**：再現可能なコードと入力値を保存し、数学的導出と突き合わせる。

## 分野ごとの重要な問い

### 確率・推測統計（第1〜15章）

- 観測値はどのような値を取り、期待値は何を意味するか。
- 標準偏差と標準誤差が答える問いは何か。
- 信頼区間の被覆率と観測済み母数の確率を混同していないか。

### 回帰・因果推論（第16〜27章）

- 係数は条件付き平均の傾きか、対数平均の変化か、オッズ比か。
- モデルが当てはまることと因果効果の識別を区別しているか。
- 評価データの情報をモデル選択・前処理に使っていないか。

### 時系列（第31〜38章）

- 将来を予測する時点で本当に利用できた情報だけを使っているか。
- 自己相関を無視して標準誤差を小さく見積もっていないか。
- 予測対象が水準か、差分か、発生率かを区別しているか。

## 検証状態の読み方

本書のCIはファイルの存在、基本的なTeX記法、一部の数値例を検査します。しかし、**すべての内容の正確さ、専門的な査読、外部資料との完全な整合性を保証するものではありません**。章の完成度については [執筆・レビュー基準](https://github.com/Tanoshima/statistics-textbook/blob/main/EDITORIAL.md) と [完成度の記録](https://github.com/Tanoshima/statistics-textbook/blob/main/EXPANSION_STATUS.md) を参照してください。
