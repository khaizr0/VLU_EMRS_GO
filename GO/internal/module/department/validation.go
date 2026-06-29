package department

import (
	"regexp"
	"strings"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

var departmentNamePattern = regexp.MustCompile(`^[\p{L}\p{N}\s]+$`)

func cleanDepartmentName(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) > 100 || !departmentNamePattern.MatchString(name) {
		return "", domain.ErrInvalidDepartmentName
	}
	return name, nil
}
