package extract

import "image/color"

type Difficult string

const (
	NoDifficult Difficult = "NoDifficult"
	Comet       Difficult = "comet"
	Nova        Difficult = "nova"
	Supernova   Difficult = "supernova"
	Quasar      Difficult = "quasar"
	Starlight   Difficult = "starlight"
	Mystic      Difficult = "mystic"
)

var ResultDifficultColors = []color.Color{
	color.RGBA{R: 255, G: 255, B: 255, A: 255}, // other #FFFFFF
	color.RGBA{R: 51, G: 225, B: 245, A: 255},  // comet #33E1F5
	color.RGBA{R: 254, G: 148, B: 130, A: 255}, // nova #FE9480
	color.RGBA{R: 242, G: 82, B: 122, A: 255},  // supernova #F2527A
	color.RGBA{R: 91, G: 23, B: 202, A: 255},   // quasar #5B17CA
	color.RGBA{R: 231, G: 202, B: 252, A: 255}, // starlight #E7CAFC
	color.RGBA{R: 113, G: 212, B: 76, A: 255},  // mystic #71D44C
}
