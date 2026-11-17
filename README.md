# 考え方から理解する現代統計学

日本語の統計学教科書を、標準HTML + CSS + MathJaxで公開するプロジェクトです。

- **構成**：全10部・58章（第1章は初稿、残りは目次のみ）
- **方針**：直感・適用場面・数式の意味・限界・演習を重視
- **原稿**：Markdown、数式のみLaTeX
- **公開**：GitHub Pages

## ローカル開発

Node.js 22以上が必要です。

```sh
npm install
npm run build
python3 -m http.server 8000 -d dist
```

ブラウザで http://localhost:8000/ を開いてください。

## GitHub Pages

Repository Settings → Pages → Build and deployment → Source を **GitHub Actions** にしてください。mainブランチへのpushで公開されます。

## 原稿の追加

`src/chapters/02.md` のようなファイルを作ると、`chapters.json` に登録済みの章のページ・目次リンク・前後の章へのナビゲーションが自動生成されます。数式は `$...$` と `$$...$$` で記述します。ブラウザでの数式表示にはMathJaxを使います。

現段階は本文・構成ともに初稿です。今後、数学的な説明と演習を充実させます。
