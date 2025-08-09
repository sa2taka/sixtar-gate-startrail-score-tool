"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MusicType } from "@prisma/client";

type SortBy = "playedAt" | "score" | "misses";
type SortOrder = "asc" | "desc";

interface HighscoreData {
  musicId: string;
  type: string;
  difficulty: string;
  score: number;
  playedAt: Date;
  isFullCombo: boolean;
  misses: number;
  musicName: string;
  musicEnglishName: string | null;
  level: number;
  notes: number;
  combo: number;
}

interface ScoreListProps {
  initialData: HighscoreData[];
}

const difficultyColors = {
  comet: "bg-green-100 text-green-800",
  nova: "bg-blue-100 text-blue-800",
  supernova: "bg-purple-100 text-purple-800",
  quasar: "bg-orange-100 text-orange-800",
  starlight: "bg-pink-100 text-pink-800",
  mystic: "bg-red-100 text-red-800",
};

const getScoreRank = (score: number) => {
  if (score >= 995000) return { rank: "995", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" };
  if (score >= 990000) return { rank: "990", color: "bg-gradient-to-r from-blue-500 to-purple-500 text-white" };
  if (score >= 975000) return { rank: "975", color: "bg-gradient-to-r from-green-500 to-blue-500 text-white" };
  if (score >= 950000) return { rank: "SS", color: "bg-yellow-400 text-black" };
  if (score >= 900000) return { rank: "S", color: "bg-yellow-300 text-black" };
  if (score >= 850000) return { rank: "A", color: "bg-green-200 text-green-800" };
  if (score >= 800000) return { rank: "B", color: "bg-blue-200 text-blue-800" };
  if (score >= 700000) return { rank: "C", color: "bg-gray-200 text-gray-800" };
  return { rank: "D", color: "bg-red-200 text-red-800" };
};

export function ScoreList({ initialData }: ScoreListProps) {
  const [selectedType, setSelectedType] = useState<MusicType | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [highscores] = useState<HighscoreData[]>(initialData);

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
                <TableRow key={`${item.musicId}-${item.type}-${item.difficulty}`} className="cursor-pointer hover:bg-gray-50">
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
                    {item.score.toLocaleString()}
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
                    {new Date(item.playedAt).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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