package main

import (
	"log"
	"os"
	"time"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/handler"
	"belezapura_go_api/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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

	// Auto-migrate
	if err := db.Migrate(); err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}

	r := gin.Default()

	// Security Headers (Anti-XSS, anti-sniff, clickjacking protection)
	r.Use(middleware.SecurityHeaders())

	// CORS — allow the Vite dev server and any origin in dev
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
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

		// ── Protected routes ────────────────────────────────────────
		auth := api.Group("/")
		auth.Use(middleware.AuthRequired())
		auth.Use(middleware.TrialEnforcer())
		{
			// Appointments
			auth.POST("/appointments", handler.CreateAppointment)
			auth.GET("/appointments", handler.ListAppointments)
			auth.PUT("/appointments/:id", handler.UpdateAppointment)
			auth.DELETE("/appointments/:id", handler.DeleteAppointment)

			// Salon (owner dashboard)
			auth.GET("/salon/dashboard", handler.GetSalonDashboard)
			auth.GET("/salon/details", handler.GetSalonDetails)
			auth.PUT("/salon/details", handler.UpdateSalonDetails)
			auth.POST("/salon/upgrade-plan", handler.UpgradePlan)
			auth.GET("/salon/clients", handler.GetSalonClients)
			auth.POST("/salon/clients", handler.CreateSalonClient)
			auth.PUT("/salon/clients/:id", handler.UpdateSalonClient)
			auth.DELETE("/salon/clients/:id", handler.DeleteSalonClient)

			// Services & professionals
			auth.POST("/services", handler.CreateService)
			auth.PUT("/services/:id", handler.UpdateService)
			auth.DELETE("/services/:id", handler.DeleteService)

			auth.POST("/professionals", handler.CreateProfessional)
			auth.PUT("/professionals/:id", handler.UpdateProfessional)
			auth.DELETE("/professionals/:id", handler.DeleteProfessional)

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
				sa.PUT("/subscriptions/:id/status", handler.UpdateSubscriptionStatus)
				sa.GET("/users", handler.GetUsers)
				sa.POST("/users", handler.CreateUser)
				sa.PUT("/users/:id", handler.UpdateUser)
				sa.DELETE("/users/:id", handler.DeleteUser)
				sa.GET("/audit-logs", handler.GetAuditLogs)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3050"
	}
	log.Printf("🚀 BelezaPura API (Go) running on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
