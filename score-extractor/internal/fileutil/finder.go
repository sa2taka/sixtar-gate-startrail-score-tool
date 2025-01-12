package fileutil

import (
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ImageFinder は画像ファイルを検索するための構造体
type ImageFinder struct {
	directory string
	since     time.Time
}

// NewImageFinder は新しいImageFinderを作成する
func NewImageFinder(directory string, since time.Time) *ImageFinder {
	return &ImageFinder{
		directory: directory,
		since:     since,
	}
}

// Find は指定されたディレクトリから画像ファイルを検索する
func (f *ImageFinder) Find() ([]string, error) {
	// ディレクトリの存在確認
	if _, err := os.Stat(f.directory); os.IsNotExist(err) {
		return nil, err
	}

	var images []string

	err := filepath.Walk(f.directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// ディレクトリはスキップ
		if info.IsDir() {
			return nil
		}

		// 時刻によるフィルタリング
		if !f.since.IsZero() && info.ModTime().Before(f.since) {
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
