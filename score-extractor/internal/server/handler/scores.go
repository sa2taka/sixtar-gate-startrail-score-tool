package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"score_extractor/cmd/extract"
	"score_extractor/internal/fileutil"
)

type ScoresHandler struct {
	directory string
}

func NewScoresHandler(directory string) *ScoresHandler {
	return &ScoresHandler{
		directory: directory,
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

		result, err := extract.ExtractResult(file, fileInfo.ModTime())
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
