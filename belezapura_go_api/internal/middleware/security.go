package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"belezapura_go_api/internal/db"
)

// RealClientIP extrai o IP real do cliente com suporte aos headers da Vercel
func RealClientIP(c *gin.Context) string {
	if ip := strings.TrimSpace(c.GetHeader("X-Vercel-Forwarded-For")); ip != "" {
		return strings.TrimSpace(strings.Split(ip, ",")[0])
	}
	if ip := strings.TrimSpace(c.GetHeader("X-Real-IP")); ip != "" {
		return ip
	}
	return c.ClientIP()
}

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

// RateLimiter limits requests by Client IP to prevent brute-force attacks and abuse
func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	rateLimitMap := make(map[string]*clientRate)
	var rateMutex sync.Mutex
	lastCleanup := time.Now()
	return func(c *gin.Context) {
		ip := RealClientIP(c)
		now := time.Now()

		rateMutex.Lock()
		if now.Sub(lastCleanup) >= window {
			for key, value := range rateLimitMap {
				if now.After(value.resetTime) {
					delete(rateLimitMap, key)
				}
			}
			lastCleanup = now
		}
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

// TrialEnforcer verifies that the salon's 14-day trial is not expired for modifying actions
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

		sub, err := db.CurrentSubscription(salonID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "Não foi possível validar a assinatura."})
			return
		}
		if !sub.AllowsAccess(time.Now()) {
			c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{"error": "SUBSCRIPTION_SUSPENDED", "message": "Assinatura suspensa ou vencida. Solicite a regularização do plano.", "trialExpired": true})
			return
		}
		c.Next()
	}
}
