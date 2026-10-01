package handler

import (
	"net/http"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
)

// GET /api/salon/dashboard
func GetSalonDashboard(c *gin.Context) {
	salonID := c.GetString("salonId")

	var totalAppointments, totalClients, totalProfessionals int64
	db.DB.Model(&db.Appointment{}).Where("salon_id = ?", salonID).Count(&totalAppointments)
	db.DB.Model(&db.Client{}).Where("salon_id = ?", salonID).Count(&totalClients)
	db.DB.Model(&db.Professional{}).Where("salon_id = ? AND status = ?", salonID, "active").Count(&totalProfessionals)

	// Revenue this month
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	var monthlyRevenue float64
	db.DB.Model(&db.Appointment{}).
		Select("COALESCE(SUM(value), 0)").
		Where("salon_id = ? AND status = ? AND date >= ?", salonID, "done", monthStart).
		Scan(&monthlyRevenue)

	// Recent appointments
	var recentAppts []db.Appointment
	db.DB.
		Preload("Client").
		Preload("Professional").
		Preload("Service").
		Where("salon_id = ?", salonID).
		Order("date desc").
		Limit(10).
		Find(&recentAppts)

	c.JSON(http.StatusOK, gin.H{
		"totalAppointments":   totalAppointments,
		"totalClients":        totalClients,
		"totalProfessionals":  totalProfessionals,
		"monthlyRevenue":      monthlyRevenue,
		"recentAppointments":  recentAppts,
	})
}

// GET /api/salon/details
func GetSalonDetails(c *gin.Context) {
	salonID := c.GetString("salonId")

	var salon db.Salon
	if err := db.DB.
		Preload("Professionals").
		Preload("Services").
		Preload("Subscriptions").
		First(&salon, "id = ?", salonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}
	c.JSON(http.StatusOK, salon)
}

// GET /api/salon/clients
func GetSalonClients(c *gin.Context) {
	salonID := c.GetString("salonId")

	var clients []db.Client
	db.DB.Where("salon_id = ?", salonID).Order("name asc").Find(&clients)
	c.JSON(http.StatusOK, clients)
}
