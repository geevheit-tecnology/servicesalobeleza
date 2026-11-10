package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestLoginLockoutAfter5Attempts(t *testing.T) {
	gin.SetMode(gin.TestMode)

	const testEmail = "lockout-test@example.com"
	const testIP = "192.168.1.100"

	ResetLoginAttempts(testEmail, testIP)
	defer ResetLoginAttempts(testEmail, testIP)

	r := gin.New()
	r.POST("/api/auth/login", Login)

	// Attempts 1 to 4 should return 401 Unauthorized with remaining attempts
	for i := 1; i <= 4; i++ {
		w := httptest.NewRecorder()
		body, _ := json.Marshal(map[string]string{
			"email":    testEmail,
			"password": "wrong-password",
		})
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = testIP + ":12345"
		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Fatalf("attempt %d: expected 401, got %d (%s)", i, w.Code, w.Body.String())
		}

		var res map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &res)
		expectedRemaining := float64(MaxLoginAttempts - i)
		if res["remainingAttempts"] != expectedRemaining {
			t.Fatalf("attempt %d: expected remainingAttempts %v, got %v", i, expectedRemaining, res["remainingAttempts"])
		}
	}

	// 5th attempt must trigger lockout with 429 Too Many Requests
	{
		w := httptest.NewRecorder()
		body, _ := json.Marshal(map[string]string{
			"email":    testEmail,
			"password": "wrong-password",
		})
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = testIP + ":12345"
		r.ServeHTTP(w, req)

		if w.Code != http.StatusTooManyRequests {
			t.Fatalf("attempt 5: expected 429, got %d (%s)", w.Code, w.Body.String())
		}

		var res map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &res)
		if res["locked"] != true {
			t.Fatalf("attempt 5: expected locked true, got %v", res["locked"])
		}
	}

	// 6th attempt immediately rejected as 429 without db lookup
	{
		w := httptest.NewRecorder()
		body, _ := json.Marshal(map[string]string{
			"email":    testEmail,
			"password": "even-if-correct",
		})
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = testIP + ":12345"
		r.ServeHTTP(w, req)

		if w.Code != http.StatusTooManyRequests {
			t.Fatalf("attempt 6: expected 429, got %d (%s)", w.Code, w.Body.String())
		}
	}

	// Resetting attempts unblocks
	ResetLoginAttempts(testEmail, testIP)
	locked, _ := checkLoginLock(testEmail, testIP, time.Now())
	if locked {
		t.Fatalf("expected unlocked after reset")
	}
}

