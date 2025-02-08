package extract

import (
	"path/filepath"
	"reflect"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"testing"
)

func TestExtractScoreSummaryFromResult(t *testing.T) {
	// 楽曲情報の読み込み
	music_info_path, err := filepath.Abs(filepath.Join("..", "..", "musicInformation.json"))
	if err != nil {
		t.Fatalf("音楽データの読み込みに失敗しました: %v", err)
	}

	candidates, err := music_info.LoadMusicData(music_info_path)
	if err != nil {
		t.Fatalf("音楽データの読み込みに失敗しました: %v", err)
	}

	tests := []struct {
		name     string
		filename string
		want     *ScoreSummary
		wantErr  bool
	}{
		{
			name:     "通常のリザルト",
			filename: "result_qs.jpg",
			want: &ScoreSummary{
				Title:     findMusicById(candidates, "128kbps_Succubus"),
				Mode:      Solar,
				Difficult: Quasar,
				Score:     985602,
				Pattern:   DefaultPattern,
				Hazard:    Lv3,
				Judgement: &Judgement{
					BlueStar:   2391,
					WhiteStar:  45,
					YellowStar: 3,
					RedStar:    10,
				},
				IsFullCombo: false,
			},
			wantErr: false,
		},
		{
			name:     "フルコンボのリザルト",
			filename: "result_pb.jpg",
			want: &ScoreSummary{
				Title:     findMusicById(candidates, "Mischievous_Sensation"),
				Mode:      Solar,
				Difficult: Quasar,
				Score:     1000000,
				Pattern:   DefaultPattern,
				Hazard:    Lv3,
				Judgement: &Judgement{
					BlueStar:   1299,
					WhiteStar:  0,
					YellowStar: 0,
					RedStar:    0,
				},
				IsFullCombo: true,
			},
			wantErr: false,
		},
		{
			name:     "選択画面",
			filename: "select_cm.jpg",
			want:     nil,
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

			got, err := extractScoreFromResult(img, candidates)
			if (err != nil) != tt.wantErr {
				t.Errorf("extractScoreFromResult() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr && !reflect.DeepEqual(got, tt.want) {
				t.Errorf("extractScoreFromResult() = %v, want %v", got, tt.want)
			}
		})
	}
}
