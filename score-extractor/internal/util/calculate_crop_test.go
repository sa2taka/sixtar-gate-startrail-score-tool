package util

import (
	"path/filepath"
	"score_extractor/internal/imageproc"
	"testing"
)

func TestCalculateCrop(t *testing.T) {
	// 1920 x 1080の画像
	imgPath, err := filepath.Abs(filepath.Join("..", "..", "testdata", "result.jpg"))
	if err != nil {
		t.Fatalf("パスの解決に失敗しました: %v", err)
	}

	img, err := imageproc.ReadImage(imgPath)
	if err != nil {
		t.Fatalf("画像の読み込みに失敗しました: %v", err)
	}

	// テストケース
	tests := []struct {
		name                       string
		topLeftX, topLeftY         float64
		bottomRightX, bottomRightY float64
		expectedX0, expectedY0     int
		expectedX1, expectedY1     int
	}{
		{
			name:         "中央の切り抜き",
			topLeftX:     0.25,
			topLeftY:     0.25,
			bottomRightX: 0.75,
			bottomRightY: 0.75,
			expectedX0:   480,
			expectedY0:   270,
			expectedX1:   1440,
			expectedY1:   810,
		},
		{
			name:         "左上の切り抜き",
			topLeftX:     0,
			topLeftY:     0,
			bottomRightX: 0.5,
			bottomRightY: 0.5,
			expectedX0:   0,
			expectedY0:   0,
			expectedX1:   960,
			expectedY1:   540,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateCrop(img, tt.topLeftX, tt.topLeftY, tt.bottomRightX, tt.bottomRightY)

			if result.Min.X != tt.expectedX0 || result.Min.Y != tt.expectedY0 ||
				result.Max.X != tt.expectedX1 || result.Max.Y != tt.expectedY1 {
				t.Errorf("%sのテストが失敗しました。期待値: (%d, %d)-(%d, %d), 実際の値: (%d, %d)-(%d, %d)",
					tt.name,
					tt.expectedX0, tt.expectedY0, tt.expectedX1, tt.expectedY1,
					result.Min.X, result.Min.Y, result.Max.X, result.Max.Y)
			}
		})
	}
}
