package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  string
	DatabaseURL           string
	DatabaseMaintenanceDB string
	ClientBaseURL         string
	MicrosoftJWKSURL      string
	MicrosoftAudience     string
	MicrosoftAPIScope     string
	AllowedEmailDomains   map[string]string
}

func Load() (Config, error) {
	if err := godotenv.Overload(); err != nil && !os.IsNotExist(err) {
		return Config{}, err
	}

	env, err := requiredEnv(
		"PORT",
		"DATABASE_URL",
		"CLIENT_BASEURL",
		"MICROSOFT_JWKS_URL",
		"MICROSOFT_AUDIENCE",
		"MICROSOFT_API_SCOPE",
	)
	if err != nil {
		return Config{}, err
	}

	domainRoles, err := domainRoles("ALLOWED_EMAIL_DOMAIN")
	if err != nil {
		return Config{}, err
	}

	return Config{
		Port:                  env["PORT"],
		DatabaseURL:           env["DATABASE_URL"],
		DatabaseMaintenanceDB: optionalEnv("DATABASE_MAINTENANCE_DB", "postgres"),
		ClientBaseURL:         env["CLIENT_BASEURL"],
		MicrosoftJWKSURL:      env["MICROSOFT_JWKS_URL"],
		MicrosoftAudience:     env["MICROSOFT_AUDIENCE"],
		MicrosoftAPIScope:     env["MICROSOFT_API_SCOPE"],
		AllowedEmailDomains:   domainRoles,
	}, nil
}

func requiredEnv(keys ...string) (map[string]string, error) {
	values := make(map[string]string, len(keys))
	for _, key := range keys {
		value := strings.TrimSpace(os.Getenv(key))
		if value == "" {
			return nil, fmt.Errorf("%s is required", key)
		}
		values[key] = value
	}
	return values, nil
}

func optionalEnv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func domainRoles(prefix string) (map[string]string, error) {
	result := map[string]string{}
	for index := 0; ; index++ {
		key := fmt.Sprintf("%s_%d", prefix, index)
		value := strings.TrimSpace(os.Getenv(key))
		if value == "" {
			break
		}

		domain, role, ok := strings.Cut(value, "=")
		domain = strings.ToLower(strings.TrimSpace(domain))
		role = strings.TrimSpace(role)

		if !ok || domain == "" || role == "" {
			return nil, fmt.Errorf(
				"invalid %s item %q; expected domain=Role",
				prefix,
				value,
			)
		}
		result[domain] = role
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("%s_0 is required", prefix)
	}
	return result, nil
}
