package fileutil

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
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

// extractDateFromFilename はファイル名から日時を抽出する
func extractDateFromFilename(filename string) (time.Time, error) {
	// yyyyMMddHHmmss_n.ext の形式から日時部分を抽出
	re := regexp.MustCompile(`^(\d{14})_\d+\.`)
	matches := re.FindStringSubmatch(filename)
	
	if len(matches) < 2 {
		return time.Time{}, fmt.Errorf("failed to parse date from filename: %s", filename)
	}
	
	dateStr := matches[1] // yyyyMMddHHmmss
	
	// 各部分を抽出
	year, _ := strconv.Atoi(dateStr[0:4])
	month, _ := strconv.Atoi(dateStr[4:6])
	day, _ := strconv.Atoi(dateStr[6:8])
	hour, _ := strconv.Atoi(dateStr[8:10])
	minute, _ := strconv.Atoi(dateStr[10:12])
	second, _ := strconv.Atoi(dateStr[12:14])
	
	return time.Date(year, time.Month(month), day, hour, minute, second, 0, time.Local), nil
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

		// 時刻によるフィルタリング（ファイル名から抽出した日時を使用）
		if !f.since.IsZero() {
			filename := filepath.Base(path)
			fileTime, err := extractDateFromFilename(filename)
			if err != nil {
				// ファイル名から日時を抽出できない場合はスキップ
				return nil
			}
			
			// ファイル名から抽出した日時がゼロ値の場合もスキップ
			if fileTime.IsZero() {
				return nil
			}
			
			if fileTime.Before(f.since) || fileTime.Equal(f.since) {
				return nil
			}
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
