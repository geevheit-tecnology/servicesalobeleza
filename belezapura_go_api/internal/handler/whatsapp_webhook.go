package handler

import (
	"crypto/subtle"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/whatsapp"
)

func validWhatsAppWebhookSecret(c *gin.Context) bool {
	expected := strings.TrimSpace(os.Getenv("WHATSAPP_WEBHOOK_SECRET"))
	if expected == "" {
		expected = strings.TrimSpace(os.Getenv("WHATSAPP_API_KEY"))
	}
	if len(expected) < 16 {
		return false
	}
	provided := strings.TrimSpace(c.GetHeader("X-Webhook-Token"))
	if provided == "" {
		provided = strings.TrimSpace(c.GetHeader("apikey"))
	}
	if provided == "" {
		if parts := strings.Fields(c.GetHeader("Authorization")); len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			provided = strings.TrimSpace(parts[1])
		}
	}
	if provided == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) == 1
}

// WhatsAppWebhookHandler processa respostas de clientes recebidas pelo Evolution API
func WhatsAppWebhookHandler(c *gin.Context) {
	if !validWhatsAppWebhookSecret(c) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Webhook não autorizado."})
		return
	}

	var payload struct {
		Event   string `json:"event"`
		SalonID string `json:"salonId"`
		Data    struct {
			Key struct {
				RemoteJid string `json:"remoteJid"`
				FromMe    bool   `json:"fromMe"`
			} `json:"key"`
			Message struct {
				Conversation        string `json:"conversation"`
				ExtendedTextMessage struct {
					Text string `json:"text"`
				} `json:"extendedTextMessage"`
			} `json:"message"`
		} `json:"data"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "reason": "invalid_payload"})
		return
	}

	// Ignora mensagens enviadas pelo próprio bot
	if payload.Data.Key.FromMe {
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "reason": "from_me"})
		return
	}

	text := strings.TrimSpace(payload.Data.Message.Conversation)
	if text == "" {
		text = strings.TrimSpace(payload.Data.Message.ExtendedTextMessage.Text)
	}

	remote := payload.Data.Key.RemoteJid
	phone := strings.Split(remote, "@")[0]
	phone = whatsapp.CleanPhoneNumber(phone)

	if len(phone) < 10 || text == "" {
		c.JSON(http.StatusOK, gin.H{"status": "ignored"})
		return
	}

	salonID := strings.TrimSpace(c.Query("salonId"))
	if salonID == "" {
		salonID = strings.TrimSpace(payload.SalonID)
	}

	lowerText := strings.ToLower(text)
	log.Printf("[WhatsApp Webhook] Mensagem recebida de %s: %s", phone, text)

	// Busca o cliente pelo telefone (restrito ao salão se informado e com WhatsApp ativo)
	var client db.Client
	clientQuery := db.DB.Where("phone LIKE ? AND status <> ?", "%"+phone[len(phone)-8:], "deleted")
	if salonID != "" {
		clientQuery = clientQuery.Where("salon_id = ?", salonID)
	} else {
		clientQuery = clientQuery.Where("salon_id IN (SELECT id FROM salons WHERE whatsapp_enabled = true AND deleted_at IS NULL)")
	}
	if err := clientQuery.Order("created_at DESC").First(&client).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "client_not_found"})
		return
	}

	// Busca o agendamento mais recente em aberto do cliente naquele salão
	var appt db.Appointment
	now := time.Now()
	if err := db.DB.Where("salon_id = ? AND client_id = ? AND date >= ? AND status IN ('waiting', 'confirmed')", client.SalonID, client.ID, now.Add(-2*time.Hour)).Order("date ASC").First(&appt).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "no_pending_appointment"})
		return
	}

	if lowerText == "1" || strings.Contains(lowerText, "confirm") || strings.Contains(lowerText, "sim") {
		db.DB.Model(&appt).Update("status", "confirmed")
		log.Printf("[WhatsApp Auto] Agendamento %s confirmado via WhatsApp por %s", appt.ID, phone)
		if consumeWhatsAppQuota(appt.SalonID) {
			_ = whatsapp.SendTextMessage(phone, "Perfeito! Sua presença está *confirmada*. Te esperamos!")
		}
	} else if lowerText == "2" || strings.Contains(lowerText, "cancel") || strings.Contains(lowerText, "não") {
		db.DB.Model(&appt).Update("status", "cancelled")
		log.Printf("[WhatsApp Auto] Agendamento %s cancelado via WhatsApp por %s", appt.ID, phone)
		if consumeWhatsAppQuota(appt.SalonID) {
			_ = whatsapp.SendTextMessage(phone, "Seu agendamento foi *cancelado*. Caso queira reagendar, acesse o link do salão quando preferir.")
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "processed"})
}
