package db

import (
	"fmt"
	"log"
	"os"
	"strings"
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

	// Seed / Update official BelezaPura plans: Essencial R$59,90, Studio R$119,90 [14 dias grátis], Elite R$249,90
	seedPlans := []Plan{
		{
			Name:             "Essencial",
			Price:            59.90,
			Period:           "/mês",
			Highlight:        false,
			MaxProfessionals: 1,
			MaxSubscriptions: 0,
			Features:         `["1 profissional","Página exclusiva para bio do Instagram","Agendamento online 24h","Sinal antecipado via PIX sem taxas","Lembretes automáticos para clientes","Controle de atendimentos"]`,
			Color:            "#B8614A",
		},
		{
			Name:             "Studio",
			Price:            119.90,
			Period:           "/mês",
			Highlight:        true,
			MaxProfessionals: 5,
			MaxSubscriptions: 0,
			Features:         `["Tudo do Essencial","Até 5 profissionais com acessos individuais","Divisão e cálculo automático de comissões","Painel financeiro com controle de entradas","Lembretes anti-no show no WhatsApp","Controle de comandas e serviços","🎁 14 dias de teste grátis"]`,
			Color:            "#E11D48",
		},
		{
			Name:             "Elite",
			Price:            249.90,
			Period:           "/mês",
			Highlight:        false,
			MaxProfessionals: 0,
			MaxSubscriptions: 0,
			Features:         `["Tudo do Studio","Profissionais ilimitados","Automação completa no WhatsApp","Fidelização e mensagens de retorno","Controle de produtos e estoque","Multi-unidades (filiais)","Suporte prioritário VIP"]`,
			Color:            "#8B5CF6",
		},
	}

	for _, sp := range seedPlans {
		var p Plan
		if err := DB.Where("LOWER(name) = ?", strings.ToLower(sp.Name)).First(&p).Error; err != nil {
			DB.Create(&sp)
		} else {
			DB.Model(&p).Updates(map[string]interface{}{
				"price":             sp.Price,
				"max_professionals": sp.MaxProfessionals,
				"max_subscriptions": sp.MaxSubscriptions,
				"features":          sp.Features,
				"highlight":         sp.Highlight,
				"color":             sp.Color,
			})
		}
	}

	return nil
}
