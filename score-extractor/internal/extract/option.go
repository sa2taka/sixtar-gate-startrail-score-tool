package extract

type Pattern string

const (
	UnknownPattern Pattern = "unknown"
	DefaultPattern Pattern = "DEFAULT"
	Mirror         Pattern = "MIRROR"
	Random         Pattern = "RANDOM"
)

type Hazard string

const (
	UnknownHazard Hazard = "unknown"
	DefaultHazard Hazard = "DEFAULT"
	Lv1           Hazard = "LV1"
	Lv2           Hazard = "LV2"
	Lv3           Hazard = "LV3"
	Deadend       Hazard = "DEADEND"
	Sudden        Hazard = "SUDDEN"
)
