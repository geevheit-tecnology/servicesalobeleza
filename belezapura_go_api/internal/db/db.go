package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return fmt.Errorf("DATABASE_URL not set")
	}

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("✅ Database connected")
	return nil
}

func Close() {
	sqlDB, err := DB.DB()
	if err != nil {
		return
	}
	sqlDB.Close()
}

func Migrate() error {
	return DB.AutoMigrate(
		&User{},
		&Salon{},
		&Client{},
		&Professional{},
		&Service{},
		&Appointment{},
		&Subscription{},
		&Plan{},
		&SystemSettings{},
		&AdminAuditLog{},
	)
}
