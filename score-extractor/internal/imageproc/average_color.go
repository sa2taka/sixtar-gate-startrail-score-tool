package imageproc

import (
	"image"
	"image/color"
	"math"
)

type CalculateAverageOption struct {
	IgnoreColor     color.Color
	IgnoreTolerance int
}

func isExcludedColor(c1, excluded color.Color, tolerance int) bool {
	if excluded == nil {
		return false
	}
	tolerance16bit := tolerance << 8
	r1, g1, b1, _ := c1.RGBA()
	r2, g2, b2, _ := excluded.RGBA()

	return (math.Abs(float64(r1-r2)) < float64(tolerance16bit)) &&
		(math.Abs(float64(g1-g2)) < float64(tolerance16bit)) &&
		(math.Abs(float64(b1-b2)) < float64(tolerance16bit))
}

func CalculateAverageColor(img image.Image) color.Color {
	return CalculateAverageColorWithOption(img, nil)
}

func CalculateAverageColorWithOption(img image.Image, option *CalculateAverageOption) color.Color {
	var totalR, totalG, totalB, totalA uint32
	var count uint32
	bounds := img.Bounds()

	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			col := img.At(x, y)

			if option != nil && isExcludedColor(col, option.IgnoreColor, option.IgnoreTolerance) {
				continue
			}

			r, g, b, a := col.RGBA()

			totalR += r
			totalG += g
			totalB += b
			totalA += a
			count++
		}
	}

	if count == 0 {
		return color.RGBA{0, 0, 0, 0}
	}

	avgR := totalR / count
	avgG := totalG / count
	avgB := totalB / count
	avgA := totalA / count

	return color.RGBA{
		R: uint8(avgR >> 8),
		G: uint8(avgG >> 8),
		B: uint8(avgB >> 8),
		A: uint8(avgA >> 8),
	}
}
