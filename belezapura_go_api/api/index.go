package handler

import (
	"net/http"
	"sync"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"
	"belezapura_go_api/internal/router"
)

var (
	initOnce sync.Once
	initErr  error
	app      http.Handler
)

// Handler é o entrypoint Serverless exportado para a Vercel.
func Handler(w http.ResponseWriter, r *http.Request) {
	initOnce.Do(func() {
		if err := middleware.ValidateSecret(); err != nil {
			initErr = err
			return
		}
		if err := db.ConnectOnce(); err != nil {
			initErr = err
			return
		}
		app = router.New()
	})
	if initErr != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusServiceUnavailable)
		_, _ = w.Write([]byte(`{"error":"Serviço temporariamente indisponível."}`))
		return
	}
	app.ServeHTTP(w, r)
}
