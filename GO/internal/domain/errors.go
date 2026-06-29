package domain

type Code string

const (
	Unauthorized Code = "UNAUTHORIZED"
	Forbidden    Code = "FORBIDDEN"
	NotFound     Code = "NOT_FOUND"
	BadRequest   Code = "BAD_REQUEST"
)

type Error struct {
	Code    Code
	Message string
}

func (e *Error) Error() string {
	return e.Message
}

func newError(code Code, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

var (
	ErrBearerTokenRequired = newError(
		Unauthorized,
		"Bearer token is required",
	)
	ErrInvalidMicrosoftToken = newError(
		Unauthorized,
		"Microsoft access token is invalid",
	)
	ErrEmailDomainNotAllowed = newError(
		Forbidden,
		"Email không được phép truy cập vào hệ thống",
	)
	ErrForbidden = newError(
		Forbidden,
		"Bạn không có quyền thực hiện hành động này",
	)
	ErrInactiveUser = newError(
		Forbidden,
		"Tài khoản đã bị khóa",
	)
	ErrCannotModifyAdmin = newError(
		BadRequest,
		"Không thể thực hiện hành động này lên Admin",
	)
	ErrInvalidUserRole = newError(
		BadRequest,
		"User role không hợp lệ",
	)
	ErrUserNotFound = newError(
		NotFound,
		"Tài khoản chưa được đồng bộ",
	)
	ErrInvalidMicrosoftEmail = newError(
		BadRequest,
		"Microsoft token không chứa email hợp lệ",
	)
	ErrDepartmentNotFound = newError(
		NotFound,
		"Không tìm thấy khoa",
	)
	ErrInvalidDepartmentName = newError(
		BadRequest,
		"Tên khoa không hợp lệ",
	)
	ErrUserAlreadyInOtherDepartment = newError(
		BadRequest,
		"Người dùng đã thuộc về khoa khác",
	)
	ErrUserAlreadyHeadOfOtherDepartment = newError(
		BadRequest,
		"Người dùng này đã là trưởng khoa của khoa khác",
	)
	ErrUserNotInDepartment = newError(
		NotFound,
		"Không tìm thấy người dùng trong khoa này",
	)
	ErrDepartmentHasNoHead = newError(
		BadRequest,
		"Khoa này hiện tại chưa có trưởng khoa",
	)
	ErrUserIsNotDepartmentHead = newError(
		BadRequest,
		"Người dùng hiện tại không còn là trưởng khoa của khoa này",
	)
)
