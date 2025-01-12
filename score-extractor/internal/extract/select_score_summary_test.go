package extract

import (
	"path/filepath"
	"reflect"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"testing"
)

func TestExtractScoreSummaryFromSelect(t *testing.T) {
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
			name:     "通常の選択画面",
			filename: "select_qs.jpg",
			want: &ScoreSummary{
				Title:       findMusicById(candidates, "STARGATE_EXTREME"),
				Mode:        Solar,
				Difficult:   NoDifficult,
				Score:       985581,
				IsFullCombo: false,
			},
			wantErr: false,
		},
		{
			name:     "フルコンボの選択画面",
			filename: "select_fc.jpg",
			want: &ScoreSummary{
				Title:       findMusicById(candidates, "Full_power_Happy_life"),
				Mode:        Solar,
				Difficult:   NoDifficult,
				Score:       998574,
				IsFullCombo: true,
			},
			wantErr: false,
		},
		{
			name:     "リザルト画面",
			filename: "result_cm.jpg",
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

			got, err := extractScoreFromSelect(img, candidates)
			if (err != nil) != tt.wantErr {
				t.Errorf("extractScoreFromSelect() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr && !reflect.DeepEqual(got, tt.want) {
				t.Errorf("extractScoreFromSelect() = %v, want %v", got, tt.want)
			}
		})
	}
}
