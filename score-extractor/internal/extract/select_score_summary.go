package extract

import (
	"fmt"
	"image"
	"score_extractor/internal/music_info"
)

func extractScoreFromSelect(img image.Image, musicInformationList []music_info.MusicInformation) (*ScoreSummary, error) {
	// 楽曲情報の取得
	title, err := ExtractTitleFromSelect(img, musicInformationList)
	if err != nil {
		return nil, fmt.Errorf("failed to extract title: %w", err)
	}

	// モードの取得
	mode, err := ExtractModeFromSelect(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract mode: %w", err)
	}

	// スコアの取得
	score, err := ExtractScoreFromSelect(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract score: %w", err)
	}

	// フルコンボかどうかの取得
	isFullCombo, err := ExtractIsFullComboFromSelect(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract full combo: %w", err)
	}

	// 最大コンボ数の取得
	maxCombo, err := ExtractMaxComboFromSelect(img)
	if err != nil {
		return nil, fmt.Errorf("failed to extract max combo: %w", err)
	}

	return &ScoreSummary{
		Title:       title,
		Mode:        mode,
		Difficult:   NoDifficult, // 選択画面では難易度は取得できない
		Score:       score,
		IsFullCombo: isFullCombo,
		MaxCombo:    maxCombo,
	}, nil
}
