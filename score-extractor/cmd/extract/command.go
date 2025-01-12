package extract

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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

	// 結果の格納用スライス
	var results []*Result
	var errors []string

	// 各画像ファイルからスコアを抽出
	for _, imgPath := range images {
		if opts.Verbose {
			fmt.Printf("処理中: %s\n", imgPath)
		}

		// ファイルの更新日時を取得
		info, err := os.Stat(imgPath)
		if err != nil {
			msg := fmt.Sprintf("%s: ファイル情報の取得に失敗: %v", imgPath, err)
			if opts.Verbose {
				fmt.Fprintln(os.Stderr, msg)
			}
			errors = append(errors, msg)
			continue
		}

		// スコアを抽出
		result, err := ExtractResult(imgPath, info.ModTime())
		if err != nil {
			msg := fmt.Sprintf("%s: %v", imgPath, err)
			if opts.Verbose {
				fmt.Fprintln(os.Stderr, msg)
			}
			errors = append(errors, msg)
			continue
		}

		results = append(results, result)
	}

	// 結果の出力
	switch opts.OutputFormat {
	case "json":
		if err := outputJSON(results); err != nil {
			return fmt.Errorf("JSON出力に失敗: %w", err)
		}
	case "tsv":
		if err := outputTSV(results); err != nil {
			return fmt.Errorf("TSV出力に失敗: %w", err)
		}
	}

	if opts.Verbose {
		fmt.Printf("\n処理完了: %d件成功, %d件失敗\n", len(results), len(errors))
		if len(errors) > 0 {
			fmt.Fprintln(os.Stderr, "\n失敗したファイル:")
			for _, err := range errors {
				fmt.Fprintln(os.Stderr, err)
			}
		}
	}

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
		ext := strings.ToLower(filepath.Ext(path))
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

// outputJSON は結果をJSON形式で出力する
func outputJSON(results []*Result) error {
	// 結果全体を配列としてJSONに変換
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(results)
}

// outputTSV は結果をTSV形式で出力する
func outputTSV(results []*Result) error {
	// ヘッダーを出力
	fmt.Println(HeaderTSV())

	// 各結果を出力
	for _, result := range results {
		fmt.Println(result.FormatTSV())
	}
	return nil
}
