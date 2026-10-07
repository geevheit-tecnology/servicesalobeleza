package handler

import (
	"net/http"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
)

// GET /api/public/salons/:slug
func GetSalonBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var salon db.Salon
	if err := db.DB.
		Preload("Services", "status = ?", "active").
		Preload("Professionals", "status = ?", "active").
		Where("slug = ?", slug).
		First(&salon).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}
	c.JSON(http.StatusOK, salon)
}

// GET /api/public/availability?salonId=...&professionalId=...&date=2024-10-15
func GetAvailability(c *gin.Context) {
	salonID := c.Query("salonId")
	professionalID := c.Query("professionalId")
	dateStr := c.Query("date")

	if salonID == "" || professionalID == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "salonId, professionalId and date are required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format (use YYYY-MM-DD)"})
		return
	}

	dayStart := date.Truncate(24 * time.Hour)
	dayEnd := dayStart.Add(24 * time.Hour)

	var booked []db.Appointment
	db.DB.Where(
		"salon_id = ? AND professional_id = ? AND date >= ? AND date < ? AND status != ?",
		salonID, professionalID, dayStart, dayEnd, "cancelled",
	).Find(&booked)

	bookedSlots := make([]string, 0, len(booked))
	for _, a := range booked {
		bookedSlots = append(bookedSlots, a.Date.Format("15:04"))
	}

	// Generate all 30-min slots from 08:00 to 20:00
	var allSlots []string
	t := dayStart.Add(8 * time.Hour)
	end := dayStart.Add(20 * time.Hour)
	for t.Before(end) {
		allSlots = append(allSlots, t.Format("15:04"))
		t = t.Add(30 * time.Minute)
	}

	bookedMap := make(map[string]bool)
	for _, s := range bookedSlots {
		bookedMap[s] = true
	}

	var available []string
	for _, s := range allSlots {
		if !bookedMap[s] {
			available = append(available, s)
		}
	}

	c.JSON(http.StatusOK, gin.H{"available": available, "booked": bookedSlots})
}

// POST /api/public/appointments
func CreatePublicAppointment(c *gin.Context) {
	var body struct {
		SalonID        string  `json:"salonId" binding:"required"`
		ProfessionalID string  `json:"professionalId" binding:"required"`
		ServiceID      string  `json:"serviceId" binding:"required"`
		ClientName     string  `json:"clientName" binding:"required"`
		ClientPhone    string  `json:"clientPhone"`
		Date           string  `json:"date" binding:"required"` // "2024-10-15T10:00:00Z"
		PaymentMethod  *string `json:"paymentMethod"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse(time.RFC3339, body.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	var service db.Service
	if err := db.DB.First(&service, "id = ? AND salon_id = ? AND status = ?", body.ServiceID, body.SalonID, "active").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Serviço não encontrado."})
		return
	}

	var professional db.Professional
	if err := db.DB.First(&professional, "id = ? AND salon_id = ? AND status = ?", body.ProfessionalID, body.SalonID, "active").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profissional não encontrado."})
		return
	}

	// Upsert client
	var client db.Client
	db.DB.Where("salon_id = ? AND name = ?", body.SalonID, body.ClientName).FirstOrCreate(&client, db.Client{
		SalonID: body.SalonID,
		Name:    body.ClientName,
		Phone:   &body.ClientPhone,
	})

	appt := db.Appointment{
		SalonID:        body.SalonID,
		ClientID:       client.ID,
		ProfessionalID: body.ProfessionalID,
		ServiceID:      body.ServiceID,
		Date:           date,
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
