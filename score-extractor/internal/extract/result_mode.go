package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"strings"
)

const modeAreaX0Rate = 0.030269 // 77 / 1920
const modeAreaY0Rate = 0.141629 // 203 / 1080
const modeAreaX1Rate = 0.105381 // 269 / 1920
const modeAreaY1Rate = 0.165546 // 238 / 1080

func ExtractMode(img image.Image) (Mode, error) {
	cropRect := util.CalculateCrop(img, modeAreaX0Rate, modeAreaY0Rate, modeAreaX1Rate, modeAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		return UnknownMode, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return UnknownMode, err
	}

	lowerText := strings.ToLower(ocrText)

	if strings.Contains(lowerText, "solar") {
		return Solar, nil
	} else if strings.Contains(lowerText, "lunar") {
		return Lunar, nil
	} else {
		return UnknownMode, nil
	}
}
