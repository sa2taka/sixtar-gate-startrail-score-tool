package util

import (
	"strconv"
	"strings"
)

func StringToInt(s string) (int, error) {
	cleanStr := strings.NewReplacer(",", "", " ", "", "o", "0", "O", "0", "l", "1", "i", "1").Replace(s)

	int, err := strconv.Atoi(cleanStr)
	if err != nil {
		return 0, err
	}

	return int, nil
}
