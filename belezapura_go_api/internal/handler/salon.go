package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
)

// GET /api/salon/dashboard
func GetSalonDashboard(c *gin.Context) {
	salonID := c.GetString("salonId")

	var totalAppointments, totalClients, totalProfessionals, servicesCount, appointmentsToday int64
	db.DB.Model(&db.Appointment{}).Where("salon_id = ?", salonID).Count(&totalAppointments)
	db.DB.Model(&db.Client{}).Where("salon_id = ? AND status <> ?", salonID, "deleted").Count(&totalClients)
	db.DB.Model(&db.Professional{}).Where("salon_id = ? AND status = ?", salonID, "active").Count(&totalProfessionals)
	db.DB.Model(&db.Service{}).Where("salon_id = ? AND status <> ?", salonID, "deleted").Count(&servicesCount)

	// Revenue this month & today's appointments
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)
	db.DB.Model(&db.Appointment{}).Where("salon_id = ? AND date >= ? AND date < ?", salonID, todayStart, todayEnd).Count(&appointmentsToday)

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
		"appointmentsToday":   appointmentsToday,
		"revenue":             monthlyRevenue,
		"monthlyRevenue":      monthlyRevenue,
		"totalAppointments":   totalAppointments,
		"clientsCount":        totalClients,
		"totalClients":        totalClients,
		"prosCount":           totalProfessionals,
		"totalProfessionals":  totalProfessionals,
		"servicesCount":       servicesCount,
		"recentAppointments":  recentAppts,
	})
}

// GET /api/salon/details
func GetSalonDetails(c *gin.Context) {
	salonID := c.GetString("salonId")

	var salon db.Salon
	if err := db.DB.
		Preload("Professionals", "status <> ?", "deleted").
		Preload("Services", "status <> ?", "deleted").
		Preload("Subscriptions.Plan").
		First(&salon, "id = ?", salonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}

	// Calculate 10-day trial status
	trialExpired := false
	daysRemaining := 10
	if len(salon.Subscriptions) > 0 {
		sub := &salon.Subscriptions[0]
		if sub.Status == "TRIAL" {
			limit := sub.CreatedAt.Add(10 * 24 * time.Hour)
			if sub.TrialEnds != nil {
				limit = *sub.TrialEnds
			}
			if time.Now().After(limit) {
				trialExpired = true
				daysRemaining = 0
				sub.Status = "EXPIRED"
				db.DB.Model(sub).Update("status", "EXPIRED")
			} else {
				remaining := time.Until(limit)
				daysRemaining = int(remaining.Hours() / 24)
				if daysRemaining < 1 && remaining > 0 {
					daysRemaining = 1
				}
			}
		} else if sub.Status == "EXPIRED" {
			trialExpired = true
			daysRemaining = 0
		}
	}

	resMap := gin.H{
		"id":             salon.ID,
		"slug":           salon.Slug,
		"name":           salon.Name,
		"document":       salon.Document,
		"phone":          salon.Phone,
		"pixKey":         salon.PixKey,
		"logo":           salon.Logo,
		"cover":          salon.Cover,
		"gallery":        salon.Gallery,
		"mainColor":      salon.MainColor,
		"scheduleRaw":    salon.ScheduleRaw,
		"professionals":  salon.Professionals,
		"services":       salon.Services,
		"subscriptions":  salon.Subscriptions,
		"trialExpired":   trialExpired,
		"daysRemaining":  daysRemaining,
		"trialTotalDays": 10,
	}
	c.JSON(http.StatusOK, resMap)
}

// PUT /api/salon/details
func UpdateSalonDetails(c *gin.Context) {
	salonID := c.GetString("salonId")

	var salon db.Salon
	if err := db.DB.First(&salon, "id = ?", salonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}

	var body struct {
		Name        *string `json:"name"`
		PixKey      *string `json:"pixKey"`
		Logo        *string `json:"logo"`
		Cover       *string `json:"cover"`
		Gallery     *string `json:"gallery"`
		MainColor   *string `json:"mainColor"`
		ScheduleRaw *string `json:"scheduleRaw"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Name != nil && *body.Name != "" {
		salon.Name = *body.Name
	}
	if body.PixKey != nil {
		salon.PixKey = body.PixKey
	}
	if body.Logo != nil {
		salon.Logo = body.Logo
	}
	if body.Cover != nil {
		salon.Cover = body.Cover
	}
	if body.Gallery != nil {
		salon.Gallery = *body.Gallery
	}
	if body.MainColor != nil {
		salon.MainColor = body.MainColor
	}
	if body.ScheduleRaw != nil {
		salon.ScheduleRaw = *body.ScheduleRaw
	}

	if err := db.DB.Save(&salon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar dados do salão."})
		return
	}

	c.JSON(http.StatusOK, salon)
}

// GET /api/salon/clients
func GetSalonClients(c *gin.Context) {
	salonID := c.GetString("salonId")

	var clients []db.Client
	db.DB.Where("salon_id = ? AND status <> ?", salonID, "deleted").Order("name asc").Find(&clients)
	c.JSON(http.StatusOK, clients)
}

// POST /api/salon/upgrade-plan
func UpgradePlan(c *gin.Context) {
	salonID := c.GetString("salonId")
	var body struct {
		PlanID   string `json:"planId"`
		PlanName string `json:"planName"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	var plan db.Plan
	query := db.DB
	if body.PlanID != "" {
		query = query.Where("id = ?", body.PlanID)
	} else if body.PlanName != "" {
		query = query.Where("LOWER(name) = ?", strings.ToLower(body.PlanName))
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Plano não informado."})
		return
	}

	if err := query.First(&plan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plano selecionado não foi encontrado."})
		return
	}

	// Check subscriber spots limit (10 for Basic, 10 for Pro, 5 for Premium)
	if plan.MaxSubscriptions > 0 {
		var activeCount int64
		db.DB.Model(&db.Subscription{}).
			Where("plan_id = ? AND status IN (?) AND salon_id <> ?", plan.ID, []string{"ACTIVE", "TRIAL"}, salonID).
			Count(&activeCount)

		if int(activeCount) >= plan.MaxSubscriptions {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "PLAN_LIMIT_REACHED",
				"message": fmt.Sprintf("As %d vagas disponíveis para o plano %s foram esgotadas. Escolha outro plano disponível.", plan.MaxSubscriptions, plan.Name),
			})
			return
		}
	}

	// Update existing subscription or create a new active one
	var sub db.Subscription
	if err := db.DB.Where("salon_id = ?", salonID).Order("created_at desc").First(&sub).Error; err == nil {
		sub.PlanID = plan.ID
		sub.Status = "ACTIVE"
		sub.TrialEnds = nil
		if err := db.DB.Save(&sub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar plano."})
			return
		}
	} else {
		newSub := db.Subscription{
			SalonID: salonID,
			PlanID:  plan.ID,
			Status:  "ACTIVE",
		}
		if err := db.DB.Create(&newSub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar assinatura."})
			return
		}
	}

	writeAuditLog(c, "SALON_UPGRADED_PLAN", salonID, fmt.Sprintf("Salão realizou adesão ao plano %s (R$ %.2f)", plan.Name, plan.Price), "info")

	c.JSON(http.StatusOK, gin.H{
		"message":  "Plano atualizado com sucesso!",
		"planName": plan.Name,
		"plan":     plan,
	})
}
