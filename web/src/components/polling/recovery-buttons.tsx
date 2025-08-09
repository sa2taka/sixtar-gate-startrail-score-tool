"use client";

type RecoveryButtonsProps = {
  queueLength: number;
  onReopen: () => void;
  onClearAll: () => void;
};

export const RecoveryButtons = ({ queueLength, onReopen, onClearAll }: RecoveryButtonsProps) => {
  if (queueLength === 0) return null;

  const handleClearAll = () => {
    const shouldClear = confirm(
      `${queueLength}件の未編集スコアを全て破棄しますか？\n\nこの操作は取り消せません。`
    );
    if (shouldClear) {
      onClearAll();
    }
  };

  return (
    <div className="fixed bottom-28 right-4 z-40 flex flex-col gap-2">
      <button
        onClick={onReopen}
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        title={`未編集のスコアが${queueLength}件あります - クリックして編集を再開`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-sm">
            {queueLength}
          </div>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      </button>
      <button
        onClick={handleClearAll}
        className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
        title="未編集のスコアを全て破棄"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};