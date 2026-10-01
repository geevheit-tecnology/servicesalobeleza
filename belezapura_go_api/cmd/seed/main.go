package main

import (
	"fmt"
	"log"
	"os"

	"belezapura_go_api/internal/db"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("DB connect error: %v", err)
	}
	defer db.Close()

	if err := db.Migrate(); err != nil {
		log.Fatalf("Migrate error: %v", err)
	}

	email := "admin@beautyos.app"
	password := "admin123"
	name := "Admin beautyOS"

	// Check if already exists
	var existing db.User
	if err := db.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		fmt.Printf("✅ Super admin already exists: %s\n", existing.Email)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt error: %v", err)
	}

	user := db.User{
		Email:    email,
		Password: string(hashed),
		Name:     name,
		Role:     "superadmin",
	}

	if err := db.DB.Create(&user).Error; err != nil {
		log.Fatalf("Failed to create superadmin: %v", err)
	}

	fmt.Printf("✅ Super admin criado com sucesso!\n")
	fmt.Printf("   Email: %s\n", email)
	fmt.Printf("   Senha: %s\n", password)
	fmt.Printf("   Role:  %s\n", user.Role)
	os.Exit(0)
}
