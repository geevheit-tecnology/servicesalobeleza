package db

import (
	"errors"
	"gorm.io/gorm"
)

// SeedPlans only inserts missing plans; administrator changes are preserved.
func SeedPlans() error {
	plans := []Plan{
		{Name: "Essencial", Price: 59.90, Period: "/mês", MaxProfessionals: 1, Features: `["1 profissional","Página exclusiva","Agendamento online","Pix com conferência manual","Controle de atendimentos"]`, Color: "#B8614A"},
		{Name: "Studio", Price: 119.90, Period: "/mês", MaxProfessionals: 5, Highlight: true, Features: `["Tudo do Essencial","Até 5 profissionais","Painel financeiro","Estoque por salão","14 dias de teste grátis"]`, Color: "#E11D48"},
		{Name: "Elite", Price: 319.09, Period: "/mês", MaxProfessionals: 0, Features: `["Tudo do Studio","Profissionais ilimitados","Estoque por salão"]`, Color: "#8B5CF6"},
	}
	return DB.Transaction(func(tx *gorm.DB) error {
		for _, p := range plans {
			var existing Plan
			err := tx.Where("LOWER(name) = LOWER(?)", p.Name).First(&existing).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := tx.Create(&p).Error; err != nil {
					return err
				}
			} else if err != nil {
				return err
			}
		}
		return nil
	})
}
