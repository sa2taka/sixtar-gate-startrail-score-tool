package extract

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"strings"
	"time"

	"score_extractor/internal/extract"
	"score_extractor/internal/music_info"
)

type Result struct {
	// ファイルパス
	FilePath string `json:"file_path"`
	// ファイルの更新日時
	ModTime time.Time `json:"mod_time"`
	// 画面種別
	Kind string `json:"kind"`
	// 楽曲情報
	Music music_info.MusicInformation `json:"music"`
	// 難易度
	Difficulty string `json:"difficulty,omitempty"`
	// モード
	Mode string `json:"mode,omitempty"`
	// スコア
	Score int `json:"score"`
	// 判定
	Judgments map[string]int `json:"judgments,omitempty"`
	// フルコンボかどうか
	IsFullCombo bool `json:"is_full_combo"`
	// パターン
	Pattern string `json:"pattern,omitempty"`
	// ハザード
	Hazard string `json:"hazard,omitempty"`
	// Base64エンコードされた画像データ（serverモードでのみ使用）
	ImageBinary string `json:"image_binary,omitempty"`
	// 最大コンボ数
	MaxCombo int `json:"max_combo,omitempty"`
}

// ExtractResult は画像ファイルから情報を抽出する
func ExtractResult(filePath string, modTime time.Time, musicInfoPath string) (*Result, error) {
	// 画像ファイルを開く
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("ファイルのオープンに失敗: %w", err)
	}
	defer file.Close()

	// 画像をデコード
	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("画像のデコードに失敗: %w", err)
	}

	// 楽曲情報を読み込む
	musicInfoList, err := music_info.LoadMusicData(musicInfoPath)
	if err != nil {
		return nil, fmt.Errorf("楽曲情報の読み込みに失敗（%s）: %w", musicInfoPath, err)
	}

	// 画像から情報を抽出
	summary, err := extract.ExtractScore(img, musicInfoList)
	if err != nil {
		return nil, fmt.Errorf("画像からの情報抽出に失敗: %w", err)
	}

	// パターンとハザードの設定
	pattern := string(summary.Pattern)
	if pattern == string(extract.UnknownPattern) {
		pattern = ""
	}

	hazard := string(summary.Hazard)
	if hazard == string(extract.UnknownHazard) {
		hazard = ""
	}

	// 判定情報をマップに変換
	var judgments map[string]int
	if summary.Judgement != nil {
		judgments = map[string]int{
			"blueStar":   summary.Judgement.BlueStar,
			"whiteStar":  summary.Judgement.WhiteStar,
			"yellowStar": summary.Judgement.YellowStar,
			"redStar":    summary.Judgement.RedStar,
		}
	}

	// 難易度の文字列を取得（NoDifficultの場合は空文字列）
	difficulty := string(summary.Difficult)
	if difficulty == string(extract.NoDifficult) {
		difficulty = ""
	}

	// モードがunknownの場合は空文字列
	mode := string(summary.Mode)
	if mode == string(extract.UnknownMode) {
		mode = ""
	}

	result := &Result{
		FilePath:    filePath,
		ModTime:     modTime,
		Kind:        string(summary.Kind),
		Music:       summary.Title,
		Score:       summary.Score,
		IsFullCombo: summary.IsFullCombo,
	}

	// 空でない場合のみフィールドを設定
	if difficulty != "" {
		result.Difficulty = difficulty
	}
	if mode != "" {
		result.Mode = mode
	}
	if judgments != nil {
		result.Judgments = judgments
	}
	if pattern != "" {
		result.Pattern = pattern
	}
	if hazard != "" {
		result.Hazard = hazard
	}
	if summary.MaxCombo != -1 {
		result.MaxCombo = summary.MaxCombo
	}

	return result, nil
}

// FormatJSON はJSON形式の文字列に変換する
func (r *Result) FormatJSON() (string, error) {
	bytes, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSONへの変換に失敗: %w", err)
	}
	return string(bytes), nil
}

// FormatTSV はTSV形式の文字列に変換する
// ヘッダー行が必要な場合は、HeaderTSV()を使用する
func (r *Result) FormatTSV() string {
	// 判定情報をTSV用に変換
	var judgments string
	if r.Judgments != nil {
		judgments = fmt.Sprintf("%d\t%d\t%d\t%d",
			r.Judgments["blueStar"],
			r.Judgments["whiteStar"],
			r.Judgments["yellowStar"],
			r.Judgments["redStar"],
		)
	} else {
		judgments = "0\t0\t0\t0"
	}

	// TSV形式の文字列を生成
	return fmt.Sprintf("%s\t%s\t%s\t%s\t%s\t%d\t%s\t%v\t%s\t%s",
		r.FilePath,
		r.ModTime.Format(time.RFC3339),
		r.Kind,
		r.Music.Name,
		r.Difficulty,
		r.Score,
		judgments,
		r.IsFullCombo,
		r.Pattern,
		r.Hazard,
	)
}

// HeaderTSV はTSVのヘッダー行を返す
func HeaderTSV() string {
	return strings.Join([]string{
		"ファイルパス",
		"更新日時",
		"画面種別",
		"楽曲タイトル",
		"難易度",
		"スコア",
		"BLUE STAR",
		"WHITE STAR",
		"YELLOW STAR",
		"RED STAR",
		"フルコンボ",
		"パターン",
		"ハザード",
	}, "\t")
}
