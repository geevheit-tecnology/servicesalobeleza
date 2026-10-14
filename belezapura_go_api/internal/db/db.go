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
	err := DB.AutoMigrate(
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
	if err != nil {
		return err
	}

	// Seed / Update official plans with prices and spots: 49.99 (10 vagas), 99.99 (10 vagas), 219.99 (5 vagas)
	seedPlans := []Plan{
		{
			Name:             "Básico",
			Price:            49.99,
			Period:           "/mês",
			Highlight:        false,
			MaxProfessionals: 1,
			MaxSubscriptions: 10,
			Features:         `["1 profissional","Página do salão (Link na Bio)","Agendamento Automático 24h","Cobrança de Sinal (PIX)","Apenas 10 vagas disponíveis"]`,
			Color:            "#B8614A",
		},
		{
			Name:             "Profissional",
			Price:            99.99,
			Period:           "/mês",
			Highlight:        true,
			MaxProfessionals: 5,
			MaxSubscriptions: 10,
			Features:         `["Tudo do plano Básico, mais:","Até 5 profissionais","Agendamentos Ilimitados","Cálculo de Comissões","Controle Financeiro","Suporte VIP","Apenas 10 vagas disponíveis"]`,
			Color:            "#9B7EA8",
		},
		{
			Name:             "Premium",
			Price:            219.99,
			Period:           "/mês",
			Highlight:        false,
			MaxProfessionals: 0,
			MaxSubscriptions: 5,
			Features:         `["Tudo do plano Profissional, mais:","🤖 Chatbot WhatsApp IA (Atendente 24h)","💬 Agendamento e Cobrança no WhatsApp","⏰ Lembrete Anti-Furo 2h Antes","Profissionais Ilimitados","Múltiplas unidades (até 3)","Gestão de Estoque Completa","Apenas 5 vagas exclusivas"]`,
			Color:            "#5558e3",
		},
	}

	for _, sp := range seedPlans {
		var p Plan
		if err := DB.Where("name = ?", sp.Name).First(&p).Error; err != nil {
			DB.Create(&sp)
		} else {
			DB.Model(&p).Updates(map[string]interface{}{
				"price":             sp.Price,
				"max_professionals": sp.MaxProfessionals,
				"max_subscriptions": sp.MaxSubscriptions,
				"features":          sp.Features,
				"highlight":         sp.Highlight,
			})
		}
	}

	return nil
}
