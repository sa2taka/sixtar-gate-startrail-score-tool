package extract

import (
	"image"
	"score_extractor/internal/music_info"
)

func extractScoreFromSelect(img image.Image, musicInformationList []music_info.MusicInformation) (*ScoreSummary, error) {
	summary := &ScoreSummary{
		Kind:        MusicSelect,
		Mode:        UnknownMode,
		Difficult:   NoDifficult,
		Score:       -1,
		IsFullCombo: false,
		MaxCombo:    -1,
	}

	// 楽曲情報の取得
	if title, err := ExtractTitleFromSelect(img, musicInformationList); err == nil {
		summary.Title = title
	}

	// モードの取得
	if mode, err := ExtractModeFromSelect(img); err == nil {
		summary.Mode = mode
	}

	// 難易度の取得
	if difficult, err := ExtractDifficultFromSelect(img); err == nil {
		summary.Difficult = difficult
	}

	// スコアの取得
	if score, err := ExtractScoreFromSelect(img); err == nil {
		summary.Score = score
	}

	// フルコンボかどうかの取得
	if isFullCombo, err := ExtractIsFullComboFromSelect(img); err == nil {
		summary.IsFullCombo = isFullCombo
	}

	// 最大コンボ数の取得
	if maxCombo, err := ExtractMaxComboFromSelect(img); err == nil {
		summary.MaxCombo = maxCombo
	}

	return summary, nil
}
