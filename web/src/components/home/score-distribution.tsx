"use client";

interface ScoreDistributionData {
  rank: string;
  count: number;
  minScore: number;
  color: string;
}

interface ScoreDistributionProps {
  data: ScoreDistributionData[];
}

export function ScoreDistribution({ data }: ScoreDistributionProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">スコア分布</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.rank} className="flex items-center gap-4">
            <div className="w-12 text-sm font-medium text-center">
              <span className={`inline-block px-2 py-1 rounded text-white text-xs ${item.color}`}>
                {item.rank}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="text-sm text-gray-600 w-24">
                {item.minScore.toLocaleString()}+
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full ${item.color} flex items-center justify-end pr-2 transition-all duration-300`}
                  style={{
                    width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%',
                    minWidth: item.count > 0 ? '2rem' : '0',
                  }}
                >
                  {item.count > 0 && (
                    <span className="text-white text-xs font-medium">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium w-8 text-right">
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.every(d => d.count === 0) && (
        <div className="text-center py-8 text-gray-500">
          プレイデータがありません
        </div>
      )}
    </div>
  );
}