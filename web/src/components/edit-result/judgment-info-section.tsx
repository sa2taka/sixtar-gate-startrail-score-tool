"use client";

import { Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { EditableResultSchema } from "@/model/result";

type JudgmentInfoSectionProps = {
  control: Control<EditableResultSchema>;
  validatePositiveNumber: (value: number | undefined) => string | true;
};

export const JudgmentInfoSection = ({ control, validatePositiveNumber }: JudgmentInfoSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">判定情報</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <FormField
          control={control}
          name="judgments.blueStar"
          rules={{ validate: validatePositiveNumber }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>BLUE STAR</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="judgments.whiteStar"
          rules={{ validate: validatePositiveNumber }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>WHITE STAR</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="judgments.yellowStar"
          rules={{ validate: validatePositiveNumber }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>YELLOW STAR</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="judgments.redStar"
          rules={{ validate: validatePositiveNumber }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>RED STAR</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="isFullCombo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>フルコンボ</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};