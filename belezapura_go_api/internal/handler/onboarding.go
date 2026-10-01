package handler

import (
	"net/http"
	"strings"
	"time"
	"unicode"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

type onboardingRequest struct {
	SalonName    string `json:"salonName" binding:"required"`
	OwnerName    string `json:"ownerName" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=6"`
	Phone        string `json:"phone"`
	Document     string `json:"document"`
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
	salon := db.Salon{
		Name:     req.SalonName,
		Slug:     slug,
		Document: &req.Document,
	}
	if err := db.DB.Create(&salon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar salão."})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha."})
		return
	}

	user := db.User{
		Email:    req.Email,
		Password: string(hashed),
		Name:     req.OwnerName,
		Role:     "owner",
		SalonID:  &salon.ID,
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Cadastro realizado com sucesso!",
		"salonId":  salon.ID,
		"salonSlug": salon.Slug,
	})
}
