package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// Invalid credentials must fail before any database lookup is possible.
func TestAuthRejectsInvalidCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)
	const secret = "test-only-random-secret-with-32-characters"
	t.Setenv("JWT_SECRET", secret)
	claims := func() Claims {
		return Claims{UserID: "test-user", RegisteredClaims: jwt.RegisteredClaims{
			Issuer: "belezapura", IssuedAt: jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		}}
	}
	sign := func(method jwt.SigningMethod, c Claims, key string) string {
		t.Helper()
		token, err := jwt.NewWithClaims(method, c).SignedString([]byte(key))
		if err != nil {
			t.Fatal(err)
		}
		return "Bearer " + token
	}
	expired, noExpiry, noIssuedAt, wrongIssuer, noUser := claims(), claims(), claims(), claims(), claims()
	expired.ExpiresAt = jwt.NewNumericDate(time.Now().Add(-time.Minute))
	noExpiry.ExpiresAt = nil
	noIssuedAt.IssuedAt = nil
	wrongIssuer.Issuer = "other-service"
	noUser.UserID = ""
	cases := map[string]string{
		"missing header": "", "malformed token": "Bearer invalid",
		"wrong scheme": "Basic abc", "extra fields": "Bearer abc def",
		"expired":           sign(jwt.SigningMethodHS256, expired, secret),
		"missing expiry":    sign(jwt.SigningMethodHS256, noExpiry, secret),
		"missing issued at": sign(jwt.SigningMethodHS256, noIssuedAt, secret),
		"wrong issuer":      sign(jwt.SigningMethodHS256, wrongIssuer, secret),
		"missing user":      sign(jwt.SigningMethodHS256, noUser, secret),
		"wrong signature":   sign(jwt.SigningMethodHS256, claims(), secret+"wrong"),
		"wrong algorithm":   sign(jwt.SigningMethodHS384, claims(), secret),
	}
	for name, header := range cases {
		t.Run(name, func(t *testing.T) {
			r := gin.New()
			r.GET("/protected", AuthRequired(), func(c *gin.Context) {
				t.Error("invalid credentials reached protected handler")
				c.Status(http.StatusOK)
			})
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			req.Header.Set("Authorization", header)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)
			if w.Code != http.StatusUnauthorized {
				t.Fatalf("got %d want 401: %s", w.Code, w.Body.String())
			}
		})
	}
}

func TestSecretRequired(t *testing.T) {
	for _, secret := range []string{"", "short", "super-secret-key-geevheithair"} {
		t.Setenv("JWT_SECRET", secret)
		if ValidateSecret() == nil {
			t.Fatal("accepted unsafe secret")
		}
	}
	t.Setenv("JWT_SECRET", "test-only-random-secret-with-32-characters")
	if err := ValidateSecret(); err != nil {
		t.Fatal(err)
	}
}
func TestRateLimitsAreIndependentAndRejectSpoofedProxy(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	_ = r.SetTrustedProxies(nil)
	r.GET("/one", RateLimiter(1, 1000000000), func(c *gin.Context) { c.Status(200) })
	r.GET("/two", RateLimiter(1, 1000000000), func(c *gin.Context) { c.Status(200) })
	for i, path := range []string{"/one", "/two", "/one"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("X-Forwarded-For", "1.2.3."+string(rune('1'+i)))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		want := 200
		if i == 2 {
			want = 429
		}
		if w.Code != want {
			t.Fatalf("request %d: got %d want %d", i, w.Code, want)
		}
	}
}
