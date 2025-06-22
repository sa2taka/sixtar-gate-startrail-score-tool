"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Music } from "@/model/result";

type Props = {
  value?: Music;
  onChange: (music: Music | undefined) => void;
};

export const MusicSelect = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState("");
  const [musics, setMusics] = useState<Music[]>([]);
  const [filteredMusics, setFilteredMusics] = useState<Music[]>([]);

  useEffect(() => {
    const loadMusics = async () => {
      const response = await fetch("/musicInformation.json");
      const data = await response.json();
      const musicList: Music[] = data.songs.map((song: {
        id: string;
        name: string;
        englishName?: string | null;
      }) => ({
        id: song.id,
        name: song.name,
        englishName: song.englishName ?? null,
      }));
      setMusics(musicList);
      setFilteredMusics(musicList);
    };
    loadMusics();
  }, []);

  useEffect(() => {
    const filtered = musics.filter((music) => {
      const searchText = query.toLowerCase();
      return (
        music.name.toLowerCase().includes(searchText) ||
        (music.englishName?.toLowerCase().includes(searchText) ?? false)
      );
    });
    setFilteredMusics(filtered);
  }, [query, musics]);

  return (
    <div className="space-y-2">
      <Input type="text" placeholder="楽曲名を入力..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="max-h-48 overflow-y-auto border rounded-md">
        {filteredMusics.map((music) => (
          <button
            key={music.id}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${value?.id === music.id ? "bg-gray-100" : ""}`}
            onClick={() => onChange(music)}
          >
            <div>{music.name}</div>
            {music.englishName && <div className="text-sm text-gray-500">{music.englishName}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};
