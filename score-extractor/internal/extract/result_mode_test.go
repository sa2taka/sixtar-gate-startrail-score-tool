package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractMode(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Mode
		wantErr  bool
	}{
		{
			name:     "Solar",
			filename: "result_sl.jpg",
			want:     Solar,
			wantErr:  false,
		},
		{
			name:     "Lunar",
			filename: "result_lunar.jpg",
			want:     Lunar,
			wantErr:  false,
		},
		{
			name:     "Other",
			filename: "select_cm.jpg",
			want:     UnknownMode,
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

			got, err := ExtractMode(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractMode() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractMode() = %v, want %v", got, tt.want)
			}
		})
	}
}
