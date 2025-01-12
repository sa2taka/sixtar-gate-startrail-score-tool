package music_info

type MusicInformation struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	EnglishName string `json:"englishName"`
}

type JsonData struct {
	Songs []MusicInformation `json:"songs"`
}
