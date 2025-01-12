package extract

import (
	"image"
	"image/color"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/util"
)

const lunarAreaX0Rate = 0.246637 // 631 / 1920
const lunarAreaY0Rate = 0.052940 // 76 / 1080
const lunarAreaX1Rate = 0.289798 // 741 / 1920
const lunarAreaY1Rate = 0.077853 // 112 / 1080

const solarAreaX0Rate = 0.321749 // 823 / 1920
const solarAreaY0Rate = 0.055929 // 80 / 1080
const solarAreaX1Rate = 0.359305 // 919 / 1920
const solarAreaY1Rate = 0.073866 // 106 / 1080

var lunarColor = color.RGBA{R: 112, G: 212, B: 214, A: 255} // #6FE0F1
var solarColor = color.RGBA{R: 235, G: 136, B: 165, A: 255} // #EB88A5
var blankColor = color.RGBA{R: 128, G: 128, B: 128, A: 128} // #7F7F7F

var selectModeExcludeOption = imageproc.CalculateAverageOption{
	IgnoreColor:     color.RGBA{R: 0, G: 0, B: 0, A: 255}, // #000000
	IgnoreTolerance: 160,
}

func ExtractModeFromSelect(img image.Image) (Mode, error) {
	lunarCropRect := util.CalculateCrop(img, lunarAreaX0Rate, lunarAreaY0Rate, lunarAreaX1Rate, lunarAreaY1Rate)
	solarCropRect := util.CalculateCrop(img, solarAreaX0Rate, solarAreaY0Rate, solarAreaX1Rate, solarAreaY1Rate)

	lunarCroppedImg := imageproc.CropImage(img, lunarCropRect)
	solarCroppedImg := imageproc.CropImage(img, solarCropRect)

	lunarAverageColor := imageproc.CalculateAverageColorWithOption(lunarCroppedImg, &selectModeExcludeOption)
	solarAverageColor := imageproc.CalculateAverageColorWithOption(solarCroppedImg, &selectModeExcludeOption)

	lunarClosetColorIndex := imageproc.FindClosestColor(lunarAverageColor, []color.Color{blankColor, lunarColor})
	solarClosetColorIndex := imageproc.FindClosestColor(solarAverageColor, []color.Color{blankColor, solarColor})

	if lunarClosetColorIndex == 0 && solarClosetColorIndex == 0 {
		return UnknownMode, nil
	} else if lunarClosetColorIndex == 1 && solarClosetColorIndex == 0 {
		return Lunar, nil
	} else if lunarClosetColorIndex == 0 && solarClosetColorIndex == 1 {
		return Solar, nil
	} else {
		return UnknownMode, nil
	}

}
