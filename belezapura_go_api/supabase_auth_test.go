package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Real isolated PostgreSQL and a simulated TLS identity provider, not Supabase production.
func TestSupabaseIdentityIntegration(t *testing.T) {
	setupDatabase(t)
	var plan db.Plan
	if err := db.DB.Where("name = ?", "Studio").First(&plan).Error; err != nil {
		t.Fatal(err)
	}
	f := makeFixture(t, plan)
	if err := db.DB.Model(&f.user).Updates(map[string]interface{}{"auth_provider": "supabase", "password": "disabled-external-account"}).Error; err != nil {
		t.Fatal(err)
	}
	var unavailable atomic.Bool
	var wrongIdentity atomic.Bool
	var userCalls atomic.Int64
	var currentToken string
	provider := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("apikey") != "test-publishable-key" {
			t.Error("missing public API key")
			w.WriteHeader(401)
			return
		}
		if unavailable.Load() {
			w.WriteHeader(503)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/auth/v1/token":
			var body map[string]string
			if r.Method != "POST" || r.URL.Query().Get("grant_type") != "password" || json.NewDecoder(r.Body).Decode(&body) != nil || body["email"] != f.user.Email || body["password"] != "existing-supabase-password" {
				w.WriteHeader(400)
				return
			}
			_ = json.NewEncoder(w).Encode(map[string]string{"access_token": currentToken})
		case "/auth/v1/user":
			userCalls.Add(1)
			if r.Header.Get("Authorization") != "Bearer "+currentToken {
				w.WriteHeader(401)
				return
			}
			id := f.user.ID
			if wrongIdentity.Load() {
				id = uuid.NewString()
			}
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "email": f.user.Email, "user_metadata": map[string]string{"role": "superadmin", "salonId": uuid.NewString()}})
		default:
			w.WriteHeader(404)
		}
	}))
	defer provider.Close()
	oldTransport := http.DefaultTransport
	http.DefaultTransport = provider.Client().Transport
	defer func() { http.DefaultTransport = oldTransport }()
	t.Setenv("SUPABASE_URL", provider.URL)
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "test-publishable-key")
	tokenFor := func(issuer, subject string) string {
		t.Helper()
		s, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"iss": issuer, "sub": subject, "exp": time.Now().Add(time.Hour).Unix(), "role": "superadmin"}).SignedString([]byte("simulated-provider-key"))
		if err != nil {
			t.Fatal(err)
		}
		return s
	}
	currentToken = tokenFor(provider.URL+"/auth/v1", f.user.ID)
	r := NewRouter()
	login := map[string]string{"email": f.user.Email, "password": "existing-supabase-password"}
	raw := expect(t, r, 200, "POST", "/api/auth/login", "", login)
	var result struct {
		Token string `json:"token"`
	}
	if json.Unmarshal(raw, &result) != nil || result.Token != currentToken {
		t.Fatal("login did not preserve external access token")
	}
	expect(t, r, 200, "GET", "/api/salon/details", result.Token, nil)
	expect(t, r, 403, "GET", "/api/superadmin/users", result.Token, nil)
	if strings.Contains(string(raw), "disabled-external-account") {
		t.Fatal("password leaked")
	}
	expect(t, r, 401, "POST", "/api/auth/login", "", map[string]string{"email": f.user.Email, "password": "wrong"})
	wrongIdentity.Store(true)
	expect(t, r, 401, "POST", "/api/auth/login", "", login)
	wrongIdentity.Store(false)
	expect(t, r, 401, "GET", "/api/salon/details", tokenFor(provider.URL+"/auth/v1", uuid.NewString()), nil)
	before := userCalls.Load()
	expect(t, r, 401, "GET", "/api/salon/details", tokenFor("https://other-project.supabase.co/auth/v1", f.user.ID), nil)
	if userCalls.Load() != before {
		t.Fatal("foreign issuer reached identity provider")
	}
	// A formerly valid local token must not bypass the external provider after migration.
	expect(t, r, 401, "GET", "/api/salon/details", f.token, nil)
	if _, err := middleware.GenerateToken(f.user.ID, f.salon.ID, "owner", f.user.Name); err == nil {
		t.Fatal("generated a local token for external identity")
	}
	if err := db.DB.Model(&f.user).Update("status", "blocked").Error; err != nil {
		t.Fatal(err)
	}
	expect(t, r, 401, "GET", "/api/salon/details", result.Token, nil)
	if err := db.DB.Model(&f.user).Update("status", "active").Error; err != nil {
		t.Fatal(err)
	}
	unavailable.Store(true)
	expect(t, r, 503, "GET", "/api/salon/details", result.Token, nil)
	expect(t, r, 503, "POST", "/api/auth/login", "", login)
	unavailable.Store(false)
	// Local administrator remains local; edits must not pretend to change an external password.
	admin := db.User{Email: uuid.NewString() + "@example.test", Name: "Admin", Role: "superadmin", Status: "active", Password: "unused"}
	mustCreate(t, &admin)
	adminToken, err := middleware.GenerateToken(admin.ID, "", admin.Role, admin.Name)
	if err != nil {
		t.Fatal(err)
	}
	expect(t, r, 400, "PUT", "/api/superadmin/users/"+f.user.ID, adminToken, map[string]string{"password": "not-applicable"})
	expect(t, r, 400, "PUT", "/api/superadmin/users/"+f.user.ID, adminToken, map[string]string{"email": "other@example.test"})
	// An authentic but unprovisioned identity receives no automatic account or elevated role.
	if err := db.DB.Delete(&f.user).Error; err != nil {
		t.Fatal(err)
	}
	expect(t, r, 401, "GET", "/api/salon/details", result.Token, nil)
	var count int64
	if err := db.DB.Model(&db.User{}).Where("id = ?", f.user.ID).Count(&count).Error; err != nil || count != 0 {
		t.Fatal("external identity was auto-provisioned")
	}
}
