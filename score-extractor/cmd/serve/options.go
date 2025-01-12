package serve

import (
	"flag"
	"fmt"
)

type Options struct {
	ConfigPath string
}

func ParseOptions() (*Options, error) {
	var opts Options

	flag.StringVar(&opts.ConfigPath, "config", "", "設定ファイルのパス")
	flag.Parse()

	if opts.ConfigPath == "" {
		return nil, fmt.Errorf("設定ファイルのパスを指定してください")
	}

	return &opts, nil
}
