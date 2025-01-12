package extract

import (
	"flag"
	"fmt"
	"time"
)

// Options はextractコマンドのオプションを表す構造体
type Options struct {
	// 処理対象のディレクトリパス
	Directory string
	// 指定時刻以降のファイルのみを処理
	Since time.Time
	// 出力フォーマット（json/tsv）
	OutputFormat string
	// 詳細なログ出力
	Verbose bool
}

// ParseOptions はコマンドライン引数をパースしてOptionsを返す
func ParseOptions(args []string) (*Options, error) {
	var opts Options
	var sinceStr string

	fs := flag.NewFlagSet("extract", flag.ContinueOnError)
	fs.StringVar(&sinceStr, "since", "", "指定時刻以降のファイルのみを処理 (形式: 2006-01-02T15:04:05)")
	fs.StringVar(&opts.OutputFormat, "format", "json", "出力フォーマット (json/tsv)")
	fs.BoolVar(&opts.Verbose, "verbose", false, "詳細なログ出力")

	if err := fs.Parse(args); err != nil {
		return nil, err
	}

	// 必須の引数（ディレクトリパス）のチェック
	args = fs.Args()
	if len(args) != 1 {
		return nil, fmt.Errorf("ディレクトリパスを1つ指定してください")
	}
	opts.Directory = args[0]

	// --sinceオプションのパース
	if sinceStr != "" {
		t, err := time.Parse("2006-01-02T15:04:05", sinceStr)
		if err != nil {
			return nil, fmt.Errorf("時刻のフォーマットが不正です: %w", err)
		}
		opts.Since = t
	}

	// --outputオプションの検証
	if opts.OutputFormat != "json" && opts.OutputFormat != "tsv" {
		return nil, fmt.Errorf("出力フォーマットは json または tsv を指定してください")
	}

	return &opts, nil
}
