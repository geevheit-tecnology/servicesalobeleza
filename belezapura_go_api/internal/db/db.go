package db

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB          *gorm.DB
	connectOnce sync.Once
	connectErr  error
)

// ConnectOnce garante que o pool de conexões e a checagem de schema
// sejam executados apenas uma vez por instância Serverless (cold start).
func ConnectOnce() error {
	connectOnce.Do(func() {
		if err := Connect(); err != nil {
			connectErr = err
			return
		}
		connectErr = CheckSchema()
	})
	return connectErr
}

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
			Colorful:                  false,
		},
	)

	var err error
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // Compatível com Supabase Transaction Pooler (porta 6543 / PgBouncer)
	}), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetMaxOpenConns(3)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

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
