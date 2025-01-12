package imageproc

import (
	"image/color"
	"math"
)

func colorDistance(c1, c2 color.Color) float64 {
	r1, g1, b1, _ := c1.RGBA()
	r2, g2, b2, _ := c2.RGBA()

	rDiff := float64(r1>>8) - float64(r2>>8)
	gDiff := float64(g1>>8) - float64(g2>>8)
	bDiff := float64(b1>>8) - float64(b2>>8)

	return math.Sqrt(rDiff*rDiff + gDiff*gDiff + bDiff*bDiff)
}

func FindClosestColor(targetColor color.Color, colors []color.Color) int {
	minDistance := math.MaxFloat64
	var closestIndex int = 0

	for i := range colors {
		baseColor := colors[i]
		distance := colorDistance(targetColor, baseColor)
		if distance < minDistance {
			minDistance = distance
			closestIndex = i
		}
	}

	return closestIndex
}
