"use client";

import { useForm } from "react-hook-form";
import { validateClientSide } from "@/application/client-validation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { EditableResultSchema } from "@/model/result";
import { BasicInfoSection } from "./basic-info-section";
import { MusicSelectionSection } from "./music-selection-section";
import { JudgmentInfoSection } from "./judgment-info-section";
import { OptionsSection } from "./options-section";

type Props = {
  defaultValues?: Partial<EditableResultSchema>;
  onSubmit: (data: EditableResultSchema) => void;
  isLoading?: boolean;
};

export const EditResult = ({ defaultValues, onSubmit, isLoading }: Props) => {
  const form = useForm<EditableResultSchema>({
    defaultValues: defaultValues || {
      kind: "result",
      mode: "lunar",
      pattern: "DEFAULT",
      hazard: "DEFAULT",
      score: 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const handleSubmit = (data: EditableResultSchema) => {
    const errors = validateClientSide(data);
    if (errors.length > 0) {
      errors.forEach((error) => {
        form.setError(error.key, {
          message: error.error,
        });
      });
      return;
    }
    onSubmit(data);
  };

  const validatePositiveNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "値を入力してください";
    if (isNaN(value)) return "数値を入力してください";
    if (value < 0) return "0以上の値を入力してください";
    return true;
  };

  const isResult = form.watch("kind") === "result";

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <BasicInfoSection 
            control={form.control} 
            validatePositiveNumber={validatePositiveNumber}
          />

          <MusicSelectionSection control={form.control} />

          {isResult && (
            <>
              <JudgmentInfoSection 
                control={form.control}
                validatePositiveNumber={validatePositiveNumber}
              />
              
              <OptionsSection control={form.control} />
            </>
          )}

          {/* 保存ボタン */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};