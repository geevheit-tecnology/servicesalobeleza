package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/whatsapp"
)

func publicSalon(c *gin.Context, id string) (db.Salon, bool) {
	var salon db.Salon
	if db.DB.Preload("Services", "status = ?", "active").Preload("Professionals", "status = ?", "active").Where("id::text = ? OR slug = ?", id, id).First(&salon).Error != nil {
		c.JSON(404, gin.H{"error": "Salão não encontrado."})
		return salon, false
	}
	sub, err := db.CurrentSubscription(salon.ID)
	if err != nil {
		c.JSON(503, gin.H{"error": "Assinatura indisponível."})
		return salon, false
	}
	if !sub.AllowsAccess(time.Now()) {
		c.JSON(402, gin.H{"error": "Salão temporariamente suspenso.", "suspended": true})
		return salon, false
	}
	return salon, true
}
func GetSalonBySlug(c *gin.Context) {
	s, ok := publicSalon(c, c.Param("slug"))
	if !ok {
		return
	}
	for i := range s.Professionals {
		s.Professionals[i].Phone = nil
	}
	c.JSON(200, gin.H{"reviewsRaw": s.ReviewsRaw, "id": s.ID, "slug": s.Slug, "name": s.Name, "phone": s.Phone, "pixKey": s.PixKey, "logo": s.Logo, "cover": s.Cover, "gallery": s.Gallery, "mainColor": s.MainColor, "scheduleRaw": s.ScheduleRaw, "timezone": s.Timezone, "blockedDates": s.BlockedDates, "services": s.Services, "professionals": s.Professionals, "address": s.Address, "instagram": s.Instagram, "pixName": s.PixName, "depositPolicy": s.DepositPolicy, "depositType": s.DepositType, "depositValue": s.DepositValue})
}
func GetAvailability(c *gin.Context) {
	if c.Query("salonId") == "" || c.Query("professionalId") == "" || c.Query("serviceId") == "" || c.Query("date") == "" {
		c.JSON(400, gin.H{"error": "Informe salão, serviço, profissional e data."})
		return
	}
	s, ok := publicSalon(c, c.Query("salonId"))
	if !ok {
		return
	}
	loc, err := salonLocation(s)
	if err != nil {
		bookingFailure(c, err)
		return
	}
	date, err := time.ParseInLocation("2006-01-02", c.Query("date"), loc)
	if err != nil {
		c.JSON(400, gin.H{"error": "Data inválida."})
		return
	}
	var service db.Service
	var pro db.Professional
	if db.DB.Where("id = ? AND salon_id = ? AND status = ?", c.Query("serviceId"), s.ID, "active").First(&service).Error != nil || db.DB.Where("id = ? AND salon_id = ? AND status = ?", c.Query("professionalId"), s.ID, "active").First(&pro).Error != nil {
		c.JSON(404, gin.H{"error": "Serviço ou profissional não encontrado."})
		return
	}
	available := []string{}
	slots := map[string]string{}
	open, close, err := scheduleFor(s, date)
	if err != nil {
		c.JSON(200, gin.H{"available": available, "slots": slots})
		return
	}
	var booked []db.Appointment
	if err := db.DB.Where("salon_id = ? AND professional_id = ? AND date < ? AND ends_at > ? AND status <> ?", s.ID, pro.ID, close, open, "cancelled").Find(&booked).Error; err != nil {
		bookingFailure(c, err)
		return
	}
	if service.Duration <= 0 {
		c.JSON(409, gin.H{"error": "Duração inválida."})
		return
	}
	for t := open; !t.Add(time.Duration(service.Duration) * time.Minute).After(close); t = t.Add(30 * time.Minute) {
		if !t.After(time.Now()) {
			continue
		}
		end := t.Add(time.Duration(service.Duration) * time.Minute)
		free := true
		for _, a := range booked {
			if t.Before(a.EndsAt) && end.After(a.Date) {
				free = false
				break
			}
		}
		if free {
			label := t.Format("15:04")
			available = append(available, label)
			slots[label] = t.Format(time.RFC3339)
		}
	}
	c.JSON(200, gin.H{"available": available, "slots": slots, "timezone": s.Timezone})
}
func CreatePublicAppointment(c *gin.Context) {
	var body struct {
		SalonID        string  `json:"salonId" binding:"required"`
		ProfessionalID string  `json:"professionalId" binding:"required"`
		ServiceID      string  `json:"serviceId" binding:"required"`
		ClientName     string  `json:"clientName" binding:"required,max=120"`
		ClientPhone    string  `json:"clientPhone" binding:"required,min=8,max=30"`
		Date           string  `json:"date" binding:"required"`
		PaymentMethod  *string `json:"paymentMethod"`
		PayDeposit     *bool   `json:"payDeposit"`
	}
	if c.ShouldBindJSON(&body) != nil {
		c.JSON(400, gin.H{"error": "Informe seus dados, serviço, profissional e horário."})
		return
	}
	s, ok := publicSalon(c, body.SalonID)
	if !ok {
		return
	}
	date, err := time.Parse(time.RFC3339, body.Date)
	if err != nil {
		c.JSON(400, gin.H{"error": "Data inválida."})
		return
	}
	pix := ""
	deposit := 0.0
	appt := db.Appointment{SalonID: s.ID, ServiceID: body.ServiceID, ProfessionalID: body.ProfessionalID, Date: date, PaymentMethod: body.PaymentMethod}
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		var current db.Salon
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&current, "id = ?", s.ID).Error; err != nil {
			return err
		}
		var service db.Service
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND salon_id = ? AND status = ?", body.ServiceID, s.ID, "active").First(&service).Error; err != nil {
			return bookingError{404, "Serviço não encontrado."}
		}
		deposit = depositForService(current, service.Price, body.PayDeposit)
		if deposit > 0 {
			var pixErr error
			pix, pixErr = generatePix(*current.PixKey, pixBeneficiary(current), deposit)
			if pixErr != nil {
				return bookingError{409, "O salão precisa revisar a configuração Pix."}
			}
		}
		appt.Deposit = deposit
		return reserve(tx, &appt, strings.TrimSpace(body.ClientName), strings.TrimSpace(body.ClientPhone))
	})
	if err != nil {
		bookingFailure(c, err)
		return
	}
	paymentStatus := "pending_confirmation"
	message := "Reserva registrada. Aguarde a confirmação do salão."
	if deposit > 0 {
		paymentStatus = "pending_manual_review"
		message = "Reserva registrada. A confirmação do sinal será feita pelo salão."
	}

	var svc db.Service
	_ = db.DB.Select("name").First(&svc, "id = ?", body.ServiceID)
	var pro db.Professional
	_ = db.DB.Select("name").First(&pro, "id = ?", body.ProfessionalID)

	if consumeWhatsAppQuota(s.ID) {
		whatsapp.DispatchBookingNotification(
			body.ClientPhone,
			body.ClientName,
			s.Name,
			svc.Name,
			pro.Name,
			date.Format("02/01/2006 15:04"),
			pix,
			deposit,
		)
	}
	c.JSON(http.StatusCreated, gin.H{"appointment": gin.H{"id": appt.ID, "status": appt.Status, "date": appt.Date}, "pixCode": pix, "deposit": deposit, "paymentStatus": paymentStatus, "message": message})
}
