package extract

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestResult_FormatJSON(t *testing.T) {
	now := time.Now()
	result := &Result{
		FilePath:   "test.jpg",
		ModTime:    now,
		Title:      "Test Song",
		Difficulty: "comet",
		Mode:       "solar",
		Score:      1000000,
		Judgements: map[string]int{
			"perfect":  100,
			"great":    10,
			"good":     5,
			"bad":      2,
			"miss":     1,
			"maxCombo": 110,
		},
		IsFullCombo: true,
		Options:     []string{"Mirror", "level1"},
	}

	// JSON形式に変換
	jsonStr, err := result.FormatJSON()
	if err != nil {
		t.Errorf("FormatJSON() error = %v", err)
		return
	}

	// JSONとしてパース可能か確認
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err != nil {
		t.Errorf("結果のJSONをパースできません: %v", err)
		return
	}

	// 主要なフィールドの存在確認
	expectedFields := []string{
		"file_path",
		"mod_time",
		"kind",
		"title",
		"difficulty",
		"mode",
		"score",
		"judgements",
		"is_full_combo",
		"options",
	}

	for _, field := range expectedFields {
		if _, ok := parsed[field]; !ok {
			t.Errorf("JSONに必要なフィールドがありません: %s", field)
		}
	}
}

func TestResult_FormatTSV(t *testing.T) {
	now := time.Now()
	result := &Result{
		FilePath:   "test.jpg",
		ModTime:    now,
		Kind:       "Result",
		Title:      "Test Song",
		Difficulty: "comet",
		Mode:       "solar",
		Score:      1000000,
		Judgements: map[string]int{
			"perfect":  100,
			"great":    10,
			"good":     5,
			"bad":      2,
			"miss":     1,
			"maxCombo": 110,
		},
		IsFullCombo: true,
		Options:     []string{"Mirror", "level1"},
	}

	// TSV形式に変換
	tsv := result.FormatTSV()
	fields := strings.Split(tsv, "\t")

	// フィールド数の確認
	expectedFields := 14 // ファイルパス、更新日時、画面種別、タイトル、難易度、スコア、6つの判定、フルコンボ、オプション
	if len(fields) != expectedFields {
		t.Errorf("TSVのフィールド数が不正です: got %d, want %d", len(fields), expectedFields)
	}

	// 各フィールドの値を確認
	if fields[0] != "test.jpg" {
		t.Errorf("ファイルパスが不正です: got %s, want test.jpg", fields[0])
	}
	if fields[2] != "Result" {
		t.Errorf("画面種別が不正です: got %s, want Result", fields[2])
	}
	if fields[3] != "Test Song" {
		t.Errorf("タイトルが不正です: got %s, want Test Song", fields[3])
	}
	if fields[4] != "comet" {
		t.Errorf("難易度が不正です: got %s, want comet", fields[4])
	}
}

func TestHeaderTSV(t *testing.T) {
	header := HeaderTSV()
	fields := strings.Split(header, "\t")

	expectedFields := []string{
		"ファイルパス",
		"更新日時",
		"画面種別",
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
	}

	if len(fields) != len(expectedFields) {
		t.Errorf("ヘッダーのフィールド数が不正です: got %d, want %d", len(fields), len(expectedFields))
	}

	for i, want := range expectedFields {
		if fields[i] != want {
			t.Errorf("ヘッダーのフィールドが不正です[%d]: got %s, want %s", i, fields[i], want)
		}
	}
}
