# 考え方から理解する現代統計学

統計学の**発想・適用場面・数式の意味・前提条件・限界**を、計算例と演習を通して学ぶための日本語のオンライン教科書です。

> **制作目的・AI利用について**  
> 本書は、制作者が**私的な学習・復習・理解の整理**のために制作・公開している個人プロジェクトです。本文、数式の説明、例題、演習、コードなどの作成・改訂には**生成AI（ChatGPT）を利用**しています。AI生成・編集された内容には誤りや不正確な記述が含まれる可能性があります。専門家による網羅的な査読や、全計算・全数式の独立検証が完了したものではありません。学術研究・業務・意思決定に用いる際は、原典や信頼できる資料で必ず確認してください。

## 内容と現在の状態

- **全10部・58章**：全章に本文、基本的な数式、具体例、適用上の注意、演習・解説を掲載。
- **第1〜20章**：基礎概念や推測統計・回帰について、導出と計算の説明を比較的詳しく整備。
- **第21〜24章**：非線形回帰・固定効果・ヘドニック回帰・分散分析を詳しく再編集。**第25〜58章**：全34章に手計算できる発展例・追加演習と解答を増補。説明の分量や専門的な校閲状況には章間の差があります。
- **対象読者**：統計学を一度学んだことがあり、直感や使い分けを整理したい読者。
- **公開形式**：標準HTML、CSS、MathJax。本文はMarkdown、数式はLaTeX。
- **図解**：標本分布・信頼区間の被覆率・分散分析の例について、代替テキスト付きのローカルSVG図を追加しています。
- **編集状況**：全章公開済みですが、**校了・専門家査読済みではありません**。自動テストと内容の正確性確認は別です。

詳細な進捗と未完了の品質課題は [EXPANSION_STATUS.md](EXPANSION_STATUS.md)、完成基準は [EDITORIAL.md](EDITORIAL.md) を参照してください。

## 読み方

統計学の主要概念を一覧できる [用語集](https://tanoshima.github.io/statistics-textbook/glossary.html) 、学習内容を独立に確かめるための [参考資料](https://tanoshima.github.io/statistics-textbook/references.html)、さらにNode.jsで手計算を追試できる [再現可能な計算例](https://tanoshima.github.io/statistics-textbook/reproduce.html) を用意しています。

[公開サイトの目次](https://tanoshima.github.io/statistics-textbook/) から章を選べます。各章では、まず「何を知りたいか」を読み、次に数式の各記号、具体例、前提と限界を確認してから演習に進むことを推奨します。

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
- CIはHTMLファイル、基本的な数式記法、第25〜58章の代表的な計算例を検査します。**統計的な説明の正しさ、計算の独立検算、専門家査読は代替できません**。

誤植、数式の誤り、解釈の疑問点はGitHub IssuesまたはPull Requestで報告・修正してください。

## 利用上の注意

この教材は個人的な学習記録を公開したものであり、特定の大学・学会・企業の公式な教材や見解を示すものではありません。参考資料の確認が必要な場面では、専門書や原著論文などを優先してください。
