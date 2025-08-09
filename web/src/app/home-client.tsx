"use client";

import { useState } from "react";
import Image from "next/image";
import { PollingManager } from "@/components/polling/polling-manager";
import { Button } from "@/components/ui/button";

interface HomeClientProps {
  initialLastDate: string | null;
}

export function HomeClient({ initialLastDate }: HomeClientProps) {
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePollingError = (error: Error) => {
    console.error("Polling error:", error);
    setErrorMessage(error.message);
  };

  const togglePolling = () => {
    setPollingEnabled(!pollingEnabled);
    if (!pollingEnabled) {
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-8 items-center sm:items-start">
          <div className="flex items-center gap-4">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
            <div className="text-2xl font-bold">SIXTAR GATE STARTRAIL</div>
          </div>

          <div className="w-full">
            <h1 className="text-3xl font-bold mb-4">スコア管理システム</h1>
            <p className="text-gray-600 mb-6">
              score-extractorから自動的にスコア情報を取得し、編集・保存します。
              新しいスコアが検出されると自動的にダイアログが表示されます。
            </p>

            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={togglePolling}
                variant={pollingEnabled ? "default" : "outline"}
              >
                {pollingEnabled ? "ポーリング停止" : "ポーリング開始"}
              </Button>
              
              <div className="text-sm text-gray-500">
                ポーリング間隔: 1分
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>エラー:</strong> {errorMessage}
                <br />
                <span className="text-sm">
                  score-extractorサーバーが localhost:6433 で起動していることを確認してください。
                </span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-3">機能</h2>
                <ul className="space-y-2 text-sm">
                  <li>✓ 自動スコア検出（1分間隔）</li>
                  <li>✓ スコア編集ダイアログ</li>
                  <li>✓ 複数スコアの順次処理</li>
                  <li>✓ スクリーンショット画像表示</li>
                  <li>✓ 楽曲情報の自動補完</li>
                </ul>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-3">使い方</h2>
                <ol className="space-y-2 text-sm">
                  <li>1. score-extractorサーバーを起動</li>
                  <li>2. ゲームのスクリーンショットを撮影</li>
                  <li>3. 自動的にスコアが検出される</li>
                  <li>4. ダイアログで内容を確認・編集</li>
                  <li>5. 保存してデータベースに記録</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PollingManager
        enabled={pollingEnabled}
        onError={handlePollingError}
        initialLastDate={initialLastDate}
      />
    </div>
  );
}