package extract

import (
	"fmt"
	"os"
	"score_extractor/internal/config"
	"score_extractor/internal/fileutil"
)

// Command は抽出コマンドを表す構造体
type Command struct {
	options   *Options
	formatter Formatter
	config    *config.Config
}

// NewCommand は新しいCommandを作成する
func NewCommand(opts *Options) (*Command, error) {
	formatter, err := NewFormatter(opts.OutputFormat, os.Stdout)
	if err != nil {
		return nil, newError("フォーマッターの作成に失敗", err)
	}

	// 設定ファイルを読み込む
	cfg, err := config.LoadConfig("config.toml")
	if err != nil {
		// 設定ファイルが読めない場合はデフォルト値を使用
		cfg = &config.Config{}
		cfg.MusicInfo.Path = "musicInformation.json"
	}

	return &Command{
		options:   opts,
		formatter: formatter,
		config:    cfg,
	}, nil
}

// Run はextractコマンドのメイン処理を実行する
func Run() error {
	args := os.Args[1:]
	if len(args) > 0 && args[0] == "extract" {
		args = args[1:] // extractサブコマンドを除外
	}

	opts, err := ParseOptions(args)
	if err != nil {
		return newError("オプションのパースに失敗", err)
	}

	cmd, err := NewCommand(opts)
	if err != nil {
		return err
	}

	return cmd.Execute()
}

// Execute はコマンドの実行を行う
func (c *Command) Execute() error {
	if err := c.validateOptions(); err != nil {
		return err
	}

	images, err := c.findTargetImages()
	if err != nil {
		return err
	}

	if len(images) == 0 {
		return newError("処理対象の画像ファイルが見つかりませんでした", nil)
	}

	if c.options.Verbose {
		fmt.Printf("処理対象ファイル数: %d\n", len(images))
	}

	results, errors := c.processImages(images)
	if err := c.outputResults(results); err != nil {
		return err
	}

	return c.handleErrors(errors)
}

// validateOptions はオプションの検証を行う
func (c *Command) validateOptions() error {
	if c.options.Verbose {
		fmt.Printf("処理対象ディレクトリ: %s\n", c.options.Directory)
		if !c.options.Since.IsZero() {
			fmt.Printf("処理対象時刻: %s 以降\n", c.options.Since.Format("2006-01-02 15:04:05"))
		}
		fmt.Printf("出力フォーマット: %s\n", c.options.OutputFormat)
		if c.options.MusicInfoPath != "" {
			fmt.Printf("楽曲情報ファイル: %s\n", c.options.MusicInfoPath)
		} else {
			fmt.Printf("楽曲情報ファイル: %s\n", c.config.MusicInfo.Path)
		}
	}
	return nil
}

// findTargetImages は処理対象の画像ファイルを検索する
func (c *Command) findTargetImages() ([]string, error) {
	finder := fileutil.NewImageFinder(c.options.Directory, c.options.Since)
	images, err := finder.Find()
	if err != nil {
		return nil, newError("画像ファイルの検索に失敗", err)
	}
	return images, nil
}

// processImages は画像ファイルの処理を行う
func (c *Command) processImages(images []string) ([]*Result, []string) {
	var results []*Result
	var errors []string

	// 楽曲情報ファイルのパスを決定
	musicInfoPath := c.config.MusicInfo.Path
	if c.options.MusicInfoPath != "" {
		musicInfoPath = c.options.MusicInfoPath
	}

	for _, imgPath := range images {
		if c.options.Verbose {
			fmt.Printf("処理中: %s\n", imgPath)
		}

		// ファイルの更新日時を取得
		info, err := os.Stat(imgPath)
		if err != nil {
			msg := fmt.Sprintf("%s: ファイル情報の取得に失敗: %v", imgPath, err)
			if c.options.Verbose {
				fmt.Fprintln(os.Stderr, msg)
			}
			errors = append(errors, msg)
			continue
		}

		// スコアを抽出
		result, err := ExtractResult(imgPath, info.ModTime(), musicInfoPath)
		if err != nil {
			msg := fmt.Sprintf("%s: %v", imgPath, err)
			if c.options.Verbose {
				fmt.Fprintln(os.Stderr, msg)
			}
			errors = append(errors, msg)
			continue
		}

		results = append(results, result)
	}

	return results, errors
}

// outputResults は結果の出力を行う
func (c *Command) outputResults(results []*Result) error {
	return c.formatter.Format(results)
}

// handleErrors はエラーの処理を行う
func (c *Command) handleErrors(errors []string) error {
	if c.options.Verbose {
		if len(errors) > 0 {
			fmt.Fprintln(os.Stderr, "\n失敗したファイル:")
			for _, err := range errors {
				fmt.Fprintln(os.Stderr, err)
			}
		}
	}
	return nil
}
