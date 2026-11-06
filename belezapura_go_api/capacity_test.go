package main

import (
	"belezapura_go_api/internal/db"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm/logger"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"runtime"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"
)

type stageResult struct {
	Users           int                            `json:"users"`
	DurationSeconds float64                        `json:"durationSeconds"`
	Requests        int                            `json:"requests"`
	Errors          int                            `json:"errors"`
	P50             float64                        `json:"p50Ms"`
	P95             float64                        `json:"p95Ms"`
	P99             float64                        `json:"p99Ms"`
	MaxConnections  int                            `json:"maxConnections"`
	StartHeap       uint64                         `json:"startHeapBytes"`
	EndHeap         uint64                         `json:"endHeapBytes"`
	ReadP95         float64                        `json:"readP95Ms"`
	WriteP95        float64                        `json:"writeP95Ms"`
	ErrorKinds      map[string]int                 `json:"errorKinds"`
	Routes          map[string]capacityRouteResult `json:"routes"`
}

type capacityRouteResult struct {
	Requests int     `json:"requests"`
	Errors   int     `json:"errors"`
	P95      float64 `json:"p95Ms"`
}

func percentile(values []float64, p float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sort.Float64s(values)
	return values[int(float64(len(values)-1)*p)]
}
func TestCapacity(t *testing.T) {
	if os.Getenv("RUN_CAPACITY") != "1" {
		t.Skip("RUN_CAPACITY=1 necessário")
	}
	setupDatabase(t)
	db.DB.Logger = logger.Default.LogMode(logger.Silent)
	var plan db.Plan
	db.DB.Where("name = ?", "Studio").First(&plan)
	fixtures := make([]fixture, 50)
	for i := range fixtures {
		f := makeFixture(t, plan)
		fixtures[i] = f
		for j := 0; j < 4; j++ {
			p := db.Professional{SalonID: f.salon.ID, Name: fmt.Sprintf("Profissional %d", j), Status: "active"}
			mustCreate(t, &p)
		}
		clients := []db.Client{}
		for j := 0; j < 29; j++ {
			clients = append(clients, db.Client{SalonID: f.salon.ID, Name: fmt.Sprintf("Cliente %d", j), Status: "active"})
		}
		if err := db.DB.Create(&clients).Error; err != nil {
			t.Fatal(err)
		}
		services := []db.Service{}
		for j := 0; j < 9; j++ {
			services = append(services, db.Service{SalonID: f.salon.ID, Name: fmt.Sprintf("Serviço %d", j), Status: "active", Duration: 30, Price: 50})
		}
		if err := db.DB.Create(&services).Error; err != nil {
			t.Fatal(err)
		}
		appts := []db.Appointment{}
		start := tomorrow(10).AddDate(0, -2, 0)
		for j := 0; j < 300; j++ {
			date := start.Add(time.Duration(j) * time.Hour)
			appts = append(appts, db.Appointment{SalonID: f.salon.ID, ClientID: f.client.ID, ProfessionalID: f.pro.ID, ServiceID: f.service.ID, Date: date, EndsAt: date.Add(30 * time.Minute), Value: 50, Status: "done"})
		}
		if err := db.DB.CreateInBatches(&appts, 100).Error; err != nil {
			t.Fatal(err)
		}
	}
	server := httptest.NewServer(NewRouter())
	defer server.Close()
	transport := &http.Transport{MaxIdleConns: 120, MaxIdleConnsPerHost: 120}
	client := &http.Client{Transport: transport, Timeout: 10 * time.Second}
	defer transport.CloseIdleConnections()
	stages := []struct {
		users    int
		duration time.Duration
	}{{10, time.Minute}, {25, time.Minute}, {50, 30 * time.Minute}, {100, 5 * time.Minute}}
	if os.Getenv("CAPACITY_QUICK") == "1" {
		stages = []struct {
			users    int
			duration time.Duration
		}{{10, 10 * time.Second}, {25, 10 * time.Second}, {50, 30 * time.Second}, {100, 10 * time.Second}}
	}
	results := []stageResult{}
	for _, stage := range stages {
		ctx, cancel := context.WithTimeout(context.Background(), stage.duration)
		var wg sync.WaitGroup
		var mu sync.Mutex
		latencies, reads, writes := []float64{}, []float64{}, []float64{}
		errors := 0
		errorKinds := map[string]int{}
		routeLatencies := map[string][]float64{}
		routeErrors := map[string]int{}
		maxConnections := 0
		var before runtime.MemStats
		runtime.GC()
		runtime.ReadMemStats(&before)
		start := time.Now()
		for worker := 0; worker < stage.users; worker++ {
			wg.Add(1)
			go func(index int) {
				defer wg.Done()
				f := fixtures[index%50]
				for step := 0; ctx.Err() == nil; step++ {
					method, path, body := "GET", "/api/salon/dashboard", []byte(nil)
					write := false
					switch step % 10 {
					case 0, 1, 2:
						path = "/api/appointments"
					case 3:
						path = "/api/salon/clients"
					case 4:
						path = "/api/salon/details"
					case 5:
						path = "/api/salon/products"
					case 6:
						path = fmt.Sprintf("/api/public/availability?salonId=%s&professionalId=%s&serviceId=%s&date=%s", f.salon.ID, f.pro.ID, f.service.ID, tomorrow(10).Format("2006-01-02"))
					case 7, 8:
						method = "POST"
						path = "/api/salon/products"
						body = []byte(fmt.Sprintf(`{"nome":"Carga %s","qtde":2,"min":1,"price":10}`, uuid.NewString()))
						write = true
					}
					requestStart := time.Now()
					req, _ := http.NewRequest(method, server.URL+path, bytes.NewReader(body))
					req.Header.Set("Authorization", "Bearer "+f.token)
					req.Header.Set("Content-Type", "application/json")
					resp, err := client.Do(req)
					code := 0
					if err == nil {
						code = resp.StatusCode
						_, err = io.Copy(io.Discard, resp.Body)
						resp.Body.Close()
					}
					elapsed := float64(time.Since(requestStart).Microseconds()) / 1000
					mu.Lock()
					latencies = append(latencies, elapsed)
					route := method + " " + strings.SplitN(path, "?", 2)[0]
					routeLatencies[route] = append(routeLatencies[route], elapsed)
					if write {
						writes = append(writes, elapsed)
					} else {
						reads = append(reads, elapsed)
					}
					if err != nil || code < 200 || code >= 300 {
						errors++
						routeErrors[route]++
						kind := fmt.Sprintf("http_%d", code)
						if err != nil {
							kind = "transport: " + fmt.Sprintf("%T", err)
							if os.IsTimeout(err) {
								kind = "transport_timeout"
							}
						}
						errorKinds[kind]++
					}
					sqlDB, _ := db.DB.DB()
					if stats := sqlDB.Stats(); stats.OpenConnections > maxConnections {
						maxConnections = stats.OpenConnections
					}
					mu.Unlock()
					select {
					case <-ctx.Done():
						return
					case <-time.After(time.Second):
					}
				}
			}(worker)
		}
		wg.Wait()
		cancel()
		runtime.GC()
		var after runtime.MemStats
		runtime.ReadMemStats(&after)
		result := stageResult{Users: stage.users, DurationSeconds: time.Since(start).Seconds(), Requests: len(latencies), Errors: errors, P50: percentile(latencies, .5), P95: percentile(latencies, .95), P99: percentile(latencies, .99), ReadP95: percentile(reads, .95), WriteP95: percentile(writes, .95), MaxConnections: maxConnections, StartHeap: before.HeapAlloc, EndHeap: after.HeapAlloc}
		result.ErrorKinds = errorKinds
		result.Routes = map[string]capacityRouteResult{}
		for route, values := range routeLatencies {
			result.Routes[route] = capacityRouteResult{Requests: len(values), Errors: routeErrors[route], P95: percentile(values, .95)}
		}
		results = append(results, result)
		raw, _ := json.Marshal(result)
		t.Log(string(raw))
		if result.Errors > 0 || result.ReadP95 > 1000 || result.WriteP95 > 2000 {
			t.Errorf("stage %d failed latency/error criteria", stage.users)
		}
		if path := os.Getenv("CAPACITY_REPORT_PATH"); path != "" {
			raw, _ := json.MarshalIndent(map[string]interface{}{"environment": "local Docker PostgreSQL; HTTP httptest on development machine", "salons": 50, "professionals": 250, "clients": 1500, "services": 500, "historicalAppointments": 15000, "thinkTimeSeconds": 1, "operationMix": "80% reads, 20% product creates; appointments list, dashboard, clients, details, stock, availability", "quick": os.Getenv("CAPACITY_QUICK") == "1", "stages": results}, "", "  ")
			if err := os.WriteFile(path, raw, 0644); err != nil {
				t.Fatal(err)
			}
		}
	}
}
