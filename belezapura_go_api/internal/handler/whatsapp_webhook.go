package handler

import (
	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/whatsapp"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
	"time"
)

// WhatsAppWebhookHandler processa respostas de clientes recebidas pelo Evolution API
func WhatsAppWebhookHandler(c *gin.Context) {
	var payload struct {
		Event string `json:"event"`
		Data  struct {
			Key struct {
				RemoteJid string `json:"remoteJid"`
				FromMe    bool   `json:"fromMe"`
			} `json:"key"`
			Message struct {
				Conversation string `json:"conversation"`
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

	if phone == "" || text == "" {
		c.JSON(http.StatusOK, gin.H{"status": "ignored"})
		return
	}

	lowerText := strings.ToLower(text)
	log.Printf("[WhatsApp Webhook] Mensagem recebida de %s: %s", phone, text)

	// Busca o cliente pelo telefone
	var client db.Client
	if err := db.DB.Where("phone LIKE ?", "%"+phone[len(phone)-8:]).Order("created_at DESC").First(&client).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "client_not_found"})
		return
	}

	// Busca o agendamento mais recente em aberto do cliente
	var appt db.Appointment
	now := time.Now()
	if err := db.DB.Where("client_id = ? AND date >= ? AND status IN ('waiting', 'confirmed')", client.ID, now.Add(-2*time.Hour)).Order("date ASC").First(&appt).Error; err != nil {
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

