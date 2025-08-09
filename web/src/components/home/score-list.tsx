"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MusicType } from "@prisma/client";
import type { HighscoreData } from "@/types/score";
import { getScoreRank, formatPlayDate, formatScore } from "@/lib/utils/score-utils";
import { difficultyColors, type SortBy, type SortOrder } from "@/lib/constants/game-constants";

interface ScoreListProps {
  initialData: HighscoreData[];
}

export function ScoreList({ initialData }: ScoreListProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<MusicType | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [highscores] = useState<HighscoreData[]>(initialData);

  const handleRowClick = (item: HighscoreData) => {
    router.push(`/music/${encodeURIComponent(item.musicId)}/${item.type}/${item.difficulty}`);
  };

  // フィルタリング
  const filteredData = selectedType === "all" 
    ? highscores 
    : highscores.filter(item => item.type === selectedType);

  const sortedData = filteredData?.slice().sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case "score":
        compareValue = a.score - b.score;
        break;
      case "misses":
        compareValue = a.misses - b.misses;
        break;
      case "playedAt":
        compareValue = new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime();
        break;
      case "musicName":
        compareValue = a.musicName.localeCompare(b.musicName);
        break;
    }
    return sortOrder === "desc" ? -compareValue : compareValue;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">タイプ:</label>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as MusicType | "all")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="solar">SOLAR</SelectItem>
              <SelectItem value="lunar">LUNAR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">ソート:</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">スコア順</SelectItem>
              <SelectItem value="playedAt">プレイ順</SelectItem>
              <SelectItem value="misses">ミス数順</SelectItem>
              <SelectItem value="musicName">曲名順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "desc" ? "↓降順" : "↑昇順"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>楽曲名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>難易度</TableHead>
              <TableHead>スコア</TableHead>
              <TableHead>ランク</TableHead>
              <TableHead>FC</TableHead>
              <TableHead>ミス数</TableHead>
              <TableHead>プレイ日時</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData?.map((item) => {
              const scoreRank = getScoreRank(item.score);
              return (
                <TableRow 
                  key={`${item.musicId}-${item.type}-${item.difficulty}`} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div>{item.musicName}</div>
                      {item.musicEnglishName && (
                        <div className="text-xs text-gray-500">{item.musicEnglishName}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === "solar" ? "default" : "secondary"}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={difficultyColors[item.difficulty as keyof typeof difficultyColors]}>
                      {item.difficulty.toUpperCase()} {item.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatScore(item.score)}
                  </TableCell>
                  <TableCell>
                    <Badge className={scoreRank.color}>
                      {scoreRank.rank}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.isFullCombo ? (
                      <Badge className="bg-green-100 text-green-800">FC</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{item.misses}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatPlayDate(item.playedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sortedData?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          データがありません
        </div>
      )}
    </div>
  );
}