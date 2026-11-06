package main

import (
	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"
)

const testSecret = "local-tests-only-secret-at-least-32-characters"
const testSchedule = `[{"day":"Segunda","open":true,"start":"08:00","end":"20:00"},{"day":"Terça","open":true,"start":"08:00","end":"20:00"},{"day":"Quarta","open":true,"start":"08:00","end":"20:00"},{"day":"Quinta","open":true,"start":"08:00","end":"20:00"},{"day":"Sexta","open":true,"start":"08:00","end":"20:00"},{"day":"Sábado","open":true,"start":"08:00","end":"20:00"},{"day":"Domingo","open":true,"start":"08:00","end":"20:00"}]`

type fixture struct {
	salon   db.Salon
	user    db.User
	client  db.Client
	service db.Service
	pro     db.Professional
	sub     db.Subscription
	token   string
}

func setupDatabase(t *testing.T) {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL não informado; integração exige PostgreSQL descartável")
	}
	u, err := url.Parse(dsn)
	if err != nil || !(u.Hostname() == "127.0.0.1" || u.Hostname() == "localhost") || !strings.HasSuffix(u.Path, "_test") {
		t.Fatal("integração permitida apenas em localhost e banco com sufixo _test")
	}
	t.Setenv("DATABASE_URL", dsn)
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	gin.DefaultWriter = io.Discard
	if err := db.Connect(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(db.Close)
	if err := db.Migrate(); err != nil {
		t.Fatal(err)
	}
	if err := db.Migrate(); err != nil {
		t.Fatalf("migração deve ser idempotente: %v", err)
	}
	if err := db.SeedPlans(); err != nil {
		t.Fatal(err)
	}
}
func makeFixture(t *testing.T, plan db.Plan) fixture {
	t.Helper()
	id := uuid.NewString()
	s := db.Salon{Name: "Salão Teste", Slug: "teste-" + id, ScheduleRaw: testSchedule, Timezone: "America/Sao_Paulo", BlockedDates: "[]"}
	mustCreate(t, &s)
	hash, _ := bcrypt.GenerateFromPassword([]byte("test-password-123"), bcrypt.MinCost)
	u := db.User{Email: id + "@example.test", Password: string(hash), Name: "Responsável", Role: "owner", Status: "active", SalonID: &s.ID}
	mustCreate(t, &u)
	cl := db.Client{SalonID: s.ID, Name: "Cliente", Status: "active"}
	mustCreate(t, &cl)
	svc := db.Service{SalonID: s.ID, Name: "Corte", Duration: 60, Price: 100, Status: "active"}
	mustCreate(t, &svc)
	pro := db.Professional{SalonID: s.ID, Name: "Profissional", Status: "active"}
	mustCreate(t, &pro)
	future := time.Now().Add(14 * 24 * time.Hour)
	sub := db.Subscription{SalonID: s.ID, PlanID: plan.ID, Status: "TRIAL", TrialEnds: &future, Price: plan.Price}
	mustCreate(t, &sub)
	token, err := middleware.GenerateToken(u.ID, s.ID, u.Role, u.Name)
	if err != nil {
		t.Fatal(err)
	}
	return fixture{s, u, cl, svc, pro, sub, token}
}
func mustCreate(t *testing.T, v interface{}) {
	t.Helper()
	if err := db.DB.Create(v).Error; err != nil {
		t.Fatal(err)
	}
}
func request(r http.Handler, method, path, token string, body interface{}) (int, []byte) {
	var b []byte
	if body != nil {
		b, _ = json.Marshal(body)
	}
	req := httptest.NewRequest(method, path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w.Code, w.Body.Bytes()
}
func expect(t *testing.T, r http.Handler, status int, method, path, token string, body interface{}) []byte {
	t.Helper()
	got, b := request(r, method, path, token, body)
	if got != status {
		t.Fatalf("%s %s status %d want %d: %s", method, path, got, status, b)
	}
	return b
}
func tomorrow(hour int) time.Time {
	loc, _ := time.LoadLocation("America/Sao_Paulo")
	d := time.Now().In(loc).AddDate(0, 0, 2)
	return time.Date(d.Year(), d.Month(), d.Day(), hour, 0, 0, 0, loc)
}
func TestIntegration(t *testing.T) {
	setupDatabase(t)
	var plan db.Plan
	if err := db.DB.Where("name = ?", "Studio").First(&plan).Error; err != nil {
		t.Fatal(err)
	}
	a := makeFixture(t, plan)
	b := makeFixture(t, plan)
	r := NewRouter()
	admin := db.User{Email: uuid.NewString() + "@example.test", Name: "Admin", Role: "superadmin", Status: "active", Password: "unused"}
	mustCreate(t, &admin)
	adminToken, err := middleware.GenerateToken(admin.ID, "", admin.Role, admin.Name)
	if err != nil {
		t.Fatal(err)
	}
	payload := func(f fixture, date time.Time) map[string]interface{} {
		return map[string]interface{}{"clientId": f.client.ID, "professionalId": f.pro.ID, "serviceId": f.service.ID, "date": date.Format(time.RFC3339)}
	}
	t.Run("tenant and role boundaries", func(t *testing.T) {
		expect(t, r, 401, "GET", "/api/appointments", "", nil)
		expect(t, r, 403, "GET", "/api/superadmin/subscriptions", a.token, nil)
		expect(t, r, 403, "GET", "/api/salon/details", adminToken, nil)
		for _, field := range []string{"clientId", "serviceId", "professionalId"} {
			p := payload(a, tomorrow(10))
			foreign := map[string]string{"clientId": b.client.ID, "serviceId": b.service.ID, "professionalId": b.pro.ID}
			p[field] = foreign[field]
			expect(t, r, 404, "POST", "/api/appointments", a.token, p)
		}
		for _, route := range []string{"/api/services/" + b.service.ID, "/api/professionals/" + b.pro.ID, "/api/salon/clients/" + b.client.ID} {
			expect(t, r, 404, "PUT", route, a.token, map[string]string{"name": "INVADED"})
			expect(t, r, 404, "DELETE", route, a.token, nil)
		}
		foreign := db.Appointment{SalonID: a.salon.ID, ClientID: b.client.ID, ProfessionalID: a.pro.ID, ServiceID: a.service.ID, Date: tomorrow(10), EndsAt: tomorrow(11), Status: "waiting"}
		if db.DB.Create(&foreign).Error == nil {
			t.Fatal("database accepted cross-tenant relationship")
		}
	})
	t.Run("concurrent and overlapping bookings", func(t *testing.T) {
		var wg sync.WaitGroup
		codes := make(chan int, 20)
		for i := 0; i < 20; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				code, _ := request(r, "POST", "/api/appointments", a.token, payload(a, tomorrow(10)))
				codes <- code
			}()
		}
		wg.Wait()
		close(codes)
		created, conflicts := 0, 0
		for code := range codes {
			switch code {
			case 201:
				created++
			case 409:
				conflicts++
			default:
				t.Fatalf("unexpected status %d", code)
			}
		}
		if created != 1 || conflicts != 19 {
			t.Fatalf("created %d conflicts %d", created, conflicts)
		}
		expect(t, r, 409, "POST", "/api/appointments", a.token, payload(a, tomorrow(10).Add(30*time.Minute)))
		expect(t, r, 201, "POST", "/api/appointments", a.token, payload(a, tomorrow(11)))
		raw := expect(t, r, 200, "GET", fmt.Sprintf("/api/public/availability?salonId=%s&professionalId=%s&serviceId=%s&date=%s", a.salon.ID, a.pro.ID, a.service.ID, tomorrow(10).Format("2006-01-02")), "", nil)
		var data struct {
			Available []string          `json:"available"`
			Slots     map[string]string `json:"slots"`
		}
		if json.Unmarshal(raw, &data) != nil {
			t.Fatal("invalid availability")
		}
		for _, slot := range data.Available {
			if slot == "10:00" || slot == "10:30" || slot == "11:00" || slot == "11:30" {
				t.Fatalf("overlapping slot %s", slot)
			}
		}
		if !strings.HasSuffix(data.Slots["12:00"], "-03:00") {
			t.Fatal("missing salon timezone")
		}
		expect(t, r, 409, "POST", "/api/appointments", a.token, payload(a, tomorrow(20)))
	})
	t.Run("stock persistence isolation optimistic lock", func(t *testing.T) {
		p := map[string]interface{}{"nome": "Shampoo", "categoria": "Lavatório", "qtde": 10, "min": 2, "price": 19.90}
		raw := expect(t, r, 201, "POST", "/api/salon/products", a.token, p)
		var product db.Product
		_ = json.Unmarshal(raw, &product)
		raw = expect(t, r, 200, "GET", "/api/salon/products", b.token, nil)
		if strings.Contains(string(raw), product.ID) {
			t.Fatal("stock leaked")
		}
		p["version"] = 1
		p["qtde"] = 9
		expect(t, r, 409, "PUT", "/api/salon/products/"+product.ID, b.token, p)
		expect(t, r, 200, "PUT", "/api/salon/products/"+product.ID, a.token, p)
		expect(t, r, 409, "PUT", "/api/salon/products/"+product.ID, a.token, p)
		expect(t, r, 404, "DELETE", "/api/salon/products/"+product.ID, b.token, nil)
		expect(t, r, 204, "DELETE", "/api/salon/products/"+product.ID, a.token, nil)
	})
	t.Run("subscription suspension and manual renewal", func(t *testing.T) {
		for _, state := range []string{"BLOCKED", "CANCELED", "LATE", "EXPIRED", "PENDING"} {
			if err := db.DB.Model(&db.Subscription{}).Where("id = ?", a.sub.ID).Update("status", state).Error; err != nil {
				t.Fatal(err)
			}
			expect(t, r, 402, "POST", "/api/appointments", a.token, payload(a, tomorrow(14)))
			expect(t, r, 402, "GET", "/api/public/salons/"+a.salon.Slug, "", nil)
			expect(t, r, 200, "GET", "/api/salon/details", a.token, nil)
		}
		expect(t, r, 202, "POST", "/api/salon/upgrade-plan", a.token, map[string]string{"planId": plan.ID})
		var sub db.Subscription
		db.DB.First(&sub, "id = ?", a.sub.ID)
		if sub.Status != "PENDING" || sub.PendingPlanID == nil {
			t.Fatal("request autoactivated")
		}
		route := "/api/superadmin/subscriptions/" + sub.ID + "/status"
		expect(t, r, 400, "PUT", route, adminToken, map[string]interface{}{"status": "ACTIVE"})
		ref := "receipt-" + uuid.NewString()
		payment := map[string]interface{}{"status": "ACTIVE", "paymentReference": ref, "amount": plan.Price}
		expect(t, r, 200, "PUT", route, adminToken, payment)
		db.DB.First(&sub, "id = ?", sub.ID)
		if !sub.AllowsAccess(time.Now()) || sub.Price != plan.Price || sub.PendingPlanID != nil {
			t.Fatal("approval not persisted")
		}
		firstEnd := *sub.CurrentPeriodEnd
		expect(t, r, 202, "POST", "/api/salon/upgrade-plan", a.token, map[string]string{"planId": plan.ID})
		expect(t, r, 409, "PUT", route, adminToken, payment)
		payment["paymentReference"] = "receipt-" + uuid.NewString()
		expect(t, r, 200, "PUT", route, adminToken, payment)
		db.DB.First(&sub, "id = ?", sub.ID)
		if !sub.CurrentPeriodEnd.After(firstEnd) {
			t.Fatal("renewal did not extend period")
		}
		expect(t, r, 200, "PUT", route, adminToken, map[string]string{"status": "CANCELED"})
		expect(t, r, 402, "POST", "/api/appointments", a.token, payload(a, tomorrow(15)))
	})
	t.Run("revocation disabled user deleted user expired tokens", func(t *testing.T) {
		expect(t, r, 200, "PUT", "/api/superadmin/users/"+b.user.ID, adminToken, map[string]string{"password": "new-password-123"})
		expect(t, r, 401, "GET", "/api/appointments", b.token, nil)
		token, _ := middleware.GenerateToken(b.user.ID, b.salon.ID, "owner", b.user.Name)
		db.DB.Model(&b.user).Update("status", "blocked")
		expect(t, r, 401, "GET", "/api/appointments", token, nil)
		expect(t, r, 401, "POST", "/api/auth/login", "", map[string]string{"email": b.user.Email, "password": "new-password-123"})
		db.DB.Model(&b.user).Update("status", "active")
		db.DB.Delete(&b.user)
		expect(t, r, 401, "GET", "/api/appointments", token, nil)
		claims := middleware.Claims{UserID: a.user.ID, SalonID: a.salon.ID, Role: "owner", RegisteredClaims: jwt.RegisteredClaims{Issuer: "belezapura", IssuedAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)), ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Second))}}
		expired, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(testSecret))
		expect(t, r, 401, "GET", "/api/appointments", expired, nil)
		claims.ExpiresAt = nil
		missing, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(testSecret))
		expect(t, r, 401, "GET", "/api/appointments", missing, nil)
	})
	t.Run("onboarding rollback and validated plan", func(t *testing.T) {
		var schedule interface{}
		json.Unmarshal([]byte(testSchedule), &schedule)
		p := map[string]interface{}{"salonName": "Atomic Salon " + uuid.NewString(), "email": uuid.NewString() + "@example.test", "password": "test-password-123", "planId": plan.ID, "schedule": schedule, "services": []map[string]string{{"name": "FAIL_SERVICES", "duration": "60 min", "price": "100.50"}}, "professionals": []map[string]string{{"name": "Profissional"}}}
		p["planId"] = "nonexistent"
		expect(t, r, 400, "POST", "/api/public/onboarding", "", p)
		p["planId"] = plan.ID
		if err := db.DB.Exec(`CREATE OR REPLACE FUNCTION fail_test_service() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.name = 'FAIL_SERVICES' THEN RAISE EXCEPTION 'test service failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_test_service BEFORE INSERT ON services FOR EACH ROW EXECUTE FUNCTION fail_test_service();`).Error; err != nil {
			t.Fatal(err)
		}
		defer db.DB.Exec("DROP TRIGGER fail_test_service ON services; DROP FUNCTION fail_test_service();")
		expect(t, r, 500, "POST", "/api/public/onboarding", "", p)
		var n int64
		db.DB.Model(&db.Salon{}).Where("name = ?", p["salonName"]).Count(&n)
		if n != 0 {
			t.Fatal("onboarding left partial salon")
		}
	})
	t.Run("concurrent professional limit and reactivation", func(t *testing.T) {
		var essential db.Plan
		db.DB.Where("name = ?", "Essencial").First(&essential)
		f := makeFixture(t, essential)
		var wg sync.WaitGroup
		codes := make(chan int, 10)
		for i := 0; i < 10; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				code, _ := request(r, "POST", "/api/professionals", f.token, map[string]string{"name": "Extra"})
				codes <- code
			}()
		}
		wg.Wait()
		close(codes)
		for code := range codes {
			if code != 403 {
				t.Fatalf("limit exceeded, status %d", code)
			}
		}
		inactive := db.Professional{SalonID: f.salon.ID, Name: "Inactive", Status: "inactive"}
		mustCreate(t, &inactive)
		expect(t, r, 403, "PUT", "/api/professionals/"+inactive.ID, f.token, map[string]string{"status": "active"})
		expect(t, r, 403, "DELETE", "/api/professionals/"+inactive.ID+"?mode=inactive", f.token, nil)
	})
	t.Run("admin plan edits cannot partially change salon", func(t *testing.T) {
		old := a.salon.Name
		expect(t, r, 400, "PUT", "/api/superadmin/salons/"+a.salon.ID, adminToken, map[string]string{"name": "MUST_NOT_SAVE", "plan": "Essencial"})
		var check db.Salon
		db.DB.First(&check, "id = ?", a.salon.ID)
		if check.Name != old {
			t.Fatal("rejected request mutated salon")
		}
	})

	t.Run("seed preserves administrator plans", func(t *testing.T) {
		old := plan.Price
		db.DB.Model(&plan).Update("price", 129.99)
		defer db.DB.Model(&plan).Update("price", old)
		if err := db.SeedPlans(); err != nil {
			t.Fatal(err)
		}
		var check db.Plan
		db.DB.First(&check, "id = ?", plan.ID)
		if check.Price != 129.99 {
			t.Fatal("seed overwrote price")
		}
	})
	t.Run("database rejects overlap independently", func(t *testing.T) {
		appt := db.Appointment{SalonID: a.salon.ID, ClientID: a.client.ID, ProfessionalID: a.pro.ID, ServiceID: a.service.ID, Date: tomorrow(10).Add(15 * time.Minute), EndsAt: tomorrow(11), Status: "waiting"}
		if err := db.DB.Create(&appt).Error; err == nil {
			t.Fatal("database accepted overlap")
		}
	})
}

