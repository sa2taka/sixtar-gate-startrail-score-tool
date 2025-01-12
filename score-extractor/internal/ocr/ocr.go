package ocr

import (
	"fmt"

	"github.com/otiai10/gosseract/v2"
)

func ExtractTextFromImage(imgBytes []byte, lang ...string) (string, error) {
	client := gosseract.NewClient()
	defer client.Close()

	client.SetLanguage(lang...)

	client.SetImageFromBytes(imgBytes)
	text, err := client.Text()
	if err != nil {
		fmt.Printf("OCR failed: %v.\n", err)
		return "", err
	}

	return text, nil
}
