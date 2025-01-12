package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/util"
)

const difficultAreaX0Rate = 0.028125 // 54 / 1920
const difficultAreaY0Rate = 0.181597 // 196 / 1080
const difficultAreaX1Rate = 0.031771 // 61 / 1920
const difficultAreaY1Rate = 0.248264 // 268 / 1080

func ExtractDifficultFromResult(img image.Image) (Difficult, error) {
	cropRect := util.CalculateCrop(img, difficultAreaX0Rate, difficultAreaY0Rate, difficultAreaX1Rate, difficultAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	averageColor := imageproc.CalculateAverageColor(croppedImg)

	index := imageproc.FindClosestColor(averageColor, ResultDifficultColors)

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
