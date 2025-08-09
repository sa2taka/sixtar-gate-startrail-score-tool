"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditResult } from "@/components/edit-result/edit-result";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/ui/image-viewer";
import type { EditableResultSchema } from "@/model/result";

export type ScoreEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoreData?: EditableResultSchema;
  onSubmit: (data: EditableResultSchema) => Promise<void>;
  onSkip?: () => void;
  queueLength?: number;
  currentIndex?: number;
  isLoading?: boolean;
};

export const ScoreEditDialog = ({
  open,
  onOpenChange,
  scoreData,
  onSubmit,
  onSkip,
  queueLength = 0,
  currentIndex = 0,
  isLoading = false,
}: ScoreEditDialogProps) => {

  const handleSubmit = async (data: EditableResultSchema) => {
    try {
      await onSubmit(data);
      // onSubmit内で次のスコアに進むか、全て完了したらダイアログを閉じる処理が行われる
    } catch (error) {
      console.error("Failed to save score:", error);
      // エラーはEditResultコンポーネント内で処理される
      throw error;
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      // onSkip内で次のスコアに進むか、全て完了したらダイアログを閉じる処理が行われる
    }
  };

  const queueInfo = queueLength > 1 ? 
    `(${currentIndex + 1}/${queueLength})` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <DialogHeader className="px-6 py-4 border-b bg-gray-50">
            <DialogTitle className="text-xl font-semibold">
              スコア編集 {queueInfo}
            </DialogTitle>
            <DialogDescription>
              スコア情報を確認・編集して保存してください。
              {queueLength > 1 && (
                <span className="block mt-1 text-sm text-gray-600">
                  残り {queueLength - currentIndex - 1} 件のスコアが待機中です。
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {scoreData && (
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* 画像エリア（左側・上半分） */}
              <div className="w-1/2 p-4 bg-gray-100 flex items-center justify-center">
                <div className="max-w-full max-h-full">
                  <ImageViewer 
                    imageBinary={scoreData.imageBinary}
                    alt="Score Image"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* フォームエリア（右側・下半分） */}
              <div className="w-1/2 flex flex-col min-h-0">
                <div className="flex-1 p-6 overflow-y-auto">
                  <EditResult
                    defaultValues={scoreData}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* フッター（スキップボタン） */}
          {onSkip && (
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                size="lg"
              >
                スキップ
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};