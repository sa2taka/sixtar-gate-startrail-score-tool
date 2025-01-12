package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
)

const selectTitleAreaX0Rate = 0.223655 // 572 / 1920
const selectTitleAreaY0Rate = 0.413677 // 595 / 1080
const selectTitleAreaX1Rate = 0.517937 // 1325 / 1920
const selectTitleAreaY1Rate = 0.450548 // 648 / 1080

func ExtractTitleFromSelect(img image.Image, musicInformationList []music_info.MusicInformation) (music_info.MusicInformation, error) {
	cropRect := util.CalculateCrop(img, selectTitleAreaX0Rate, selectTitleAreaY0Rate, selectTitleAreaX1Rate, selectTitleAreaY1Rate)

	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		return music_info.MusicInformation{}, err
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes, "kor", "jpn")
	if err != nil {
		return music_info.MusicInformation{}, err
	}

	candidates := convertMusicInformationListToCandidates(musicInformationList)

	index := util.FindClosestStringIndex(ocrText, candidates)

	return musicInformationList[index], nil
}
