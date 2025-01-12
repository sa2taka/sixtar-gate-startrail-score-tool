package main

import (
	"fmt"
	"os"

	"score_extractor/cmd/extract"
)

func main() {
	if err := extract.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "エラー: %v\n", err)
		os.Exit(1)
	}
}
