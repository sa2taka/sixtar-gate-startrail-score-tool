package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"testing"
)

func TestExtractTitleFromResult(t *testing.T) {
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
			name:     "患部で止まってすぐ溶ける～狂気の優曇華院",
			filename: "result_nv.jpg",
			wantId:   "Kanbu_de_Tomatte_Sugu_Tokeru_Kyouki_no_Udongein",
			wantErr:  false,
		},
		{
			name:     "Strawberry Chips",
			filename: "result_sl.jpg",
			wantId:   "Strawberry_Chip",
			wantErr:  false,
		},
		{
			name:     ":하트: :돋보기: :무지개: :오리: :별:",
			filename: "result_sn.jpg",
			wantId:   "heart_mag_rainbow_duck_sparkles",
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

			result, err := ExtractTitleFromResult(img, candidates)

			if tt.wantErr && err == nil {
				t.Errorf("ExtractStoreFromResult() error = %v, expected error", err)
			}
			if result.Id != tt.wantId {
				t.Errorf("ExtractStoreFromResult() = %v, expected %v", result, tt.wantId)
			}
		})
	}
}
