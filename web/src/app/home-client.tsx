"use client";

import { PollingManager } from "@/components/polling/polling-manager";
import { Header } from "@/components/home/header";
import { PollingControlPanel } from "@/components/home/polling-control-panel";
import { ScoreList } from "@/components/home/score-list";
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

interface HomeClientProps {
  initialLastDate: string | null;
  highscores: HighscoreData[];
}

export function HomeClient({ initialLastDate, highscores }: HomeClientProps) {
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