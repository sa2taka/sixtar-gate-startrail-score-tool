"use client";

import { useForm } from "react-hook-form";
import { validateClientSide } from "@/application/client-validation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
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
import { MusicSelect } from "./music-select";

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

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 基本情報セクション - 横並び */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">基本情報</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

          {/* 楽曲選択セクション */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">楽曲選択</h3>
            <FormField
              control={form.control}
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

          {/* リザルト画面専用セクション */}
          {form.watch("kind") === "result" && (
            <>
              {/* 判定情報セクション */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">判定情報</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                  control={form.control}
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

              {/* オプション設定セクション */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">オプション設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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