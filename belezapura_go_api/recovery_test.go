package main

import (
	"belezapura_go_api/internal/db"
	"os"
	"testing"
)

func TestRestoredDatabase(t *testing.T) {
	if os.Getenv("VERIFY_RESTORE") != "1" {
		t.Skip("VERIFY_RESTORE=1 necessário")
	}
	setupDatabase(t)
	var salons, appointments, invalid int64
	if err := db.DB.Model(&db.Salon{}).Count(&salons).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.DB.Model(&db.Appointment{}).Count(&appointments).Error; err != nil {
		t.Fatal(err)
	}
	if salons < 50 || appointments < 15000 {
		t.Fatalf("restored dataset incomplete: %d salons %d appointments", salons, appointments)
	}
	if err := db.DB.Raw(`SELECT count(*) FROM appointments a LEFT JOIN clients c ON c.id=a.client_id::uuid LEFT JOIN services s ON s.id=a.service_id::uuid LEFT JOIN professionals p ON p.id=a.professional_id::uuid WHERE c.id IS NULL OR s.id IS NULL OR p.id IS NULL OR c.salon_id<>a.salon_id OR s.salon_id<>a.salon_id OR p.salon_id<>a.salon_id OR a.ends_at IS NULL OR a.ends_at<=a.date`).Scan(&invalid).Error; err != nil {
		t.Fatal(err)
	}
	if invalid != 0 {
		t.Fatalf("restored invalid relations %d", invalid)
	}
	expect(t, NewRouter(), 200, "GET", "/health", "", nil)
	t.Logf("Restored API healthy; %d salons, %d appointments, no invalid tenant relationships.", salons, appointments)
}
