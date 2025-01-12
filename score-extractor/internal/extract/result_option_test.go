package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractOptionFromResult(t *testing.T) {

	tests := []struct {
		name     string
		filename string
		want     Pattern
		want1    Hazard
		wantErr  bool
	}{
		{
			name:     "Mirror, Deadend",
			filename: "result_m_d.jpg",
			want:     Mirror,
			want1:    Deadend,
			wantErr:  false,
		},
		{
			name:     "Random, Lv2",
			filename: "result_r_2.jpg",
			want:     Random,
			want1:    Lv2,
			wantErr:  false,
		},
		{
			name:     "Default, Lv3",
			filename: "result_qs.jpg",
			want:     DefaultPattern,
			want1:    Lv3,
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

			got, got1, err := ExtractOptionFromResult(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractOptionFromResult() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractOptionFromResult() got = %v, want %v", got, tt.want)
			}
			if got1 != tt.want1 {
				t.Errorf("ExtractOptionFromResult() got1 = %v, want %v", got1, tt.want1)
			}
		})
	}
}
