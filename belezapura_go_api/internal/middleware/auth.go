package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID  string `json:"userId"`
	SalonID string `json:"salonId"`
	Role    string `json:"role"`
	Name    string `json:"name"`
	jwt.RegisteredClaims
}

func jwtSecret() []byte {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		s = "super-secret-key-belezapura"
	}
	return []byte(s)
}

// AuthRequired validates the Bearer JWT and injects claims into the context.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido."})
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token malformado."})
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) {
			return jwtSecret(), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado."})
			return
		}

		c.Set("userId", claims.UserID)
		c.Set("salonId", claims.SalonID)
		c.Set("role", claims.Role)
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

// GenerateToken creates a signed JWT for the given user.
func GenerateToken(userID, salonID, role, name string) (string, error) {
	claims := &Claims{
		UserID:  userID,
		SalonID: salonID,
		Role:    role,
		Name:    name,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}
