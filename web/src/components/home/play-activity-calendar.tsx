"use client";

interface PlayActivityData {
  date: string; // YYYY-MM-DD format
  count: number;
}

interface PlayActivityCalendarProps {
  data: PlayActivityData[];
  year?: number;
}

export function PlayActivityCalendar({ data, year = new Date().getFullYear() }: PlayActivityCalendarProps) {
  // データをMap化して高速アクセス
  const playDataMap = new Map(data.map(d => [d.date, d.count]));
  
  // 最大プレイ数を取得して色の強度を決める
  const maxCount = Math.max(...data.map(d => d.count), 0);
  
  // 年の全ての日を生成
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const weeks: Date[][] = [];
  
  // 週ごとに分割
  let currentWeek: Date[] = [];
  const current = new Date(startDate);
  
  // 最初の週の空白部分を埋める（日曜日開始）
  const firstDayOfWeek = startDate.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDate = new Date(startDate);
    emptyDate.setDate(startDate.getDate() - firstDayOfWeek + i);
    currentWeek.push(emptyDate);
  }
  
  while (current <= endDate) {
    currentWeek.push(new Date(current));
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  // 最後の週を埋める
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const nextDate = new Date(current);
      currentWeek.push(nextDate);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(currentWeek);
  }
  
  // プレイ数に応じた色を返す
  const getIntensityColor = (count: number): string => {
    if (count === 0) return "bg-gray-100";
    const intensity = Math.min(count / Math.max(maxCount / 4, 1), 4);
    
    if (intensity <= 1) return "bg-green-200";
    if (intensity <= 2) return "bg-green-300";
    if (intensity <= 3) return "bg-green-500";
    return "bg-green-700";
  };
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const isCurrentYear = (date: Date): boolean => {
    return date.getFullYear() === year;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">プレイアクティビティ</h2>
        <span className="text-sm text-gray-500">{year}年</span>
      </div>
      
      {/* 曜日ラベル */}
      <div className="flex gap-1 mb-2">
        <div className="w-8"></div>
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={i} className="w-3 text-xs text-gray-500 text-center">
            {i % 2 === 0 ? day : ''}
          </div>
        ))}
      </div>
      
      {/* 月ラベルとカレンダーグリッド */}
      <div className="flex gap-1">
        {/* 月ラベル（左側） */}
        <div className="w-8 flex flex-col justify-start">
          {Array.from({ length: 12 }, (_, i) => {
            const month = new Date(year, i, 1);
            const monthWeekIndex = Math.floor((month.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const isVisible = monthWeekIndex < weeks.length && monthWeekIndex >= 0;
            
            return (
              <div
                key={i}
                className="text-xs text-gray-500"
                style={{
                  height: '14px',
                  lineHeight: '14px',
                  visibility: isVisible && i % 2 === 0 ? 'visible' : 'hidden'
                }}
              >
                {month.toLocaleDateString('ja-JP', { month: 'short' })}
              </div>
            );
          })}
        </div>
        
        {/* カレンダーグリッド */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date, dayIndex) => {
                const dateStr = formatDate(date);
                const count = playDataMap.get(dateStr) || 0;
                const isThisYear = isCurrentYear(date);
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${
                      isThisYear 
                        ? getIntensityColor(count)
                        : "bg-gray-50"
                    }`}
                    title={isThisYear ? `${date.toLocaleDateString('ja-JP')}: ${count}曲` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* 凡例 */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>少ない</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
        </div>
        <span>多い</span>
      </div>
    </div>
  );
}