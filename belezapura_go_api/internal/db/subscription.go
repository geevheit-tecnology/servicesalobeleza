package db

import "time"

// Access is derived at request time; expiry does not depend on a cron job.
func (s Subscription) AllowsAccess(now time.Time) bool {
	switch s.Status {
	case "TRIAL":
		return s.TrialEnds != nil && now.Before(*s.TrialEnds)
	case "ACTIVE":
		return s.CurrentPeriodEnd != nil && now.Before(*s.CurrentPeriodEnd)
	default:
		return false
	}
}
func CurrentSubscription(salonID string) (Subscription, error) {
	var sub Subscription
	err := DB.Where("salon_id = ?", salonID).Order("created_at desc, id desc").First(&sub).Error
	return sub, err
}
