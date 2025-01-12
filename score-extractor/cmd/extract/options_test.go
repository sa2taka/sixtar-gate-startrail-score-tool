package extract

import (
	"testing"
	"time"
)

func TestParseOptions(t *testing.T) {
	tests := []struct {
		name        string
		args        []string
		wantErr     bool
		wantOptions *Options
	}{
		{
			name:    "必須の引数（ディレクトリパス）がない場合はエラー",
			args:    []string{},
			wantErr: true,
		},
		{
			name: "基本的な引数のパース",
			args: []string{"-output", "json", "testdata"},
			wantOptions: &Options{
				Directory:    "testdata",
				OutputFormat: "json",
				Verbose:      false,
			},
		},
		{
			name: "全オプションを指定",
			args: []string{
				"-since", "2024-01-01T00:00:00",
				"-output", "tsv",
				"-verbose",
				"testdata",
			},
			wantOptions: &Options{
				Directory:    "testdata",
				Since:        time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				OutputFormat: "tsv",
				Verbose:      true,
			},
		},
		{
			name:    "不正な出力フォーマット",
			args:    []string{"-output", "invalid", "testdata"},
			wantErr: true,
		},
		{
			name:    "不正な時刻フォーマット",
			args:    []string{"-since", "invalid", "testdata"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseOptions(tt.args)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseOptions() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if err != nil {
				return
			}

			if got.Directory != tt.wantOptions.Directory {
				t.Errorf("Directory = %v, want %v", got.Directory, tt.wantOptions.Directory)
			}
			if !got.Since.Equal(tt.wantOptions.Since) {
				t.Errorf("Since = %v, want %v", got.Since, tt.wantOptions.Since)
			}
			if got.OutputFormat != tt.wantOptions.OutputFormat {
				t.Errorf("OutputFormat = %v, want %v", got.OutputFormat, tt.wantOptions.OutputFormat)
			}
			if got.Verbose != tt.wantOptions.Verbose {
				t.Errorf("Verbose = %v, want %v", got.Verbose, tt.wantOptions.Verbose)
			}
		})
	}
}
