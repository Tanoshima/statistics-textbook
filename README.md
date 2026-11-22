# 考え方から理解する現代統計学

統計学の主要概念を、**定義、数式と記号、数式から分かること、使用場面、計算例、結果の解釈、注意点**の順に整理した日本語の技術解説資料です。私的な学習・復習の際に、必要な項目を参照する用途を想定しています。

> **制作目的・AI利用について**  
> 本書は、制作者が**私的な学習・復習・理解の整理**のために制作・公開している個人プロジェクトです。本文、数式の説明、例題、演習、コードなどの作成・改訂には**生成AI（ChatGPT）を利用**しています。**私的学習用の教材として一通り完成しています。** 生成AIの利用により、誤りや不正確な記述が残っている可能性があるため、学習中に気づいた点は随時修正します。研究・業務など重要な用途で参照する場合は、原典や信頼できる資料も確認してください。

## 内容と現在の状態

- **全10部・58章**：全章に本文、基本的な数式、具体例、適用上の注意、演習・解説を掲載。
- **第1〜20章**：基礎概念や推測統計・回帰について、導出と計算の説明を比較的詳しく整備。
- **第21〜24章**：非線形回帰・固定効果・ヘドニック回帰・分散分析の数式・導出・例題を整備。**第25〜58章**：複数箇所に重複していたケーススタディを整理し、計算例・結果の解釈・注意点・演習と解答を見通しよく配置しています。章によって説明の深さは異なります。
- **対象読者**：統計学を一度学んだことがあり、直感や使い分けを整理したい読者。
- **公開形式**：標準HTML、CSS、MathJax。本文はMarkdown、数式はLaTeX。
- **図解**：標本分布・信頼区間の被覆率・分散分析の例について、代替テキスト付きのローカルSVG図を追加しています。
- **現在の状態**：**私的学習用として一通り完成**。今後は誤植や説明の分かりにくい箇所を、実際の学習に合わせて修正・改善します。

学習用としての完成基準と編集方針は [EDITORIAL.md](EDITORIAL.md)、収録内容と自動検査の範囲は [EXPANSION_STATUS.md](EXPANSION_STATUS.md) にまとめています。

## 読み方

基本演算を定義から復習できる [数学の基礎](https://tanoshima.github.io/statistics-textbook/math-foundations.html)、統計学の主要概念を一覧できる [用語集](https://tanoshima.github.io/statistics-textbook/glossary.html)、学習内容を独立に確かめるための [参考資料](https://tanoshima.github.io/statistics-textbook/references.html)、さらにNode.jsで手計算を追試できる [再現可能な計算例](https://tanoshima.github.io/statistics-textbook/reproduce.html) を用意しています。

[公開サイトの目次](https://tanoshima.github.io/statistics-textbook/) から章を選べます。各章は原則として、**① 概要（定義） → ② 基本となる数式と記号 → ③ 数式から分かること → ④ 何ができるか・使用場面 → ⑤ 詳細・計算例 → ⑥ 結果の解釈・注意点 → ⑦ 演習と解答**の順に整理しています。具体例から数式を導入するのではなく、式を理解してから用途・数値例で確認できる構成です。必要な項目から参照できます。

本書の数値例は、特に明記しない限り説明のための**架空・簡略化された例**です。実際の集団や研究結果の証拠を示すものではありません。

## ローカルで確認する

Node.js 26 系を使用します。依存ライブラリは `package-lock.json` からインストールします。

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run check:generated
npm run check:examples
npm run check:advanced
npm run check:reproduce
npm run check:links
python3 -m http.server 8000 -d dist
```

ブラウザで `http://localhost:8000/` を開きます。`npm run check` は章構成とTeXの基本的な静的検査を行いますが、数式の数学的な正しさやブラウザ上の表示を保証するものではありません。

## 原稿・サイトの構成

- `src/index.md`：サイトの序文と目次前の説明
- `src/chapters/01.md` 〜 `58.md`：章本文
- `chapters.json`：章番号・部・タイトルの一覧
- `scripts/build.mjs`：MarkdownからHTMLへの生成
- `scripts/check-content.mjs`：章構成・基本的なTeX記法の検査
- `scripts/check-generated.mjs`：生成された全ページ・注意書き・MathJax設定の検査
- `scripts/check-examples.mjs`：図と数値例の独立検算
- `scripts/check-advanced-examples.mjs`：第25〜58章の計算例と補足説明の検査
- `examples/reproduce.mjs`：外部依存のない回帰・分散分析・ブートストラップ等の実行例
- `src/math-foundations.md`：log・総和・微分などを定義と計算例で説明する独立ページ
- `src/reproduce.md`：実行手順・解釈上の限界を示すページ
- `scripts/check-links.mjs`：生成HTMLの内部リンクと画像参照の検査
- `src/references.md`：原典の照合に役立つ参考資料
- `src/assets/style.css`：最小限の見た目

MathJaxの数式はインラインを `$...$`、独立行を `$$...$$` で記述します。作成された各章のページにも、AIを利用した私的学習用の原稿である旨の注意書きを表示します。

## GitHub Pagesでの公開

Repository Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定してください。mainブランチへのpush後、CI成功時に公開されます。PRではビルドと検査のみ行い、公開しません。

## セキュリティと品質

- 依存ライブラリはバージョンとintegrityをlockfileで固定し、CIは `npm ci --ignore-scripts` を使用します。
- GitHub ActionsはコミットSHAで固定し、checkoutの資格情報を残しません。
- ビルドと公開をジョブで分け、公開ジョブだけにPages関連の書き込み権限を付けています。
- MathJaxのCDNスクリプトはバージョンを固定し、SRIを利用します。
- Dependabotの更新PRは内容を確認してから取り込みます。
- CIはHTMLファイル、基本的な数式記法、代表的な計算例を検査します。**すべての説明や数式が正しいことを保証するものではない**ため、気づいた誤りは随時修正します。

誤植、数式の誤り、解釈の疑問点はGitHub IssuesまたはPull Requestで報告・修正してください。

## 利用上の注意

この教材は個人的な学習記録を公開したものであり、特定の大学・学会・企業の公式な教材や見解を示すものではありません。参考資料の確認が必要な場面では、専門書や原著論文などを優先してください。
