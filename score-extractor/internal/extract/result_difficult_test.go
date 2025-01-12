package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractDifficultFromResult(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Difficult
		wantErr  bool
	}{
		{
			name:     "Comet",
			filename: "result_cm.jpg",
			want:     Comet,
			wantErr:  false,
		},
		{
			name:     "Nova",
			filename: "result_nv.jpg",
			want:     Nova,
			wantErr:  false,
		},
		{
			name:     "Supernova",
			filename: "result_sn.jpg",
			want:     Supernova,
			wantErr:  false,
		},
		{
			name:     "Quasar",
			filename: "result_qs.jpg",
			want:     Quasar,
			wantErr:  false,
		},
		{
			name:     "Starlight",
			filename: "result_sl.jpg",
			want:     Starlight,
			wantErr:  false,
		},
		{
			name:     "Not Result",
			filename: "select_sl.jpg",
			want:     NoDifficult,
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

			got, err := ExtractDifficultFromResult(img)

			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractDifficultFromResult() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractDifficultFromResult() = %v, want %v", got, tt.want)
			}
		})
	}
}
