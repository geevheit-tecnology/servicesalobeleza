package middleware

import (
	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/identity"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"os"
	"strings"
	"time"
)

type Claims struct {
	UserID  string `json:"userId"`
	SalonID string `json:"salonId"`
	Role    string `json:"role"`
	Name    string `json:"name"`
	Version int    `json:"version"`
	jwt.RegisteredClaims
}

func ValidateSecret() error {
	s := os.Getenv("JWT_SECRET")
	if len(s) < 32 || s == "super-secret-key-geevheithair" {
		return errors.New("JWT_SECRET deve conter pelo menos 32 caracteres e não pode ser o segredo de exemplo")
	}
	return nil
}
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		parts := strings.Fields(c.GetHeader("Authorization"))
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || ValidateSecret() != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Autenticação inválida."})
			return
		}
		claims := &Claims{}
		external := identity.HasSupabaseIssuer(parts[1])
		if external {
			provider, err := identity.FromEnv()
			if err != nil {
				c.AbortWithStatusJSON(503, gin.H{"error": "Autenticação indisponível."})
				return
			}
			user, err := provider.GetUser(c.Request.Context(), parts[1])
			if errors.Is(err, identity.ErrUnavailable) {
				c.AbortWithStatusJSON(503, gin.H{"error": "Autenticação indisponível."})
				return
			}
			if err != nil {
				c.AbortWithStatusJSON(401, gin.H{"error": "Token inválido ou expirado."})
				return
			}
			claims.UserID = user.ID
		} else {
			token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) { return []byte(os.Getenv("JWT_SECRET")), nil }, jwt.WithValidMethods([]string{"HS256"}), jwt.WithExpirationRequired(), jwt.WithIssuer("belezapura"))
			if err != nil || !token.Valid || claims.UserID == "" || claims.IssuedAt == nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado."})
				return
			}
		}
		var user db.User
		if err := db.DB.First(&user, "id = ?", claims.UserID).Error; err != nil || user.Status != "active" || (!external && (user.TokenVersion != claims.Version || user.AuthProvider != "local")) || (external && user.AuthProvider != "supabase") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Sessão revogada ou usuário inativo."})
			return
		}
		salonID := ""
		if user.SalonID != nil {
			salonID = *user.SalonID
		}
		if (!external && (user.Role != claims.Role || salonID != claims.SalonID)) || (user.Role != "superadmin" && salonID == "") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Permissões alteradas. Entre novamente."})
			return
		}
		if salonID != "" {
			var salon db.Salon
			if db.DB.First(&salon, "id = ?", salonID).Error != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Salão indisponível."})
				return
			}
		}
		c.Set("userId", user.ID)
		c.Set("salonId", salonID)
		c.Set("role", user.Role)
		c.Next()
	}
}
func SuperAdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != "superadmin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Acesso restrito ao superadmin."})
			return
		}
		c.Next()
	}
}
func SalonRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("salonId") == "" || c.GetString("role") != "owner" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Acesso restrito ao responsável do salão."})
			return
		}
		c.Next()
	}
}
func GenerateToken(userID, salonID, role, name string) (string, error) {
	if err := ValidateSecret(); err != nil {
		return "", err
	}
	var user db.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return "", err
	}
	if user.AuthProvider != "local" {
		return "", errors.New("usuário exige autenticação Supabase")
	}
	now := time.Now()
	claims := &Claims{UserID: userID, SalonID: salonID, Role: role, Name: name, Version: user.TokenVersion, RegisteredClaims: jwt.RegisteredClaims{Issuer: "belezapura", Subject: userID, IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(8 * time.Hour))}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(os.Getenv("JWT_SECRET")))
}
