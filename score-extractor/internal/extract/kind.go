package extract

import (
	"fmt"
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"strings"
)

type Kind string

const (
	OtherKind   Kind = "Other"
	Result      Kind = "Result"
	MusicSelect Kind = "MusicSelect"
)

const judgeAreaX0Rate = 0.038117 // 73 / 1920
const judgeAreaY0Rate = 0.045964 // 49 / 1080
const judgeAreaX1Rate = 0.215247 // 413 / 1920
const judgeAreaY1Rate = 0.084828 // 91 / 1080

func JudgeKind(img image.Image) (Kind, error) {
	cropRect := util.CalculateCrop(img, judgeAreaX0Rate, judgeAreaY0Rate, judgeAreaX1Rate, judgeAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		fmt.Printf("failed to convert cropped image to bytes: %v", err)
		return OtherKind, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		fmt.Printf("failed to extract text from image: %v", err)
		return OtherKind, err
	}

	lowerText := strings.ToLower(ocrText)

	if strings.Contains(lowerText, "result") {
		return Result, nil
	} else if strings.Contains(lowerText, "music select") {
		return MusicSelect, nil
	} else {
		return OtherKind, nil
	}
}
