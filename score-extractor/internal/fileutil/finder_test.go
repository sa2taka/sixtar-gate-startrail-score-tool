package fileutil

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestImageFinder_Find(t *testing.T) {
	// テスト用の一時ディレクトリを作成
	tmpDir, err := os.MkdirTemp("", "finder-test-*")
	if err != nil {
		t.Fatalf("一時ディレクトリの作成に失敗: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// テスト用のファイルを作成
	now := time.Now()
	old := now.Add(-24 * time.Hour)

	files := []struct {
		name    string
		modTime time.Time
	}{
		{"test1.jpg", old},
		{"test2.png", now},
		{"test3.jpeg", now},
		{"test4.txt", now}, // 非画像ファイル
	}

	for _, f := range files {
		path := filepath.Join(tmpDir, f.name)
		if err := os.WriteFile(path, []byte("dummy"), 0644); err != nil {
			t.Fatalf("テストファイルの作成に失敗: %v", err)
		}
		if err := os.Chtimes(path, f.modTime, f.modTime); err != nil {
			t.Fatalf("ファイルの更新日時の設定に失敗: %v", err)
		}
	}

	tests := []struct {
		name      string
		directory string
		since     time.Time
		wantCount int
		wantErr   bool
	}{
		{
			name:      "全ての画像ファイルを取得",
			directory: tmpDir,
			wantCount: 3,
		},
		{
			name:      "新しい画像ファイルのみを取得",
			directory: tmpDir,
			since:     old.Add(time.Hour),
			wantCount: 2,
		},
		{
			name:      "存在しないディレクトリを指定",
			directory: filepath.Join(tmpDir, "nonexistent"),
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			finder := NewImageFinder(tt.directory, tt.since)
			got, err := finder.Find()
			if (err != nil) != tt.wantErr {
				t.Errorf("Find() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && len(got) != tt.wantCount {
				t.Errorf("Find() got %d files, want %d", len(got), tt.wantCount)
			}
		})
	}
}
