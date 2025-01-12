package extract

import (
	"fmt"
	"os"
	"path/filepath"
)

// Run はextractコマンドのメイン処理を実行する
func Run() error {
	opts, err := ParseOptions(os.Args[1:])
	if err != nil {
		return fmt.Errorf("オプションのパースに失敗: %w", err)
	}

	// ディレクトリの存在確認
	if _, err := os.Stat(opts.Directory); os.IsNotExist(err) {
		return fmt.Errorf("指定されたディレクトリが存在しません: %s", opts.Directory)
	}

	if opts.Verbose {
		fmt.Printf("処理対象ディレクトリ: %s\n", opts.Directory)
		if !opts.Since.IsZero() {
			fmt.Printf("処理対象時刻: %s 以降\n", opts.Since.Format("2006-01-02 15:04:05"))
		}
		fmt.Printf("出力フォーマット: %s\n", opts.OutputFormat)
	}

	// 画像ファイルの検索
	images, err := findImageFiles(opts)
	if err != nil {
		return fmt.Errorf("画像ファイルの検索に失敗: %w", err)
	}

	if len(images) == 0 {
		return fmt.Errorf("処理対象の画像ファイルが見つかりませんでした")
	}

	if opts.Verbose {
		fmt.Printf("処理対象ファイル数: %d\n", len(images))
	}

	// TODO: 画像ファイルからのスコア抽出処理を実装
	// TODO: 結果の出力処理を実装

	return nil
}

// findImageFiles は指定されたディレクトリから画像ファイルを検索する
func findImageFiles(opts *Options) ([]string, error) {
	var images []string

	err := filepath.Walk(opts.Directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// ディレクトリはスキップ
		if info.IsDir() {
			return nil
		}

		// 時刻によるフィルタリング
		if !opts.Since.IsZero() && info.ModTime().Before(opts.Since) {
			return nil
		}

		// 拡張子によるフィルタリング
		ext := filepath.Ext(path)
		switch ext {
		case ".jpg", ".jpeg", ".png":
			images = append(images, path)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return images, nil
}
