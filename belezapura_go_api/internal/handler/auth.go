package handler

import (
	"errors"
	"fmt"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/identity"
	"belezapura_go_api/internal/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

const (
	MaxLoginAttempts     = 5
	LoginLockoutDuration = 15 * time.Minute
)

type loginFailureRecord struct {
	attempts    int
	lockedUntil time.Time
	lastAttempt time.Time
}

var (
	loginTrackerMu sync.Mutex
	loginFailures  = make(map[string]*loginFailureRecord)
	lastCleanup    = time.Now()
)

func cleanupOldAttempts(now time.Time) {
	if now.Sub(lastCleanup) < 5*time.Minute {
		return
	}
	lastCleanup = now
	for k, v := range loginFailures {
		if now.After(v.lockedUntil) && now.Sub(v.lastAttempt) > 30*time.Minute {
			delete(loginFailures, k)
		}
	}
}

func checkLoginLock(cleanEmail, ip string, now time.Time) (bool, int) {
	loginTrackerMu.Lock()
	defer loginTrackerMu.Unlock()

	cleanupOldAttempts(now)

	var lockedUntil time.Time
	if rec, ok := loginFailures[cleanEmail]; ok && rec.attempts >= MaxLoginAttempts && now.Before(rec.lockedUntil) {
		lockedUntil = rec.lockedUntil
	} else if rec, ok := loginFailures["ip:"+ip]; ok && rec.attempts >= MaxLoginAttempts && now.Before(rec.lockedUntil) {
		lockedUntil = rec.lockedUntil
	}

	if !lockedUntil.IsZero() {
		remaining := lockedUntil.Sub(now)
		mins := int(math.Ceil(remaining.Minutes()))
		if mins < 1 {
			mins = 1
		}
		return true, mins
	}
	return false, 0
}

func recordFailedLoginAttempt(cleanEmail, ip string, now time.Time) int {
	loginTrackerMu.Lock()
	defer loginTrackerMu.Unlock()

	keys := []string{cleanEmail}
	if ip != "" {
		keys = append(keys, "ip:"+ip)
	}

	maxAttempts := 0
	for _, key := range keys {
		rec, exists := loginFailures[key]
		if !exists || (now.After(rec.lockedUntil) && now.Sub(rec.lastAttempt) > LoginLockoutDuration) {
			rec = &loginFailureRecord{
				attempts:    1,
				lastAttempt: now,
			}
			loginFailures[key] = rec
		} else {
			rec.attempts++
			rec.lastAttempt = now
		}

		if rec.attempts >= MaxLoginAttempts {
			rec.lockedUntil = now.Add(LoginLockoutDuration)
		}

		if rec.attempts > maxAttempts {
			maxAttempts = rec.attempts
		}
	}

	return maxAttempts
}

// ResetLoginAttempts limpa o histórico de tentativas (ex: após login bem-sucedido ou em testes)
func ResetLoginAttempts(cleanEmail, ip string) {
	loginTrackerMu.Lock()
	defer loginTrackerMu.Unlock()

	delete(loginFailures, cleanEmail)
	if ip != "" {
		delete(loginFailures, "ip:"+ip)
	}
}

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
	ip := c.ClientIP()
	now := time.Now()

	// 1. Trava de segurança: bloqueia tentativas se atingiu o limite de 5 falhas consecutivas
	if locked, mins := checkLoginLock(cleanEmail, ip, now); locked {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":             fmt.Sprintf("Muitas tentativas incorretas. Conta bloqueada temporariamente. Tente novamente em %d minuto(s).", mins),
			"locked":            true,
			"retryAfterMinutes": mins,
		})
		return
	}

	failLogin := func() {
		attempts := recordFailedLoginAttempt(cleanEmail, ip, time.Now())
		if attempts >= MaxLoginAttempts {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":             "Muitas tentativas incorretas. Conta bloqueada temporariamente por 15 minutos.",
				"locked":            true,
				"retryAfterMinutes": 15,
			})
			return
		}
		remaining := MaxLoginAttempts - attempts
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             fmt.Sprintf("Credenciais inválidas. Você tem mais %d tentativa(s) antes do bloqueio temporário.", remaining),
			"remainingAttempts": remaining,
		})
	}

	var user db.User
	if db.DB == nil || db.DB.Preload("Salon").Where("email = ? OR LOWER(email) = ?", cleanEmail, cleanEmail).First(&user).Error != nil {
		failLogin()
		return
	}

	if user.Status != "active" {
		failLogin()
		return
	}

	var token string
	if user.AuthProvider == "supabase" {
		provider, err := identity.FromEnv()
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Autenticação indisponível."})
			return
		}
		external, accessToken, err := provider.SignIn(c.Request.Context(), cleanEmail, req.Password)
		if errors.Is(err, identity.ErrUnavailable) {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Autenticação indisponível."})
			return
		}
		if err != nil || external.ID != user.ID || !strings.EqualFold(external.Email, user.Email) {
			failLogin()
			return
		}
		token = accessToken
	} else if user.AuthProvider != "local" || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		failLogin()
		return
	}

	// Login bem-sucedido: limpa o contador de falhas
	ResetLoginAttempts(cleanEmail, ip)

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
