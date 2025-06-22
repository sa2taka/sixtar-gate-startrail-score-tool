"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { EditableResultSchema } from "@/model/result";
import { EditResult } from "@/components/edit-result/edit-result";
import { Button } from "@/components/ui/button";

// score-extractor APIのレスポンス型
interface ScoreApiResponse {
  file_path: string;
  mod_time: string;
  kind: "result" | "select";
  music: {
    id: string;
    name: string;
    englishName: string;
  };
  difficulty?: string;
  mode?: string;
  score: number;
  judgments?: {
    blueStar: number;
    whiteStar: number;
    yellowStar: number;
    redStar: number;
  };
  is_full_combo: boolean;
  pattern?: string;
  hazard?: string;
  max_combo?: number;
  image_binary: string;
}

// APIクライアント
class ScoreExtractorClient {
  private baseUrl: string;
  private lastCheckTime: Date;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
    this.lastCheckTime = new Date();
  }

  async getNewScores(): Promise<ScoreApiResponse[]> {
    const since = this.lastCheckTime.toISOString();
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/scores?since=${since}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.lastCheckTime = new Date();
      return data;
    } catch (error) {
      console.error("Score fetching error:", error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// データ変換関数
function convertToEditResultData(
  apiData: ScoreApiResponse,
): Partial<EditableResultSchema> {
  // モード変換（score-extractorのmode → Prismaのmode）
  const modeMap: Record<string, "solar" | "lunar"> = {
    star: "solar",
    solar: "solar",
    lunar: "lunar",
    ultrastar: "solar", // ultrastartは存在しないので仮にsolarにマップ
    purestar: "solar", // purestarは存在しないので仮にsolarにマップ
  };

  // 難易度変換
  const difficultyMap: Record<
    string,
    "comet" | "nova" | "supernova" | "quasar" | "starlight" | "mystic"
  > = {
    comet: "comet",
    nova: "nova",
    supernova: "supernova",
    quasar: "quasar",
    starlight: "starlight",
    mystic: "mystic",
  };

  // パターン変換
  const patternMap: Record<string, "DEFAULT" | "MIRROR" | "RANDOM"> = {
    "": "DEFAULT",
    MIRROR: "MIRROR",
    RANDOM: "RANDOM",
  };

  // ハザード変換
  const hazardMap: Record<
    string,
    "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN"
  > = {
    "": "DEFAULT",
    LV1: "LV1",
    LV2: "LV2",
    LV3: "LV3",
    DEADEND: "DEADEND",
    SUDDEN: "SUDDEN",
  };


  return {
    kind: apiData.kind,
    music: {
      id: apiData.music.id,
      name: apiData.music.name,
      englishName: apiData.music.englishName || null,
    },
    mode: apiData.mode ? modeMap[apiData.mode] : "solar",
    difficulty: apiData.difficulty
      ? difficultyMap[apiData.difficulty]
      : undefined,
    pattern: patternMap[apiData.pattern || ""],
    hazard: hazardMap[apiData.hazard || ""],
    score: apiData.score,
    judgments: apiData.judgments ? {
      blueStar: apiData.judgments.blueStar || 0,
      whiteStar: apiData.judgments.whiteStar || 0,
      yellowStar: apiData.judgments.yellowStar || 0,
      redStar: apiData.judgments.redStar || 0,
    } : undefined,
    isFullCombo: apiData.is_full_combo || false,
    maxCombo: apiData.max_combo,
    imageBinary: apiData.image_binary,
    filePath: apiData.file_path,
    modTime: apiData.mod_time,
  };
}

export default function EditResultPage() {
  const router = useRouter();
  const [currentResult, setCurrentResult] =
    useState<Partial<EditableResultSchema> | null>(null);
  const [queue, setQueue] = useState<Partial<EditableResultSchema>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<ScoreExtractorClient | null>(null);

  // score-extractor APIとの接続を確立
  useEffect(() => {
    clientRef.current = new ScoreExtractorClient();

    // ヘルスチェック
    const checkConnection = async () => {
      if (clientRef.current) {
        const health = await clientRef.current.checkHealth();
        setIsConnected(health);
      }
    };

    checkConnection();
    const healthInterval = setInterval(checkConnection, 10000); // 10秒ごとにヘルスチェック

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  // ポーリング
  useEffect(() => {
    if (!isConnected || !clientRef.current) return;

    const pollScores = async () => {
      if (clientRef.current) {
        const newScores = await clientRef.current.getNewScores();
        if (newScores.length > 0) {
          const convertedScores = newScores.map(convertToEditResultData);
          setQueue((prev) => [...prev, ...convertedScores]);
        }
      }
    };

    // 初回実行
    pollScores();

    // 5秒ごとにポーリング
    const pollInterval = setInterval(pollScores, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isConnected]);

  // キューから次のスコアを読み込み
  useEffect(() => {
    if (!currentResult && queue.length > 0) {
      setCurrentResult(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [currentResult, queue]);

  // 保存処理
  const handleSave = async (data: EditableResultSchema) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/results/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      // 次のスコアを読み込み
      setCurrentResult(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("保存中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // スキップ処理
  const handleSkip = () => {
    setCurrentResult(null);
  };

  // 手動入力モード
  const handleManualInput = () => {
    setCurrentResult({
      kind: "result",
      mode: "lunar",
      pattern: "DEFAULT",
      hazard: "DEFAULT",
      score: 0,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">スコア編集</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "score-extractor接続中" : "score-extractor未接続"}
            </span>
          </div>
          {queue.length > 0 && (
            <span className="text-sm text-muted-foreground">
              待機中: {queue.length}件
            </span>
          )}
        </div>
      </div>

      {currentResult ? (
        <div className="space-y-4">
          <EditResult
            defaultValues={currentResult}
            onSubmit={handleSave}
            isLoading={isLoading}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
              スキップ
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              終了
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {isConnected
              ? "新しいスコアを待っています..."
              : "score-extractorに接続できません"}
          </p>
          <Button onClick={handleManualInput}>手動で入力</Button>
        </div>
      )}
    </div>
  );
}
