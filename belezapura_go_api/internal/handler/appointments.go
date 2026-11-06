package handler

import (
	"fmt"
	"gorm.io/gorm/clause"
	"net/http"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// POST /api/appointments
func CreateAppointment(c *gin.Context) {
	salonID := c.GetString("salonId")
	var body struct {
		ClientID       string  `json:"clientId" binding:"required"`
		ProfessionalID string  `json:"professionalId" binding:"required"`
		ServiceID      string  `json:"serviceId" binding:"required"`
		Date           string  `json:"date" binding:"required"`
		PaymentMethod  *string `json:"paymentMethod"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse(time.RFC3339, body.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido."})
		return
	}

	appt := db.Appointment{SalonID: salonID, ClientID: body.ClientID, ProfessionalID: body.ProfessionalID, ServiceID: body.ServiceID, Date: date, PaymentMethod: body.PaymentMethod}
	if err := db.DB.Transaction(func(tx *gorm.DB) error { return reserve(tx, &appt, "", "") }); err != nil {
		bookingFailure(c, err)
		return
	}

	c.JSON(http.StatusCreated, appt)
}

// GET /api/appointments
func ListAppointments(c *gin.Context) {
	salonID := c.GetString("salonId")

	var appts []db.Appointment
	db.DB.
		Preload("Client").
		Preload("Professional").
		Preload("Service").
		Where("salon_id = ?", salonID).
		Order("date desc").
		Find(&appts)

	c.JSON(http.StatusOK, appts)
}

// POST /api/services
func CreateService(c *gin.Context) {
	salonID := c.GetString("salonId")
	var body struct {
		Name     string  `json:"name" binding:"required"`
		Price    float64 `json:"price" binding:"gte=0,lte=99999999"`
		Duration int     `json:"duration" binding:"gte=1,lte=1440"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	svc := db.Service{
		SalonID:  salonID,
		Name:     body.Name,
		Price:    body.Price,
		Duration: body.Duration,
	}
	if err := db.DB.Create(&svc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, svc)
}

// POST /api/professionals
func CreateProfessional(c *gin.Context) {
	salonID := c.GetString("salonId")
	var body struct {
		Name       string   `json:"name" binding:"required"`
		Specialty  *string  `json:"specialty"`
		Avatar     *string  `json:"avatar"`
		Commission *float64 `json:"commission" binding:"omitempty,gte=0,lte=100"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	commission := 0.0
	if body.Commission != nil {
		commission = *body.Commission
	}

	pro := db.Professional{
		SalonID:    salonID,
		Name:       body.Name,
		Specialty:  body.Specialty,
		Avatar:     body.Avatar,
		Commission: commission,
		Status:     "active",
	}
	if err := db.DB.Transaction(func(tx *gorm.DB) error {
		if err := ensureProfessionalCapacity(tx, salonID, ""); err != nil {
			return err
		}
		return tx.Create(&pro).Error
	}); err != nil {
		bookingFailure(c, err)
		return
	}

	c.JSON(http.StatusCreated, pro)
}

// PUT /api/services/:id
func UpdateService(c *gin.Context) {
	salonID := c.GetString("salonId")
	serviceID := c.Param("id")

	var svc db.Service
	if err := db.DB.Where("id = ? AND salon_id = ?", serviceID, salonID).First(&svc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Serviço não encontrado."})
		return
	}

	var body struct {
		Name     *string  `json:"name"`
		Price    *float64 `json:"price" binding:"omitempty,gte=0,lte=99999999"`
		Duration *int     `json:"duration" binding:"omitempty,gte=1,lte=1440"`
		Status   *string  `json:"status" binding:"omitempty,oneof=active inactive"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if body.Name != nil && *body.Name != "" {
		svc.Name = *body.Name
	}
	if body.Price != nil {
		svc.Price = *body.Price
	}
	if body.Duration != nil {
		svc.Duration = *body.Duration
	}
	if body.Status != nil && *body.Status != "" {
		svc.Status = *body.Status
	}

	if err := db.DB.Save(&svc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar serviço."})
		return
	}

	c.JSON(http.StatusOK, svc)
}

// DELETE /api/services/:id
func DeleteService(c *gin.Context) {
	salonID := c.GetString("salonId")
	serviceID := c.Param("id")
	mode := c.Query("mode")

	var svc db.Service
	if err := db.DB.Where("id = ? AND salon_id = ?", serviceID, salonID).First(&svc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Serviço não encontrado."})
		return
	}

	if mode == "inactive" {
		newStatus := "inactive"
		if svc.Status == "inactive" {
			newStatus = "active"
		}
		svc.Status = newStatus
		db.DB.Save(&svc)
		c.JSON(http.StatusOK, gin.H{"message": "Status atualizado.", "status": newStatus})
		return
	}

	svc.Status = "deleted"
	db.DB.Save(&svc)
	c.JSON(http.StatusOK, gin.H{"message": "Serviço excluído com sucesso."})
}

// PUT /api/professionals/:id
func UpdateProfessional(c *gin.Context) {
	salonID := c.GetString("salonId")
	proID := c.Param("id")

	var pro db.Professional
	if err := db.DB.Where("id = ? AND salon_id = ?", proID, salonID).First(&pro).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profissional não encontrado."})
		return
	}

	var body struct {
		Name       *string  `json:"name"`
		Specialty  *string  `json:"specialty"`
		Avatar     *string  `json:"avatar"`
		Commission *float64 `json:"commission" binding:"omitempty,gte=0,lte=100"`
		Status     *string  `json:"status" binding:"omitempty,oneof=active inactive"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if body.Name != nil && *body.Name != "" {
		pro.Name = *body.Name
	}
	if body.Specialty != nil {
		pro.Specialty = body.Specialty
	}
	if body.Avatar != nil {
		pro.Avatar = body.Avatar
	}
	if body.Commission != nil {
		pro.Commission = *body.Commission
	}
	if body.Status != nil && *body.Status != "" {
		pro.Status = *body.Status
	}

	if err := db.DB.Transaction(func(tx *gorm.DB) error {
		if pro.Status == "active" {
			if err := ensureProfessionalCapacity(tx, salonID, pro.ID); err != nil {
				return err
			}
		}
		return tx.Save(&pro).Error
	}); err != nil {
		bookingFailure(c, err)
		return
	}

	c.JSON(http.StatusOK, pro)
}

// DELETE /api/professionals/:id
func DeleteProfessional(c *gin.Context) {
	salonID := c.GetString("salonId")
	proID := c.Param("id")
	mode := c.Query("mode")

	var pro db.Professional
	if err := db.DB.Where("id = ? AND salon_id = ?", proID, salonID).First(&pro).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profissional não encontrado."})
		return
	}

	if mode == "inactive" {
		newStatus := "inactive"
		if pro.Status == "inactive" {
			newStatus = "active"
		}
		pro.Status = newStatus
		if err := db.DB.Transaction(func(tx *gorm.DB) error {
			if pro.Status == "active" {
				if err := ensureProfessionalCapacity(tx, salonID, pro.ID); err != nil {
					return err
				}
			}
			return tx.Save(&pro).Error
		}); err != nil {
			bookingFailure(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Status atualizado.", "status": newStatus})
		return
	}

	pro.Status = "deleted"
	db.DB.Save(&pro)
	c.JSON(http.StatusOK, gin.H{"message": "Profissional excluído com sucesso."})
}

// PUT /api/appointments/:id
func UpdateAppointment(c *gin.Context) {
	salonID := c.GetString("salonId")
	apptID := c.Param("id")

	var appt db.Appointment
	if err := db.DB.Where("id = ? AND salon_id = ?", apptID, salonID).First(&appt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agendamento não encontrado."})
		return
	}

	var body struct {
		Status        *string  `json:"status"` // waiting | confirmed | cancelled | done
		PaymentMethod *string  `json:"paymentMethod"`
		Value         *float64 `json:"value"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if body.Status != nil && *body.Status != "" {
		if *body.Status != "waiting" && *body.Status != "confirmed" && *body.Status != "cancelled" && *body.Status != "done" {
			c.JSON(400, gin.H{"error": "Status inválido."})
			return
		}
		appt.Status = *body.Status
	}
	if body.PaymentMethod != nil {
		appt.PaymentMethod = body.PaymentMethod
	}
	if body.Value != nil {
		if *body.Value < 0 {
			c.JSON(400, gin.H{"error": "Valor inválido."})
			return
		}
		appt.Value = *body.Value
	}

	if err := db.DB.Save(&appt).Error; err != nil {
		bookingFailure(c, err)
		return
	}

	c.JSON(http.StatusOK, appt)
}

// DELETE /api/appointments/:id
func DeleteAppointment(c *gin.Context) {
	salonID := c.GetString("salonId")
	apptID := c.Param("id")

	var appt db.Appointment
	if err := db.DB.Where("id = ? AND salon_id = ?", apptID, salonID).First(&appt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agendamento não encontrado."})
		return
	}

	if err := db.DB.Delete(&appt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir agendamento."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento excluído com sucesso."})
}

func ensureProfessionalCapacity(tx *gorm.DB, salonID, exclude string) error {
	var salon db.Salon
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&salon, "id = ?", salonID).Error; err != nil {
		return err
	}
	var sub db.Subscription
	if err := tx.Preload("Plan").Where("salon_id = ?", salonID).Order("created_at desc,id desc").First(&sub).Error; err != nil {
		return err
	}
	if !sub.AllowsAccess(time.Now()) {
		return bookingError{402, "Assinatura suspensa ou vencida."}
	}
	if sub.Plan == nil {
		return bookingError{503, "Plano indisponível."}
	}
	if sub.Plan.MaxProfessionals > 0 {
		var n int64
		if err := tx.Model(&db.Professional{}).Where("salon_id = ? AND status = ? AND id::text <> ?", salonID, "active", exclude).Count(&n).Error; err != nil {
			return err
		}
		if n >= int64(sub.Plan.MaxProfessionals) {
			return bookingError{403, fmt.Sprintf("O plano permite até %d profissionais ativos.", sub.Plan.MaxProfessionals)}
		}
	}
	return nil
}
