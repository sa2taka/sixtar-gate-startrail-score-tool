package extract

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestIsResult(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Kind
	}{
		{
			name:     "リザルト画面",
			filename: "result_lunar.jpg",
			want:     Result,
		},
		{
			name:     "リザルト画面",
			filename: "result_qs.jpg",
			want:     Result,
		},
		{
			name:     "選択画面",
			filename: "select_cm.jpg",
			want:     MusicSelect,
		},
		{
			name:     "リザルトでも選択画面でもない",
			filename: "other.jpg",
			want:     OtherKind,
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

			result, err := JudgeKind(img)
			if err != nil {
				t.Fatalf("種類の判定に失敗しました: %v", err)
			}

			if result != tt.want {
				t.Errorf("%sのテストが失敗しました。期待値: %v, 実際の値: %v", tt.name, tt.want, result)
			}
		})
	}
}
