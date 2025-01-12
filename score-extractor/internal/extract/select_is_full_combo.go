package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"strings"
)

const fullComboFromSelectX0Rate = 0.875850 // 2242 / 1920
const fullComboFromSelectY0Rate = 0.425422 // 612 / 1080
const fullComboFromSelectX1Rate = 0.923469 // 2364 / 1920
const fullComboFromSelectY1Rate = 0.440539 // 634 / 1080

func ExtractIsFullComboFromSelect(img image.Image) (bool, error) {
	cropRect := util.CalculateCrop(img, fullComboFromSelectX0Rate, fullComboFromSelectY0Rate, fullComboFromSelectX1Rate, fullComboFromSelectY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)
	binarizedImg := imageproc.BinarizeImage(croppedImg, 200)

	imgBytes, err := imageproc.ImageToBytes(binarizedImg)
	if err != nil {
		return false, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return false, err
	}

	lowerText := strings.ToLower(ocrText)

	return strings.Contains(lowerText, "full combo"), nil
}
