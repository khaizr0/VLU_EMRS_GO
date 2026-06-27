import type { Record } from "@/types";
import { SectionTitle, InfoRow } from "./RecordDetailUtils";

interface PatientManagementInfoProps {
  record: Record;
}

export const PatientManagementInfo = ({ record }: PatientManagementInfoProps) => {
  return (
    <section id="patientManagement" className="scroll-mt-6">
      <SectionTitle>II. QUẢN LÝ NGƯỜI BỆNH</SectionTitle>
      <div className="pl-2 space-y-3">
        <InfoRow label="12. Vào viện lúc" value={`${record.managementData?.admissionTime || ""} - ${record.admissionDate}`} />
        <InfoRow label="13. Trực tiếp vào" value={record.managementData?.admissionType} />
        <InfoRow label="14. Nơi giới thiệu" value={record.managementData?.referralSource} />
        <InfoRow label="    Vào viện lần thứ" value={record.managementData?.admissionCount} />

        <div className="mt-4">
          <p className="font-bold mb-2 text-sm text-gray-800">15-16. Quá trình điều trị:</p>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Khoa</th>
                <th className="border border-gray-300 p-2 text-left">Ngày vào</th>
                <th className="border border-gray-300 p-2 text-left">Số ngày</th>
              </tr>
            </thead>
            <tbody>
              {record.managementData?.transfers?.map((t, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{t.department}</td>
                  <td className="border border-gray-300 p-2">{t.date}</td>
                  <td className="border border-gray-300 p-2">{t.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InfoRow
          label="17. Chuyển viện"
          value={`${record.managementData?.hospitalTransfer?.type || "Không"} - ${record.managementData?.hospitalTransfer?.destination || ""}`}
          className="mt-2"
        />
        <InfoRow label="18. Ra viện" value={record.managementData?.dischargeType} />
        <InfoRow label="19. Tổng số ngày điều trị" value={record.managementData?.totalDays} />
      </div>
    </section>
  );
};
