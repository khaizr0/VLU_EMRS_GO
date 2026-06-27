package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/labstack/echo/v4"
)

const claimsContextKey = "microsoft_claims"

type Claims struct {
	Audience          audience `json:"aud"`
	ExpiresAt         int64    `json:"exp"`
	IssuedAt          int64    `json:"iat"`
	NotBefore         int64    `json:"nbf"`
	Issuer            string   `json:"iss"`
	Version           string   `json:"ver"`
	TenantID          string   `json:"tid"`
	ObjectID          string   `json:"oid"`
	Email             string   `json:"email"`
	PreferredUsername string   `json:"preferred_username"`
	UPN               string   `json:"upn"`
	Name              string   `json:"name"`
	Scopes            string   `json:"scp"`
}

type audience []string

func (a *audience) UnmarshalJSON(data []byte) error {
	var single string
	if json.Unmarshal(data, &single) == nil {
		*a = []string{single}
		return nil
	}
	if err := json.Unmarshal(data, (*[]string)(a)); err != nil {
		return fmt.Errorf("decode aud claim: %w", err)
	}
	return nil
}

func (c Claims) IdentityKey() string {
	return c.TenantID + ":" + c.ObjectID
}

func (c Claims) LoginEmail() (string, error) {
	for _, candidate := range []string{c.Email, c.PreferredUsername, c.UPN} {
		value := strings.ToLower(strings.TrimSpace(candidate))
		address, err := mail.ParseAddress(value)
		if value != "" && err == nil && address.Address == value {
			return value, nil
		}
	}
	return "", domain.ErrInvalidMicrosoftEmail
}

func PutClaims(c echo.Context, claims Claims) {
	c.Set(claimsContextKey, claims)
}

func ClaimsFromContext(c echo.Context) (Claims, bool) {
	claims, ok := c.Get(claimsContextKey).(Claims)
	return claims, ok
}

type TokenVerifier struct {
	keys          *oidc.RemoteKeySet
	audience      string
	tenantID      string
	requiredScope string
}

func NewTokenVerifier(
	jwksURL string,
	audience string,
	tenantID string,
	requiredScope string,
) *TokenVerifier {
	return &TokenVerifier{
		keys:          oidc.NewRemoteKeySet(context.Background(), jwksURL),
		audience:      audience,
		tenantID:      tenantID,
		requiredScope: requiredScope,
	}
}

func (v *TokenVerifier) Verify(ctx context.Context, rawToken string) (Claims, error) {
	payload, err := v.keys.VerifySignature(ctx, rawToken)
	if err != nil {
		return Claims{}, domain.ErrInvalidMicrosoftToken
	}

	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return Claims{}, domain.ErrInvalidMicrosoftToken
	}

	if !v.validClaims(claims, time.Now()) {
		return Claims{}, domain.ErrInvalidMicrosoftToken
	}
	return claims, nil
}

func (v *TokenVerifier) validClaims(claims Claims, now time.Time) bool {
	expectedIssuer := "https://login.microsoftonline.com/" + claims.TenantID + "/v2.0"

	validTime := claims.ExpiresAt > 0 &&
		now.Before(time.Unix(claims.ExpiresAt, 0)) &&
		(claims.NotBefore == 0 || !now.Add(30*time.Second).Before(time.Unix(claims.NotBefore, 0))) &&
		(claims.IssuedAt == 0 || !time.Unix(claims.IssuedAt, 0).After(now.Add(5*time.Minute)))

	validMicrosoft := claims.Version == "2.0" &&
		claims.TenantID == v.tenantID &&
		claims.ObjectID != "" &&
		claims.Issuer == expectedIssuer

	validAccess := contains(claims.Audience, v.audience) &&
		contains(strings.Fields(claims.Scopes), v.requiredScope)

	return validTime && validMicrosoft && validAccess
}

func contains(values []string, expected string) bool {
	for _, value := range values {
		if value == expected {
			return true
		}
	}
	return false
}
