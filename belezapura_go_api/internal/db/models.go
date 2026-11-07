package db

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── BeforeCreate hook to generate UUIDs ────────────────────────────────────

func newUUID() string {
	return uuid.New().String()
}

// ─── Models ──────────────────────────────────────────────────────────────────

type User struct {
	AuthProvider string         `gorm:"not null;default:local" json:"-"`
	TokenVersion int            `gorm:"not null;default:0" json:"-"`
	ID           string         `gorm:"primaryKey;type:uuid" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	Password     string         `gorm:"not null" json:"-"`
	Name         string         `gorm:"not null" json:"name"`
	Role         string         `gorm:"default:owner" json:"role"` // owner | superadmin
	Status       string         `gorm:"default:active" json:"status"`
	SalonID      *string        `json:"salonId"`
	Salon        *Salon         `gorm:"foreignKey:SalonID" json:"salon,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = newUUID()
	}
	return nil
}

type Address struct {
	ZipCode  string `json:"zipCode"`
	Street   string `json:"street"`
	Number   string `json:"number"`
	District string `json:"district"`
	City     string `json:"city"`
	State    string `json:"state"`
}

type Salon struct {
	Address       Address        `gorm:"embedded;embeddedPrefix:address_" json:"address"`
	Instagram     string         `json:"instagram"`
	PixName       string         `json:"pixName"`
	DepositPolicy string         `gorm:"not null;default:required" json:"depositPolicy"`
	DepositType   string         `gorm:"not null;default:percentage" json:"depositType"`
	DepositValue  float64        `gorm:"type:decimal(10,2);not null;default:20" json:"depositValue"`
	Timezone      string         `gorm:"not null;default:America/Sao_Paulo" json:"timezone"`
	BlockedDates  string         `gorm:"type:text;not null;default:'[]'" json:"blockedDates"`
	// WhatsApp sob demanda: só dispara quando o Super Admin ativa para o salão.
	WhatsAppEnabled      bool `gorm:"column:whatsapp_enabled;not null;default:false" json:"whatsappEnabled"`
	WhatsAppMonthlyLimit int  `gorm:"column:whatsapp_monthly_limit;not null;default:0" json:"whatsappMonthlyLimit"` // 0 = usa o padrão do plano
	ID            string         `gorm:"primaryKey;type:uuid" json:"id"`
	Slug          string         `gorm:"uniqueIndex;not null" json:"slug"`
	Name          string         `gorm:"not null" json:"name"`
	Document      *string        `gorm:"index" json:"document"`
	Phone         *string        `json:"phone"`
	PixKey        *string        `json:"pixKey"`
	Logo          *string        `gorm:"type:text" json:"logo"`
	Cover         *string        `gorm:"type:text" json:"cover"`
	Gallery       string         `gorm:"type:text" json:"gallery"`
	MainColor     *string        `json:"mainColor"`
	ScheduleRaw   string         `gorm:"type:text" json:"scheduleRaw"`
	Users         []User         `gorm:"foreignKey:SalonID" json:"users,omitempty"`
	Clients       []Client       `gorm:"foreignKey:SalonID" json:"clients,omitempty"`
	Professionals []Professional `gorm:"foreignKey:SalonID" json:"professionals,omitempty"`
	Services      []Service      `gorm:"foreignKey:SalonID" json:"services,omitempty"`
	Appointments  []Appointment  `gorm:"foreignKey:SalonID" json:"appointments,omitempty"`
	Subscriptions []Subscription `gorm:"foreignKey:SalonID" json:"subscriptions,omitempty"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Salon) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = newUUID()
	}
	return nil
}

type Client struct {
	ID           string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID      string         `gorm:"not null" json:"salonId"`
	Salon        Salon          `gorm:"foreignKey:SalonID" json:"-"`
	Name         string         `gorm:"not null" json:"name"`
	Phone        *string        `json:"phone"`
	Status       string         `gorm:"default:active" json:"status"`
	LastVisit    *time.Time     `json:"lastVisit"`
	Visits       int            `gorm:"default:0" json:"visits"`
	TotalSpent   float64        `gorm:"default:0.0;type:decimal(10,2)" json:"totalSpent"`
	Tags         string         `gorm:"type:text" json:"tags"` // comma-separated
	Appointments []Appointment  `gorm:"foreignKey:ClientID" json:"appointments,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Client) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = newUUID()
	}
	return nil
}

type Professional struct {
	Phone        *string        `json:"phone,omitempty"`
	ID           string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID      string         `gorm:"not null" json:"salonId"`
	Salon        Salon          `gorm:"foreignKey:SalonID" json:"-"`
	Name         string         `gorm:"not null" json:"name"`
	Specialty    *string        `json:"specialty"`
	Avatar       *string        `gorm:"type:text" json:"avatar"`
	Commission   float64        `gorm:"default:0.0;type:decimal(5,2)" json:"commission"`
	Status       string         `gorm:"default:active" json:"status"`
	Appointments []Appointment  `gorm:"foreignKey:ProfessionalID" json:"appointments,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Professional) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = newUUID()
	}
	return nil
}

type Service struct {
	Category     string         `json:"cat"`
	ID           string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID      string         `gorm:"not null" json:"salonId"`
	Salon        Salon          `gorm:"foreignKey:SalonID" json:"-"`
	Name         string         `gorm:"not null" json:"name"`
	Price        float64        `gorm:"type:decimal(10,2)" json:"price"`
	Duration     int            `json:"duration"` // minutes
	Status       string         `gorm:"default:active" json:"status"`
	Appointments []Appointment  `gorm:"foreignKey:ServiceID" json:"appointments,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Service) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = newUUID()
	}
	return nil
}

