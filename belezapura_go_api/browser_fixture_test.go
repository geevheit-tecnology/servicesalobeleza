package main

import (
	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"
	"encoding/json"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"os"
	"testing"
)

func TestPrepareBrowser(t *testing.T) {
	path := os.Getenv("BROWSER_FIXTURE_PATH")
	if path == "" {
		t.Skip("BROWSER_FIXTURE_PATH não informado")
	}
	setupDatabase(t)
	var plan db.Plan
	db.DB.Where("name = ?", "Studio").First(&plan)
	a := makeFixture(t, plan)
	b := makeFixture(t, plan)
	key := "123e4567-e12b-12d1-a456-426655440000"
	db.DB.Model(&a.salon).Update("pix_key", key)
	hash, _ := bcrypt.GenerateFromPassword([]byte("test-password-123"), bcrypt.MinCost)
	admin := db.User{Email: uuid.NewString() + "@example.test", Name: "Admin Teste", Role: "superadmin", Status: "active", Password: string(hash)}
	mustCreate(t, &admin)
	token, err := middleware.GenerateToken(admin.ID, "", admin.Role, admin.Name)
	if err != nil {
		t.Fatal(err)
	}
	data := map[string]interface{}{"owner": map[string]string{"email": a.user.Email, "password": "test-password-123", "token": a.token, "salonId": a.salon.ID, "slug": a.salon.Slug}, "other": map[string]string{"email": b.user.Email, "password": "test-password-123", "token": b.token}, "admin": map[string]string{"email": admin.Email, "password": "test-password-123", "token": token}, "subscriptionId": a.sub.ID, "planId": plan.ID, "planPrice": plan.Price, "serviceId": a.service.ID, "professionalId": a.pro.ID, "date": tomorrow(10).Format("2006-01-02")}
	raw, _ := json.MarshalIndent(data, "", "  ")
	if err := os.WriteFile(path, raw, 0600); err != nil {
		t.Fatal(err)
	}
	t.Log("Fixture sintética de navegador preparada.")
}
