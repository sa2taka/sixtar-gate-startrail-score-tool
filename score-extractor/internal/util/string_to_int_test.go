package util

import "testing"

func TestStringToInt(t *testing.T) {
	type args struct {
		s string
	}
	tests := []struct {
		name    string
		args    args
		want    int
		wantErr bool
	}{
		{
			name:    "数値の文字列",
			args:    args{s: "123"},
			want:    123,
			wantErr: false,
		},
		{
			name:    "カンマ区切りの数値",
			args:    args{s: "1,234"},
			want:    1234,
			wantErr: false,
		},
		{
			name:    "スペース区切りの数値",
			args:    args{s: " 56 "},
			want:    56,
			wantErr: false,
		},
		{
			name:    "数値以外の文字列",
			args:    args{s: "abc"},
			want:    0,
			wantErr: true,
		},
		{
			name:    "空文字列",
			args:    args{s: ""},
			want:    0,
			wantErr: true,
		},
		{
			name:    "マイナスの数値",
			args:    args{s: "-123"},
			want:    -123,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := StringToInt(tt.args.s)
			if (err != nil) != tt.wantErr {
				t.Errorf("StringToInt() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("StringToInt() = %v, want %v", got, tt.want)
			}
		})
	}
}
