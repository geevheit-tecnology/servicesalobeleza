package handler

import (
	"errors"
	"net/http"
	"strings"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/identity"
	"belezapura_go_api/internal/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))

	var user db.User
	if err := db.DB.Preload("Salon").Where("email = ? OR LOWER(email) = ?", cleanEmail, cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas."})
		return
	}

	if user.Status != "active" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas."})
		return
	}

	var token string
	if user.AuthProvider == "supabase" {
		provider, err := identity.FromEnv()
		if err != nil {
			c.JSON(503, gin.H{"error": "Autenticação indisponível."})
			return
		}
		external, accessToken, err := provider.SignIn(c.Request.Context(), cleanEmail, req.Password)
		if errors.Is(err, identity.ErrUnavailable) {
			c.JSON(503, gin.H{"error": "Autenticação indisponível."})
			return
		}
		if err != nil || external.ID != user.ID || !strings.EqualFold(external.Email, user.Email) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas."})
			return
		}
		token = accessToken
	} else if user.AuthProvider != "local" || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas."})
		return
	}

	salonID := ""
	salonSlug := ""
	if user.SalonID != nil {
		salonID = *user.SalonID
	}
	if user.Salon != nil {
		salonSlug = user.Salon.Slug
	}

	if token == "" {
		var err error
		token, err = middleware.GenerateToken(user.ID, salonID, user.Role, user.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token."})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"role":      user.Role,
			"salonSlug": salonSlug,
		},
	})
}
