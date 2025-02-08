package extract

import (
	"image"
	"score_extractor/internal/imageproc"
	"score_extractor/internal/ocr"
	"score_extractor/internal/util"
	"sync"
)

type Judgement struct {
	BlueStar   int
	WhiteStar  int
	YellowStar int
	RedStar    int
}

const blueStarAreaX0Rate = 0.147917 // 284 / 1920
const blueStarAreaY0Rate = 0.764005 // 825 / 1080
const blueStarAreaX1Rate = 0.180208 // 346 / 1920
const blueStarAreaY1Rate = 0.787153 // 850 / 1080

const whiteStarAreaX0Rate = 0.148958 // 286 / 1920
const whiteStarAreaY0Rate = 0.788079 // 851 / 1080
const whiteStarAreaX1Rate = 0.179167 // 344 / 1920
const whiteStarAreaY1Rate = 0.816782 // 882 / 1080

const yellowStarAreaX0Rate = 0.145833 // 280 / 1920
const yellowStarAreaY0Rate = 0.817708 // 883 / 1080
const yellowStarAreaX1Rate = 0.178646 // 343 / 1920
const yellowStarAreaY1Rate = 0.842708 // 910 / 1080

const redStarAreaX0Rate = 0.147917 // 284 / 1920
const redStarAreaY0Rate = 0.846412 // 914 / 1080
const redStarAreaX1Rate = 0.179167 // 344 / 1920
const redStarAreaY1Rate = 0.871412 // 941 / 1080

func judgmentExtractor(img image.Image, x0Rate, y0Rate, x1Rate, y1Rate float64, wg *sync.WaitGroup, result *int) {
	defer wg.Done()

	cropRect := util.CalculateCrop(img, x0Rate, y0Rate, x1Rate, y1Rate)
	croppedImg := imageproc.CropImage(img, cropRect)

	imgBytes, err := imageproc.ImageToBytes(croppedImg)
	if err != nil {
		*result = -1
		return
	}

	ocrText, err := ocr.ExtractTextFromImage(imgBytes)
	if err != nil {
		*result = -1
		return
	}

	judgementCount, err := util.StringToInt(ocrText)
	if err != nil {
		*result = -1
		return
	}

	*result = judgementCount
}

func ExtractJudgementFromResult(img image.Image) (Judgement, error) {
	var wg sync.WaitGroup
	wg.Add(4)

	// 各ジャッジの結果を保存する変数（デフォルト値は-1）
	var blueStar, whiteStar, yellowStar, redStar = -1, -1, -1, -1

	// 並列に処理を実行
	go judgmentExtractor(img, blueStarAreaX0Rate, blueStarAreaY0Rate, blueStarAreaX1Rate, blueStarAreaY1Rate, &wg, &blueStar)
	go judgmentExtractor(img, whiteStarAreaX0Rate, whiteStarAreaY0Rate, whiteStarAreaX1Rate, whiteStarAreaY1Rate, &wg, &whiteStar)
	go judgmentExtractor(img, yellowStarAreaX0Rate, yellowStarAreaY0Rate, yellowStarAreaX1Rate, yellowStarAreaY1Rate, &wg, &yellowStar)
	go judgmentExtractor(img, redStarAreaX0Rate, redStarAreaY0Rate, redStarAreaX1Rate, redStarAreaY1Rate, &wg, &redStar)

	// 全てのゴルーチンの完了を待つ
	wg.Wait()

	// 全ての値を返す（取得できなかった場合は-1のまま）
	return Judgement{
		BlueStar:   blueStar,
		WhiteStar:  whiteStar,
		YellowStar: yellowStar,
		RedStar:    redStar,
	}, nil
}
