"use client";

import { PollingManager } from "@/components/polling/polling-manager";
import { Header } from "@/components/home/header";
import { PollingControlPanel } from "@/components/home/polling-control-panel";
import { ScoreList } from "@/components/home/score-list";
import { ScoreDistribution } from "@/components/home/score-distribution";
import { PlayActivityCalendar } from "@/components/home/play-activity-calendar";
import { HazardStats } from "@/components/home/hazard-stats";
import { usePollingControl } from "@/hooks/use-polling-control";

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

interface ScoreDistributionData {
  rank: string;
  count: number;
  minScore: number;
  color: string;
}

interface PlayActivityData {
  date: string;
  count: number;
}


interface HazardData {
  hazard: string;
  count: number;
  displayName: string;
  color: string;
}

interface HomeClientProps {
  initialLastDate: string | null;
  highscores: HighscoreData[];
  scoreDistribution: ScoreDistributionData[];
  playActivity: PlayActivityData[];
  hazardStats: HazardData[];
}

export function HomeClient({ initialLastDate, highscores, scoreDistribution, playActivity, hazardStats }: HomeClientProps) {
  const pollingControl = usePollingControl();

  return (
    <div className="min-h-screen">
      <main className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <Header />
          
          <div className="mt-4">
            <PollingControlPanel
              pollingEnabled={pollingControl.pollingEnabled}
              onTogglePolling={pollingControl.togglePolling}
              errorMessage={pollingControl.errorMessage}
            />
          </div>
        </div>

        {/* 統計セクション */}
        {(scoreDistribution.length > 0 || playActivity.length > 0 || hazardStats.some(h => h.count > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScoreDistribution data={scoreDistribution} />
            <PlayActivityCalendar data={playActivity} />
            <HazardStats data={hazardStats} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">スコア一覧</h2>
          <ScoreList initialData={highscores} />
        </div>
      </main>

      <PollingManager
        enabled={pollingControl.pollingEnabled}
        onError={pollingControl.handlePollingError}
        initialLastDate={initialLastDate}
      />
    </div>
  );
}