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
	ID        string         `gorm:"primaryKey;type:uuid" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	Role      string         `gorm:"default:owner" json:"role"` // owner | superadmin
	Status    string         `gorm:"default:active" json:"status"`
	SalonID   *string        `json:"salonId"`
	Salon     *Salon         `gorm:"foreignKey:SalonID" json:"salon,omitempty"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = newUUID()
	}
	return nil
}

type Salon struct {
	ID            string         `gorm:"primaryKey;type:uuid" json:"id"`
	Slug          string         `gorm:"uniqueIndex;not null" json:"slug"`
	Name          string         `gorm:"not null" json:"name"`
	Document      *string        `json:"document"`
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
	ID           string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID      string         `gorm:"not null" json:"salonId"`
	Salon        Salon          `gorm:"foreignKey:SalonID" json:"-"`
	Name         string         `gorm:"not null" json:"name"`
	Specialty    *string        `json:"specialty"`
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
	ID        string         `gorm:"primaryKey;type:uuid" json:"id"`
	SalonID   string         `gorm:"not null" json:"salonId"`
	Salon     Salon          `gorm:"foreignKey:SalonID" json:"salon,omitempty"`
	PlanID    string         `gorm:"not null" json:"planId"`
	Plan      *Plan          `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	Status    string         `gorm:"default:TRIAL" json:"status"` // ACTIVE | CANCELED | TRIAL
	Price     float64        `gorm:"type:decimal(10,2)" json:"price"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = newUUID()
	}
	return nil
}

type SystemSettings struct {
	ID            string    `gorm:"primaryKey;type:uuid" json:"id"`
	PlatformName  string    `gorm:"default:beautyOS" json:"platformName"`
	Domain        string    `gorm:"default:beautyos.app" json:"domain"`
	SupportEmail  string    `gorm:"default:suporte@beautyos.app" json:"supportEmail"`
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
