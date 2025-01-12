package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"score_extractor/internal/config"
	"score_extractor/internal/server/handler"

	"github.com/gorilla/mux"
)

type Server struct {
	config     *config.Config
	httpServer *http.Server
}

func NewServer(cfg *config.Config) *Server {
	return &Server{
		config: cfg,
	}
}

func (s *Server) Start() error {
	r := mux.NewRouter()

	// ヘルスチェックエンドポイント
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods(http.MethodGet)

	// スコアデータ取得エンドポイント
	scoresHandler := handler.NewScoresHandler(s.config.Monitoring.Directory)
	r.Handle("/api/v1/scores", scoresHandler).Methods(http.MethodGet)

	s.httpServer = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.config.API.Port),
		Handler: r,
	}

	return s.httpServer.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	if s.httpServer != nil {
		return s.httpServer.Shutdown(ctx)
	}
	return nil
}

// GracefulShutdown はサーバーを安全に停止する
func (s *Server) GracefulShutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	return s.Stop(ctx)
}
