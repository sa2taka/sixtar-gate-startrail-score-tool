package extract

type Pattern string

const (
	UnknownPattern Pattern = "unknown"
	DefaultPattern Pattern = "Default"
	Mirror         Pattern = "Mirror"
	Random         Pattern = "Randoms"
)

type Hazard string

const (
	UnknownHazard Hazard = "unknown"
	DefaultHazard Hazard = "Default"
	Lv1           Hazard = "level1"
	Lv2           Hazard = "level2"
	Lv3           Hazard = "level3"
	Deadend       Hazard = "deadend"
	FullCombo     Hazard = "full combo"
	PureWhite     Hazard = "pure white"
	PureBlue      Hazard = "pure blue"
)
