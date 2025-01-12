package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/music_info"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
)

const titleAreaX0Rate = 0.096939 // 248 / 1920
const titleAreaY0Rate = 0.505039 // 727 / 1080
const titleAreaX1Rate = 0.434807 // 1113 / 1920
const titleAreaY1Rate = 0.560469 // 807 / 1080

func convertMusicInformationListToCandidates(musicInformationList []music_info.MusicInformation) [][]string {
	candidates := make([][]string, len(musicInformationList))
	for i, musicInformation := range musicInformationList {
		if musicInformation.EnglishName == "" {
			candidates[i] = []string{musicInformation.Name}
		} else {
			candidates[i] = []string{musicInformation.Name, musicInformation.EnglishName}
		}
	}
	return candidates
}

func ExtractTitleFromResult(img image.Image, musicInformationList []music_info.MusicInformation) (music_info.MusicInformation, error) {
	cropRect := util.CalculateCrop(img, titleAreaX0Rate, titleAreaY0Rate, titleAreaX1Rate, titleAreaY1Rate)

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
