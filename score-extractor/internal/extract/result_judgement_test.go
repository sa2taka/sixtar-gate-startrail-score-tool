package extract

import (
	"path/filepath"
	"reflect"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestExtractJudgementFromResult(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     Judgement
		wantErr  bool
	}{
		{
			name:     "通常のリザルト",
			filename: "result_qs.jpg",
			want: Judgement{
				BlueStar:   2391,
				WhiteStar:  45,
				YellowStar: 3,
				RedStar:    10,
			},
			wantErr: false,
		},
		{
			name:     "Pure Blueのリザルト",
			filename: "result_pb.jpg",
			want: Judgement{
				BlueStar:   1299,
				WhiteStar:  0,
				YellowStar: 0,
				RedStar:    0,
			},
			wantErr: false,
		},
		{
			name:     "選択画面",
			filename: "select_cm.jpg",
			want:     Judgement{},
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

			got, err := ExtractJudgementFromResult(img)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractJudgementFromResult() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ExtractJudgementFromResult() = %v, want %v", got, tt.want)
			}
		})
	}
}
