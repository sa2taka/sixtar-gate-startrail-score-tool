package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
)

const selectScoreAreaX0Rate = 0.244955 // 470 / 1920
const selectScoreAreaY0Rate = 0.854634 // 923 / 1080
const selectScoreAreaX1Rate = 0.397422 // 763 / 1920
const selectScoreAreaY1Rate = 0.906452 // 978 / 1080

func ExtractScoreFromSelect(img image.Image) (int, error) {
	cropRect := util.CalculateCrop(img, selectScoreAreaX0Rate, selectScoreAreaY0Rate, selectScoreAreaX1Rate, selectScoreAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		return -1, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return -1, err
	}

	score, err := util.StringToInt(ocrText)

	if err != nil {
		return -1, err
	}

	return score, nil
}
