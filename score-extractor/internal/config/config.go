package config

import (
	"github.com/BurntSushi/toml"
)

type Config struct {
	API struct {
		Port int `toml:"port"`
	} `toml:"api"`
	Monitoring struct {
		Directory string `toml:"directory"`
	} `toml:"monitoring"`
	MusicInfo struct {
		Path string `toml:"path"`
	} `toml:"music_info"`
}

func LoadConfig(path string) (*Config, error) {
	var config Config
	config.API.Port = 6433                          // デフォルト値
	config.MusicInfo.Path = "musicInformation.json" // デフォルト値

	if _, err := toml.DecodeFile(path, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
