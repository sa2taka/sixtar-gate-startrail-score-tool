package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractIsFullComboFromSelect(t *testing.T) {

	tests := []struct {
		name     string
		filename string
		want     bool
		wantErr  bool
	}{
		{
			name:     "Full Combo",
			filename: "select_fc.jpg",
			want:     true,
			wantErr:  false,
		},
		{
			name:     "No Full Combo",
			filename: "select_sl.jpg",
			want:     false,
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

			got, err := ExtractIsFullComboFromSelect(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractIsFullComboFromSelect() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractIsFullComboFromSelect() = %v, want %v", got, tt.want)
			}
		})
	}
}
