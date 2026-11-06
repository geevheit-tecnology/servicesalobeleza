package handler

import (
	"belezapura_go_api/internal/db"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"math"
	"net/http"
	"net/mail"
	"regexp"
	"strings"
	"time"
	_ "time/tzdata"
)

type bookingError struct {
	status  int
	message string
}

func (e bookingError) Error() string { return e.message }
func bookingFailure(c *gin.Context, err error) {
	var be bookingError
	if errors.As(err, &be) {
		c.JSON(be.status, gin.H{"error": be.message})
		return
	}
	var pg *pgconn.PgError
	if errors.As(err, &pg) && (pg.Code == "23P01" || pg.Code == "23505") {
		c.JSON(http.StatusConflict, gin.H{"error": "Este horário já foi reservado. Atualize a disponibilidade."})
		return
	}
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Não foi possível concluir a operação. Tente novamente."})
}

type workingDay struct {
	Day   string `json:"day"`
	Open  bool   `json:"open"`
	Start string `json:"start"`
	End   string `json:"end"`
}

var weekdayNames = []string{"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"}

func salonLocation(s db.Salon) (*time.Location, error) { return time.LoadLocation(s.Timezone) }
func scheduleFor(s db.Salon, date time.Time) (time.Time, time.Time, error) {
	loc, err := salonLocation(s)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	d := date.In(loc)
	var blocks []string
	if err := json.Unmarshal([]byte(s.BlockedDates), &blocks); err != nil {
		return time.Time{}, time.Time{}, err
	}
	for _, b := range blocks {
		if b == d.Format("2006-01-02") {
			return time.Time{}, time.Time{}, bookingError{409, "Data bloqueada pelo salão."}
		}
	}
	var schedule []workingDay
	if err := json.Unmarshal([]byte(s.ScheduleRaw), &schedule); err != nil {
		return time.Time{}, time.Time{}, bookingError{409, "Configure o horário de funcionamento antes de agendar."}
	}
	for _, day := range schedule {
		if strings.EqualFold(firstDay(day.Day), weekdayNames[int(d.Weekday())]) {
			if !day.Open {
				return time.Time{}, time.Time{}, bookingError{409, "Salão fechado nesta data."}
			}
			start, e1 := time.ParseInLocation("2006-01-02 15:04", d.Format("2006-01-02")+" "+day.Start, loc)
			end, e2 := time.ParseInLocation("2006-01-02 15:04", d.Format("2006-01-02")+" "+day.End, loc)
			if e1 != nil || e2 != nil || !end.After(start) {
				return time.Time{}, time.Time{}, bookingError{409, "Horário de funcionamento inválido."}
			}
			return start, end, nil
		}
	}
	return time.Time{}, time.Time{}, bookingError{409, "Salão fechado nesta data."}
}
func firstDay(s string) string {
	r := []rune(strings.TrimSpace(s))
	if len(r) > 3 {
		r = r[:3]
	}
	return string(r)
}
func validateSchedule(raw string) error {
	var days []workingDay
	if json.Unmarshal([]byte(raw), &days) != nil || len(days) != 7 {
		return errors.New("Informe os sete dias de funcionamento.")
	}
	seen := map[string]bool{}
	for _, d := range days {
		key := firstDay(d.Day)
		valid := false
		for _, n := range weekdayNames {
			if strings.EqualFold(key, n) {
				key = n
				valid = true
			}
		}
		if !valid || seen[key] {
			return errors.New("Dias da semana inválidos ou repetidos.")
		}
		seen[key] = true
		if d.Open {
			start, e1 := time.Parse("15:04", d.Start)
			end, e2 := time.Parse("15:04", d.End)
			if e1 != nil || e2 != nil || !end.After(start) {
				return errors.New("O fechamento deve ser depois da abertura.")
			}
		}
	}
	return nil
}
func reserve(tx *gorm.DB, appt *db.Appointment, name, phone string) error {
	// Serialize reservations/settings for this salon, then enforce overlap again in PostgreSQL.
	var salon db.Salon
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&salon, "id = ?", appt.SalonID).Error; err != nil {
		return bookingError{404, "Salão não encontrado."}
	}
	var sub db.Subscription
	if err := tx.Where("salon_id = ?", salon.ID).Order("created_at desc, id desc").First(&sub).Error; err != nil {
		return bookingError{503, "Assinatura indisponível."}
	}
	if !sub.AllowsAccess(time.Now()) {
		return bookingError{402, "Assinatura suspensa ou vencida."}
	}
	var service db.Service
	var pro db.Professional
	if tx.Where("id = ? AND salon_id = ? AND status = ?", appt.ServiceID, salon.ID, "active").First(&service).Error != nil {
		return bookingError{404, "Serviço não encontrado."}
	}
	if tx.Where("id = ? AND salon_id = ? AND status = ?", appt.ProfessionalID, salon.ID, "active").First(&pro).Error != nil {
		return bookingError{404, "Profissional não encontrado."}
	}
	if service.Duration <= 0 {
		return bookingError{409, "Duração do serviço inválida."}
	}
	appt.EndsAt = appt.Date.Add(time.Duration(service.Duration) * time.Minute)
	if !appt.Date.After(time.Now()) || appt.Date.Second() != 0 || appt.Date.Nanosecond() != 0 {
		return bookingError{400, "Escolha um horário futuro válido."}
	}
	open, close, err := scheduleFor(salon, appt.Date)
	if err != nil {
		return err
	}
	if appt.Date.Before(open) || appt.EndsAt.After(close) {
		return bookingError{409, "O serviço deve caber no expediente do salão."}
	}
	var count int64
	if err := tx.Model(&db.Appointment{}).Where("professional_id = ? AND status <> ? AND date < ? AND ends_at > ?", pro.ID, "cancelled", appt.EndsAt, appt.Date).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return bookingError{409, "Este intervalo já possui um agendamento."}
	}
	var client db.Client
	if name != "" {
		// Public clients are matched by phone, never by a shared display name.
		err := tx.Where("salon_id = ? AND phone = ? AND status = ?", salon.ID, phone, "active").First(&client).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			client = db.Client{SalonID: salon.ID, Name: name, Phone: &phone, Status: "active"}
			if err := tx.Create(&client).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		}
		appt.ClientID = client.ID
	} else if tx.Where("id = ? AND salon_id = ? AND status = ?", appt.ClientID, salon.ID, "active").First(&client).Error != nil {
		return bookingError{404, "Cliente não encontrado."}
	}
	appt.Value = service.Price
	appt.Status = "waiting"
	return tx.Create(appt).Error
}
func generatePix(key, name string, amount float64) (string, error) {
	key = strings.TrimSpace(key)
	amount = math.Round(amount*100) / 100
	validKey := false
	if len(key) == 36 {
		_, err := uuid.Parse(key)
		validKey = err == nil
	}
	if strings.Contains(key, "@") {
		address, err := mail.ParseAddress(key)
		validKey = err == nil && address.Address == key && !strings.ContainsAny(key, " \t\r\n")
	}
	if regexp.MustCompile(`^(?:[0-9]{11}|[0-9]{14}|\+[1-9][0-9]{10,14})$`).MatchString(key) {
		validKey = true
	}
	if !validKey || len(key) > 77 || amount <= 0 || amount > 99999999 || math.IsNaN(amount) || math.IsInf(amount, 0) {
		return "", errors.New("Chave Pix ou valor inválido.")
	}
	field := func(id, value string) string { return fmt.Sprintf("%s%02d%s", id, len(value), value) }
	// EMV merchant fields use uppercase ASCII. Accents are removed by slugify's normalization elsewhere;
	// unsupported characters are discarded, with a stable merchant fallback.
	var merchant strings.Builder
	for _, r := range strings.ToUpper(name) {
		if (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == ' ' {
			merchant.WriteRune(r)
		}
	}
	n := strings.TrimSpace(merchant.String())
	if n == "" {
		n = "SALAO"
	}
	if len(n) > 25 {
		n = n[:25]
	}
	payload := field("00", "01") + field("26", field("00", "br.gov.bcb.pix")+field("01", key)) + field("52", "0000") + field("53", "986") + field("54", fmt.Sprintf("%.2f", amount)) + field("58", "BR") + field("59", n) + field("60", "SAO PAULO") + field("62", field("05", "***")) + "6304"
	crc := uint16(0xffff)
	for _, b := range []byte(payload) {
		crc ^= uint16(b) << 8
		for i := 0; i < 8; i++ {
			if crc&0x8000 != 0 {
				crc = (crc << 1) ^ 0x1021
			} else {
				crc <<= 1
			}
		}
	}
	return fmt.Sprintf("%s%04X", payload, crc), nil
}
