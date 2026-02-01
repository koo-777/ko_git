# Apexia Lab - Web Tools Collection

便利なWebツールを集約したプロジェクト（モノレポ）です。
Vercelのサブディレクトリ機能を活用し、単一ドメインで複数のツールを管理しています。

## 収録ツール

### 1. [文字数カウント](/char-count/) (`/char-count/`)
- テキストの文字数をリアルタイムで計測
- 空白・改行の除外オプション
- 40文字/行のガイドライン表示

### 2. [WEBガラポン](/garapon/) (`/garapon/`)
- ブラウザで動く抽選器
- 抽選内容のカスタマイズが可能（当たり、はずれの設定等）
- ローカルストレージ対応（予定）

### 3. [Simple Image to PDF](/img-to-pdf/) (`/img-to-pdf/`)
- 複数の画像をまとめてPDFに変換
- ブラウザ完結で安全

### 4. [Diag-Lib Gallery](/diag-lib/) (`/diag-lib/`)
- 高機能な図解ギャラリー
- Next.js製のモダンなUI

## ディレクトリ構成

```bash
.
├── assets/           # 共通リソース（CSS/JS）
│   ├── css/
│   └── js/           # グローバルナビゲーション等
├── char-count/       # 文字数カウントツール
├── garapon/          # ガラポン抽選ツール
├── img-to-pdf/       # 画像PDF変換ツール
├── privacy/          # プライバシーポリシー
├── scripts/          # 開発・運用スクリプト
├── index.html        # ポータルサイト（トップページ）
├── robots.txt        # クローラー設定
├── sitemap.xml       # サイトマップ
├── vercel.json       # Vercel設定（ルーティング/CleanURLs）
└── README.md         # 本ファイル
```

## 技術スタック

- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Vercel (Clean URLs enabled)
- **Structure**: Monorepo

## 開発・実行

ローカルで動作確認をするには、プロジェクトルートで簡易サーバーを立ち上げてください。

```bash
# Pythonの場合
python3 -m http.server 3000

# Node.js (serve) の場合
npx serve .
```

ブラウザで `http://localhost:3000` にアクセスするとポータルサイトが表示されます。