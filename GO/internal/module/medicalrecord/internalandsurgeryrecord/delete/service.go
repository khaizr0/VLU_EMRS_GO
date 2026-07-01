package delete

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
)

type Service struct {
	baseStore *base.Store
}

func NewService(baseStore *base.Store) *Service {
	return &Service{baseStore: baseStore}
}

func (s *Service) Delete(ctx context.Context, claims auth.Claims, id int) error {
	currentUser, err := shared.CurrentUser(ctx, s.baseStore, claims)
	if err != nil {
		return err
	}
	if !shared.CanWriteRecords(currentUser) {
		return domain.ErrForbidden
	}
	if _, err := s.baseStore.FindRecordByID(ctx, id); err != nil {
		return err
	}
	return s.baseStore.DeleteRecord(ctx, id)
}
