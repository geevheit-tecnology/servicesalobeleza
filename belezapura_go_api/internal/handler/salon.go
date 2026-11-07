package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
		"appointmentsToday":  appointmentsToday,
		"revenue":            monthlyRevenue,
		"monthlyRevenue":     monthlyRevenue,
		"totalAppointments":  totalAppointments,
		"clientsCount":       totalClients,
		"totalClients":       totalClients,
		"prosCount":          totalProfessionals,
		"totalProfessionals": totalProfessionals,
		"servicesCount":      servicesCount,
		"recentAppointments": recentAppts,
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

	sub, subErr := db.CurrentSubscription(salonID)
	if subErr != nil {
		c.JSON(503, gin.H{"error": "Assinatura indisponível."})
		return
	}
	trialExpired := !sub.AllowsAccess(time.Now())
	daysRemaining := 0
	if sub.Status == "TRIAL" && sub.TrialEnds != nil && !trialExpired {
		daysRemaining = int(time.Until(*sub.TrialEnds).Hours()/24) + 1
	}

	resMap := gin.H{
		"address": salon.Address, "instagram": salon.Instagram, "pixName": salon.PixName,
		"depositPolicy": salon.DepositPolicy, "depositType": salon.DepositType, "depositValue": salon.DepositValue,
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
		"subscriptions":  []db.Subscription{sub},
		"trialExpired":   trialExpired,
		"daysRemaining":  daysRemaining,
		"trialTotalDays": 14,
		"timezone":       salon.Timezone, "blockedDates": salon.BlockedDates,
	}
	c.JSON(http.StatusOK, resMap)
}

