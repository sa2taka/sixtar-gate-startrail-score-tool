package music_info

import (
	"encoding/json"
	"io"
	"os"
)

func LoadMusicData(filePath string) ([]MusicInformation, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)

	if err != nil {
		return nil, err
	}

	var musicData JsonData
	if err := json.Unmarshal(byteValue, &musicData); err != nil {
		return nil, err
	}

	return musicData.Songs, nil
}
