package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"strings"
)

const selectMaxComboAreaX0Rate = 0.465590 // 1191 / 1920
const selectMaxComboAreaY0Rate = 0.771692 // 1111 / 1080
const selectMaxComboAreaX1Rate = 0.498596 // 1276 / 1920
const selectMaxComboAreaY1Rate = 0.802903 // 1156 / 1080

func ExtractMaxComboFromSelect(img image.Image) (int, error) {
	cropRect := util.CalculateCrop(img, selectMaxComboAreaX0Rate, selectMaxComboAreaY0Rate, selectMaxComboAreaX1Rate, selectMaxComboAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)
	binarizedImg := imageproc.BinarizeImage(croppedImg, 200)

	imgBytes, err := imageproc.ImageToBytes(binarizedImg)
	if err != nil {
		return 0, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return 0, err
	}

	// OCRで取得したテキストから数字のみを抽出
	cleanText := strings.TrimSpace(ocrText)
	return util.StringToInt(cleanText)
}
