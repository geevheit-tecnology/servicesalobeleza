package identity

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var ErrCredentials = errors.New("invalid Supabase credentials")
var ErrUnavailable = errors.New("Supabase authentication unavailable")

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type Supabase struct {
	baseURL string
	key     string
	client  *http.Client
}

func FromEnv() (*Supabase, error) {
	base := strings.TrimRight(strings.TrimSpace(os.Getenv("SUPABASE_URL")), "/")
	u, err := url.Parse(base)
	key := strings.TrimSpace(os.Getenv("SUPABASE_PUBLISHABLE_KEY"))
	if err != nil || u.Scheme != "https" || u.Host == "" || u.User != nil || u.Path != "" || u.RawQuery != "" || u.Fragment != "" || key == "" || strings.HasPrefix(key, "sb_secret_") {
		return nil, ErrUnavailable
	}
	var keyClaims jwt.MapClaims
	if _, _, err := jwt.NewParser().ParseUnverified(key, &keyClaims); err == nil && keyClaims["role"] != "anon" {
		return nil, ErrUnavailable
	}
	return &Supabase{baseURL: base, key: key, client: &http.Client{
		Timeout:       5 * time.Second,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}}, nil
}

// HasSupabaseIssuer routes credentials only. It never establishes their validity.
func HasSupabaseIssuer(token string) bool {
	base := strings.TrimRight(strings.TrimSpace(os.Getenv("SUPABASE_URL")), "/")
	if base == "" {
		return false
	}
	claims := &jwt.RegisteredClaims{}
	_, _, err := jwt.NewParser().ParseUnverified(token, claims)
	return err == nil && claims.Issuer == base+"/auth/v1"
}

func (s *Supabase) request(ctx context.Context, method, path, token string, body interface{}, out interface{}) error {
	var data []byte
	if body != nil {
		var err error
		data, err = json.Marshal(body)
		if err != nil {
			return ErrUnavailable
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, s.baseURL+"/auth/v1"+path, bytes.NewReader(data))
	if err != nil {
		return ErrUnavailable
	}
	req.Header.Set("apikey", s.key)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return ErrUnavailable
	}
	defer resp.Body.Close()
	if resp.StatusCode == 400 || resp.StatusCode == 401 || resp.StatusCode == 403 || resp.StatusCode == 422 {
		return ErrCredentials
	}
	if resp.StatusCode != http.StatusOK {
		return ErrUnavailable
	}
	data, err = io.ReadAll(io.LimitReader(resp.Body, 1024*1024+1))
	if err != nil || len(data) > 1024*1024 || json.Unmarshal(data, out) != nil {
		return ErrUnavailable
	}
	return nil
}

func (s *Supabase) GetUser(ctx context.Context, token string) (User, error) {
	var user User
	err := s.request(ctx, http.MethodGet, "/user", token, nil, &user)
	if err == nil && (user.ID == "" || user.Email == "") {
		err = ErrCredentials
	}
	return user, err
}

func (s *Supabase) SignIn(ctx context.Context, email, password string) (User, string, error) {
	var result struct {
		AccessToken string `json:"access_token"`
	}
	err := s.request(ctx, http.MethodPost, "/token?grant_type=password", "", map[string]string{"email": email, "password": password}, &result)
	if err != nil {
		return User{}, "", err
	}
	if result.AccessToken == "" || !HasSupabaseIssuer(result.AccessToken) {
		return User{}, "", ErrCredentials
	}
	user, err := s.GetUser(ctx, result.AccessToken)
	return user, result.AccessToken, err
}
