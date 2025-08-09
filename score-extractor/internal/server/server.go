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

// corsMiddleware はCORSヘッダーを設定するミドルウェア
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORSヘッダーを設定
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		// OPTIONSメソッドの場合は早期リターン
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func (s *Server) Start() error {
	r := mux.NewRouter()

	// CORSミドルウェアを追加
	r.Use(corsMiddleware)

	// ヘルスチェックエンドポイント
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods(http.MethodGet)

	// スコアデータ取得エンドポイント
	scoresHandler := handler.NewScoresHandler(s.config.Monitoring.Directory)
	r.Handle("/api/v1/scores", scoresHandler).Methods(http.MethodGet)

	// OPTIONSメソッド用のハンドラを追加
	r.Handle("/api/v1/scores", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})).Methods(http.MethodOptions)

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
