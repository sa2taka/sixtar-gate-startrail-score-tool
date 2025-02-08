package extract

import (
	"image"
	"image/color"
	"math"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/util"
)

const selectDifficultArea1X0Rate = 0.263343 // 505 / 1920
const selectDifficultArea1Y0Rate = 0.638109 // 689 / 1080
const selectDifficultArea1X1Rate = 0.290730 // 558 / 1920
const selectDifficultArea1Y1Rate = 0.655587 // 708 / 1080

const selectDifficultArea2X0Rate = 0.327247 // 628 / 1920
const selectDifficultArea2Y0Rate = 0.638109 // 689 / 1080
const selectDifficultArea2X1Rate = 0.352528 // 676 / 1920
const selectDifficultArea2Y1Rate = 0.655587 // 708 / 1080

const selectDifficultArea3X0Rate = 0.392556 // 753 / 1920
const selectDifficultArea3Y0Rate = 0.638109 // 689 / 1080
const selectDifficultArea3X1Rate = 0.417135 // 800 / 1920
const selectDifficultArea3Y1Rate = 0.655587 // 708 / 1080

const selectDifficultArea4X0Rate = 0.454354 // 872 / 1920
const selectDifficultArea4Y0Rate = 0.638109 // 689 / 1080
const selectDifficultArea4X1Rate = 0.478933 // 919 / 1920
const selectDifficultArea4Y1Rate = 0.655587 // 708 / 1080

func ExtractDifficultFromSelect(img image.Image) (Difficult, error) {
	// 4つのエリアから平均色を取得
	area1 := util.CalculateCrop(img, selectDifficultArea1X0Rate, selectDifficultArea1Y0Rate, selectDifficultArea1X1Rate, selectDifficultArea1Y1Rate)
	area2 := util.CalculateCrop(img, selectDifficultArea2X0Rate, selectDifficultArea2Y0Rate, selectDifficultArea2X1Rate, selectDifficultArea2Y1Rate)
	area3 := util.CalculateCrop(img, selectDifficultArea3X0Rate, selectDifficultArea3Y0Rate, selectDifficultArea3X1Rate, selectDifficultArea3Y1Rate)
	area4 := util.CalculateCrop(img, selectDifficultArea4X0Rate, selectDifficultArea4Y0Rate, selectDifficultArea4X1Rate, selectDifficultArea4Y1Rate)

	color1 := imageproc.CalculateAverageColor(imageproc.CropImage(img, area1))
	color2 := imageproc.CalculateAverageColor(imageproc.CropImage(img, area2))
	color3 := imageproc.CalculateAverageColor(imageproc.CropImage(img, area3))
	color4 := imageproc.CalculateAverageColor(imageproc.CropImage(img, area4))

	// 最も白から遠い色を選ぶ
	targetColor := findFarthestFromWhite(color1, color2, color3, color4)

	// 難易度判定
	index := imageproc.FindClosestColor(targetColor, ResultDifficultColors)

	switch index {
	case 1:
		return Comet, nil
	case 2:
		return Nova, nil
	case 3:
		return Supernova, nil
	case 4:
		return Quasar, nil
	case 5:
		return Starlight, nil
	case 6:
		return Mystic, nil
	default:
		return NoDifficult, nil
	}
}

func findFarthestFromWhite(colors ...color.Color) color.Color {
	white := color.RGBA{R: 255, G: 255, B: 255, A: 255}
	var maxDistance float64
	var farthestColor color.Color

	for _, c := range colors {
		r, g, b, _ := c.RGBA()
		wr, wg, wb, _ := white.RGBA()

		// 色の距離を計算（ユークリッド距離）
		distance := math.Sqrt(
			math.Pow(float64(r>>8)-float64(wr>>8), 2) +
				math.Pow(float64(g>>8)-float64(wg>>8), 2) +
				math.Pow(float64(b>>8)-float64(wb>>8), 2))

		if distance > maxDistance {
			maxDistance = distance
			farthestColor = c
		}
	}

	return farthestColor
}
