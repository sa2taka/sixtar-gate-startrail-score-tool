package util

import (
	"image"
)

func CalculateCrop(img image.Image, topLeftX, topLeftY, bottomRightX, bottomRightY float64) image.Rectangle {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	x0 := int(topLeftX * float64(width))
	y0 := int(topLeftY * float64(height))
	x1 := int(bottomRightX * float64(width))
	y1 := int(bottomRightY * float64(height))

	return image.Rect(x0, y0, x1, y1)
}
