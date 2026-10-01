package handler

import (
	"net/http"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
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

	var service db.Service
	db.DB.First(&service, "id = ?", body.ServiceID)

	appt := db.Appointment{
		SalonID:        salonID,
		ClientID:       body.ClientID,
		ProfessionalID: body.ProfessionalID,
		ServiceID:      body.ServiceID,
		Value:          service.Price,
		PaymentMethod:  body.PaymentMethod,
		Status:         "waiting",
	}

	if err := db.DB.Create(&appt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		Price    float64 `json:"price" binding:"required"`
		Duration int     `json:"duration" binding:"required"`
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
		Commission *float64 `json:"commission"`
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
		Commission: commission,
	}
	if err := db.DB.Create(&pro).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, pro)
}
