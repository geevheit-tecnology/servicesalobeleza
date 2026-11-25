package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"
	"belezapura_go_api/internal/router"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	// Connect DB
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := middleware.ValidateSecret(); err != nil {
		log.Fatal(err)
	}
	if err := db.CheckSchema(); err != nil {
		log.Fatal(err)
	}
	r := NewRouter()
	port := os.Getenv("PORT")
	if port == "" {
		port = "3050"
	}
	server := &http.Server{Addr: ":" + port, Handler: r, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 1 << 20}
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-stop
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		_ = server.Shutdown(ctx)
	}()
	log.Printf("BelezaPura API na porta %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func NewRouter() *gin.Engine {
	return router.New()
}
