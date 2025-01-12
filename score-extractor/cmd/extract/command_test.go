package extract

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestRun(t *testing.T) {
	// テスト用の一時ディレクトリを作成
	tmpDir, err := os.MkdirTemp("", "extract-test-*")
	if err != nil {
		t.Fatalf("一時ディレクトリの作成に失敗: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// テスト用の画像ファイルを作成
	oldTime := time.Now().Add(-24 * time.Hour)
	newTime := time.Now()

	files := []struct {
		name    string
		content []byte
		modTime time.Time
	}{
		{"old.jpg", []byte("dummy"), oldTime},
		{"new.jpg", []byte("dummy"), newTime},
		{"test.txt", []byte("dummy"), newTime}, // 非画像ファイル
	}

	for _, f := range files {
		path := filepath.Join(tmpDir, f.name)
		if err := os.WriteFile(path, f.content, 0644); err != nil {
			t.Fatalf("テストファイルの作成に失敗: %v", err)
		}
		if err := os.Chtimes(path, f.modTime, f.modTime); err != nil {
			t.Fatalf("ファイルの更新日時の設定に失敗: %v", err)
		}
	}

	tests := []struct {
		name    string
		args    []string
		wantErr bool
	}{
		{
			name:    "存在しないディレクトリを指定",
			args:    []string{"-output", "json", "nonexistent"},
			wantErr: true,
		},
		{
			name:    "画像ファイルが存在しないディレクトリを指定",
			args:    []string{"-output", "json", os.TempDir()},
			wantErr: true,
		},
		{
			name: "正常系（全ファイル）",
			args: []string{"-output", "json", tmpDir},
		},
		{
			name: "正常系（TSV出力）",
			args: []string{"-output", "tsv", tmpDir},
		},
		{
			name: "正常系（新しいファイルのみ）",
			args: []string{
				"-since", oldTime.Add(time.Hour).Format("2006-01-02T15:04:05"),
				"-output", "json",
				tmpDir,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// コマンドライン引数を一時的に置き換え
			oldArgs := os.Args
			defer func() { os.Args = oldArgs }()
			os.Args = append([]string{"cmd"}, tt.args...)

			err := Run()
			if (err != nil) != tt.wantErr {
				t.Errorf("Run() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestFindImageFiles(t *testing.T) {
	// テスト用の一時ディレクトリを作成
	tmpDir, err := os.MkdirTemp("", "extract-test-*")
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
		opts      *Options
		wantCount int
	}{
		{
			name: "全ての画像ファイルを取得",
			opts: &Options{
				Directory: tmpDir,
			},
			wantCount: 3,
		},
		{
			name: "新しい画像ファイルのみを取得",
			opts: &Options{
				Directory: tmpDir,
				Since:     old.Add(time.Hour),
			},
			wantCount: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := findImageFiles(tt.opts)
			if err != nil {
				t.Errorf("findImageFiles() error = %v", err)
				return
			}
			if len(got) != tt.wantCount {
				t.Errorf("findImageFiles() got %d files, want %d", len(got), tt.wantCount)
			}
		})
	}
}
