"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditResult } from "@/components/edit-result/edit-result";
import type { EditableResultSchema } from "@/model/result";
import type { PlayResult } from "@/types/score";

interface PlayHistoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result?: PlayResult;
  onSubmit: (data: EditableResultSchema) => Promise<void>;
  onDelete?: (resultId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PlayHistoryEditDialog({
  open,
  onOpenChange,
  result,
  onSubmit,
  onDelete,
  isLoading = false,
}: PlayHistoryEditDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (data: EditableResultSchema) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update result:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!result || !onDelete) return;
    
    try {
      await onDelete(result.id);
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete result:", error);
      // エラーハンドリングは親コンポーネントで処理
    }
  };

  // PlayResultからEditableResultSchemaに変換
  const convertToEditableResult = (playResult: PlayResult): EditableResultSchema => {
    return {
      filePath: "", // プレイ履歴編集では不要
      imageBinary: "", // プレイ履歴編集では不要
      modTime: "", // プレイ履歴編集では不要
      kind: "result" as const,
      score: playResult.score,
      judgments: {
        blueStar: playResult.blueStar ?? 0,
        whiteStar: playResult.whiteStar ?? 0,
        yellowStar: playResult.yellowStar ?? 0,
        redStar: playResult.redStar ?? 0,
      },
      isFullCombo: playResult.isFullCombo,
      hazard: playResult.hazard || "DEFAULT",
      pattern: playResult.pattern || "DEFAULT",
      // playedAtフィールドはEditableResultSchemaに存在しないため削除
    };
  };

  const editableResult = result ? convertToEditableResult(result) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">

        <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle>プレイ履歴を編集</DialogTitle>
            <DialogDescription>
              スコア情報を編集して保存するか、記録を削除できます。
            </DialogDescription>
          </DialogHeader>

          {editableResult && (
            <div className="flex-1 overflow-y-auto min-h-0 py-2">
              <EditResult
                defaultValues={editableResult}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* 削除確認ダイアログ */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">記録を削除</h3>
                <p className="text-gray-600 mb-4">
                  この記録を削除します。この操作は取り消せません。
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    削除
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* フッター */}
          {onDelete && (
            <div className="flex-shrink-0 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                size="sm"
              >
                記録を削除
              </Button>

            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}