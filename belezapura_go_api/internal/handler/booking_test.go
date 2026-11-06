package handler

import (
	"belezapura_go_api/internal/db"
	"math"
	"testing"
	"time"
)

func TestPixPayload(t *testing.T) {
	got, err := generatePix("123e4567-e12b-12d1-a456-426655440000", "SALAO TESTE", 20)
	if err != nil {
		t.Fatal(err)
	}
	const want = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000520400005303986540520.005802BR5911SALAO TESTE6009SAO PAULO62070503***6304B1D3"
	if got != want {
		t.Fatalf("payload or CRC incorrect: %s", got)
	}
	for _, tc := range []struct {
		key    string
		amount float64
	}{{"", 20}, {"example-key", 20}, {"bad\n@example.test", 20}, {"a@example.test", 0}, {"a@example.test", math.NaN()}, {"a@example.test", math.Inf(1)}, {"a@example.test", 0.001}} {
		if _, err := generatePix(tc.key, "SALAO", tc.amount); err == nil {
			t.Errorf("accepted invalid Pix input %q %v", tc.key, tc.amount)
		}
	}
}
func TestScheduleAndBlockedDate(t *testing.T) {
	s := db.Salon{Timezone: "America/Sao_Paulo", BlockedDates: "[]", ScheduleRaw: `[{"day":"Segunda","open":true,"start":"09:00","end":"18:00"}]`}
	loc, _ := time.LoadLocation(s.Timezone)
	date := time.Date(2030, 1, 7, 12, 0, 0, 0, loc)
	start, end, err := scheduleFor(s, date)
	if err != nil || start.Hour() != 9 || end.Hour() != 18 {
		t.Fatalf("invalid window %v %v %v", start, end, err)
	}
	s.BlockedDates = `["2030-01-07"]`
	if _, _, err := scheduleFor(s, date); err == nil {
		t.Fatal("blocked day allowed")
	}
	s.BlockedDates = "[]"
	if _, _, err := scheduleFor(s, date.AddDate(0, 0, 1)); err == nil {
		t.Fatal("unconfigured weekday allowed")
	}
}
