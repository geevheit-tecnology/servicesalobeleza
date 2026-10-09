package main

import (
	"log"

	"belezapura_go_api/internal/db"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	email := "admin.master@gmail.com"
	password := "200484"
	name := "Super Admin Master"
	role := "superadmin"

	// Check if already exists
	var existing db.User
	if err := db.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		log.Println("Superadmin user already exists! Deleting and recreating to ensure password is correct...")
		db.DB.Delete(&existing)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	user := db.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := db.DB.Create(&user).Error; err != nil {
		log.Fatalf("Failed to create superadmin: %v", err)
	}

	log.Println("✅ Superadmin created successfully!")
}
