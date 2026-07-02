package notification

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/notification/stream"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
	broker  *stream.Broker
}

// NewHandler wires the notification service into HTTP handlers.
func NewHandler(service *Service, broker *stream.Broker) *Handler {
	return &Handler{service: service, broker: broker}
}

// List handles GET /notifications for the current user.
func (h *Handler) List(c echo.Context) error {
	claims, err := claimsFromContext(c)
	if err != nil {
		return err
	}
	items, err := h.service.List(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, items)
}

// MarkRead handles PUT /notifications/:id/read.
func (h *Handler) MarkRead(c echo.Context) error {
	claims, id, err := claimsAndID(c)
	if err != nil {
		return err
	}
	if err := h.service.MarkRead(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// Stream handles GET /notifications/stream using Server-Sent Events.
func (h *Handler) Stream(c echo.Context) error {
	claims, err := claimsFromContext(c)
	if err != nil {
		return err
	}
	user, err := h.service.currentUser(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	events, unsubscribe := h.broker.Subscribe(user.ID)
	defer unsubscribe()

	response := c.Response()
	response.Header().Set(echo.HeaderContentType, "text/event-stream")
	response.Header().Set(echo.HeaderCacheControl, "no-cache")
	response.Header().Set(echo.HeaderConnection, "keep-alive")
	response.WriteHeader(http.StatusOK)
	flusher, ok := response.Writer.(http.Flusher)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "Streaming is not supported")
	}
	writeSSE(response, stream.Event{Name: "connected", Data: `{}`})
	flusher.Flush()

	ping := time.NewTicker(30 * time.Second)
	defer ping.Stop()
	for {
		select {
		case <-c.Request().Context().Done():
			return nil
		case event := <-events:
			writeSSE(response, event)
			flusher.Flush()
		case <-ping.C:
			fmt.Fprint(response, ": ping\n\n")
			flusher.Flush()
		}
	}
}

func writeSSE(response *echo.Response, event stream.Event) {
	if event.Name != "" {
		fmt.Fprintf(response, "event: %s\n", event.Name)
	}
	fmt.Fprintf(response, "data: %s\n\n", event.Data)
}

func claimsAndID(c echo.Context) (auth.Claims, int, error) {
	claims, err := claimsFromContext(c)
	if err != nil {
		return auth.Claims{}, 0, err
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		return auth.Claims{}, 0, echo.NewHTTPError(http.StatusBadRequest, "Id không hợp lệ")
	}
	return claims, id, nil
}

func claimsFromContext(c echo.Context) (auth.Claims, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, domain.ErrInvalidMicrosoftToken
	}
	return claims, nil
}
