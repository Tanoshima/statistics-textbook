# 考え方から理解する現代統計学

日本語の統計学教科書を、標準HTML + CSS + MathJaxで公開するプロジェクトです。

- **構成**：全10部・58章（全章初稿。第3章以降は短い骨子で、詳細な執筆・査読はこれから）
- **方針**：直感・適用場面・数式の意味・限界・演習を重視
- **原稿**：Markdown、数式のみLaTeX
- **公開**：GitHub Pages

## ローカル開発

Node.js 26 LTS を推奨します。依存ライブラリは lockfile から再現可能にインストールします。

```sh
npm ci --ignore-scripts
npm run build
python3 -m http.server 8000 -d dist
```

ブラウザで http://localhost:8000/ を開いてください。

## GitHub Pages

Repository Settings → Pages → Build and deployment → Source を **GitHub Actions** にしてください。mainブランチへのpushで公開されます。

## 原稿の追加

`src/chapters/02.md` のようなファイルを作ると、`chapters.json` に登録済みの章のページ・目次リンク・前後の章へのナビゲーションが自動生成されます。数式は `$...$` と `$$...$$` で記述します。ブラウザでの数式表示にはMathJaxを使います。

現段階は全章の初稿です。特に第3章以降は学習ガイドとしての短い骨子であり、完成した教科書ではありません。各章を詳しく拡充し、数学的な説明・図・演習と解説を充実させます。執筆・レビュー基準は [EDITORIAL.md](EDITORIAL.md) を参照してください。

## セキュリティ

- Node.js 26 LTS を使用し、npm の依存バージョンと integrity を `package-lock.json` に固定しています。
- CI は `npm ci --ignore-scripts` を使用し、依存パッケージのインストール時スクリプトを実行しません。
- GitHub Actions は検証したフルコミット SHA に固定し、Checkoutの資格情報を残しません。
- ビルドとデプロイを別ジョブに分け、書き込み権限は公開ジョブにだけ付与しています。
- CDNから取得する MathJax はバージョンを指定し、SRIでメインスクリプトの改ざん検知を行います。
- Dependabot が npm と GitHub Actions の更新PRを週次で作成します。更新は内容をレビューしてから取り込んでください。

追加の防御として、Repository Settings の Actions、Rulesets、Code security で承認・ブランチ保護・Dependabot alertsの有効化を推奨します。