type Appointment struct {
	Deposit        float64        `gorm:"type:decimal(10,2);not null;default:0" json:"deposit"`
	EndsAt         time.Time      `json:"endsAt"`
	ID             string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID        string         `gorm:"not null" json:"salonId"`
	Salon          Salon          `gorm:"foreignKey:SalonID" json:"-"`
	ClientID       string         `gorm:"not null" json:"clientId"`
	Client         Client         `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	ProfessionalID string         `gorm:"not null" json:"professionalId"`
	Professional   Professional   `gorm:"foreignKey:ProfessionalID" json:"professional,omitempty"`
	ServiceID      string         `gorm:"not null" json:"serviceId"`
	Service        Service        `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Date           time.Time      `json:"date"`
	Value          float64        `gorm:"type:decimal(10,2)" json:"value"`
	PaymentMethod  *string        `json:"paymentMethod"`
	Status         string         `gorm:"default:waiting" json:"status"` // waiting|confirmed|cancelled|done
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (a *Appointment) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = newUUID()
	}
	return nil
}

type Plan struct {
	ID               string         `gorm:"primaryKey;type:uuid" json:"id"`
	Name             string         `gorm:"not null" json:"name"`
	Price            float64        `gorm:"type:decimal(10,2)" json:"price"`
	Period           string         `gorm:"default:/mês" json:"period"`
	Highlight        bool           `gorm:"default:false" json:"highlight"`
	Features         string         `gorm:"type:text" json:"featuresRaw"` // JSON array stored as text
	MaxProfessionals int            `gorm:"default:0" json:"maxProfessionals"`
	MaxSubscriptions int            `gorm:"default:0" json:"maxSubscriptions"`
	Color            string         `gorm:"default:#000000" json:"color"`
	Subscriptions    []Subscription `gorm:"foreignKey:PlanID" json:"subscriptions,omitempty"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Plan) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = newUUID()
	}
	return nil
}

type Subscription struct {
	CurrentPeriodEnd *time.Time     `json:"currentPeriodEnd"`
	PendingPlanID    *string        `json:"pendingPlanId"`
	PaymentReference string         `json:"paymentReference"`
	RequestedPrice   *float64       `json:"requestedPrice"`
	ID               string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID          string         `gorm:"not null" json:"salonId"`
	Salon            Salon          `gorm:"foreignKey:SalonID" json:"salon,omitempty"`
	PlanID           string         `gorm:"not null" json:"planId"`
	Plan             *Plan          `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	Status           string         `gorm:"default:TRIAL" json:"status"` // ACTIVE | CANCELED | TRIAL | EXPIRED
	Price            float64        `gorm:"type:decimal(10,2)" json:"price"`
	TrialEnds        *time.Time     `json:"trialEnds"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = newUUID()
	}
	return nil
}

type SystemSettings struct {
	ID            string    `gorm:"primaryKey;type:uuid" json:"id"`
	PlatformName  string    `gorm:"default:BelezaPura" json:"platformName"`
	Domain        string    `gorm:"default:belezapura.com.br" json:"domain"`
	SupportEmail  string    `gorm:"default:geevheittecnology@gmail.com" json:"supportEmail"`
	TrialDays     int       `gorm:"default:14" json:"trialDays"`
	DefaultPlanID *string   `json:"defaultPlanId"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

func (s *SystemSettings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = newUUID()
	}
	return nil
}

type AdminAuditLog struct {
	ID        string    `gorm:"primaryKey;type:uuid" json:"id"`
	Action    string    `gorm:"not null;index" json:"action"`
	UserID    *string   `json:"userId"`
	UserName  *string   `json:"userName"`
	Resource  string    `gorm:"not null" json:"resource"`
	Detail    string    `gorm:"not null" json:"detail"`
	Level     string    `gorm:"default:info;index" json:"level"`
	CreatedAt time.Time `gorm:"index" json:"createdAt"`
}

func (a *AdminAuditLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = newUUID()
	}
	return nil
}

// Payment records administrator-confirmed subscription receipts. Reference is unique across salons.
type Payment struct {
	ID             string    `gorm:"primaryKey;type:uuid" json:"id"`
	SubscriptionID string    `gorm:"not null" json:"subscriptionId"`
	Reference      string    `gorm:"uniqueIndex;not null" json:"reference"`
	Amount         float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	ApprovedBy     string    `gorm:"not null" json:"approvedBy"`
	CreatedAt      time.Time `json:"createdAt"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = newUUID()
	}
	return nil
}

type Product struct {
	ID          string    `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID     string    `gorm:"not null;index" json:"-"`
	Name        string    `gorm:"not null" json:"nome"`
	Category    string    `json:"categoria"`
	Quantity    int       `gorm:"not null" json:"qtde"`
	Minimum     int       `gorm:"not null" json:"min"`
	Price       float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	InternalUse bool      `json:"usoInterno"`
	ForSale     bool      `json:"venda"`
	Version     int       `gorm:"not null;default:1" json:"version"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = newUUID()
	}
	return nil
}
