package handler

import (
	"encoding/json"
	"github.com/google/uuid"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"belezapura_go_api/internal/db"
	"belezapura_go_api/internal/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

type serviceReq struct {
	Category string `json:"cat" binding:"max=100"`
	Name     string `json:"name"`
	Duration string `json:"duration"` // e.g. "45 min"
	Price    string `json:"price"`    // e.g. "R$ 50"
}

type professionalReq struct {
	Phone     *string `json:"phone" binding:"omitempty,max=30"`
	Name      string  `json:"name"`
	Specialty string  `json:"specialty"`
}

type scheduleReq struct {
	Day   string `json:"day"`
	Open  bool   `json:"open"`
	Start string `json:"start"`
	End   string `json:"end"`
}

type onboardingRequest struct {
	Address       db.Address        `json:"address"`
	Instagram     string            `json:"instagram" binding:"max=100"`
	PixName       string            `json:"pixName" binding:"max=120"`
	DepositPolicy *string           `json:"depositPolicy"`
	DepositType   *string           `json:"depositType"`
	DepositValue  *float64          `json:"depositValue"`
	SalonName     string            `json:"salonName" binding:"required"`
	Email         string            `json:"email" binding:"required,email"`
	Password      string            `json:"password" binding:"required,min=6"`
	Document      *string           `json:"document"`
	Phone         *string           `json:"phone"`
	PlanID        *string           `json:"planId"`
	PixKey        *string           `json:"pixKey"`
	Logo          *string           `json:"logo"`
	Cover         *string           `json:"cover"`
	Gallery       []string          `json:"gallery"`
	MainColor     *string           `json:"mainColor"`
	Services      []serviceReq      `json:"services"`
	Professionals []professionalReq `json:"professionals"`
	Schedule      []scheduleReq     `json:"schedule"`
}

// slugify converts a string to a URL-safe slug
func slugify(s string) string {
	// Normalize unicode
	t := transform.Chain(norm.NFD, transform.RemoveFunc(func(r rune) bool {
		return unicode.Is(unicode.Mn, r)
	}), norm.NFC)
	result, _, _ := transform.String(t, s)
	result = strings.ToLower(result)
	var b strings.Builder
	for _, r := range result {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			b.WriteRune('-')
		}
	}
	slug := strings.Trim(b.String(), "-")
	// Ensure uniqueness with timestamp suffix
	return slug + "-" + uuid.NewString()[:8]
}

func parsePrice(p string) float64 {
	p = strings.ReplaceAll(p, "R$", "")
	p = strings.ReplaceAll(p, " ", "")
	if strings.Contains(p, ",") {
		p = strings.ReplaceAll(p, ".", "")
		p = strings.ReplaceAll(p, ",", ".")
	}
	val, err := strconv.ParseFloat(p, 64)
	if err != nil || math.IsNaN(val) || math.IsInf(val, 0) {
		return -1
	}
	return val
}

func parseDuration(d string) int {
	d = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(d), " ", ""))
	if parts := regexp.MustCompile(`^(\d+)(?:h|:)(\d{1,2})?(?:min)?$`).FindStringSubmatch(d); parts != nil {
		h, _ := strconv.Atoi(parts[1])
		m, _ := strconv.Atoi(parts[2])
		if m >= 60 {
			return 0
		}
		return h*60 + m
	}
	val, _ := strconv.Atoi(strings.TrimSuffix(d, "min"))
	return val
}

