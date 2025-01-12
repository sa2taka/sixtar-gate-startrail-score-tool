package extract

import "score_extractor/internal/music_info"

// findMusicById は指定されたIDの楽曲情報を検索して返します。
// テストヘルパー関数として使用します。
func findMusicById(list []music_info.MusicInformation, id string) music_info.MusicInformation {
	for _, m := range list {
		if m.Id == id {
			return m
		}
	}
	return music_info.MusicInformation{}
}
