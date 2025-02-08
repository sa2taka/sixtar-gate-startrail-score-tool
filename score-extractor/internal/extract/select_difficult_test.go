package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractDifficultFromSelect(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Difficult
		wantErr  bool
	}{
		{
			name:     "Comet",
			filename: "select_cm.jpg",
			want:     Comet,
			wantErr:  false,
		},
		{
			name:     "Nova",
			filename: "select_nv.jpg",
			want:     Nova,
			wantErr:  false,
		},
		{
			name:     "Supernova",
			filename: "select_sn.jpg",
			want:     Supernova,
			wantErr:  false,
		},
		{
			name:     "Quasar",
			filename: "select_qs.jpg",
			want:     Quasar,
			wantErr:  false,
		},
		{
			name:     "Starlight",
			filename: "select_sl.jpg",
			want:     Starlight,
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

			got, err := ExtractDifficultFromSelect(img)

			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractDifficultFromSelect() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractDifficultFromSelect() = %v, want %v", got, tt.want)
			}
		})
	}
}
