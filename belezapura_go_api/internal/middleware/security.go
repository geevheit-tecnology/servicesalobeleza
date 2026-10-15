package middleware

import (
	"net/http"
	"sync"
	"time"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders adds standard web security headers to protect against XSS, clickjacking and MIME sniffing
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "SAMEORIGIN")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		c.Next()
	}
}

type clientRate struct {
	count     int
	resetTime time.Time
}

var (
	rateLimitMap = make(map[string]*clientRate)
	rateMutex    sync.Mutex
)

// RateLimiter limits requests by Client IP to prevent brute-force attacks and abuse
func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		rateMutex.Lock()
		client, exists := rateLimitMap[ip]
		if !exists || now.After(client.resetTime) {
			rateLimitMap[ip] = &clientRate{
				count:     1,
				resetTime: now.Add(window),
			}
			rateMutex.Unlock()
			c.Next()
			return
		}

		client.count++
		if client.count > maxRequests {
			rateMutex.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Muitas tentativas em pouco tempo. Por segurança, aguarde alguns instantes antes de tentar novamente.",
			})
			return
		}
		rateMutex.Unlock()
		c.Next()
	}
}

// TrialEnforcer verifies that the salon's 10-day trial is not expired for modifying actions
func TrialEnforcer() gin.HandlerFunc {
	return func(c *gin.Context) {
		salonID := c.GetString("salonId")
		role := c.GetString("role")

		// Superadmin is not restricted by salon subscription
		if role == "superadmin" || salonID == "" {
			c.Next()
			return
		}

		// Allow read-only operations (GET) so user can see dashboard / plans
		// Also allow upgrade-plan so expired salon can subscribe
		if c.Request.Method == http.MethodGet || c.Request.URL.Path == "/api/salon/upgrade-plan" {
			c.Next()
			return
		}

		var sub db.Subscription
		if err := db.DB.Where("salon_id = ?", salonID).Order("created_at desc").First(&sub).Error; err == nil {
			isExpired := sub.Status == "EXPIRED" || 
				(sub.Status == "TRIAL" && sub.TrialEnds != nil && time.Now().After(*sub.TrialEnds)) || 
				(sub.Status == "TRIAL" && sub.TrialEnds == nil && time.Since(sub.CreatedAt) > 14*24*time.Hour)

			if isExpired {
				c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{
					"error":        "TRIAL_EXPIRED",
					"message":      "O seu período de demonstração gratuita de 14 dias expirou. Para continuar utilizando o sistema, selecione um plano ativo.",
					"trialExpired": true,
				})
				return
			}
		}

		c.Next()
	}
}
