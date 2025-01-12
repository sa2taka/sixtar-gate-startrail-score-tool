package util

import "testing"

func TestFindClosestStringIndex(t *testing.T) {
	type args struct {
		target     string
		candidates [][]string
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "完全一致",
			args: args{
				target:     "MOON LIGHT DANCE",
				candidates: [][]string{{"MOON LIGHT DANCE -Full Song-"}, {"MOON LIGHT DANCE"}},
			},
			want: 1,
		},
		{
			name: "サブタイトル付き",
			args: args{
				target:     "MOON LIGHT DANCE -Full Song-",
				candidates: [][]string{{"MOON LIGHT DANCE -Full Song-"}, {"MOON LIGHT DANCE"}},
			},
			want: 0,
		},
		{
			name: "部分一致",
			args: args{
				target:     "MOON LIGHT DANCE -Full",
				candidates: [][]string{{"MOON LIGHT DANCE -Full Song-"}, {"MOON LIGHT DANCE"}},
			},
			want: 0,
		},
		{
			name: "日英併記",
			args: args{
				target:     "Cirno's Perfect Ma",
				candidates: [][]string{{"チルノのパーフェクトさんすう教室", "Cirno's Perfect Math Class"}, {"魔理沙は大変なものを盗んでいきました", "Marisa Stole the Precious Thing"}},
			},
			want: 0,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := FindClosestStringIndex(tt.args.target, tt.args.candidates); got != tt.want {
				t.Errorf("FindClosestStringIndex() = %v, want %v", got, tt.want)
			}
		})
	}
}
