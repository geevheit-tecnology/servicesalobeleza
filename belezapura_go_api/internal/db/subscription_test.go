package db

import (
	"testing"
	"time"
)

func TestSubscriptionAccess(t *testing.T) {
	now := time.Now()
	future := now.Add(time.Hour)
	past := now.Add(-time.Second)
	for _, tc := range []struct {
		name string
		sub  Subscription
		want bool
	}{
		{"trial valid", Subscription{Status: "TRIAL", TrialEnds: &future}, true}, {"trial expired", Subscription{Status: "TRIAL", TrialEnds: &past}, false}, {"trial without end", Subscription{Status: "TRIAL"}, false}, {"active valid", Subscription{Status: "ACTIVE", CurrentPeriodEnd: &future}, true}, {"active without end", Subscription{Status: "ACTIVE"}, false}, {"active expired", Subscription{Status: "ACTIVE", CurrentPeriodEnd: &past}, false}, {"blocked", Subscription{Status: "BLOCKED", CurrentPeriodEnd: &future}, false}, {"canceled", Subscription{Status: "CANCELED", CurrentPeriodEnd: &future}, false}, {"late", Subscription{Status: "LATE", CurrentPeriodEnd: &future}, false}, {"pending", Subscription{Status: "PENDING", TrialEnds: &future}, false}} {
		t.Run(tc.name, func(t *testing.T) {
			if got := tc.sub.AllowsAccess(now); got != tc.want {
				t.Fatalf("got %v want %v", got, tc.want)
			}
		})
	}
}
