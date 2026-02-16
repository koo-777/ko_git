# Apexia Lab - Web Tools Collection

便利なWebツールを集約したプロジェクト（モノレポ）です。
Vercelのサブディレクトリ機能を活用し、単一ドメインで複数のツールを管理しています。

## 🏗️ Web Applications

### 1. [Feynman Diagram Sketcher](/feynman-sketcher/) (`/feynman-sketcher/`)
素粒子物理学で使用される「ファインマン・ダイアグラム」をブラウザ上で直感的に描画できるツールです。
- **描画**: フェルミオン、光子、グルーオン、スカラー粒子のプロパゲーターを描画。
- **編集**: 頂点のドラッグ移動（接続維持）、削除、矢印反転。
- **ラベル**: MathJax (LaTeX) 対応の数式ラベル。ラベルは線の下（背面）に配置され、操作性を損ないません。
- **エクスポート**:
    - **PNG/PDF**: 高解像度保存（描画範囲を自動計算して余白をカット）。
    - **TikZ**: LaTeX文書用のコード生成。
    - **SVG/JSON**: ベクター保存および作業状態の復元。

### 2. [Physics Constants & Units](/physics-constants/) (`/physics-constants/`)
物理学の研究・学習に役立つ計算ダッシュボードです。
- **相対論的運動学**: エネルギー・運動量・質量の相互計算。
- **物理定数表**: 主要な物理定数の検索とコピー。
- **単位変換**: エネルギー (eV, J)、断面積 (barn)、自然単位系の変換に対応。

### 3. [Simple Image to PDF](/img-to-pdf/) (`/img-to-pdf/`)
- 複数の画像をアップロードしてPDFに結合・変換。
- 全処理がクライアントサイドで行われるため、プライバシーが保護されます。

### 4. [Base Converter](/base-converter/) (`/base-converter/`)
- 2進数・10進数・16進数をリアルタイムで相互変換。
- シンプルで直感的なUI。

### 5. [WEB Galapon (WEBガラポン)](/garapon/) (`/garapon/`)
- イベントで使えるブラウザ抽選器。
- アニメーション付きで盛り上がります。

### 6. [Character Count (文字数カウント)](/char-count/) (`/char-count/`)
- 文字数をリアルタイム計測。
- 改行・空白の除外オプション付き。


---

## 🧩 Browser Extensions

### Simple Work Timer
Chrome拡張機能として開発された、シンプルな作業時間計測ツールです。
- ツールバーから手軽にスタート/ストップ。
- ブラウザを閉じても計測状態を永続化。

---

## 🛠️ 技術スタック

- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Frameworks/Libs**:
    - **Konva.js**: キャンバス描画 (Feynman Sketcher)
    - **MathJax**: 数式レンダリング
    - **html2canvas / jsPDF**: 画像処理
    - **Next.js**: (Diag-Lib)
- **Deployment**: Vercel (Clean URLs, Monorepo support)

## 開発・実行

プロジェクトルートで簡易サーバーを立ち上げることで、ローカル環境で動作確認が可能です。

```bash
# Python 3
python3 -m http.server 3000

# Node.js (serve)
npx serve .
```

ブラウザで `http://localhost:3000` にアクセスすると、ポータルサイト（`index.html`）が表示されます。