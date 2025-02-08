package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"score_extractor/cmd/extract"
	"score_extractor/internal/config"
	"score_extractor/internal/fileutil"
)

type ScoresHandler struct {
	directory string
	config    *config.Config
}

func NewScoresHandler(directory string) *ScoresHandler {
	// 設定ファイルを読み込む
	cfg, err := config.LoadConfig("config.toml")
	if err != nil {
		// 設定ファイルが読めない場合はデフォルト値を使用
		cfg = &config.Config{}
		cfg.MusicInfo.Path = "musicInformation.json"
	}

	return &ScoresHandler{
		directory: directory,
		config:    cfg,
	}
}

func (h *ScoresHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sinceStr := r.URL.Query().Get("since")
	var targetTime time.Time
	var err error

	if sinceStr != "" {
		targetTime, err = time.Parse(time.RFC3339, sinceStr)
		if err != nil {
			http.Error(w, "Invalid date format. Expected RFC3339 format", http.StatusBadRequest)
			return
		}
	}

	finder := fileutil.NewImageFinder(h.directory, targetTime)
	files, err := finder.Find()
	if err != nil {
		http.Error(w, "Failed to find score files", http.StatusInternalServerError)
		return
	}

	results := make([]*extract.Result, 0, len(files))
	for _, file := range files {
		fileInfo, err := os.Stat(file)
		if err != nil {
			continue
		}

		result, err := extract.ExtractResult(file, fileInfo.ModTime(), h.config.MusicInfo.Path)
		if err != nil {
			continue // Skip failed extractions
		}
		results = append(results, result)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
