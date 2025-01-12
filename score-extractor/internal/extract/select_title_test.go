package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"testing"
)

func TestExtractTitleFromSelect(t *testing.T) {
	music_info_path, err := filepath.Abs(filepath.Join("..", "..", "musicInformation.json"))
	if err != nil {
		t.Fatalf("音楽データの読み込みに失敗しました: %v", err)
	}

	candidates, err := music_info.LoadMusicData(music_info_path)
	if err != nil {
		t.Fatalf("音楽データの読み込みに失敗しました: %v", err)
	}

	tests := []struct {
		name     string
		filename string
		wantId   string
		wantErr  bool
	}{
		{
			name:     "Starting Point",
			filename: "select_sp.jpg",
			wantId:   "Starting_Point",
			wantErr:  false,
		},
		{
			name:     "Starting Point (yomoha Jazz Arrange)",
			filename: "select_spa.jpg",
			wantId:   "Starting_Point_yomoha_Jazz_Arrange",
			wantErr:  false,
		},
		{
			name:     "사무치는 누군가의 위로",
			filename: "select_kr.jpg",
			wantId:   "Scatter_One%27s_Consolation",
			wantErr:  false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			imgPath, err := filepath.Abs(filepath.Join("..", "..", "testdata", tt.filename))
			if err != nil {
				t.Fatalf("パスの解決に失敗しました: %v", err)
			}

			img, err := imageproc.ReadImage(imgPath)
			if err != nil {
				t.Fatalf("画像の読み込みに失敗しました: %v", err)
			}

			result, err := ExtractTitleFromSelect(img, candidates)

			if tt.wantErr && err == nil {
				t.Errorf("ExtractStoreFromResult() error = %v, expected error", err)
			}
			if result.Id != tt.wantId {
				t.Errorf("ExtractStoreFromResult() = %v, expected %v", result, tt.wantId)
			}
		})
	}
}