// PUT /api/salon/details
func UpdateSalonDetails(c *gin.Context) {
	salonID := c.GetString("salonId")

	var salon db.Salon
	var body struct {
		Address       *db.Address `json:"address"`
		Phone         *string     `json:"phone" binding:"omitempty,max=30"`
		Instagram     *string     `json:"instagram" binding:"omitempty,max=100"`
		PixName       *string     `json:"pixName" binding:"omitempty,max=120"`
		DepositPolicy *string     `json:"depositPolicy"`
		DepositType   *string     `json:"depositType"`
		DepositValue  *float64    `json:"depositValue"`
		Name          *string     `json:"name"`
		PixKey        *string     `json:"pixKey"`
		Logo          *string     `json:"logo"`
		Cover         *string     `json:"cover"`
		Gallery       *string     `json:"gallery"`
		MainColor     *string     `json:"mainColor"`
		ScheduleRaw   *string     `json:"scheduleRaw"`
		Timezone      *string     `json:"timezone"`
		BlockedDates  *string     `json:"blockedDates"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&salon, "id = ?", salonID).Error; err != nil {
			return bookingError{404, "Salão não encontrado."}
		}
		if body.Name != nil && *body.Name != "" {
			salon.Name = *body.Name
		}
		if body.Address != nil {
			salon.Address = *body.Address
		}
		if body.Phone != nil {
			salon.Phone = body.Phone
		}
		if body.Instagram != nil {
			salon.Instagram = strings.TrimPrefix(strings.TrimSpace(*body.Instagram), "@")
		}
		if body.PixName != nil {
			salon.PixName = strings.TrimSpace(*body.PixName)
		}
		if body.DepositPolicy != nil {
			salon.DepositPolicy = *body.DepositPolicy
		}
		if body.DepositType != nil {
			salon.DepositType = *body.DepositType
		}
		if body.DepositValue != nil {
			salon.DepositValue = *body.DepositValue
		}
		if err := validateDepositConfiguration(salon.DepositPolicy, salon.DepositType, salon.DepositValue); err != nil {
			return bookingError{400, err.Error()}
		}
		if body.PixKey != nil {
			if strings.TrimSpace(*body.PixKey) != "" {
				if _, err := generatePix(*body.PixKey, pixBeneficiary(salon), 1); err != nil {
					return bookingError{400, "Chave Pix inválida."}
				}
			}
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
			if err := validateSchedule(*body.ScheduleRaw); err != nil {
				return bookingError{400, err.Error()}
			}
			salon.ScheduleRaw = *body.ScheduleRaw
		}

		if body.Timezone != nil {
			if _, err := time.LoadLocation(*body.Timezone); err != nil {
				return bookingError{400, "Fuso inválido."}
			}
			salon.Timezone = *body.Timezone
		}
		if body.BlockedDates != nil {
			var dates []string
			if json.Unmarshal([]byte(*body.BlockedDates), &dates) != nil {
				return bookingError{400, "Datas inválidas."}
			}
			for _, d := range dates {
				if _, err := time.Parse("2006-01-02", d); err != nil {
					return bookingError{400, "Data inválida."}
				}
			}
			salon.BlockedDates = *body.BlockedDates
		}
		return tx.Save(&salon).Error
	})
	if err != nil {
		bookingFailure(c, err)
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

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var salon db.Salon
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&salon, "id = ?", salonID).Error; err != nil {
			return err
		}
		var sub db.Subscription
		if err := tx.Where("salon_id = ?", salonID).Order("created_at desc, id desc").First(&sub).Error; err != nil {
			return err
		}
		return tx.Model(&sub).Updates(map[string]interface{}{"pending_plan_id": plan.ID, "requested_price": plan.Price}).Error
	})
	if err != nil {
		c.JSON(503, gin.H{"error": "Não foi possível registrar a solicitação."})
		return
	}
	writeAuditLog(c, "SUBSCRIPTION_REQUESTED", salonID, "Adesão/renovação solicitada para "+plan.Name, "info")
	c.JSON(http.StatusAccepted, gin.H{"message": "Solicitação registrada. Aguarde a conferência do pagamento pelo administrador.", "pending": true, "planName": plan.Name})
}

// POST /api/salon/clients
func CreateSalonClient(c *gin.Context) {
	salonID := c.GetString("salonId")
	var body struct {
		Name  string   `json:"name" binding:"required"`
		Phone *string  `json:"phone"`
		Tags  []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome do cliente é obrigatório."})
		return
	}

	tagsStr := strings.Join(body.Tags, ",")
	client := db.Client{
		SalonID: salonID,
		Name:    body.Name,
		Phone:   body.Phone,
		Tags:    tagsStr,
		Status:  "active",
	}

	if err := db.DB.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao cadastrar cliente."})
		return
	}

	c.JSON(http.StatusCreated, client)
}

// PUT /api/salon/clients/:id
func UpdateSalonClient(c *gin.Context) {
	salonID := c.GetString("salonId")
	clientID := c.Param("id")

	var client db.Client
	if err := db.DB.Where("id = ? AND salon_id = ?", clientID, salonID).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cliente não encontrado."})
		return
	}

	var body struct {
		Name   *string  `json:"name"`
		Phone  *string  `json:"phone"`
		Status *string  `json:"status"`
		Tags   []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if body.Name != nil && *body.Name != "" {
		client.Name = *body.Name
	}
	if body.Phone != nil {
		client.Phone = body.Phone
	}
	if body.Status != nil && *body.Status != "" {
		client.Status = *body.Status
	}
	if body.Tags != nil {
		client.Tags = strings.Join(body.Tags, ",")
	}

	if err := db.DB.Save(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar cliente."})
		return
	}

	c.JSON(http.StatusOK, client)
}

// DELETE /api/salon/clients/:id
func DeleteSalonClient(c *gin.Context) {
	salonID := c.GetString("salonId")
	clientID := c.Param("id")
	mode := c.Query("mode")

	var client db.Client
	if err := db.DB.Where("id = ? AND salon_id = ?", clientID, salonID).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cliente não encontrado."})
		return
	}

	if mode == "inactive" {
		newStatus := "inactive"
		if client.Status == "inactive" {
			newStatus = "active"
		}
		client.Status = newStatus
		db.DB.Save(&client)
		c.JSON(http.StatusOK, gin.H{"message": "Status do cliente atualizado.", "status": newStatus})
		return
	}

	client.Status = "deleted"
	db.DB.Save(&client)
	c.JSON(http.StatusOK, gin.H{"message": "Cliente excluído com sucesso."})
}
