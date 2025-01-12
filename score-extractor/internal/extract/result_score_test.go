package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractScoreFromResult(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     int
		wantErr  bool
	}{
		{
			name:     "通常のリザルト",
			filename: "result_qs.jpg",
			want:     985602,
			wantErr:  false,
		},
		{
			name:     "Pure Blueのリザルト",
			filename: "result_pb.jpg",
			want:     1000000,
			wantErr:  false,
		},
		{
			name:     "選択画面",
			filename: "select_cm.jpg",
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

			result, err := ExtractScoreFromResult(img)

			if tt.wantErr && err == nil {
				t.Errorf("ExtractStoreFromResult() error = %v, expected error", err)
			}
			if result != tt.want {
				t.Errorf("ExtractStoreFromResult() = %v, expected %v", result, tt.want)
			}
		})
	}
}
