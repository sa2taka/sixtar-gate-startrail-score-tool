# SIXTAR GATE STARTRAIL Score Extractor

SIXTAR GATE STARTRAILのリザルト画面のスクリーンショットから、スコア情報を抽出するコマンドラインツールです。

## 機能

- リザルト画面のスクリーンショットから以下の情報を抽出します：
  - 楽曲タイトル
  - 難易度
  - モード
  - スコア
  - 判定（BLUE STAR、WHITE STAR、YELLOW STAR、RED STAR）
  - フルコンボの有無
  - オプション設定（パターン、ハザード）

- 抽出した情報は以下の形式で出力できます：
  - JSON形式
  - TSV形式
  - HTTP API（APIサーバーモード）

## 必要なもの（WIP）

- Tesseract OCR
  - 画像からテキストを抽出するために使用します
  - Windows環境でのインストール手順：
    1. [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)から最新版のインストーラー（`tesseract-ocr-w64-setup-xxx.exe`）をダウンロード
    2. インストーラーを実行
      - インストール先は `C:\Program Files\Tesseract-OCR` を推奨
      - 「Additional language data」で「Japanese」と「Korean」にチェックを入れる
    3. システム環境変数のPATHに `C:\Program Files\Tesseract-OCR` を追加
    4. コマンドプロンプトで以下のコマンドを実行して、インストールを確認
       ```
       tesseract --version
       ```

  - 既にTesseractをインストール済みの場合の言語パックの追加：
    1. [Tesseract language data files](https://github.com/tesseract-ocr/tessdata)から以下のファイルをダウンロード
       - `jpn.traineddata`（日本語）
       - `kor.traineddata`（韓国語）
    2. ダウンロードしたファイルを `C:\Program Files\Tesseract-OCR\tessdata` に配置

## 使い方

### コマンドラインモード

```bash
# 単一の画像ファイルから情報を抽出（JSON形式で出力）
score-extractor extract image.jpg

# 単一の画像ファイルから情報を抽出（TSV形式で出力）
score-extractor extract --format tsv image.jpg

# ディレクトリ内の全画像ファイルから情報を抽出
score-extractor extract --format tsv ./screenshots/

# 特定の拡張子のファイルのみを対象
score-extractor extract --format tsv --ext jpg,png ./screenshots/

# 指定時刻以降に作成されたファイルのみを対象
score-extractor extract --since 2024-01-01T00:00:00 ./screenshots/
```

### APIサーバーモード

APIサーバーモードでは、HTTPエンドポイントを通じてスコア情報を取得できます。

1. 設定ファイルの準備
```toml
# config.toml
[api]
port = 6433  # デフォルトポート

[monitoring]
directory = "./screenshots"  # スクリーンショットが保存されているディレクトリ
```

2. サーバーの起動
```bash
score-extractor serve --config config.toml
```

3. APIの利用
```bash
# 全てのスコアデータを取得
curl http://localhost:6433/api/v1/scores

# 特定の日時以降のスコアデータを取得（コマンドラインの--sinceと同様）
curl http://localhost:6433/api/v1/scores?since=2024-01-01T00:00:00Z
```

## 出力例

### JSON形式
```json
{
  "file_path": "image.jpg",
  "image_binary": "画像のバイナリのBase64エンコードしたもの",
  "mod_time": "2024-01-01T12:00:00+09:00",
  "kind": "result",
  "title": "曲名",
  "difficulty": "MASTER",
  "mode": "STANDARD",
  "score": 980000,
  "judgments": {
    "blueStar": 800,
    "whiteStar": 150,
    "yellowStar": 50,
    "redStar": 0
  },
  "is_full_combo": false,
  "options": ["MIRROR"]
}
```

### TSV形式
ヘッダー行付きのTSV形式で出力されます。

## オプション

### extractコマンド
- `--format`：出力フォーマットを指定（json/tsv、デフォルト：json）
- `--ext`：処理対象とする拡張子を指定（カンマ区切り、デフォルト：jpg,jpeg,png）
- `--since`：指定時刻以降に作成されたファイルのみを処理（形式：2006-01-02T15:04:05）
- `--verbose`：詳細なログを出力

### serveコマンド
- `--config`：設定ファイルのパスを指定（必須）

## 注意事項

- 画像は1920x1080の解像度で撮影されたものを想定しています
- リザルト画面以外の画像を指定した場合はエラーになります