func TestTenantReadAndPublicBoundaries(t *testing.T) {
	setupDatabase(t)
	var plan db.Plan
	if err := db.DB.Where("name = ?", "Studio").First(&plan).Error; err != nil {
		t.Fatal(err)
	}
	a, b := makeFixture(t, plan), makeFixture(t, plan)
	r := NewRouter()
	raw := expect(t, r, 201, "POST", "/api/appointments", b.token, map[string]string{
		"clientId": b.client.ID, "professionalId": b.pro.ID, "serviceId": b.service.ID,
		"date": tomorrow(10).Format(time.RFC3339),
	})
	var appointment db.Appointment
	if err := json.Unmarshal(raw, &appointment); err != nil || appointment.ID == "" {
		t.Fatalf("invalid appointment: %s", raw)
	}
	for _, route := range []string{"/api/appointments", "/api/salon/dashboard", "/api/salon/clients", "/api/salon/details"} {
		t.Run("read "+route, func(t *testing.T) {
			raw := expect(t, r, 200, "GET", route, a.token, nil)
			for _, id := range []string{b.salon.ID, b.client.ID, b.pro.ID, b.service.ID, b.sub.ID, appointment.ID} {
				if strings.Contains(string(raw), id) {
					t.Fatalf("foreign identifier %s leaked: %s", id, raw)
				}
			}
		})
	}
	expect(t, r, 404, "PUT", "/api/appointments/"+appointment.ID, a.token, map[string]string{"status": "done"})
	expect(t, r, 404, "DELETE", "/api/appointments/"+appointment.ID, a.token, nil)
	var preserved db.Appointment
	if err := db.DB.First(&preserved, "id = ?", appointment.ID).Error; err != nil || preserved.Status != "waiting" {
		t.Fatalf("foreign appointment changed: %v", err)
	}
	for _, field := range []string{"serviceId", "professionalId"} {
		t.Run("public "+field, func(t *testing.T) {
			serviceID, professionalID := a.service.ID, a.pro.ID
			if field == "serviceId" {
				serviceID = b.service.ID
			} else {
				professionalID = b.pro.ID
			}
			query := fmt.Sprintf("/api/public/availability?salonId=%s&serviceId=%s&professionalId=%s&date=%s", a.salon.ID, serviceID, professionalID, tomorrow(10).Format("2006-01-02"))
			expect(t, r, 404, "GET", query, "", nil)
			expect(t, r, 404, "POST", "/api/public/appointments", "", map[string]string{
				"salonId": a.salon.ID, "serviceId": serviceID, "professionalId": professionalID,
				"clientName": "Rejected foreign booking", "clientPhone": "11988887777",
				"date": tomorrow(10).Format(time.RFC3339),
			})
		})
	}
	var clients, appointments int64
	if err := db.DB.Model(&db.Client{}).Where("salon_id = ?", a.salon.ID).Count(&clients).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.DB.Model(&db.Appointment{}).Where("salon_id = ?", a.salon.ID).Count(&appointments).Error; err != nil {
		t.Fatal(err)
	}
	if clients != 1 || appointments != 0 {
		t.Fatalf("rejected public requests left data: clients=%d appointments=%d", clients, appointments)
	}
	// Claims cannot retain access after an administrative role or tenant change.
	if err := db.DB.Model(&a.user).Update("role", "superadmin").Error; err != nil {
		t.Fatal(err)
	}
	expect(t, r, 401, "GET", "/api/appointments", a.token, nil)
	if err := db.DB.Model(&a.user).Updates(map[string]interface{}{"role": "owner", "salon_id": b.salon.ID}).Error; err != nil {
		t.Fatal(err)
	}
	expect(t, r, 401, "GET", "/api/appointments", a.token, nil)
}

var _ = gorm.ErrRecordNotFound