func Onboarding(c *gin.Context) {
	if err := middleware.ValidateSecret(); err != nil {
		c.JSON(503, gin.H{"error": "Cadastro temporariamente indisponível."})
		return
	}
	var req onboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	policy, depositType, depositValue := "required", "percentage", 20.0
	if req.DepositPolicy != nil {
		policy = *req.DepositPolicy
	}
	if req.DepositType != nil {
		depositType = *req.DepositType
	}
	if req.DepositValue != nil {
		depositValue = *req.DepositValue
	}
	if err := validateDepositConfiguration(policy, depositType, depositValue); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.PixKey != nil && strings.TrimSpace(*req.PixKey) != "" {
		key := strings.TrimSpace(*req.PixKey)
		if _, err := generatePix(key, req.PixName, 1); err != nil {
			c.JSON(400, gin.H{"error": "Chave Pix inválida. Revise a chave antes de concluir."})
			return
		}
		req.PixKey = &key
	}

	// 1. Anti-Cheat: Check duplicate email
	var existing db.User
	if err := db.DB.Where("LOWER(TRIM(email)) = ?", cleanEmail).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Este e-mail já foi utilizado ou possui uma conta cadastrada. Faça login para continuar."})
		return
	}

	// 2. Anti-Cheat: Check duplicate Document (CPF / CNPJ)
	if req.Document != nil && strings.TrimSpace(*req.Document) != "" {
		cleanDoc := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(strings.TrimSpace(*req.Document), ".", ""), "-", ""), "/", "")
		var existingSalon db.Salon
		if err := db.DB.Where("document = ? OR REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = ?", *req.Document, cleanDoc).First(&existingSalon).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Este CPF/CNPJ já utilizou o período de demonstração gratuita. Não é permitido criar novas contas de teste com o mesmo documento."})
			return
		}
	}

	// 3. Anti-Cheat: Check duplicate PIX Key
	if req.PixKey != nil && strings.TrimSpace(*req.PixKey) != "" {
		var existingSalon db.Salon
		if err := db.DB.Where("pix_key = ?", strings.TrimSpace(*req.PixKey)).First(&existingSalon).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Esta chave PIX já foi cadastrada em outra conta. Por favor, acesse seu salão existente."})
			return
		}
	}

	planSlug := "studio"
	if req.PlanID != nil && strings.TrimSpace(*req.PlanID) != "" {
		planSlug = strings.ToLower(strings.TrimSpace(*req.PlanID))
	}
	aliases := map[string]string{"1": "essencial", "2": "studio", "3": "elite", "basico": "essencial", "premium": "elite"}
	if alias, ok := aliases[planSlug]; ok {
		planSlug = alias
	}
	var selectedPlan db.Plan
	if err := db.DB.Where("id::text = ? OR LOWER(name) = ?", planSlug, planSlug).First(&selectedPlan).Error; err != nil {
		c.JSON(400, gin.H{"error": "Plano inválido ou indisponível."})
		return
	}
	if len(req.Services) == 0 || len(req.Professionals) == 0 {
		c.JSON(400, gin.H{"error": "Cadastre ao menos um serviço e um profissional."})
		return
	}
	if selectedPlan.MaxProfessionals > 0 && len(req.Professionals) > selectedPlan.MaxProfessionals {
		c.JSON(400, gin.H{"error": "Equipe excede o limite do plano."})
		return
	}
	for _, service := range req.Services {
		if strings.TrimSpace(service.Name) == "" || parseDuration(service.Duration) <= 0 || parseDuration(service.Duration) > 1440 || parsePrice(service.Price) < 0 || parsePrice(service.Price) > 99999999 {
			c.JSON(400, gin.H{"error": "Serviço inválido."})
			return
		}
	}
	for _, pro := range req.Professionals {
		if strings.TrimSpace(pro.Name) == "" {
			c.JSON(400, gin.H{"error": "Profissional inválido."})
			return
		}
	}
	scheduleBytes, _ := json.Marshal(req.Schedule)
	if err := validateSchedule(string(scheduleBytes)); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	slug := slugify(req.SalonName)

	var galleryJSON string
	if len(req.Gallery) > 0 {
		b, _ := json.Marshal(req.Gallery)
		galleryJSON = string(b)
	}

	var scheduleJSON string
	if len(req.Schedule) > 0 {
		b, _ := json.Marshal(req.Schedule)
		scheduleJSON = string(b)
	}

	salon := db.Salon{
		Address:       req.Address,
		Instagram:     strings.TrimPrefix(strings.TrimSpace(req.Instagram), "@"),
		PixName:       strings.TrimSpace(req.PixName),
		DepositPolicy: policy, DepositType: depositType, DepositValue: depositValue,
		Name:        req.SalonName,
		Slug:        slug,
		Document:    req.Document,
		Phone:       req.Phone,
		PixKey:      req.PixKey,
		Logo:        req.Logo,
		Cover:       req.Cover,
		Gallery:     galleryJSON,
		MainColor:   req.MainColor,
		ScheduleRaw: scheduleJSON,
	}

	tx := db.DB.Begin()
	if tx.Error != nil {
		c.JSON(503, gin.H{"error": "Banco indisponível."})
		return
	}
	defer tx.Rollback()

	if err := tx.Create(&salon).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar salão."})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha."})
		return
	}

	user := db.User{
		Email:    cleanEmail,
		Password: string(hashed),
		Name:     "Admin " + req.SalonName,
		Role:     "owner",
		SalonID:  &salon.ID,
	}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário."})
		return
	}

	// Insert services
	for _, s := range req.Services {
		srv := db.Service{
			Category: strings.TrimSpace(s.Category),
			SalonID:  salon.ID,
			Name:     s.Name,
			Duration: parseDuration(s.Duration),
			Price:    parsePrice(s.Price),
		}
		if err := tx.Create(&srv).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Falha ao cadastrar serviços."})
			return
		}
	}

	// Insert professionals (respect plan limit if basic)
	for i, p := range req.Professionals {
		if selectedPlan.MaxProfessionals > 0 && i >= selectedPlan.MaxProfessionals {
			break // do not exceed plan limit
		}
		specialty := p.Specialty
		pro := db.Professional{
			Phone:     p.Phone,
			SalonID:   salon.ID,
			Name:      p.Name,
			Specialty: &specialty,
			Status:    "active",
		}
		if err := tx.Create(&pro).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Falha ao cadastrar equipe."})
			return
		}
	}

	// Create subscription respecting trial days from platform settings (default 14)
	var settings db.SystemSettings
	trialDays := 14
	if err := tx.First(&settings).Error; err == nil && settings.TrialDays >= 0 {
		trialDays = settings.TrialDays
	}

	var trialEnds *time.Time
	subStatus := "TRIAL"
	if trialDays > 0 {
		ends := time.Now().Add(time.Duration(trialDays) * 24 * time.Hour)
		trialEnds = &ends
	} else {
		subStatus = "LATE"
	}

	planIDToSave := selectedPlan.ID
	planPrice := selectedPlan.Price

	sub := db.Subscription{
		SalonID:   salon.ID,
		PlanID:    planIDToSave,
		Status:    subStatus,
		Price:     planPrice,
		TrialEnds: trialEnds,
	}
	if err := tx.Create(&sub).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Falha ao cadastrar assinatura."})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": "Não foi possível concluir o cadastro."})
		return
	}

	// Generate JWT Token
	token, err := middleware.GenerateToken(user.ID, salon.ID, user.Role, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token de autenticação."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Cadastro realizado com sucesso!",
		"token":   token,
		"salonId": salon.ID,
		"user": gin.H{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"salonSlug": salon.Slug,
			"role":      user.Role,
		},
	})
}
