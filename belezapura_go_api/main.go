package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/handler"
	"belezapura_go_api/internal/middleware"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	// Connect DB
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := middleware.ValidateSecret(); err != nil {
		log.Fatal(err)
	}
	if err := db.CheckSchema(); err != nil {
		log.Fatal(err)
	}
	r := NewRouter()
	port := os.Getenv("PORT")
	if port == "" {
		port = "3050"
	}
	server := &http.Server{Addr: ":" + port, Handler: r, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 1 << 20}
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-stop
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		_ = server.Shutdown(ctx)
	}()
	log.Printf("BelezaPura API na porta %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
func NewRouter() *gin.Engine {

	r := gin.Default()
	_ = r.SetTrustedProxies(nil)
	r.Use(func(c *gin.Context) { c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 8<<20); c.Next() })
	healthHandler := func(c *gin.Context) {
		sqlDB, err := db.DB.DB()
		if err != nil {
			c.JSON(503, gin.H{"status": "unavailable"})
			return
		}
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		if sqlDB.PingContext(ctx) != nil {
			c.JSON(503, gin.H{"status": "unavailable"})
			return
		}
		c.JSON(200, gin.H{"status": "ok", "revision": os.Getenv("APP_REVISION")})
	}
	r.GET("/health", healthHandler)
	r.HEAD("/health", healthHandler)

	// Security Headers (Anti-XSS, anti-sniff, clickjacking protection)
	r.Use(middleware.SecurityHeaders())

	// CORS — allow the Vite dev server, Vercel deployments, and configured origins
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			origin = strings.TrimSpace(origin)
			if strings.HasPrefix(origin, "http://localhost:") ||
				strings.HasPrefix(origin, "http://127.0.0.1:") ||
				origin == "http://localhost" ||
				origin == "http://127.0.0.1" ||
				strings.HasSuffix(origin, ".vercel.app") {
				return true
			}
			for _, o := range allowedOrigins() {
				if strings.TrimSpace(o) == origin {
					return true
				}
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// ── Public routes ──────────────────────────────────────────────
	api := r.Group("/api")
	{
		api.POST("/auth/login", middleware.RateLimiter(20, time.Minute), handler.Login)
		api.POST("/public/onboarding", middleware.RateLimiter(10, time.Minute), handler.Onboarding)
		api.GET("/public/salons/:slug", handler.GetSalonBySlug)
		api.POST("/public/appointments", middleware.RateLimiter(30, time.Minute), handler.CreatePublicAppointment)
		api.GET("/public/availability", handler.GetAvailability)
		api.GET("/public/plans", handler.GetPlans)
		api.POST("/public/whatsapp-webhook", handler.WhatsAppWebhookHandler)

		// ── Protected routes ────────────────────────────────────────
		auth := api.Group("/")
		auth.Use(middleware.AuthRequired())
		auth.Use(middleware.TrialEnforcer())
		{
			// Appointments
			salon := auth.Group("/")
			salon.Use(middleware.SalonRequired())
			salon.POST("/appointments", handler.CreateAppointment)
			salon.GET("/appointments", handler.ListAppointments)
			salon.PUT("/appointments/:id", handler.UpdateAppointment)
			salon.DELETE("/appointments/:id", handler.DeleteAppointment)

			// Salon (owner dashboard)
			salon.GET("/salon/dashboard", handler.GetSalonDashboard)
			salon.GET("/salon/details", handler.GetSalonDetails)
			salon.PUT("/salon/details", handler.UpdateSalonDetails)
			salon.POST("/salon/upgrade-plan", handler.UpgradePlan)
			salon.GET("/salon/whatsapp-usage", handler.GetSalonWhatsAppUsage)
			salon.GET("/salon/clients", handler.GetSalonClients)
			salon.POST("/salon/clients", handler.CreateSalonClient)
			salon.PUT("/salon/clients/:id", handler.UpdateSalonClient)
			salon.DELETE("/salon/clients/:id", handler.DeleteSalonClient)

			// Services & professionals
			salon.POST("/services", handler.CreateService)
			salon.PUT("/services/:id", handler.UpdateService)
			salon.DELETE("/services/:id", handler.DeleteService)

			salon.POST("/professionals", handler.CreateProfessional)
			salon.PUT("/professionals/:id", handler.UpdateProfessional)
			salon.DELETE("/professionals/:id", handler.DeleteProfessional)

			salon.GET("/salon/products", handler.GetProducts)
			salon.POST("/salon/products", handler.CreateProduct)
			salon.PUT("/salon/products/:id", handler.UpdateProduct)
			salon.DELETE("/salon/products/:id", handler.DeleteProduct)

			// Super Admin
			sa := auth.Group("/superadmin")
			sa.Use(middleware.SuperAdminRequired())
			{
				sa.GET("/overview", handler.GetOverview)
				sa.GET("/salons", handler.GetSalons)
				sa.PUT("/salons/:id", handler.UpdateSalon)
				sa.DELETE("/salons/:id", handler.DeleteSalon)
				sa.PUT("/salons/:id/block", handler.BlockSalon)
				sa.GET("/settings", handler.GetSettings)
				sa.PUT("/settings", handler.UpdateSettings)
				sa.GET("/plans", handler.GetPlans)
				sa.POST("/plans", handler.CreatePlan)
				sa.PUT("/plans/:id", handler.UpdatePlan)
				sa.DELETE("/plans/:id", handler.DeletePlan)
				sa.GET("/subscriptions", handler.GetSubscriptions)
				sa.GET("/payments", handler.GetPayments)
				sa.PUT("/subscriptions/:id/status", handler.UpdateSubscriptionStatus)
				sa.GET("/users", handler.GetUsers)
				sa.POST("/users", handler.CreateUser)
				sa.PUT("/users/:id", handler.UpdateUser)
				sa.DELETE("/users/:id", handler.DeleteUser)
				sa.GET("/audit-logs", handler.GetAuditLogs)
			}
		}
	}

	return r
}

func allowedOrigins() []string {
	origins := strings.TrimSpace(os.Getenv("CORS_ORIGINS"))
	if origins == "" {
		return []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	}
	return strings.Split(origins, ",")
}
