package serve

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"score_extractor/internal/config"
	"score_extractor/internal/server"
)

func Run() error {
	opts, err := ParseOptions()
	if err != nil {
		return fmt.Errorf("オプションの解析に失敗: %w", err)
	}

	cfg, err := config.LoadConfig(opts.ConfigPath)
	if err != nil {
		return fmt.Errorf("設定ファイルの読み込みに失敗: %w", err)
	}

	srv := server.NewServer(cfg)

	// シグナルハンドリングの設定
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// エラーハンドリング用のチャネル
	errChan := make(chan error, 1)

	// サーバーを別のゴルーチンで起動
	go func() {
		fmt.Printf("APIサーバーを起動しました (port: %d)\n", cfg.API.Port)
		if err := srv.Start(); err != nil {
			errChan <- fmt.Errorf("サーバーの起動に失敗: %w", err)
		}
	}()

	// シグナルまたはエラーを待機
	select {
	case <-sigChan:
		fmt.Println("\nシャットダウンシグナルを受信しました")
		if err := srv.GracefulShutdown(); err != nil {
			return fmt.Errorf("サーバーのシャットダウンに失敗: %w", err)
		}
		fmt.Println("サーバーを正常にシャットダウンしました")
	case err := <-errChan:
		return err
	}

	return nil
}
