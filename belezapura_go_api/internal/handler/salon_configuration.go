package handler

import (
	"belezapura_go_api/internal/db"
	"errors"
	"math"
	"strings"
)

func validateDepositConfiguration(policy, kind string, value float64) error {
	if (policy != "required" && policy != "optional" && policy != "none") ||
		(kind != "percentage" && kind != "fixed") || math.IsNaN(value) || math.IsInf(value, 0) ||
		value <= 0 || value > 99999999 || (kind == "percentage" && value > 100) {
		return errors.New("Configuração do sinal inválida. Use um valor positivo e percentual de até 100%.")
	}
	return nil
}

func depositForService(s db.Salon, price float64, pay *bool) float64 {
	if s.DepositPolicy == "none" || (s.DepositPolicy == "optional" && pay != nil && !*pay) ||
		s.PixKey == nil || strings.TrimSpace(*s.PixKey) == "" || price <= 0 {
		return 0
	}
	amount := price * s.DepositValue / 100
	if s.DepositType == "fixed" {
		amount = math.Min(price, s.DepositValue)
	}
	return math.Round(amount*100) / 100
}

func pixBeneficiary(s db.Salon) string {
	if strings.TrimSpace(s.PixName) != "" {
		return s.PixName
	}
	return s.Name
}
