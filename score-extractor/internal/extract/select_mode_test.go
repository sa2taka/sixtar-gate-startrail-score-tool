package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractModeFromSelect(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Mode
		wantErr  bool
	}{
		{
			name:     "Solar",
			filename: "select_sl.jpg",
			want:     Solar,
			wantErr:  false,
		},
		{
			name:     "Lunar",
			filename: "select_lunar.jpg",
			want:     Lunar,
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

			got, err := ExtractModeFromSelect(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractModeFromSelect() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractModeFromSelect() = %v, want %v", got, tt.want)
			}
		})
	}
}
