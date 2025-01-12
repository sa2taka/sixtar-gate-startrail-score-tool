package imageproc

import (
	"image"
	"image/color"
)

func BinarizeImage(img image.Image, threshold uint8) image.Image {
	bounds := img.Bounds()
	grayImg := image.NewGray(bounds)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			luminance := uint8((r*299 + g*587 + b*114 + 500) / 1000 >> 8)
			if luminance > threshold {
				grayImg.SetGray(x, y, color.Gray{Y: 255})
			} else {
				grayImg.SetGray(x, y, color.Gray{Y: 0})
			}
		}
	}

	return grayImg
}
