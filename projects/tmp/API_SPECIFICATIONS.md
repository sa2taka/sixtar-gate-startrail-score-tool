# API仕様書

## 🔌 score-extractor API

### 基本情報
- **Host**: `localhost:6433`
- **Protocol**: HTTP
- **Content-Type**: `application/json`

### エンドポイント: スコア取得
```
GET /api/v1/scores?since={timestamp}
```

#### パラメータ
| Name | Type | Required | Description |
|------|------|----------|-------------|
| since | string | No | RFC3339形式のタイムスタンプ。この時刻以降のスコアを取得 |

#### レスポンス例
```json
[
  {
    "file_path": "/path/to/screenshot.jpg",
    "image_binary": "base64_encoded_image_data",
    "mod_time": "2024-01-01T12:00:00Z",
    "kind": "result",
    "music": {
      "id": "music_001",
      "name": "楽曲名",
      "englishName": "Music Title"
    },
    "difficulty": "quasar",
    "mode": "lunar",
    "score": 950000,
    "judgments": {
      "blueStar": 1200,
      "whiteStar": 150,
      "yellowStar": 30,
      "redStar": 5
    },
    "is_full_combo": true,
    "hazard": "DEFAULT",
    "pattern": "DEFAULT",
    "max_combo": null
  }
]
```

#### TypeScript型定義
```typescript
type FetchScoreData = {
  file_path: string;
  image_binary: string;
  mod_time: string;
  kind: "result" | "select";
  music?: {
    id: string;
    name: string;
    englishName: string | null;
  } | null;
  difficulty?: "comet" | "nova" | "supernova" | "quasar" | "starlight" | "mystic" | null;
  mode?: "lunar" | "solar" | null;
  score: number | null;
  judgments?: {
    blueStar: number;
    whiteStar: number;
    yellowStar: number;
    redStar: number;
  } | null;
  is_full_combo?: boolean;
  hazard?: "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN" | null;
  pattern?: "DEFAULT" | "MIRROR" | "RANDOM" | null;
  max_combo?: number | null;
};
```

### ヘルスチェック
```
GET /health
```

**レスポンス**: HTTP 200 OK（正常時）

## 💾 Web Application API

### 保存エンドポイント
```
POST /api/results/save
```

#### リクエストヘッダー
```
Content-Type: application/json
Cookie: next-auth.session-token=...
```

#### リクエストボディ
```typescript
type EditableResultSchema = {
  kind: "result" | "select";
  music?: {
    id: string;
    name: string;
    englishName: string | null;
  };
  difficulty?: "comet" | "nova" | "supernova" | "quasar" | "starlight" | "mystic";
  mode?: "lunar" | "solar";
  score?: number;
  isFullCombo?: boolean;
  // result専用フィールド
  judgments?: {
    blueStar: number;
    whiteStar: number;
    yellowStar: number;
    redStar: number;
  };
  hazard?: "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN";
  pattern?: "DEFAULT" | "MIRROR" | "RANDOM";
  // select専用フィールド
  maxCombo?: number;
  // メタデータ
  filePath?: string;
  imageBinary?: string;
  modTime?: string;
};
```

#### レスポンス例
**成功時**:
```json
{
  "success": true,
  "id": "result_uuid",
  "message": "結果を保存しました"
}
```

**エラー時**:
```json
{
  "error": "エラーメッセージ"
}
```

### 認証エンドポイント
NextAuth.js標準エンドポイント
```
GET  /api/auth/session
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/providers
GET  /api/auth/callback/:provider
```

## 🎵 楽曲情報API

### 楽曲一覧
```
GET /musicInformation.json
```

#### レスポンス構造
```json
{
  "songs": [
    {
      "id": "music_001",
      "name": "楽曲名",
      "englishName": "Music Title",
      "bpm": 140,
      "length": 120,
      "charts": {
        "lunar": {
          "comet": { "level": 1, "notes": 500, "combo": 500 },
          "nova": { "level": 3, "notes": 750, "combo": 750 }
        },
        "solar": {
          "comet": { "level": 2, "notes": 600, "combo": 600 }
        }
      }
    }
  ]
}
```

## 🔄 データ変換仕様

### score-extractor → EditableResultSchema
```typescript
function convertToEditResultData(apiData: FetchScoreData): Partial<EditableResultSchema> {
  return {
    kind: apiData.kind,
    music: apiData.music ? {
      id: apiData.music.id,
      name: apiData.music.name,
      englishName: apiData.music.englishName || null,
    } : undefined,
    mode: apiData.mode || undefined,
    difficulty: apiData.difficulty || undefined,
    score: apiData.score || undefined,
    judgments: apiData.judgments || undefined,
    isFullCombo: apiData.is_full_combo || false,
    hazard: apiData.hazard || undefined,
    pattern: apiData.pattern || undefined,
    maxCombo: apiData.max_combo || undefined,
    imageBinary: apiData.image_binary,
    filePath: apiData.file_path,
    modTime: apiData.mod_time,
  };
}
```

### EditableResultSchema → Prisma Result
```typescript
const resultData = {
  userId: session.user.id,
  musicId: musicId,
  kind: body.kind,
  type: body.mode as "solar" | "lunar",
  difficulty: body.difficulty,
  mode: body.mode,
  score: body.score,
  blueStar: isResultResult(body) && body.judgments ? body.judgments.blueStar : null,
  whiteStar: isResultResult(body) && body.judgments ? body.judgments.whiteStar : null,
  yellowStar: isResultResult(body) && body.judgments ? body.judgments.yellowStar : null,
  redStar: isResultResult(body) && body.judgments ? body.judgments.redStar : null,
  isFullCombo: body.isFullCombo || false,
  hazard: isResultResult(body) ? body.hazard || null : null,
  pattern: isResultResult(body) ? body.pattern || null : null,
  playedAt: body.modTime ? new Date(body.modTime) : new Date(),
};
```

## ⚠️ エラーハンドリング

### score-extractor API
- **接続エラー**: ポーリング継続、UI上で未接続表示
- **タイムアウト**: リトライなし、次回ポーリングで再試行
- **不正レスポンス**: ログ出力、空配列として処理

### 保存API
- **認証エラー** (401): サインイン画面へリダイレクト
- **バリデーションエラー** (400): フォーム上でエラー表示
- **重複エラー**: Upsert処理で自動解決
- **サーバーエラー** (500): アラート表示、リトライ促進

## 🔐 セキュリティ考慮事項

### 認証・認可
- 全APIエンドポイントで認証必須（middleware）
- セッション管理（NextAuth.js JWT）
- userId による所有者制限

### データ検証
- クライアント側: React Hook Form + Zod
- サーバー側: Prisma型検証 + 独自バリデーション
- SQL injection対策: Prisma ORM使用

### 画像データ
- Base64エンコードでメモリ制限あり
- 一時的な表示のみ、永続化なし
- XSS対策: 適切なContent-Type設定