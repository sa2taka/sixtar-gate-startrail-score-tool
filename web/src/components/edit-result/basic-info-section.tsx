"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditableResultSchema } from "@/model/result";

type BasicInfoSectionProps = {
  control: Control<EditableResultSchema>;
  validatePositiveNumber: (value: number | undefined) => string | true;
};

export const BasicInfoSection = ({ control, validatePositiveNumber }: BasicInfoSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">基本情報</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>種類</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="result">リザルト</SelectItem>
                  <SelectItem value="select">選択画面</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>モード</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lunar">LUNAR</SelectItem>
                  <SelectItem value="solar">SOLAR</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>難易度</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="comet">COMET</SelectItem>
                  <SelectItem value="nova">NOVA</SelectItem>
                  <SelectItem value="supernova">SUPERNOVA</SelectItem>
                  <SelectItem value="quasar">QUASAR</SelectItem>
                  <SelectItem value="starlight">STARLIGHT</SelectItem>
                  <SelectItem value="mystic">MYSTIC</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="score"
          rules={{ validate: validatePositiveNumber }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>スコア</FormLabel>
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
    </div>
  );
};