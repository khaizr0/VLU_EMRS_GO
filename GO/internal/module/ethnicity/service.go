package ethnicity

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) ListEthnicities(ctx context.Context) ([]domain.Ethnicity, error) {
	return s.repository.ListEthnicities(ctx)
}
