"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditableResultSchema } from "@/model/result";

type OptionsSectionProps = {
  control: Control<EditableResultSchema>;
};

export const OptionsSection = ({ control }: OptionsSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">オプション設定</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="hazard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ハザード</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                  <SelectItem value="LV1">LV1</SelectItem>
                  <SelectItem value="LV2">LV2</SelectItem>
                  <SelectItem value="LV3">LV3</SelectItem>
                  <SelectItem value="DEADEND">DEADEND</SelectItem>
                  <SelectItem value="SUDDEN">SUDDEN</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パターン</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                  <SelectItem value="MIRROR">MIRROR</SelectItem>
                  <SelectItem value="RANDOM">RANDOM</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};