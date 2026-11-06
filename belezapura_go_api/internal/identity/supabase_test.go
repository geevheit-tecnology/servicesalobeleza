package identity

import (
	"context"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSupabaseConfiguration(t *testing.T) {
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "public-key")
	for _, u := range []string{"", "http://project.supabase.co", "https://user:pass@project.supabase.co", "https://project.supabase.co/unexpected", "https://project.supabase.co?key=x"} {
		t.Setenv("SUPABASE_URL", u)
		if _, err := FromEnv(); err == nil {
			t.Fatalf("accepted unsafe URL %q", u)
		}
	}
	t.Setenv("SUPABASE_URL", "https://project.supabase.co")
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "sb_secret_not-a-public-key")
	if _, err := FromEnv(); err == nil {
		t.Fatal("accepted secret key")
	}
	t.Setenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example")
	if _, err := FromEnv(); err != nil {
		t.Fatal(err)
	}
	for _, role := range []string{"anon", "service_role"} {
		key, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"role": role}).SignedString([]byte("test-only-key"))
		if err != nil {
			t.Fatal(err)
		}
		t.Setenv("SUPABASE_PUBLISHABLE_KEY", key)
		_, err = FromEnv()
		if (err == nil) != (role == "anon") {
			t.Fatalf("unexpected configuration result for %s", role)
		}
	}
}

func TestSupabaseRejectsFailuresAndRedirects(t *testing.T) {
	var redirected bool
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { redirected = true }))
	defer target.Close()
	for _, tc := range []struct {
		name   string
		status int
		body   string
		want   error
	}{
		{"credentials", 401, `{"error":"private upstream details"}`, ErrCredentials},
		{"unavailable", 503, `{"error":"private upstream details"}`, ErrUnavailable},
		{"malformed", 200, `not json`, ErrUnavailable},
		{"no identity", 200, `{}`, ErrCredentials},
		{"redirect", 302, ``, ErrUnavailable},
	} {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Location", target.URL)
				w.WriteHeader(tc.status)
				_, _ = w.Write([]byte(tc.body))
			}))
			defer server.Close()
			t.Setenv("SUPABASE_URL", server.URL)
			t.Setenv("SUPABASE_PUBLISHABLE_KEY", "public-key")
			client, err := FromEnv()
			if err != nil {
				t.Fatal(err)
			}
			client.client.Transport = server.Client().Transport
			_, err = client.GetUser(context.Background(), "private-user-token")
			if !errors.Is(err, tc.want) {
				t.Fatalf("got %v want %v", err, tc.want)
			}
		})
	}
	if redirected {
		t.Fatal("forwarded credentials on redirect")
	}
}
