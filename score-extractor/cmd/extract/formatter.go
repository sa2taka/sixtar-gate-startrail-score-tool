package extract

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

// Formatter は抽出結果の出力フォーマットを定義するインターフェース
type Formatter interface {
	Format([]*Result) error
}

// JSONFormatter はJSON形式での出力を行うフォーマッター
type JSONFormatter struct {
	writer io.Writer
}

// NewJSONFormatter は新しいJSONFormatterを作成する
func NewJSONFormatter(w io.Writer) *JSONFormatter {
	if w == nil {
		w = os.Stdout
	}
	return &JSONFormatter{writer: w}
}

// Format は結果をJSON形式で出力する
func (f *JSONFormatter) Format(results []*Result) error {
	encoder := json.NewEncoder(f.writer)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(results); err != nil {
		return newError("JSON出力に失敗", err)
	}
	return nil
}

// TSVFormatter はTSV形式での出力を行うフォーマッター
type TSVFormatter struct {
	writer io.Writer
}

// NewTSVFormatter は新しいTSVFormatterを作成する
func NewTSVFormatter(w io.Writer) *TSVFormatter {
	if w == nil {
		w = os.Stdout
	}
	return &TSVFormatter{writer: w}
}

// Format は結果をTSV形式で出力する
func (f *TSVFormatter) Format(results []*Result) error {
	// ヘッダーを出力
	if _, err := fmt.Fprintln(f.writer, HeaderTSV()); err != nil {
		return newError("TSVヘッダーの出力に失敗", err)
	}

	// 各結果を出力
	for _, result := range results {
		if _, err := fmt.Fprintln(f.writer, result.FormatTSV()); err != nil {
			return newError("TSVデータの出力に失敗", err)
		}
	}
	return nil
}

// NewFormatter は指定された形式のフォーマッターを作成する
func NewFormatter(format string, w io.Writer) (Formatter, error) {
	switch format {
	case "json":
		return NewJSONFormatter(w), nil
	case "tsv":
		return NewTSVFormatter(w), nil
	default:
		return nil, newError("不正な出力フォーマット", fmt.Errorf("unsupported format: %s", format))
	}
}
