package domain

type Code string

const (
	Unauthorized Code = "UNAUTHORIZED"
	Forbidden    Code = "FORBIDDEN"
	NotFound     Code = "NOT_FOUND"
	BadRequest   Code = "BAD_REQUEST"
	Conflict     Code = "CONFLICT"
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
	ErrPatientNotFound = newError(
		NotFound,
		"Không tìm thấy bệnh nhân",
	)
	ErrInvalidPatientName = newError(
		BadRequest,
		"Tên bệnh nhân không hợp lệ",
	)
	ErrInvalidDateOfBirth = newError(
		BadRequest,
		"Ngày sinh không hợp lệ",
	)
	ErrInvalidGender = newError(
		BadRequest,
		"Giới tính không hợp lệ",
	)
	ErrInvalidEthnicity = newError(
		BadRequest,
		"Dân tộc không hợp lệ",
	)
	ErrInvalidHealthInsuranceNumber = newError(
		BadRequest,
		"Số BHYT không đúng định dạng",
	)
	ErrDuplicateHealthInsuranceNumber = newError(
		Conflict,
		"Số BHYT đã tồn tại",
	)
	ErrMedicalRecordNotFound = newError(
		NotFound,
		"Không tìm thấy hồ sơ bệnh án",
	)
	ErrInvalidMedicalRecord = newError(
		BadRequest,
		"Hồ sơ bệnh án không hợp lệ",
	)
	ErrInvalidMedicalRecordDate = newError(
		BadRequest,
		"Ngày trong hồ sơ bệnh án không hợp lệ",
	)
)
