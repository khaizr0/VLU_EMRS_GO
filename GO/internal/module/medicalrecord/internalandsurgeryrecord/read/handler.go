package read

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

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

func (h *Handler) Get(c echo.Context) error {
	claims, id, err := shared.ClaimsAndID(c, "id")
	if err != nil {
		return err
	}
	record, err := h.service.Get(c.Request().Context(), claims, id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, record)
}

func listRequest(c echo.Context) (shared.ListRequest, error) {
	pageNumber, err := shared.OptionalIntQuery(c, "pageNumber", 1)
	if err != nil {
		return shared.ListRequest{}, err
	}
	pageSize, err := shared.OptionalIntQuery(c, "pageSize", 30)
	if err != nil {
		return shared.ListRequest{}, err
	}
	recordType, err := shared.OptionalIntQuery(c, "recordType", 0)
	if err != nil {
		return shared.ListRequest{}, err
	}
	return shared.ListRequest{
		SearchPhrase: c.QueryParam("searchPhrase"), PageNumber: pageNumber, PageSize: pageSize,
		RecordType: recordType, FromDay: c.QueryParam("fromDay"), ToDay: c.QueryParam("toDay"),
	}, nil
}
