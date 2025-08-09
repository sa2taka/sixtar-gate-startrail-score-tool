"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MusicInfo, ChartInfo, PlayResult } from "@/types/score";
import { getScoreRank, formatPlayDate, formatScore } from "@/lib/utils/score-utils";
import { difficultyColors } from "@/lib/constants/game-constants";

interface MusicDetailClientProps {
  musicInfo: MusicInfo;
  chartInfo: ChartInfo;
  results: PlayResult[];
}

export function MusicDetailClient({ musicInfo, chartInfo, results }: MusicDetailClientProps) {
  const router = useRouter();

  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const totalPlays = results.length;
  const fullComboCount = results.filter(r => r.isFullCombo).length;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{musicInfo.name}</h1>
          {musicInfo.englishName && (
            <p className="text-lg text-gray-600 mt-1">{musicInfo.englishName}</p>
          )}
        </div>
      </div>

      {/* 楽曲情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">楽曲情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">タイプ・難易度</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={chartInfo.type === "solar" ? "default" : "secondary"}>
                {chartInfo.type.toUpperCase()}
              </Badge>
              <Badge className={difficultyColors[chartInfo.difficulty]}>
                {chartInfo.difficulty.toUpperCase()} {chartInfo.level}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">ノーツ数</div>
            <div className="font-mono text-lg">{chartInfo.notes}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">最大コンボ</div>
            <div className="font-mono text-lg">{chartInfo.combo}</div>
          </div>
          {musicInfo.bpm && (
            <div>
              <div className="text-sm text-gray-500">BPM</div>
              <div className="font-mono text-lg">{musicInfo.bpm}</div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" asChild>
            <a href={musicInfo.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              公式サイト
            </a>
          </Button>
        </div>
      </div>

      {/* プレイ統計 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">プレイ統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">最高スコア</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-lg">{formatScore(bestScore)}</span>
              {bestScore > 0 && (
                <Badge className={getScoreRank(bestScore).color}>
                  {getScoreRank(bestScore).rank}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">総プレイ回数</div>
            <div className="font-mono text-lg">{totalPlays}回</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">フルコンボ回数</div>
            <div className="font-mono text-lg">{fullComboCount}回</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">フルコンボ率</div>
            <div className="font-mono text-lg">
              {totalPlays > 0 ? Math.round((fullComboCount / totalPlays) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* プレイ履歴 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">プレイ履歴</h2>
          <div className="text-sm text-gray-500">
            {totalPlays}件のプレイ記録
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            プレイ記録がありません
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>プレイ日時</TableHead>
                  <TableHead>スコア</TableHead>
                  <TableHead>ランク</TableHead>
                  <TableHead>判定</TableHead>
                  <TableHead>FC</TableHead>
                  <TableHead>設定</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => {
                  const scoreRank = getScoreRank(result.score);
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="text-sm">
                        {formatPlayDate(result.playedAt)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatScore(result.score)}
                      </TableCell>
                      <TableCell>
                        <Badge className={scoreRank.color}>
                          {scoreRank.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex gap-1">
                          {result.blueStar !== null && (
                            <span className="text-blue-600">{result.blueStar}</span>
                          )}
                          {result.whiteStar !== null && (
                            <span className="text-gray-600">{result.whiteStar}</span>
                          )}
                          {result.yellowStar !== null && (
                            <span className="text-yellow-600">{result.yellowStar}</span>
                          )}
                          {result.redStar !== null && (
                            <span className="text-red-600">{result.redStar}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.isFullCombo ? (
                          <Badge className="bg-green-100 text-green-800">FC</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="space-y-1">
                          {result.hazard && result.hazard !== "DEFAULT" && (
                            <Badge variant="outline" className="text-xs">
                              {result.hazard}
                            </Badge>
                          )}
                          {result.pattern && result.pattern !== "DEFAULT" && (
                            <Badge variant="outline" className="text-xs">
                              {result.pattern}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}