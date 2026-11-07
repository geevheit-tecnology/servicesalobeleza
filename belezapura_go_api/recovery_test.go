package main

import (
	"belezapura_go_api/internal/db"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"
)

func TestRestoredDatabase(t *testing.T) {
	if os.Getenv("VERIFY_RESTORE") != "1" {
		t.Skip("VERIFY_RESTORE=1 necessário")
	}
	dsn := os.Getenv("TEST_DATABASE_URL")
	u, err := url.Parse(dsn)
	if err != nil || !(u.Hostname() == "localhost" || u.Hostname() == "127.0.0.1") || !strings.HasSuffix(u.Path, "_test") {
		t.Fatal("restauração permitida apenas em banco descartável local com sufixo _test")
	}
	t.Setenv("DATABASE_URL", dsn)
	t.Setenv("JWT_SECRET", testSecret)
	if err := db.Connect(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(db.Close)
	// Verify the restored archive as-is, without migrations or seed repairing it.
	if err := db.CheckSchema(); err != nil {
		t.Fatal(err)
	}
	var salons, appointments, invalid int64
	if err := db.DB.Model(&db.Salon{}).Count(&salons).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.DB.Model(&db.Appointment{}).Count(&appointments).Error; err != nil {
		t.Fatal(err)
	}
	if os.Getenv("RESTORE_EXPECTED_SALONS") != "" || os.Getenv("RESTORE_EXPECTED_APPOINTMENTS") != "" {
		expectedSalons, salonErr := strconv.ParseInt(os.Getenv("RESTORE_EXPECTED_SALONS"), 10, 64)
		expectedAppointments, apptErr := strconv.ParseInt(os.Getenv("RESTORE_EXPECTED_APPOINTMENTS"), 10, 64)
		if salonErr != nil || apptErr != nil || expectedSalons <= 0 || expectedAppointments < 0 {
			t.Fatal("informe ambas as contagens esperadas do manifesto de origem")
		}
		if salons != expectedSalons || appointments != expectedAppointments {
			t.Fatalf("restored counts differ from source: %d salons %d appointments", salons, appointments)
		}
	} else if salons < 50 || appointments < 15000 {
		t.Fatalf("restored capacity dataset incomplete: %d salons %d appointments; outros conjuntos exigem RESTORE_EXPECTED_SALONS e RESTORE_EXPECTED_APPOINTMENTS", salons, appointments)
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
