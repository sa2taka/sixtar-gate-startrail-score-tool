package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
)

const scoreAreaX0Rate = 0.038542 // 74 / 1920
const scoreAreaY0Rate = 0.637153 // 688 / 1080
const scoreAreaX1Rate = 0.203125 // 390 / 1920
const scoreAreaY1Rate = 0.702894 // 759 / 1080

func ExtractScoreFromResult(img image.Image) (int, error) {
	cropRect := util.CalculateCrop(img, scoreAreaX0Rate, scoreAreaY0Rate, scoreAreaX1Rate, scoreAreaY1Rate)

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
