package extract

import (
	"fmt"
	"image"
	"score_extractor/internal/music_info"
)

func extractScoreFromResult(img image.Image, musicInformationList []music_info.MusicInformation) (*ScoreSummary, error) {
	// 楽曲情報の取得
	title, err := ExtractTitleFromResult(img, musicInformationList)
	if err != nil {
		return nil, fmt.Errorf("failed to extract title: %w", err)
	}

	// モードの取得
	mode, err := ExtractMode(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract mode: %w", err)
	}

	// 難易度の取得
	difficult, err := ExtractDifficultFromResult(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract difficult: %w", err)
	}

	// スコアの取得
	score, err := ExtractScoreFromResult(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract score: %w", err)
	}

	// オプションの取得
	pattern, hazard, err := ExtractOptionFromResult(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract option: %w", err)
	}

	// ジャッジ情報の取得
	judgement, err := ExtractJudgementFromResult(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract judgement: %w", err)
	}

	// フルコンボ判定（redStar が 0 の場合）
	isFullCombo := judgement.RedStar == 0

	return &ScoreSummary{
		Title:       title,
		Mode:        mode,
		Difficult:   difficult,
		Score:       score,
		Pattern:     pattern,
		Hazard:      hazard,
		Judgement:   &judgement,
		IsFullCombo: isFullCombo,
	}, nil
}
