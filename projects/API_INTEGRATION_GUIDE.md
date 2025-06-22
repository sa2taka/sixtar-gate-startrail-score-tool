# score-extractor API 統合ガイド

## 📡 API仕様

### エンドポイント
- **Base URL**: `http://localhost:8080`
- **スコア取得**: `GET /api/v1/scores`
- **ヘルスチェック**: `GET /health`

### レスポンス形式
```typescript
interface ScoreApiResponse {
  file_path: string;
  mod_time: string;  // RFC3339形式
  kind: "result" | "select";
  music: {
    id: string;
    name: string;
    englishName: string;
  };
  difficulty?: string;  // "nova", "supernova", "quasar" など
  mode?: string;  // "star", "lunar", "ultrastar", "purestar"
  score: number;
  judgments?: {
    blueStar: number;   // Just Reflec Best
    whiteStar: number;  // Just Reflec
    yellowStar: number; // Just
    redStar: number;    // Attack/Miss
  };
  is_full_combo: boolean;
  pattern?: string;  // "MIRROR", "RANDOM" など
  hazard?: string;   // "LV1", "LV2" など
  max_combo?: number;  // 選択画面のみ
  image_binary: string;  // Base64エンコード画像
}
```

## 🔄 データ変換マッピング

### score-extractor → EditResult フォーマット

```typescript
// 変換関数の実装例
function convertToEditResultData(apiData: ScoreApiResponse): EditableResult {
  return {
    // 基本情報
    type: apiData.kind === "result" ? "result" : "select",
    musicId: apiData.music.id,
    musicTitle: apiData.music.name,
    
    // ゲーム設定
    mode: convertMode(apiData.mode),
    difficulty: convertDifficulty(apiData.difficulty),
    pattern: convertPattern(apiData.pattern),
    hazard: convertHazard(apiData.hazard),
    
    // スコア情報（リザルト画面のみ）
    score: apiData.score,
    justReflecBest: apiData.judgments?.blueStar || 0,
    justReflec: apiData.judgments?.whiteStar || 0,
    just: apiData.judgments?.yellowStar || 0,
    attack: apiData.judgments?.redStar || 0,  // AttackとMissの合計
    miss: 0,  // score-extractorでは区別されない
    
    // 追加情報
    combo: calculateCombo(apiData),  // judgmentsから計算
    imageBinary: apiData.image_binary,
    
    // メタデータ
    filePath: apiData.file_path,
    modTime: new Date(apiData.mod_time),
  };
}

// モード変換
function convertMode(mode?: string): string {
  const modeMap: Record<string, string> = {
    "star": "STAR",
    "lunar": "LUNAR", 
    "ultrastar": "ULTRASTAR",
    "purestar": "PURESTAR"
  };
  return modeMap[mode || ""] || "STAR";
}

// 難易度変換
function convertDifficulty(difficulty?: string): string {
  const diffMap: Record<string, string> = {
    "nova": "NOVA",
    "supernova": "SUPERNOVA",
    "quasar": "QUASAR"
  };
  return diffMap[difficulty || ""] || "";
}
```

## 🚀 実装手順

### 1. APIクライアントの作成
```typescript
// lib/score-extractor-client.ts
export class ScoreExtractorClient {
  private baseUrl: string;
  private lastCheckTime: Date;
  
  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
    this.lastCheckTime = new Date();
  }
  
  async getNewScores(): Promise<ScoreApiResponse[]> {
    const since = this.lastCheckTime.toISOString();
    const response = await fetch(
      `${this.baseUrl}/api/v1/scores?since=${since}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    this.lastCheckTime = new Date();
    return data;
  }
}
```

### 2. ポーリング機能の実装
```typescript
// hooks/use-score-polling.ts
export function useScorePolling(
  onNewScore: (score: EditableResult) => void,
  interval: number = 5000
) {
  const clientRef = useRef(new ScoreExtractorClient());
  
  useEffect(() => {
    const pollScores = async () => {
      try {
        const newScores = await clientRef.current.getNewScores();
        newScores.forEach(score => {
          const convertedData = convertToEditResultData(score);
          onNewScore(convertedData);
        });
      } catch (error) {
        console.error("Score polling error:", error);
      }
    };
    
    const intervalId = setInterval(pollScores, interval);
    return () => clearInterval(intervalId);
  }, [onNewScore, interval]);
}
```

### 3. 編集ページでの利用
```typescript
// app/results/edit/page.tsx
export default function EditResultPage() {
  const [currentResult, setCurrentResult] = useState<EditableResult | null>(null);
  const [queue, setQueue] = useState<EditableResult[]>([]);
  
  // 新しいスコアが検出されたらキューに追加
  useScorePolling((newScore) => {
    setQueue(prev => [...prev, newScore]);
  });
  
  // キューから次のスコアを取得
  const loadNextScore = () => {
    if (queue.length > 0) {
      setCurrentResult(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  };
  
  // 保存処理
  const handleSave = async (data: EditableResult) => {
    await saveResult(data);
    loadNextScore();
  };
  
  return (
    <div>
      {currentResult ? (
        <EditResult
          defaultValues={currentResult}
          onSubmit={handleSave}
        />
      ) : (
        <div>新しいスコアを待っています...</div>
      )}
      
      {queue.length > 0 && (
        <div>待機中: {queue.length}件</div>
      )}
    </div>
  );
}
```

## ⚠️ 注意事項

### 1. エラーハンドリング
- score-extractorが起動していない場合のフォールバック
- OCR失敗時の対応（手動入力モードへの切り替え）
- ネットワークエラーのリトライ処理

### 2. パフォーマンス
- 画像データ（Base64）が大きいため、必要に応じて圧縮を検討
- ポーリング間隔の調整（デフォルト5秒）
- 大量のスコアが一度に来た場合のキューイング

### 3. セキュリティ
- CORSの設定（開発環境では `http://localhost:3000` を許可）
- 画像データのサニタイズ
- APIアクセスの認証（将来的に実装）