package main

import (
	"belezapura_go_api/internal/db"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestOnboardingConfiguration(t *testing.T) {
	setupDatabase(t)
	r := NewRouter()
	var schedule []map[string]interface{}
	if err := json.Unmarshal([]byte(testSchedule), &schedule); err != nil {
		t.Fatal(err)
	}
	key := uuid.NewString()
	payload := map[string]interface{}{
		"salonName": "Studio configuração", "email": uuid.NewString() + "@example.test", "password": "test-password-123",
		"phone": "11999990000", "address": map[string]string{"zipCode": "01001000", "street": "Rua sintética", "number": "42", "district": "Centro", "city": "São Paulo", "state": "SP"},
		"instagram": "@studio_teste", "pixKey": key, "pixName": "FAVORECIDA TESTE",
		"depositPolicy": "required", "depositType": "fixed", "depositValue": 30,
		"services":      []map[string]interface{}{{"name": "Unhas", "cat": "Unhas", "duration": "1h30", "price": "85,50"}},
		"professionals": []map[string]string{{"name": "Profissional", "phone": "11911112222", "specialty": "Unhas"}}, "schedule": schedule,
	}
	code, raw := request(r, "POST", "/api/public/onboarding", "", payload)
	if code != 201 {
		t.Fatalf("onboarding: %d %s", code, raw)
	}
	var created struct {
		Token string `json:"token"`
		User  struct {
			SalonSlug string `json:"salonSlug"`
		} `json:"user"`
	}
	if err := json.Unmarshal(raw, &created); err != nil {
		t.Fatal(err)
	}
	var salon db.Salon
	if err := db.DB.Preload("Services").Preload("Professionals").Where("slug = ?", created.User.SalonSlug).First(&salon).Error; err != nil {
		t.Fatal(err)
	}
	if salon.Address.Street != "Rua sintética" || salon.Address.City != "São Paulo" || salon.Instagram != "studio_teste" || salon.PixName != "FAVORECIDA TESTE" || salon.DepositValue != 30 || salon.DepositType != "fixed" {
		t.Fatalf("configuração não persistiu: %+v", salon)
	}
	if len(salon.Services) != 1 || salon.Services[0].Duration != 90 || salon.Services[0].Price != 85.5 || salon.Services[0].Category != "Unhas" {
		t.Fatalf("serviço: %+v", salon.Services)
	}
	if len(salon.Professionals) != 1 || salon.Professionals[0].Phone == nil || *salon.Professionals[0].Phone != "11911112222" {
		t.Fatal("telefone não persistiu")
	}
	code, raw = request(r, "GET", "/api/public/salons/"+salon.Slug, "", nil)
	var public map[string]interface{}
	if err := json.Unmarshal(raw, &public); err != nil || code != 200 {
		t.Fatalf("página pública: %d %s", code, raw)
	}
	for _, pro := range public["professionals"].([]interface{}) {
		if _, exists := pro.(map[string]interface{})["phone"]; exists {
			t.Fatal("telefone privado exposto publicamente")
		}
	}
	booking := map[string]interface{}{"salonId": salon.ID, "professionalId": salon.Professionals[0].ID, "serviceId": salon.Services[0].ID, "clientName": "Cliente", "clientPhone": "11988887777", "payDeposit": false, "deposit": .01}
	baseDate := tomorrow(10)
	book := func(offset time.Duration, expected float64) {
		t.Helper()
		booking["date"] = baseDate.Add(offset).Format(time.RFC3339)
		status, body := request(r, "POST", "/api/public/appointments", "", booking)
		var result struct {
			Deposit     float64 `json:"deposit"`
			PixCode     string  `json:"pixCode"`
			Appointment struct {
				ID     string `json:"id"`
				Status string `json:"status"`
			} `json:"appointment"`
		}
		if err := json.Unmarshal(body, &result); err != nil || status != 201 || result.Deposit != expected {
			t.Fatalf("reserva: %d %s, esperado %.2f", status, body, expected)
		}
		if (expected > 0) != (result.PixCode != "") || result.Appointment.Status != "waiting" {
			t.Fatalf("Pix/status incorreto: %s", body)
		}
		var appt db.Appointment
		if err := db.DB.First(&appt, "id = ?", result.Appointment.ID).Error; err != nil || appt.Deposit != expected {
			t.Fatalf("sinal não persistido: %+v, %v", appt, err)
		}
	}
	// A cliente não consegue dispensar nem alterar o sinal obrigatório pelo payload.
	book(0, 30)
	update := func(policy, kind string, value float64) {
		t.Helper()
		code, raw := request(r, "PUT", "/api/salon/details", created.Token, map[string]interface{}{"depositPolicy": policy, "depositType": kind, "depositValue": value})
		if code != 200 {
			t.Fatalf("configuração: %d %s", code, raw)
		}
	}
	update("optional", "fixed", 30)
	book(2*time.Hour, 0)
	booking["payDeposit"] = true
	book(4*time.Hour, 30)
	update("required", "percentage", 25)
	book(6*time.Hour, 21.38)
	update("required", "fixed", 200)
	book(8*time.Hour, 85.5)
	update("none", "fixed", 30)
	book(24*time.Hour, 0)
	code, raw = request(r, "PUT", "/api/salon/details", created.Token, map[string]interface{}{"depositType": "percentage", "depositValue": 101})
	if code != 400 {
		t.Fatalf("percentual inválido aceito: %d %s", code, raw)
	}
	// Valores inválidos precisam falhar antes de criar salão/conta parcialmente.
	for i, invalid := range []map[string]interface{}{{"depositValue": -1}, {"depositPolicy": "automatic"}, {"services": []map[string]string{{"name": "Inválido", "duration": "1h90", "price": "85"}}}, {"services": []map[string]string{{"name": "Inválido", "duration": "60", "price": "NaN"}}}} {
		payload["email"] = fmt.Sprintf("invalid-%d-%s@example.test", i, uuid.NewString())
		delete(payload, "pixKey")
		copyPayload := map[string]interface{}{}
		for k, v := range payload {
			copyPayload[k] = v
		}
		for k, v := range invalid {
			copyPayload[k] = v
		}
		code, raw := request(r, "POST", "/api/public/onboarding", "", copyPayload)
		if code != 400 {
			t.Fatalf("inválido aceito: %d %s", code, raw)
		}
		var count int64
		db.DB.Model(&db.User{}).Where("email = ?", copyPayload["email"]).Count(&count)
		if count != 0 {
			t.Fatal("cadastro inválido deixou usuário persistido")
		}
	}
}
