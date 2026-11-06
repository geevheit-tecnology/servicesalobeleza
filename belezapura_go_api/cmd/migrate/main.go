package main

import (
	"belezapura_go_api/internal/db"
	"github.com/joho/godotenv"
	"log"
)

func main() {
	_ = godotenv.Load()
	if err := db.Connect(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := db.Migrate(); err != nil {
		log.Fatal(err)
	}
	log.Println("Migrações concluídas.")
}
