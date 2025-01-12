package main

import (
	"fmt"
	"os"

	"score_extractor/cmd/extract"
	"score_extractor/cmd/serve"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "使用方法: %s [extract|serve] [オプション]\n", os.Args[0])
		os.Exit(1)
	}

	// 最初の引数をコマンドとして解釈し、残りの引数を渡す
	cmd := os.Args[1]
	os.Args = append([]string{os.Args[0]}, os.Args[2:]...)

	var err error
	switch cmd {
	case "extract":
		err = extract.Run()
	case "serve":
		err = serve.Run()
	default:
		err = fmt.Errorf("不明なコマンド: %s", cmd)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "エラー: %v\n", err)
		os.Exit(1)
	}
}
