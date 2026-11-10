package handler

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"belezapura_go_api/internal/db"
)

// ─── Super Admin ─────────────────────────────────────────────────────────────

func formatMoney(value float64) string {
	return strings.Replace(fmt.Sprintf("%.2f", value), ".", ",", 1)
}

func normalizeSubscriptionStatus(status string) string {
	switch strings.ToUpper(status) {
	case "ACTIVE":
		return "ACTIVE"
	case "TRIAL":
		return "TRIAL"
	case "PENDING":
		return "PENDING"
	case "BLOCKED":
		return "BLOCKED"
	case "LATE":
		return "LATE"
	case "CANCELED", "CANCELLED":
		return "CANCELED"
	default:
		return ""
	}
}

func auditActor(c *gin.Context) (*string, *string) {
	userID := c.GetString("userId")
	if userID == "" {
		name := "SuperAdmin"
		return nil, &name
	}

	var user db.User
	name := "SuperAdmin"
	if err := db.DB.First(&user, "id = ?", userID).Error; err == nil {
		if user.Name != "" {
			name = user.Name
		} else if user.Email != "" {
			name = user.Email
		}
	}

	return &userID, &name
}

func writeAuditLog(c *gin.Context, action, resource, detail, level string) {
	if level == "" {
		level = "info"
	}
	userID, userName := auditActor(c)
	log := db.AdminAuditLog{
		Action:   action,
		UserID:   userID,
		UserName: userName,
		Resource: resource,
		Detail:   detail,
		Level:    level,
	}
	if err := db.DB.Create(&log).Error; err != nil {
		fmt.Printf("[AdminAuditLog] %v\n", err)
	}
}

