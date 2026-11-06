package db

import (
	"embed"
	"fmt"
	"gorm.io/gorm"
	"sort"
)

//go:embed migrations/*.sql
var migrations embed.FS

// Migrate is explicit: the HTTP server never changes schema or plan prices.
func Migrate() error {
	return DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(7300411)").Error; err != nil {
			return err
		}
		if err := tx.Exec("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())").Error; err != nil {
			return err
		}
		var count int64
		if err := tx.Raw("SELECT count(*) FROM schema_migrations WHERE version = '001_baseline'").Scan(&count).Error; err != nil {
			return err
		}
		if count == 0 {
			if err := tx.AutoMigrate(&User{}, &Salon{}, &Client{}, &Professional{}, &Service{}, &Appointment{}, &Subscription{}, &Plan{}, &SystemSettings{}, &AdminAuditLog{}, &Product{}, &Payment{}); err != nil {
				return err
			}
			if err := tx.Exec("INSERT INTO schema_migrations(version) VALUES ('001_baseline')").Error; err != nil {
				return err
			}
		}
		files, err := migrations.ReadDir("migrations")
		if err != nil {
			return err
		}
		sort.Slice(files, func(i, j int) bool { return files[i].Name() < files[j].Name() })
		for _, file := range files {
			version := file.Name()
			if err := tx.Raw("SELECT count(*) FROM schema_migrations WHERE version = ?", version).Scan(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				continue
			}
			sql, err := migrations.ReadFile("migrations/" + version)
			if err != nil {
				return err
			}
			if err := tx.Exec(string(sql)).Error; err != nil {
				return fmt.Errorf("migration %s: %w", version, err)
			}
			if err := tx.Exec("INSERT INTO schema_migrations(version) VALUES (?)", version).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func CheckSchema() error {
	var n int64
	if err := DB.Raw("SELECT count(*) FROM schema_migrations WHERE version IN ('001_baseline','002_booking_integrity.sql','003_auth_provider.sql')").Scan(&n).Error; err != nil {
		return err
	}
	if n != 3 {
		return fmt.Errorf("schema desatualizado: execute go run ./cmd/migrate antes de iniciar a API")
	}
	return nil
}
