package extract

import (
	"fmt"
	"image"
	"score_extractor/internal/music_info"
)

// ScoreSummary は画像から抽出したスコア情報を保持する構造体です。
type ScoreSummary struct {
	Kind      Kind
	Title     music_info.MusicInformation
	Mode      Mode
	Difficult Difficult
	Score     int
	// リザルト画面固有の情報
	Pattern   Pattern    // オプション
	Hazard    Hazard     // オプション
	Judgement *Judgement // ジャッジ情報
	// 選択画面固有の情報
	IsFullCombo bool
	MaxCombo    int // 選択画面のみで使用
}

// ExtractScore は画像からスコア情報を抽出します。
// img: 解析対象の画像
// musicInformationList: 楽曲情報のリスト
// 戻り値: スコア情報のサマリーとエラー
func ExtractScore(img image.Image, musicInformationList []music_info.MusicInformation) (*ScoreSummary, error) {
	// 画像の種類を判定
	kind, err := JudgeKind(img)
	if err != nil {
		return nil, fmt.Errorf("failed to judge kind: %w", err)
	}

	switch kind {
	case Result:
		return extractScoreFromResult(img, musicInformationList)
	case MusicSelect:
		return extractScoreFromSelect(img, musicInformationList)
	default:
		return extractScoreFromResult(img, musicInformationList)
	}
}
