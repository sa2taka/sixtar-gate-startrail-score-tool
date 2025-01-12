package imageproc

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
)

// ImageToBytes はimage.Imageをバイト配列に変換します。
func ImageToBytes(img image.Image) ([]byte, error) {
	buf := new(bytes.Buffer)

	err := jpeg.Encode(buf, img, nil)
	if err != nil {
		fmt.Printf("failed to encode image to jpeg: %v.\n", err)
		return nil, err
	}

	return buf.Bytes(), nil
}
