"use client";

interface HazardData {
  hazard: string;
  count: number;
  displayName: string;
  color: string;
}

interface HazardStatsProps {
  data: HazardData[];
}

export function HazardStats({ data }: HazardStatsProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">ハザード別統計</h2>
      
      {totalCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          プレイデータがありません
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.hazard} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium">
                <span className={`inline-block px-3 py-1 rounded text-white text-xs ${item.color}`}>
                  {item.displayName}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-3">
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
                <div className="text-sm text-gray-600 w-16">
                  {totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0}%
                </div>
                <div className="text-sm font-medium w-12 text-right">
                  {item.count}
                </div>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3 mt-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">合計</span>
              <span className="font-medium">{totalCount}曲</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}