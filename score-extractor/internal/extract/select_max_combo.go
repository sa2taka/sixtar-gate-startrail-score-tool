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

	// OCRで取得したテキストから末尾の数字のみを抽出
	cleanText := extractLastNumber(strings.TrimSpace(ocrText))
	return util.StringToInt(cleanText)
}

// extractLastNumber は文字列から末尾の数字部分のみを抽出します
func extractLastNumber(s string) string {
	var result strings.Builder
	foundNumber := false

	// 文字列を後ろから走査して、最初に見つかった連続する数字を抽出
	for i := len(s) - 1; i >= 0; i-- {
		if s[i] >= '0' && s[i] <= '9' {
			result.WriteByte(s[i])
			foundNumber = true
		} else if foundNumber {
			// 数字列が途切れたら終了
			break
		}
	}

	// 後ろから読み取った文字列を反転
	runes := []rune(result.String())
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}

	return string(runes)
}
