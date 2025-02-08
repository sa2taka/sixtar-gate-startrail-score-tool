package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractMaxComboFromSelect(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     int
		wantErr  bool
	}{
		{
			name:     "StartingPoint Max Combo 1142",
			filename: "select_sp.jpg",
			want:     1142,
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

			got, err := ExtractMaxComboFromSelect(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractMaxComboFromSelect() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractMaxComboFromSelect() = %v, want %v", got, tt.want)
			}
		})
	}
}
