# 404

## ⚠️ 閲覧上の注意

このサイトには、精神的苦痛を伴う可能性のある内容が含まれている「設定」です。  
サイト内では没入感を高めるために、以下の視覚効果が実装されています：

- **ノイズ（Film Grain）**: 視界を遮る微細な粒子状のノイズ。
- **グリッチ（Glitch Effect）**: 記憶の歪みを再現する画面の乱れ。
- **痙攣（Text Jerking）**: 読んでいる最中に微妙に震え、焦点を狂わせる文章。
- **フリッカー（Flicker）**: 常に明滅し、不安を煽る画面。

## 🛠 技術構成

- **Framework**: [Jekyll](https://jekyllrb.com/) 4.3+
- **Languages**: HTML5, Liquid, CSS3
- **Typography**: [New Tegomin](https://fonts.google.com/specimen/New+Tegomin), [Yuji Syuku](https://fonts.google.com/specimen/Yuji+Syuku) (from Google Fonts)
- **Styling**: フレームワークに頼らない、フルカスタムのCSSアニメーションとデザイン。

## 🚀 開発・動作環境

ローカル環境でサイトを起動するには、以下の手順に従ってください。

### 前提条件
- Ruby (3.0以上推奨)
- Bundler

### セットアップ
1. 必要パッケージのインストール:
   ```bash
   bundle install
   ```

2. 開発用サーバーの起動:
   ```bash
   bundle exec jekyll serve --livereload
   ```

3. ブラウザで閲覧: `http://localhost:4000`

## 🌑 プロジェクト構造

- `_posts/`: 怪異の報告書（Markdown）。フロントマターでタイトルや日付を管理。
- `assets/css/style.css`: サイトの不気味な雰囲気を司るコアなデザインコード。
- `_layouts/`: 各ページの骨格。
- `index.html`: 記憶の集積所への入り口。

---

*このデータは、いつの間にかあなたの環境に構築されたものです。何が起きても、当方は一切の責任を負いません。*
