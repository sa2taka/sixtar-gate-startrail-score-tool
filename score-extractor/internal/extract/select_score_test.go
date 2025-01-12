package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractScoreFromSelect(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     int
		wantErr  bool
	}{
		{
			name:     "通常のリザルト",
			filename: "select_qs.jpg",
			want:     985581,
			wantErr:  false,
		},
		{
			name:     "NOT PLAYEDのリザルト",
			filename: "select_cm.jpg",
			want:     -1,
			wantErr:  true,
		},
		{
			name:     "リザルト画面",
			filename: "result_cm.jpg",
			want:     -1,
			wantErr:  true,
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

			result, err := ExtractScoreFromSelect(img)

			if tt.wantErr && err == nil {
				t.Errorf("ExtractStoreFromResult() error = %v, expected error", err)
			}
			if result != tt.want {
				t.Errorf("ExtractStoreFromResult() = %v, expected %v", result, tt.want)
			}
		})
	}
}
