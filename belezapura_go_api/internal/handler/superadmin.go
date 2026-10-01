package handler

import (
	"encoding/json"
	"net/http"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ─── Super Admin ─────────────────────────────────────────────────────────────

func GetOverview(c *gin.Context) {
	var totalSalons, totalAppointments, totalClients int64
	db.DB.Model(&db.Salon{}).Count(&totalSalons)
	db.DB.Model(&db.Appointment{}).Count(&totalAppointments)
	db.DB.Model(&db.Client{}).Count(&totalClients)

	var activeSubs []db.Subscription
	db.DB.Where("status = ?", "ACTIVE").Find(&activeSubs)
	var mrrValue float64
	for _, s := range activeSubs {
		mrrValue += s.Price
	}

	mrrData := []gin.H{
		{"name": "Jul", "value": 0},
		{"name": "Ago", "value": 0},
		{"name": "Set", "value": 0},
		{"name": "Out", "value": mrrValue},
	}

	c.JSON(http.StatusOK, gin.H{
		"totalSalons":       totalSalons,
		"totalAppointments": totalAppointments,
		"totalClients":      totalClients,
		"mrrData":           mrrData,
		"mrrValue":          mrrValue,
	})
}

func GetSalons(c *gin.Context) {
	var salons []db.Salon
	db.DB.Preload("Users").Preload("Subscriptions", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("created_at desc").Limit(1)
	}).Find(&salons)

	result := make([]gin.H, 0, len(salons))
	for _, s := range salons {
		var apptCount int64
		db.DB.Model(&db.Appointment{}).Where("salon_id = ?", s.ID).Count(&apptCount)

		owner := "Sem dono"
		if len(s.Users) > 0 {
			owner = s.Users[0].Name
		}
		plan := "Sem plano"
		status := "INACTIVE"
		if len(s.Subscriptions) > 0 {
			plan = s.Subscriptions[0].PlanID
			status = s.Subscriptions[0].Status
		}

		result = append(result, gin.H{
			"id":           s.ID,
			"name":         s.Name,
			"owner":        owner,
			"units":        1,
			"plan":         plan,
			"status":       status,
			"since":        s.CreatedAt.Format("02/01/2006"),
			"appointments": apptCount,
			"lastAccess":   s.UpdatedAt.Format("02/01/2006"),
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetSettings(c *gin.Context) {
	var settings db.SystemSettings
	if err := db.DB.First(&settings).Error; err != nil {
		// create defaults
		settings = db.SystemSettings{}
		db.DB.Create(&settings)
	}
	c.JSON(http.StatusOK, settings)
}

func UpdateSettings(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var settings db.SystemSettings
	if err := db.DB.First(&settings).Error; err != nil {
		settings = db.SystemSettings{}
		db.DB.Create(&settings)
	}

	db.DB.Model(&settings).Updates(body)
	c.JSON(http.StatusOK, settings)
}

// ─── Plans ────────────────────────────────────────────────────────────────────

type planResponse struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Price            float64  `json:"price"`
	Period           string   `json:"period"`
	Highlight        bool     `json:"highlight"`
	Features         []string `json:"features"`
	MaxProfessionals int      `json:"maxProfessionals"`
	Color            string   `json:"color"`
}

func planToResponse(p db.Plan) planResponse {
	var features []string
	_ = json.Unmarshal([]byte(p.Features), &features)
	return planResponse{
		ID:               p.ID,
		Name:             p.Name,
		Price:            p.Price,
		Period:           p.Period,
		Highlight:        p.Highlight,
		Features:         features,
		MaxProfessionals: p.MaxProfessionals,
		Color:            p.Color,
	}
}

func GetPlans(c *gin.Context) {
	var plans []db.Plan
	db.DB.Order("price asc").Find(&plans)

	resp := make([]planResponse, 0, len(plans))
	for _, p := range plans {
		resp = append(resp, planToResponse(p))
	}
	c.JSON(http.StatusOK, resp)
}

type planRequest struct {
	Name             string   `json:"name"`
	Price            float64  `json:"price"`
	Period           string   `json:"period"`
	Highlight        bool     `json:"highlight"`
	Features         []string `json:"features"`
	MaxProfessionals int      `json:"maxProfessionals"`
	Color            string   `json:"color"`
}

func CreatePlan(c *gin.Context) {
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	featuresJSON, _ := json.Marshal(req.Features)
	plan := db.Plan{
		Name:             req.Name,
		Price:            req.Price,
		Period:           req.Period,
		Highlight:        req.Highlight,
		Features:         string(featuresJSON),
		MaxProfessionals: req.MaxProfessionals,
		Color:            req.Color,
	}

	if err := db.DB.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, planToResponse(plan))
}

func UpdatePlan(c *gin.Context) {
	id := c.Param("id")
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var plan db.Plan
	if err := db.DB.First(&plan, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	featuresJSON, _ := json.Marshal(req.Features)
	db.DB.Model(&plan).Updates(db.Plan{
		Name:             req.Name,
		Price:            req.Price,
		Period:           req.Period,
		Highlight:        req.Highlight,
		Features:         string(featuresJSON),
		MaxProfessionals: req.MaxProfessionals,
		Color:            req.Color,
	})

	c.JSON(http.StatusOK, planToResponse(plan))
}

func DeletePlan(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&db.Plan{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
