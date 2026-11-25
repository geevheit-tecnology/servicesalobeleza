package db

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
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
	dsn = transactionPoolerDSN(dsn)

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
	sqlDB.SetMaxOpenConns(2)
	sqlDB.SetConnMaxIdleTime(30 * time.Second)
	sqlDB.SetConnMaxLifetime(10 * time.Minute)

	log.Println("✅ Database connected")
	return nil
}

// transactionPoolerDSN troca o pooler do Supabase do modo sessão (porta 5432,
// limite de ~15 clientes, causa EMAXCONNSESSION em ambiente serverless) para o
// modo transação (porta 6543), que multiplexa centenas de clientes.
func transactionPoolerDSN(dsn string) string {
	u, err := url.Parse(dsn)
	if err != nil || u.Host == "" {
		return dsn
	}
	if strings.HasSuffix(u.Hostname(), ".pooler.supabase.com") && u.Port() == "5432" {
		u.Host = u.Hostname() + ":6543"
		return u.String()
	}
	return dsn
}

func Close() {
	sqlDB, err := DB.DB()
	if err != nil {
		return
	}
	sqlDB.Close()
}
