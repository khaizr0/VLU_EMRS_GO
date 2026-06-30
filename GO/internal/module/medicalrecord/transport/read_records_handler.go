package transport

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
	"github.com/labstack/echo/v4"
)

// List handles GET /medical-records and forwards query filters to the usecase.
func (h *Handler) List(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	request, err := listRequest(c)
	if err != nil {
		return err
	}
	result, err := h.service.List(c.Request().Context(), claims, request)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

// Get handles GET /medical-records/:id and returns one record from the usecase.
func (h *Handler) Get(c echo.Context) error {
	claims, id, err := claimsAndID(c, "id")
	if err != nil {
		return err
	}
	record, err := h.service.Get(c.Request().Context(), claims, id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, record)
}

// listRequest converts Echo query params into a DTO for the list usecase.
func listRequest(c echo.Context) (dto.ListRequest, error) {
	pageNumber, err := optionalIntQuery(c, "pageNumber", 1)
	if err != nil {
		return dto.ListRequest{}, err
	}
	pageSize, err := optionalIntQuery(c, "pageSize", 30)
	if err != nil {
		return dto.ListRequest{}, err
	}
	recordType, err := optionalIntQuery(c, "recordType", 0)
	if err != nil {
		return dto.ListRequest{}, err
	}
	return dto.ListRequest{
		SearchPhrase: c.QueryParam("searchPhrase"),
		PageNumber:   pageNumber,
		PageSize:     pageSize,
		RecordType:   recordType,
		FromDay:      c.QueryParam("fromDay"),
		ToDay:        c.QueryParam("toDay"),
	}, nil
}
