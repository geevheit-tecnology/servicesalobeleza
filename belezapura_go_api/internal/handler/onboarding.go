package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

type serviceReq struct {
	Name     string `json:"name"`
	Duration string `json:"duration"` // e.g. "45 min"
	Price    string `json:"price"`    // e.g. "R$ 50"
}

type professionalReq struct {
	Name      string `json:"name"`
	Specialty string `json:"specialty"`
}

type scheduleReq struct {
	Day   string `json:"day"`
	Open  bool   `json:"open"`
	Start string `json:"start"`
	End   string `json:"end"`
}

type onboardingRequest struct {
	SalonName     string            `json:"salonName" binding:"required"`
	Email         string            `json:"email" binding:"required,email"`
	Password      string            `json:"password" binding:"required,min=6"`
	PlanID        *string           `json:"planId"`
	PixKey        *string           `json:"pixKey"`
	Logo          *string           `json:"logo"`
	Cover         *string           `json:"cover"`
	Gallery       []string          `json:"gallery"`
	MainColor     *string           `json:"mainColor"`
	Services      []serviceReq      `json:"services"`
	Professionals []professionalReq `json:"professionals"`
	Schedule      []scheduleReq     `json:"schedule"`
}

// slugify converts a string to a URL-safe slug
func slugify(s string) string {
	// Normalize unicode
	t := transform.Chain(norm.NFD, transform.RemoveFunc(func(r rune) bool {
		return unicode.Is(unicode.Mn, r)
	}), norm.NFC)
	result, _, _ := transform.String(t, s)
	result = strings.ToLower(result)
	var b strings.Builder
	for _, r := range result {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			b.WriteRune('-')
		}
	}
	slug := strings.Trim(b.String(), "-")
	// Ensure uniqueness with timestamp suffix
	return slug + "-" + time.Now().Format("0601021504")
}

func parsePrice(p string) float64 {
	p = strings.ReplaceAll(p, "R$", "")
	p = strings.ReplaceAll(p, " ", "")
	p = strings.ReplaceAll(p, ".", "")
	p = strings.ReplaceAll(p, ",", ".")
	val, _ := strconv.ParseFloat(p, 64)
	return val
}

func parseDuration(d string) int {
	d = strings.ReplaceAll(d, "min", "")
	d = strings.ReplaceAll(d, " ", "")
	val, _ := strconv.Atoi(d)
	return val
}

func Onboarding(c *gin.Context) {
	var req onboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check duplicate email
	var existing db.User
	if err := db.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "E-mail já cadastrado."})
		return
	}

	slug := slugify(req.SalonName)

	var galleryJSON string
	if len(req.Gallery) > 0 {
		b, _ := json.Marshal(req.Gallery)
		galleryJSON = string(b)
	}

	var scheduleJSON string
	if len(req.Schedule) > 0 {
		b, _ := json.Marshal(req.Schedule)
		scheduleJSON = string(b)
	}

	salon := db.Salon{
		Name:        req.SalonName,
		Slug:        slug,
		PixKey:      req.PixKey,
		Logo:        req.Logo,
		Cover:       req.Cover,
		Gallery:     galleryJSON,
		MainColor:   req.MainColor,
		ScheduleRaw: scheduleJSON,
	}

	tx := db.DB.Begin()

	if err := tx.Create(&salon).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar salão."})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha."})
		return
	}

	user := db.User{
		Email:    req.Email,
		Password: string(hashed),
		Name:     "Admin " + req.SalonName,
		Role:     "owner",
		SalonID:  &salon.ID,
	}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário."})
		return
	}

	// Insert services
	for _, s := range req.Services {
		srv := db.Service{
			SalonID:  salon.ID,
			Name:     s.Name,
			Duration: parseDuration(s.Duration),
			Price:    parsePrice(s.Price),
		}
		tx.Create(&srv)
	}

	// Insert professionals
	for _, p := range req.Professionals {
		specialty := p.Specialty
		pro := db.Professional{
			SalonID:   salon.ID,
			Name:      p.Name,
			Specialty: &specialty,
			Status:    "active",
		}
		tx.Create(&pro)
	}

	// Create subscription if planId is provided
	if req.PlanID != nil && *req.PlanID != "" {
		sub := db.Subscription{
			SalonID: salon.ID,
			PlanID:  *req.PlanID,
			Status:  "ACTIVE",
		}
		tx.Create(&sub)
	}

	tx.Commit()

	// Generate JWT Token
	token, err := middleware.GenerateToken(user.ID, salon.ID, user.Role, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token de autenticação."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Cadastro realizado com sucesso!",
		"token":    token,
		"salonId":  salon.ID,
		"user": gin.H{
			"salonSlug": salon.Slug,
			"role":      user.Role,
		},
	})
}