func GetOverview(c *gin.Context) {
	var totalSalons, totalAppointments, totalClients int64
	db.DB.Model(&db.Salon{}).Count(&totalSalons)
	db.DB.Model(&db.Appointment{}).Count(&totalAppointments)
	db.DB.Model(&db.Client{}).Count(&totalClients)

	var activeSubs []db.Subscription
	db.DB.Where("status = ?", "ACTIVE").Find(&activeSubs)
	var mrrValue float64
	for _, s := range activeSubs {
		mrrValue += s.Price
	}

	var lateCount, trialCount int64
	db.DB.Model(&db.Subscription{}).Where("status IN ?", []string{"LATE", "BLOCKED"}).Count(&lateCount)
	db.DB.Model(&db.Subscription{}).Where("status = ?", "TRIAL").Count(&trialCount)

	var totalPaymentsReceived float64
	db.DB.Model(&db.Payment{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalPaymentsReceived)

	var pendingRevenue float64
	db.DB.Model(&db.Subscription{}).Where("pending_plan_id IS NOT NULL").Select("COALESCE(SUM(requested_price), 0)").Scan(&pendingRevenue)

	mrrData := []gin.H{
		{"name": "Jul", "value": 0},
		{"name": "Ago", "value": 0},
		{"name": "Set", "value": 0},
		{"name": "Out", "value": mrrValue},
	}

	c.JSON(http.StatusOK, gin.H{
		"totalSalons":          totalSalons,
		"activeSubscriptions":  len(activeSubs),
		"trialSubscriptions":   trialCount,
		"lateSubscriptions":    lateCount,
		"totalAppointments":    totalAppointments,
		"totalClients":         totalClients,
		"mrrData":              mrrData,
		"mrrValue":             mrrValue,
		"totalRevenueReceived": totalPaymentsReceived,
		"pendingRevenue":       pendingRevenue,
	})
}

func GetSalons(c *gin.Context) {
	var salons []db.Salon
	db.DB.Preload("Users").Preload("Subscriptions.Plan").Order("created_at desc").Find(&salons)

	result := make([]gin.H, 0, len(salons))
	for _, s := range salons {
		var apptCount int64
		db.DB.Model(&db.Appointment{}).Where("salon_id = ?", s.ID).Count(&apptCount)

		owner := "Sem dono"
		if len(s.Users) > 0 {
			owner = s.Users[0].Name
		}
		plan := "Studio"
		status := "TRIAL"
		trialEnds := ""
		if len(s.Subscriptions) > 0 {
			lastSub := s.Subscriptions[len(s.Subscriptions)-1]
			if lastSub.Plan != nil && lastSub.Plan.Name != "" {
				plan = lastSub.Plan.Name
			} else if lastSub.PlanID != "" {
				var p db.Plan
				if err := db.DB.First(&p, "id = ?", lastSub.PlanID).Error; err == nil && p.Name != "" {
					plan = p.Name
				} else {
					plan = lastSub.PlanID
				}
			}
			if lastSub.Status != "" {
				status = lastSub.Status
			}
			if lastSub.TrialEnds != nil {
				trialEnds = lastSub.TrialEnds.Format("2006-01-02")
			}
		}

		wa := getWhatsAppStatus(s)
		result = append(result, gin.H{
			"id":                   s.ID,
			"name":                 s.Name,
			"owner":                owner,
			"units":                1,
			"plan":                 plan,
			"status":               status,
			"trialEnds":            trialEnds,
			"since":                s.CreatedAt.Format("02/01/2006"),
			"appointments":         apptCount,
			"lastAccess":           s.UpdatedAt.Format("02/01/2006"),
			"whatsappEnabled":      s.WhatsAppEnabled,
			"whatsappMonthlyLimit": s.WhatsAppMonthlyLimit,
			"whatsappLimit":        wa.Limit,
			"whatsappPlanLimit":    wa.PlanLimit,
			"whatsappUsed":         wa.Used,
		})
	}

	c.JSON(http.StatusOK, result)
}

func BlockSalon(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Salon ID is required"})
		return
	}

	var salon db.Salon
	if err := db.DB.First(&salon, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}

	var subscription db.Subscription
	if err := db.DB.
		Where("salon_id = ?", salon.ID).
		Order("created_at desc").
		First(&subscription).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Salão sem assinatura para bloquear."})
		return
	}

	if err := db.DB.Model(&subscription).Update("status", "BLOCKED").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	writeAuditLog(c, "BLOCK_SALON", salon.Name, "Salão bloqueado pelo superadmin.", "warning")
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func UpdateSalon(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Salon ID is required"})
		return
	}

	var salon db.Salon
	if err := db.DB.Preload("Subscriptions").First(&salon, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}

	var body struct {
		Name                 *string `json:"name"`
		Owner                *string `json:"owner"`
		Plan                 *string `json:"plan"`
		Status               *string `json:"status"`
		TrialEnds            *string `json:"trialEnds"`
		WhatsAppEnabled      *bool   `json:"whatsappEnabled"`
		WhatsAppMonthlyLimit *int    `json:"whatsappMonthlyLimit"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if err := db.DB.Transaction(func(tx *gorm.DB) error {
		if body.WhatsAppEnabled != nil {
			if err := tx.Model(&salon).Update("whatsapp_enabled", *body.WhatsAppEnabled).Error; err != nil {
				return err
			}
		}
		if body.WhatsAppMonthlyLimit != nil && *body.WhatsAppMonthlyLimit >= 0 {
			if err := tx.Model(&salon).Update("whatsapp_monthly_limit", *body.WhatsAppMonthlyLimit).Error; err != nil {
				return err
			}
		}
		if body.Name != nil && strings.TrimSpace(*body.Name) != "" {
			if err := tx.Model(&salon).Update("name", strings.TrimSpace(*body.Name)).Error; err != nil {
				return err
			}
		}
		if body.Owner != nil && strings.TrimSpace(*body.Owner) != "" {
			if err := tx.Model(&db.User{}).Where("salon_id = ? AND role = ?", salon.ID, "owner").Update("name", strings.TrimSpace(*body.Owner)).Error; err != nil {
				return err
			}
		}
		if (body.Plan != nil && strings.TrimSpace(*body.Plan) != "") || (body.Status != nil && strings.TrimSpace(*body.Status) != "") || (body.TrialEnds != nil && strings.TrimSpace(*body.TrialEnds) != "") {
			var sub db.Subscription
			if err := tx.Where("salon_id = ?", salon.ID).Order("created_at desc").First(&sub).Error; err == nil {
				subUpdates := map[string]interface{}{}
				if body.Plan != nil && strings.TrimSpace(*body.Plan) != "" {
					planInput := strings.TrimSpace(*body.Plan)
					var targetPlan db.Plan
					if err := tx.Where("LOWER(name) = LOWER(?) OR id = ?", planInput, planInput).First(&targetPlan).Error; err == nil {
						subUpdates["plan_id"] = targetPlan.ID
						subUpdates["price"] = targetPlan.Price
					}
				}
				if body.Status != nil && strings.TrimSpace(*body.Status) != "" {
					norm := normalizeSubscriptionStatus(*body.Status)
					if norm != "" {
						subUpdates["status"] = norm
						if norm == "ACTIVE" {
							end := time.Now().AddDate(0, 1, 0)
							subUpdates["current_period_end"] = end
						}
					}
				}
				if body.TrialEnds != nil && strings.TrimSpace(*body.TrialEnds) != "" {
					if parsedDate, err := time.Parse("2006-01-02", strings.TrimSpace(*body.TrialEnds)); err == nil {
						endOfDay := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 23, 59, 59, 0, time.UTC)
						subUpdates["trial_ends"] = endOfDay
					}
				}
				if len(subUpdates) > 0 {
					if err := tx.Model(&sub).Updates(subUpdates).Error; err != nil {
						return err
					}
				}
			}
		}
		return nil
	}); err != nil {
		bookingFailure(c, err)
		return
	}

	writeAuditLog(c, "UPDATE_SALON", salon.Name, "Dados do salão atualizados pelo superadmin.", "info")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Salão atualizado com sucesso."})
}

func DeleteSalon(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Salon ID is required"})
		return
	}

	var salon db.Salon
	if err := db.DB.First(&salon, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salão não encontrado."})
		return
	}

	db.DB.Model(&db.Subscription{}).Where("salon_id = ?", salon.ID).Update("status", "CANCELED")
	db.DB.Delete(&salon)

	writeAuditLog(c, "DELETE_SALON", salon.Name, "Salão removido pelo superadmin.", "warning")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Salão removido com sucesso."})
}

func GetSettings(c *gin.Context) {
	var settings db.SystemSettings
	if err := db.DB.First(&settings).Error; err != nil {
		// create defaults
		settings = db.SystemSettings{}
		db.DB.Create(&settings)
	}
	c.JSON(http.StatusOK, settings)
}

func UpdateSettings(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var settings db.SystemSettings
	if err := db.DB.First(&settings).Error; err != nil {
		settings = db.SystemSettings{}
		db.DB.Create(&settings)
	}

	db.DB.Model(&settings).Updates(body)
	writeAuditLog(c, "SETTINGS_UPDATE", "Configurações", "Configurações da plataforma atualizadas.", "info")
	c.JSON(http.StatusOK, settings)
}

func GetSubscriptions(c *gin.Context) {
	var subs []db.Subscription
	db.DB.
		Preload("Salon").
		Preload("Plan").
		Order("created_at desc").
		Find(&subs)

	result := make([]gin.H, 0, len(subs))
	for _, s := range subs {
		salonName := "Sem salão"
		document := "Não informado"
		if s.Salon.ID != "" {
			salonName = s.Salon.Name
			if s.Salon.Document != nil && *s.Salon.Document != "" {
				document = *s.Salon.Document
			}
		}

		planName := "Sem plano"
		if s.Plan != nil {
			planName = s.Plan.Name
		}

		next := "—"
		if s.Status == "ACTIVE" {
			if s.CurrentPeriodEnd != nil {
				next = s.CurrentPeriodEnd.Format("02/01/2006")
			}
		}

		pendingName := ""
		if s.PendingPlanID != nil {
			var plan db.Plan
			if db.DB.First(&plan, "id = ?", *s.PendingPlanID).Error == nil {
				pendingName = plan.Name
			}
		}
		effectiveStatus := s.Status
		if (s.Status == "ACTIVE" || s.Status == "TRIAL") && !s.AllowsAccess(time.Now()) {
			effectiveStatus = "EXPIRED"
		}
		result = append(result, gin.H{
			"pendingPlanName":  pendingName,
			"id":               s.ID,
			"salon":            salonName,
			"salonId":          s.SalonID,
			"document":         document,
			"plan":             planName,
			"planId":           s.PlanID,
			"priceNumeric":     s.Price,
			"value":            "R$ " + formatMoney(s.Price),
			"status":           effectiveStatus,
			"next":             next,
			"pendingPlanId":    s.PendingPlanID,
			"requestedPrice":   s.RequestedPrice,
			"currentPeriodEnd": s.CurrentPeriodEnd,
		})
	}

	c.JSON(http.StatusOK, result)
}

func UpdateSubscriptionStatus(c *gin.Context) {
	var body struct {
		Status           string  `json:"status" binding:"required"`
		PaymentReference string  `json:"paymentReference"`
		Amount           float64 `json:"amount"`
		PlanID           string  `json:"planId"`
	}
	if c.ShouldBindJSON(&body) != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos."})
		return
	}
	status := normalizeSubscriptionStatus(body.Status)
	if status == "" || status == "TRIAL" || status == "PENDING" {
		c.JSON(400, gin.H{"error": "Status inválido. Trial não pode ser reiniciado."})
		return
	}
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var sub db.Subscription
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&sub, "id = ?", c.Param("id")).Error; err != nil {
			return bookingError{404, "Assinatura não encontrada."}
		}
		updates := map[string]interface{}{"status": status}
		if status == "ACTIVE" {
			ref := strings.TrimSpace(body.PaymentReference)
			if len(ref) < 6 || len(ref) > 160 {
				return bookingError{400, "Informe a referência bancária do pagamento (mínimo 6 caracteres)."}
			}
			targetPlanID := sub.PlanID
			expectedPrice := sub.Price
			if sub.PendingPlanID != nil && *sub.PendingPlanID != "" {
				targetPlanID = *sub.PendingPlanID
			}
			if strings.TrimSpace(body.PlanID) != "" {
				targetPlanID = strings.TrimSpace(body.PlanID)
			}
			var plan db.Plan
			if err := tx.First(&plan, "id = ?", targetPlanID).Error; err != nil {
				return bookingError{409, "Plano solicitado indisponível."}
			}
			if sub.RequestedPrice != nil && *sub.RequestedPrice > 0 && (body.PlanID == "" || (sub.PendingPlanID != nil && body.PlanID == *sub.PendingPlanID)) {
				expectedPrice = *sub.RequestedPrice
			} else {
				expectedPrice = plan.Price
			}
			finalPrice := body.Amount
			if finalPrice <= 0 {
				finalPrice = expectedPrice
			}
			if finalPrice <= 0 {
				return bookingError{400, "Valor de assinatura inválido."}
			}
			if sub.PendingPlanID != nil && sub.RequestedPrice != nil && math.Abs(finalPrice-*sub.RequestedPrice) > 0.005 && body.PlanID == "" {
				return bookingError{400, "O valor recebido deve corresponder ao valor solicitado."}
			}
			if plan.MaxSubscriptions > 0 {
				var n int64
				if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&plan, "id = ?", plan.ID).Error; err != nil {
					return err
				}
				if err := tx.Model(&db.Subscription{}).Where("plan_id = ? AND salon_id <> ? AND status = ? AND current_period_end > ?", plan.ID, sub.SalonID, "ACTIVE", time.Now()).Count(&n).Error; err != nil {
					return err
				}
				if n >= int64(plan.MaxSubscriptions) {
					return bookingError{409, "Plano sem vagas."}
				}
			}
			if plan.MaxProfessionals > 0 {
				var active int64
				if err := tx.Model(&db.Professional{}).Where("salon_id = ? AND status = ?", sub.SalonID, "active").Count(&active).Error; err != nil {
					return err
				}
				if active > int64(plan.MaxProfessionals) {
					return bookingError{409, "Reduza a equipe ativa antes de aprovar este plano."}
				}
			}
			payment := db.Payment{SubscriptionID: sub.ID, Reference: ref, Amount: finalPrice, ApprovedBy: c.GetString("userId")}
			if err := tx.Create(&payment).Error; err != nil {
				return err
			}
			start := time.Now()
			if sub.Status == "ACTIVE" && sub.CurrentPeriodEnd != nil && sub.CurrentPeriodEnd.After(start) {
				start = *sub.CurrentPeriodEnd
			}
			end := start.AddDate(0, 1, 0)
			updates["plan_id"] = plan.ID
			updates["price"] = finalPrice
			updates["current_period_end"] = end
			updates["trial_ends"] = nil
			updates["pending_plan_id"] = nil
			updates["requested_price"] = nil
			updates["payment_reference"] = ref
		}
		if status == "CANCELED" || status == "BLOCKED" {
			updates["pending_plan_id"] = nil
			updates["requested_price"] = nil
		}
		if err := tx.Model(&sub).Updates(updates).Error; err != nil {
			return err
		}
		return tx.Create(&db.AdminAuditLog{Action: "SUBSCRIPTION_STATUS_UPDATE", UserID: ptr(c.GetString("userId")), Resource: sub.ID, Detail: "Assinatura alterada para " + status, Level: "info"}).Error
	})
	if err != nil {
		bookingFailure(c, err)
		return
	}
	c.JSON(200, gin.H{"message": "Assinatura atualizada."})
}
func ptr(s string) *string { return &s }

type adminUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
	Status   string `json:"status"`
}

func adminUserResponse(user db.User) gin.H {
	return gin.H{
		"id":     user.ID,
		"name":   user.Name,
		"email":  user.Email,
		"role":   user.Role,
		"status": user.Status,
		"last":   user.UpdatedAt.Format("02/01/2006"),
	}
}

func GetUsers(c *gin.Context) {
	var users []db.User
	db.DB.
		Where("salon_id IS NULL OR role = ?", "superadmin").
		Order("updated_at desc").
		Find(&users)

	result := make([]gin.H, 0, len(users))
	for _, user := range users {
		result = append(result, adminUserResponse(user))
	}

	c.JSON(http.StatusOK, result)
}

func CreateUser(c *gin.Context) {
	var req adminUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome, e-mail e senha são obrigatórios."})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha."})
		return
	}

	role := req.Role
	if role == "" {
		role = "admin"
	}
	status := req.Status
	if status == "" {
		status = "active"
	}

	user := db.User{
		Name:     strings.TrimSpace(req.Name),
		Email:    strings.ToLower(strings.TrimSpace(req.Email)),
		Password: string(hashed),
		Role:     role,
		Status:   status,
		SalonID:  nil,
	}

	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Não foi possível criar o usuário."})
		return
	}

	writeAuditLog(c, "USER_CREATED", user.Email, "Usuário administrativo criado.", "success")
	c.JSON(http.StatusCreated, adminUserResponse(user))
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req adminUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user db.User
	if err := db.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado."})
		return
	}
	if user.AuthProvider == "supabase" && (req.Password != "" || (req.Email != "" && !strings.EqualFold(strings.TrimSpace(req.Email), user.Email))) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail e senha desta conta são gerenciados pelo Supabase."})
		return
	}

	updates := map[string]interface{}{"token_version": gorm.Expr("token_version + 1")}
	if strings.TrimSpace(req.Name) != "" {
		updates["name"] = strings.TrimSpace(req.Name)
	}
	if strings.TrimSpace(req.Email) != "" {
		updates["email"] = strings.ToLower(strings.TrimSpace(req.Email))
	}
	if strings.TrimSpace(req.Role) != "" {
		updates["role"] = strings.TrimSpace(req.Role)
	}
	if strings.TrimSpace(req.Status) != "" {
		updates["status"] = strings.TrimSpace(req.Status)
	}
	if strings.TrimSpace(req.Password) != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha."})
			return
		}
		updates["password"] = string(hashed)
	}

	if err := db.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	db.DB.First(&user, "id = ?", id)
	writeAuditLog(c, "USER_UPDATED", user.Email, "Usuário administrativo atualizado.", "info")
	c.JSON(http.StatusOK, adminUserResponse(user))
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	var user db.User
	if err := db.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado."})
		return
	}

	if err := db.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeAuditLog(c, "USER_DELETED", user.Email, "Usuário administrativo removido.", "warning")
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// ─── Plans ────────────────────────────────────────────────────────────────────

type planResponse struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Category         string   `json:"category"`
	Price            float64  `json:"price"`
	Period           string   `json:"period"`
	Highlight        bool     `json:"highlight"`
	Features         []string `json:"features"`
	MaxProfessionals int      `json:"maxProfessionals"`
	Color            string   `json:"color"`
}

func inferPlanCategory(p db.Plan) string {
	nameLower := strings.ToLower(strings.TrimSpace(p.Name))
	switch {
	case strings.Contains(nameLower, "elite") || strings.Contains(nameLower, "vip") || strings.Contains(nameLower, "premium") || p.MaxProfessionals == 0 || p.Price >= 200:
		return "Completo / VIP"
	case strings.Contains(nameLower, "studio") || strings.Contains(nameLower, "equipe") || strings.Contains(nameLower, "pro") || p.MaxProfessionals > 1 || p.Price >= 100:
		return "Intermediário / Equipe"
	default:
		return "Inicial / Autônoma"
	}
}

func defaultTierFeatures(p db.Plan) []string {
	cat := inferPlanCategory(p)
	switch cat {
	case "Completo / VIP":
		proLabel := "Profissionais ilimitados"
		if p.MaxProfessionals > 0 {
			proLabel = fmt.Sprintf("Até %d profissionais ativos", p.MaxProfessionals)
		}
		return []string{
			"Tudo do plano Studio incluso",
			proLabel,
			"Automação WhatsApp & Bot IA 24h (franquia de até 1.000 disparos/mês)",
			"Assessoria VIP: Google Meu Negócio otimizado com botão no Google Maps",
			"Controle de estoque completo com alerta de reposição",
			"Relatórios avançados de faturamento, retenção e ticket médio",
			"Múltiplos acessos por perfil (Recepção e Profissionais)",
			"Suporte prioritário VIP",
		}
	case "Intermediário / Equipe":
		proLabel := "Até 5 profissionais na equipe"
		if p.MaxProfessionals > 0 {
			proLabel = fmt.Sprintf("Até %d profissionais na equipe", p.MaxProfessionals)
		} else {
			proLabel = "Profissionais ilimitados"
		}
		return []string{
			"Tudo do plano Essencial incluso",
			proLabel,
			"Avisos automáticos no WhatsApp sob demanda (franquia de até 150 disparos/mês)",
			"Gestão de comissões e rateio automático por profissional",
			"Painel financeiro completo (fluxo de caixa e receitas)",
			"Agenda multi-profissional com bloqueio de horários",
			"Relatórios gerenciais de desempenho",
			"Controle de estoque de produtos do salão",
		}
	default:
		proLabel := "Até 1 profissional (autônoma)"
		if p.MaxProfessionals > 1 {
			proLabel = fmt.Sprintf("Até %d profissionais", p.MaxProfessionals)
		} else if p.MaxProfessionals == 0 {
			proLabel = "Profissionais ilimitados"
		}
		return []string{
			proLabel,
			"Página exclusiva na Bio e agendamento online 24h",
			"Gestão de agenda, clientes e catálogo de serviços",
			"Sinal antecipado via Pix com conferência no painel",
			"Aviso de WhatsApp com 1 clique na agenda (envio manual sem custo extra)",
			"Mural de avaliações de clientes na página pública",
		}
	}
}

func isLegacyGenericFeatures(features []string) bool {
	if len(features) == 0 {
		return true
	}
	joined := strings.Join(features, "|")
	// Detect the old generic 4-item seed that was identical across all plans
	if strings.Contains(joined, "Página exclusiva e agendamento online") &&
		strings.Contains(joined, "Estoque por salão e painel financeiro") &&
		len(features) <= 5 {
		return true
	}
	return false
}

func planToResponse(p db.Plan) planResponse {
	var parsed []string
	if strings.TrimSpace(p.Features) != "" {
		_ = json.Unmarshal([]byte(p.Features), &parsed)
	}
	// Clean empty strings
	clean := make([]string, 0, len(parsed))
	for _, f := range parsed {
		if t := strings.TrimSpace(f); t != "" {
			clean = append(clean, t)
		}
	}
	if isLegacyGenericFeatures(clean) {
		clean = defaultTierFeatures(p)
		// Persist upgraded tiered features in DB asynchronously so DB stays in sync
		if b, err := json.Marshal(clean); err == nil {
			db.DB.Model(&db.Plan{}).Where("id = ?", p.ID).Update("features", string(b))
		}
	}
	period := p.Period
	if strings.TrimSpace(period) == "" {
		period = "/mês"
	}
	color := p.Color
	if strings.TrimSpace(color) == "" {
		color = "#B8614A"
	}
	return planResponse{
		ID:               p.ID,
		Name:             p.Name,
		Category:         inferPlanCategory(p),
		Price:            p.Price,
		Period:           period,
		Highlight:        p.Highlight,
		Features:         clean,
		MaxProfessionals: p.MaxProfessionals,
		Color:            color,
	}
}

func GetPlans(c *gin.Context) {
	var plans []db.Plan
	db.DB.Order("price asc").Find(&plans)

	resp := make([]planResponse, 0, len(plans))
	for _, p := range plans {
		resp = append(resp, planToResponse(p))
	}
	c.JSON(http.StatusOK, resp)
}

type planRequest struct {
	Name             string   `json:"name"`
	Price            float64  `json:"price"`
	Period           string   `json:"period"`
	Highlight        bool     `json:"highlight"`
	Features         []string `json:"features"`
	MaxProfessionals int      `json:"maxProfessionals"`
	Color            string   `json:"color"`
}

func CreatePlan(c *gin.Context) {
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(req.Name) == "" || req.Price <= 0 || req.MaxProfessionals < 0 {
		c.JSON(400, gin.H{"error": "Nome, preço e limite do plano inválidos."})
		return
	}
	period := strings.TrimSpace(req.Period)
	if period == "" {
		period = "/mês"
	}
	color := strings.TrimSpace(req.Color)
	if color == "" {
		color = "#B8614A"
	}
	tempPlan := db.Plan{
		Name:             strings.TrimSpace(req.Name),
		Price:            req.Price,
		Period:           period,
		Highlight:        req.Highlight,
		MaxProfessionals: req.MaxProfessionals,
		Color:            color,
	}
	features := make([]string, 0, len(req.Features))
	for _, f := range req.Features {
		if t := strings.TrimSpace(f); t != "" {
			features = append(features, t)
		}
	}
	if len(features) == 0 {
		features = defaultTierFeatures(tempPlan)
	}
	featuresJSON, _ := json.Marshal(features)
	tempPlan.Features = string(featuresJSON)

	if err := db.DB.Create(&tempPlan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeAuditLog(c, "PLAN_CREATED", tempPlan.Name, "Plano criado pelo superadmin.", "success")
	c.JSON(http.StatusCreated, planToResponse(tempPlan))
}

func UpdatePlan(c *gin.Context) {
	id := c.Param("id")
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var plan db.Plan
	if err := db.DB.First(&plan, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plano não encontrado."})
		return
	}

	if strings.TrimSpace(req.Name) == "" || req.Price <= 0 || req.MaxProfessionals < 0 {
		c.JSON(400, gin.H{"error": "Nome, preço e limite do plano inválidos."})
		return
	}
	period := strings.TrimSpace(req.Period)
	if period == "" {
		period = plan.Period
		if period == "" {
			period = "/mês"
		}
	}
	color := strings.TrimSpace(req.Color)
	if color == "" {
		color = plan.Color
		if color == "" {
			color = "#B8614A"
		}
	}

	features := make([]string, 0, len(req.Features))
	for _, f := range req.Features {
		if t := strings.TrimSpace(f); t != "" {
			features = append(features, t)
		}
	}
	if len(features) == 0 {
		features = defaultTierFeatures(db.Plan{
			Name:             strings.TrimSpace(req.Name),
			Price:            req.Price,
			MaxProfessionals: req.MaxProfessionals,
		})
	}
	featuresJSON, _ := json.Marshal(features)

	updates := map[string]interface{}{
		"name":              strings.TrimSpace(req.Name),
		"price":             req.Price,
		"period":            period,
		"highlight":         req.Highlight,
		"features":          string(featuresJSON),
		"max_professionals": req.MaxProfessionals,
		"color":             color,
	}
	if err := db.DB.Model(&plan).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	db.DB.First(&plan, "id = ?", id)
	writeAuditLog(c, "PLAN_UPDATE", plan.Name, "Plano atualizado pelo superadmin.", "info")
	c.JSON(http.StatusOK, planToResponse(plan))
}

func DeletePlan(c *gin.Context) {
	id := c.Param("id")
	var plan db.Plan
	if err := db.DB.First(&plan, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	if err := db.DB.Delete(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeAuditLog(c, "PLAN_DELETED", plan.Name, "Plano removido pelo superadmin.", "warning")
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func GetAuditLogs(c *gin.Context) {
	var logs []db.AdminAuditLog
	if err := db.DB.Order("created_at desc").Limit(200).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result := make([]gin.H, 0, len(logs))
	for _, log := range logs {
		user := "Sistema"
		if log.UserName != nil && *log.UserName != "" {
			user = *log.UserName
		}

		result = append(result, gin.H{
			"id":       log.ID,
			"action":   log.Action,
			"user":     user,
			"resource": log.Resource,
			"detail":   log.Detail,
			"level":    log.Level,
			"time":     log.CreatedAt.Format("02/01/2006 15:04"),
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetPayments(c *gin.Context) {
	var payments []db.Payment
	if err := db.DB.Order("created_at desc").Limit(1000).Find(&payments).Error; err != nil {
		bookingFailure(c, err)
		return
	}

	var subs []db.Subscription
	db.DB.Find(&subs)
	subMap := make(map[string]db.Subscription, len(subs))
	for _, s := range subs {
		subMap[s.ID] = s
	}

	var salons []db.Salon
	db.DB.Find(&salons)
	salonNameByID := make(map[string]string, len(salons))
	for _, s := range salons {
		salonNameByID[s.ID] = s.Name
	}

	var plans []db.Plan
	db.DB.Find(&plans)
	planNameByID := make(map[string]string, len(plans))
	for _, p := range plans {
		planNameByID[p.ID] = p.Name
	}

	result := make([]gin.H, 0, len(payments))
	for _, p := range payments {
		salonName := "Salão"
		planName := "-"
		if sub, ok := subMap[p.SubscriptionID]; ok {
			if name := salonNameByID[sub.SalonID]; name != "" {
				salonName = name
			}
			if sub.PlanID != "" {
				if pn := planNameByID[sub.PlanID]; pn != "" {
					planName = pn
				}
			}
			if planName == "-" && sub.PendingPlanID != nil && *sub.PendingPlanID != "" {
				if pn := planNameByID[*sub.PendingPlanID]; pn != "" {
					planName = pn
				}
			}
		}
		result = append(result, gin.H{
			"id":             p.ID,
			"subscriptionId": p.SubscriptionID,
			"salon":          salonName,
			"plan":           planName,
			"reference":      p.Reference,
			"amount":         p.Amount,
			"createdAt":      p.CreatedAt,
		})
	}
	c.JSON(200, result)
}
