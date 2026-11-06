package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"belezapura_go_api/internal/db"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"math"
	"time"
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

	mrrData := []gin.H{
		{"name": "Jul", "value": 0},
		{"name": "Ago", "value": 0},
		{"name": "Set", "value": 0},
		{"name": "Out", "value": mrrValue},
	}

	c.JSON(http.StatusOK, gin.H{
		"totalSalons":       totalSalons,
		"totalAppointments": totalAppointments,
		"totalClients":      totalClients,
		"mrrData":           mrrData,
		"mrrValue":          mrrValue,
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
		}

		result = append(result, gin.H{
			"id":           s.ID,
			"name":         s.Name,
			"owner":        owner,
			"units":        1,
			"plan":         plan,
			"status":       status,
			"since":        s.CreatedAt.Format("02/01/2006"),
			"appointments": apptCount,
			"lastAccess":   s.UpdatedAt.Format("02/01/2006"),
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
		Name  *string `json:"name"`
		Owner *string `json:"owner"`
		Plan  *string `json:"plan"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos."})
		return
	}

	if body.Plan != nil && *body.Plan != "" {
		c.JSON(400, gin.H{"error": "Alterações de plano exigem solicitação e conferência na aba Assinaturas."})
		return
	}
	if err := db.DB.Transaction(func(tx *gorm.DB) error {
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
			"pendingPlanName": pendingName,
			"id":              s.ID,
			"salon":           salonName,
			"salonId":         s.SalonID,
			"document":        document,
			"plan":            planName,
			"value":           "R$ " + formatMoney(s.Price),
			"status":          effectiveStatus,
			"next":            next,
			"pendingPlanId":   s.PendingPlanID, "requestedPrice": s.RequestedPrice, "currentPeriodEnd": s.CurrentPeriodEnd,
		})
	}

	c.JSON(http.StatusOK, result)
}

func UpdateSubscriptionStatus(c *gin.Context) {
	var body struct {
		Status           string  `json:"status" binding:"required"`
		PaymentReference string  `json:"paymentReference"`
		Amount           float64 `json:"amount"`
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
			if len(ref) < 6 || len(ref) > 160 || sub.PendingPlanID == nil || sub.RequestedPrice == nil {
				return bookingError{400, "Selecione uma solicitação pendente e informe a referência bancária do pagamento."}
			}
			if *sub.RequestedPrice <= 0 {
				return bookingError{400, "Valor de assinatura inválido."}
			}
			if math.Abs(body.Amount-*sub.RequestedPrice) > 0.005 {
				return bookingError{400, "O valor recebido deve corresponder ao valor solicitado."}
			}
			var plan db.Plan
			if err := tx.First(&plan, "id = ?", *sub.PendingPlanID).Error; err != nil {
				return bookingError{409, "Plano solicitado indisponível."}
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
			payment := db.Payment{SubscriptionID: sub.ID, Reference: ref, Amount: body.Amount, ApprovedBy: c.GetString("userId")}
			if err := tx.Create(&payment).Error; err != nil {
				return err
			}
			start := time.Now()
			if sub.Status == "ACTIVE" && sub.CurrentPeriodEnd != nil && sub.CurrentPeriodEnd.After(start) {
				start = *sub.CurrentPeriodEnd
			}
			end := start.AddDate(0, 1, 0)
			updates["plan_id"] = plan.ID
			updates["price"] = *sub.RequestedPrice
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
	Price            float64  `json:"price"`
	Period           string   `json:"period"`
	Highlight        bool     `json:"highlight"`
	Features         []string `json:"features"`
	MaxProfessionals int      `json:"maxProfessionals"`
	Color            string   `json:"color"`
}

func planToResponse(p db.Plan) planResponse {
	features := []string{"Página exclusiva e agendamento online", "Pix com conferência manual pelo salão", "Gestão de clientes e atendimentos", "Estoque por salão e painel financeiro"}
	if p.MaxProfessionals > 0 {
		features = append([]string{fmt.Sprintf("Até %d profissional(is)", p.MaxProfessionals)}, features...)
	} else {
		features = append([]string{"Profissionais ilimitados"}, features...)
	}
	return planResponse{
		ID:               p.ID,
		Name:             p.Name,
		Price:            p.Price,
		Period:           p.Period,
		Highlight:        p.Highlight,
		Features:         features,
		MaxProfessionals: p.MaxProfessionals,
		Color:            p.Color,
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
	featuresJSON, _ := json.Marshal(req.Features)
	plan := db.Plan{
		Name:             req.Name,
		Price:            req.Price,
		Period:           req.Period,
		Highlight:        req.Highlight,
		Features:         string(featuresJSON),
		MaxProfessionals: req.MaxProfessionals,
		Color:            req.Color,
	}

	if err := db.DB.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeAuditLog(c, "PLAN_CREATED", plan.Name, "Plano criado pelo superadmin.", "success")
	c.JSON(http.StatusCreated, planToResponse(plan))
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	if strings.TrimSpace(req.Name) == "" || req.Price <= 0 || req.MaxProfessionals < 0 {
		c.JSON(400, gin.H{"error": "Nome, preço e limite do plano inválidos."})
		return
	}
	featuresJSON, _ := json.Marshal(req.Features)
	db.DB.Model(&plan).Updates(db.Plan{
		Name:             req.Name,
		Price:            req.Price,
		Period:           req.Period,
		Highlight:        req.Highlight,
		Features:         string(featuresJSON),
		MaxProfessionals: req.MaxProfessionals,
		Color:            req.Color,
	})

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
	if payments == nil {
		payments = []db.Payment{}
	}
	c.JSON(200, payments)
}
