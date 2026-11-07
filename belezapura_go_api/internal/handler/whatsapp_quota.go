package handler

import (
	"belezapura_go_api/internal/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// whatsappStatus resume a franquia mensal de disparos de WhatsApp de um salão.
type whatsappStatus struct {
	Enabled      bool   `json:"enabled"`
	Limit        int    `json:"limit"`
	Used         int    `json:"used"`
	Remaining    int    `json:"remaining"`
	Month        string `json:"month"`
	Plan         string `json:"plan"`
	PlanLimit    int    `json:"planLimit"`
	CustomLimit  bool   `json:"customLimit"`
	Subscription string `json:"subscriptionStatus"`
}

func currentWhatsAppMonth() string {
	loc, err := time.LoadLocation("America/Sao_Paulo")
	if err != nil {
		loc = time.UTC
	}
	return time.Now().In(loc).Format("2006-01")
}

// planWhatsAppLimit define a franquia padrão por categoria de plano.
func planWhatsAppLimit(p db.Plan) int {
	switch inferPlanCategory(p) {
	case "Completo / VIP":
		return 1000
	case "Intermediário / Equipe":
		return 150
	default:
		return 0
	}
}

func salonPlanAndStatus(salonID string) (db.Plan, string) {
	var sub db.Subscription
	var plan db.Plan
	if err := db.DB.Where("salon_id = ?", salonID).Order("created_at desc").First(&sub).Error; err != nil {
		return plan, ""
	}
	if sub.PlanID != "" {
		db.DB.First(&plan, "id = ?", sub.PlanID)
	}
	return plan, sub.Status
}

func getWhatsAppStatus(salon db.Salon) whatsappStatus {
	plan, subStatus := salonPlanAndStatus(salon.ID)
	planLimit := planWhatsAppLimit(plan)
	limit := planLimit
	custom := false
	if salon.WhatsAppMonthlyLimit > 0 {
		limit = salon.WhatsAppMonthlyLimit
		custom = true
	}
	month := currentWhatsAppMonth()
	var used int
	db.DB.Raw("SELECT COALESCE(SUM(sent),0) FROM whatsapp_usages WHERE salon_id = ? AND month = ?", salon.ID, month).Scan(&used)
	remaining := limit - used
	if remaining < 0 {
		remaining = 0
	}
	return whatsappStatus{
		Enabled:      salon.WhatsAppEnabled,
		Limit:        limit,
		Used:         used,
		Remaining:    remaining,
		Month:        month,
		Plan:         plan.Name,
		PlanLimit:    planLimit,
		CustomLimit:  custom,
		Subscription: subStatus,
	}
}

// consumeWhatsAppQuota reserva 1 disparo da franquia do mês de forma atômica.
// Retorna false quando o WhatsApp está desativado, a assinatura não está em dia
// ou a franquia do mês acabou — nesse caso nenhuma mensagem deve ser enviada.
func consumeWhatsAppQuota(salonID string) bool {
	var salon db.Salon
	if err := db.DB.First(&salon, "id = ?", salonID).Error; err != nil {
		return false
	}
	if !salon.WhatsAppEnabled {
		return false
	}
	st := getWhatsAppStatus(salon)
	if st.Subscription != "ACTIVE" && st.Subscription != "TRIAL" {
		return false
	}
	if st.Limit <= 0 {
		return false
	}
	var sent int
	res := db.DB.Raw(`INSERT INTO whatsapp_usages (salon_id, month, sent, updated_at)
		VALUES (?, ?, 1, now())
		ON CONFLICT (salon_id, month) DO UPDATE
		SET sent = whatsapp_usages.sent + 1, updated_at = now()
		WHERE whatsapp_usages.sent < ?
		RETURNING sent`, salonID, st.Month, st.Limit).Scan(&sent)
	return res.Error == nil && sent > 0
}

// GetSalonWhatsAppUsage — painel do salão: franquia mensal e status.
func GetSalonWhatsAppUsage(c *gin.Context) {
	var salon db.Salon
	if err := db.DB.First(&salon, "id = ?", c.GetString("salonId")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}
	c.JSON(http.StatusOK, getWhatsAppStatus(salon))
}

