"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Music as MusicType } from "@/model/result";

type Props = {
  value?: MusicType;
  onChange: (music: MusicType | undefined) => void;
};

export const MusicSelect = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [musics, setMusics] = useState<MusicType[]>([]);

  useEffect(() => {
    const loadMusics = async () => {
      try {
        const response = await fetch("/api/musics");
        if (!response.ok) {
          throw new Error("Failed to fetch musics");
        }
        const musicList: MusicType[] = await response.json();
        setMusics(musicList);
      } catch (error) {
        console.error("Error loading musics:", error);
      }
    };
    loadMusics();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{value.name}</div>
                {value.englishName && (
                  <div className="text-xs text-muted-foreground">{value.englishName}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Music className="h-4 w-4" />
              楽曲を選択...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="楽曲名で検索..." />
          <CommandList>
            <CommandEmpty>楽曲が見つかりません</CommandEmpty>
            <CommandGroup>
              {musics.map((music) => (
                <CommandItem
                  key={music.id}
                  value={`${music.name} ${music.englishName || ""} ${music.id}`}
                  keywords={[music.name, music.englishName || "", music.id]}
                  onSelect={() => {
                    onChange(music.id === value?.id ? undefined : music);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === music.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="font-medium">{music.name}</div>
                    {music.englishName && (
                      <div className="text-xs text-muted-foreground">{music.englishName}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
