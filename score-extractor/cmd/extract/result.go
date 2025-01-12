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

// Result は1つの画像ファイルからの抽出結果を表す
type Result struct {
	// ファイルパス
	FilePath string `json:"file_path"`
	// ファイルの更新日時
	ModTime time.Time `json:"mod_time"`
	// 楽曲タイトル
	Title string `json:"title"`
	// 難易度
	Difficulty string `json:"difficulty"`
	// モード
	Mode string `json:"mode"`
	// スコア
	Score int `json:"score"`
	// 判定
	Judgements map[string]int `json:"judgements"`
	// フルコンボかどうか
	IsFullCombo bool `json:"is_full_combo"`
	// オプション
	Options []string `json:"options"`
}

// ExtractResult は画像ファイルから情報を抽出する
func ExtractResult(filePath string, modTime time.Time) (*Result, error) {
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
	musicInfoList, err := music_info.LoadMusicData("musicInformation.json")
	if err != nil {
		return nil, fmt.Errorf("楽曲情報の読み込みに失敗: %w", err)
	}

	// 画像から情報を抽出
	summary, err := extract.ExtractScore(img, musicInfoList)
	if err != nil {
		return nil, fmt.Errorf("画像からの情報抽出に失敗: %w", err)
	}

	// オプション情報を文字列のスライスに変換
	var options []string
	if summary.Pattern != extract.UnknownPattern {
		options = append(options, string(summary.Pattern))
	}
	if summary.Hazard != extract.UnknownHazard {
		options = append(options, string(summary.Hazard))
	}

	// 判定情報をマップに変換
	var judgements map[string]int
	if summary.Judgement != nil {
		judgements = map[string]int{
			"perfect":  summary.Judgement.BlueStar,
			"great":    summary.Judgement.WhiteStar,
			"good":     summary.Judgement.YellowStar,
			"bad":      summary.Judgement.RedStar,
			"miss":     0, // TODO: missの情報がない
			"maxCombo": 0, // TODO: maxComboの情報がない
		}
	}

	return &Result{
		FilePath:    filePath,
		ModTime:     modTime,
		Title:       summary.Title.Name,
		Difficulty:  string(summary.Difficult),
		Mode:        string(summary.Mode),
		Score:       summary.Score,
		Judgements:  judgements,
		IsFullCombo: summary.IsFullCombo,
		Options:     options,
	}, nil
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
	var judgements string
	if r.Judgements != nil {
		judgements = fmt.Sprintf("%d\t%d\t%d\t%d\t%d\t%d",
			r.Judgements["perfect"],
			r.Judgements["great"],
			r.Judgements["good"],
			r.Judgements["bad"],
			r.Judgements["miss"],
			r.Judgements["maxCombo"],
		)
	} else {
		judgements = "0\t0\t0\t0\t0\t0"
	}

	// オプションをカンマ区切りの文字列に変換
	options := strings.Join(r.Options, ",")

	// TSV形式の文字列を生成
	return fmt.Sprintf("%s\t%s\t%s\t%s\t%d\t%s\t%v\t%s",
		r.FilePath,
		r.ModTime.Format(time.RFC3339),
		r.Title,
		r.Difficulty,
		r.Score,
		judgements,
		r.IsFullCombo,
		options,
	)
}

// HeaderTSV はTSVのヘッダー行を返す
func HeaderTSV() string {
	return strings.Join([]string{
		"ファイルパス",
		"更新日時",
		"楽曲タイトル",
		"難易度",
		"スコア",
		"PERFECT",
		"GREAT",
		"GOOD",
		"BAD",
		"MISS",
		"MAX COMBO",
		"フルコンボ",
		"オプション",
	}, "\t")
}
