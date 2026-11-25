package router

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/handler"
	"belezapura_go_api/internal/middleware"
)

func New() *gin.Engine {
	r := gin.Default()
	_ = r.SetTrustedProxies(nil)
	r.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 8<<20)
		c.Next()
	})
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

	// CORS — allow configured origins (and localhost only when not in release mode)
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			origin = strings.TrimRight(strings.TrimSpace(origin), "/")
			if origin == "" {
				return false
			}
			for _, o := range allowedOrigins() {
				if strings.EqualFold(strings.TrimRight(strings.TrimSpace(o), "/"), origin) {
					return true
				}
			}
			if os.Getenv("GIN_MODE") != "release" {
				if strings.HasPrefix(origin, "http://localhost:") ||
					strings.HasPrefix(origin, "http://127.0.0.1:") ||
					origin == "http://localhost" ||
					origin == "http://127.0.0.1" {
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
		api.POST("/public/whatsapp-webhook", middleware.RateLimiter(60, time.Minute), handler.WhatsAppWebhookHandler)

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
		return []string{
			"https://servicesalobeleza.vercel.app",
			"https://belezapura.com.br",
			"https://www.belezapura.com.br",
		}
	}
	return strings.Split(origins, ",")
}
