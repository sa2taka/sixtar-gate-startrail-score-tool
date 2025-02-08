package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"strings"
)

func ExtractOptionFromResult(img image.Image) (Pattern, Hazard, error) {
	pattern, err := extractPatternFromResult(img)
	if err != nil {
		return UnknownPattern, UnknownHazard, err
	}

	hazard, err := extractHazardFromResult(img)
	if err != nil {
		return UnknownPattern, UnknownHazard, err
	}

	return pattern, hazard, nil
}

const patternAreaX0Rate = 0.480726 // 1230 / 1920
const patternAreaY0Rate = 0.514109 // 740 / 1080
const patternAreaX1Rate = 0.518141 // 1326 / 1920
const patternAreaY1Rate = 0.532250 // 766 / 1080

func extractPatternFromResult(img image.Image) (Pattern, error) {
	cropRect := util.CalculateCrop(img, patternAreaX0Rate, patternAreaY0Rate, patternAreaX1Rate, patternAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		return UnknownPattern, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return UnknownPattern, err
	}

	lowerText := strings.ToLower(ocrText)

	if strings.Contains(lowerText, "mirror") {
		return Mirror, nil
	} else if strings.Contains(lowerText, "random") {
		return Random, nil
	} else if strings.Contains(lowerText, "default") {
		return DefaultPattern, nil
	} else {
		return UnknownPattern, nil
	}
}

const hazardAreaX0Rate = 0.530045 // 1356 / 1920
const hazardAreaY0Rate = 0.513102 // 738 / 1080
const hazardAreaX1Rate = 0.569161 // 1457 / 1920
const hazardAreaY1Rate = 0.531242 // 764 / 1080

func extractHazardFromResult(img image.Image) (Hazard, error) {
	cropRect := util.CalculateCrop(img, hazardAreaX0Rate, hazardAreaY0Rate, hazardAreaX1Rate, hazardAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		return UnknownHazard, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		return UnknownHazard, err
	}

	lowerText := strings.ToLower(ocrText)

	if strings.Contains(lowerText, "deadend") {
		return Deadend, nil
	} else if strings.Contains(lowerText, "3") || strings.Contains(lowerText, "lvs") {
		return Lv3, nil
	} else if strings.Contains(lowerText, "2") {
		return Lv2, nil
	} else if strings.Contains(lowerText, "1") {
		return Lv1, nil
	} else if strings.Contains(lowerText, "default") {
		return DefaultHazard, nil
	} else if strings.Contains(lowerText, "sudden") {
		return Sudden, nil
	} else {
		return UnknownHazard, nil
	}
}
