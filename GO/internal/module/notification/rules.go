package notification

// notificationTypeNumber mirrors the legacy C# enum numeric JSON values.
func notificationTypeNumber(value string) int {
	switch value {
	case "XrayInitial", "XRAY_INITIAL":
		return 0
	case "XrayReceived", "XRAY_RECEIVED":
		return 1
	case "XrayProcessing", "XRAY_PROCESSING":
		return 2
	case "XrayCompleted", "XRAY_COMPLETED":
		return 3
	case "HematologyInitial", "HEMATOLOGY_INITIAL":
		return 4
	case "HematologyReceived", "HEMATOLOGY_RECEIVED":
		return 5
	case "HematologyProcessing", "HEMATOLOGY_PROCESSING":
		return 6
	case "HematologyCompleted", "HEMATOLOGY_COMPLETED":
		return 7
	default:
		return 0
	}
}
