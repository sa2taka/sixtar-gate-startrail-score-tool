"use client";

interface PersonalBestData {
  totalPBs: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  fullComboCount: number;
  fullComboRate: number;
}

interface PersonalBestStatsProps {
  data: PersonalBestData;
}

export function PersonalBestStats({ data }: PersonalBestStatsProps) {
  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  const formatPercentage = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">パーソナルベスト統計</h2>
      
      {data.totalPBs === 0 ? (
        <div className="text-center py-8 text-gray-500">
          プレイデータがありません
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">総PB数</div>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalPBs}曲
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">平均スコア</div>
            <div className="text-2xl font-bold text-green-600">
              {formatScore(data.averageScore)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">最高スコア</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatScore(data.highestScore)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">最低スコア</div>
            <div className="text-2xl font-bold text-gray-600">
              {formatScore(data.lowestScore)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">フルコンボ数</div>
            <div className="text-2xl font-bold text-yellow-600">
              {data.fullComboCount}曲
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">フルコンボ率</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(data.fullComboRate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}