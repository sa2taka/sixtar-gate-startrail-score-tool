package imageproc

import (
	"image"
)

// CropImage は指定された矩形領域をクロップして返します。
func CropImage(img image.Image, cropRect image.Rectangle) image.Image {
	croppedImg := img.(interface {
		SubImage(r image.Rectangle) image.Image
	}).SubImage(cropRect)

	return croppedImg
}
