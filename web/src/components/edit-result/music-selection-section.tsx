"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MusicSelect } from "./music-select";
import type { EditableResultSchema } from "@/model/result";

type MusicSelectionSectionProps = {
  control: Control<EditableResultSchema>;
};

export const MusicSelectionSection = ({ control }: MusicSelectionSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">楽曲選択</h3>
      <FormField
        control={control}
        name="music"
        render={({ field }) => (
          <FormItem>
            <FormLabel>楽曲</FormLabel>
            <FormControl>
              <MusicSelect value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};