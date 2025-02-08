package extract

import (
	"image"
	"score_extractor/internal/music_info"
)

func extractScoreFromResult(img image.Image, musicInformationList []music_info.MusicInformation) (*ScoreSummary, error) {
	summary := &ScoreSummary{
		Kind:        Result,
		Mode:        UnknownMode,
		Difficult:   NoDifficult,
		Score:       -1,
		Pattern:     UnknownPattern,
		Hazard:      UnknownHazard,
		IsFullCombo: false,
	}

	// 楽曲情報の取得
	if title, err := ExtractTitleFromResult(img, musicInformationList); err == nil {
		summary.Title = title
	}

	// モードの取得
	if mode, err := ExtractMode(img); err == nil {
		summary.Mode = mode
	}

	// 難易度の取得
	if difficult, err := ExtractDifficultFromResult(img); err == nil {
		summary.Difficult = difficult
	}

	// スコアの取得
	if score, err := ExtractScoreFromResult(img); err == nil {
		summary.Score = score
	}

	// オプションの取得
	if pattern, hazard, err := ExtractOptionFromResult(img); err == nil {
		summary.Pattern = pattern
		summary.Hazard = hazard
	}

	// ジャッジ情報の取得
	if judgement, err := ExtractJudgementFromResult(img); err == nil {
		summary.Judgement = &judgement
		// フルコンボ判定（redStar が 0 の場合）
		summary.IsFullCombo = judgement.RedStar == 0
	}

	return summary, nil
}
