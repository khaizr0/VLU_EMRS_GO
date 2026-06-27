import type { Patient, Record } from "@/types";
import { SectionTitle, InfoRow } from "./RecordDetailUtils";

interface AdministrativeInfoProps {
  patient?: Patient;
  record: Record;
}

export const AdministrativeInfo = ({ patient, record }: AdministrativeInfoProps) => {
  return (
    <section id="administrative" className="scroll-mt-6">
      <SectionTitle>I. HÀNH CHÍNH</SectionTitle>
      <div className="pl-2">
        {patient ? (
          <>
            <InfoRow label="1. Họ và tên" value={patient.fullName} />
            <InfoRow label="2. Sinh ngày (Tuổi)" value={`${patient.dob} (${patient.age || record.age} tuổi)`} />
            <InfoRow label="3. Giới tính" value={patient.gender} />
            <InfoRow label="4. Nghề nghiệp" value={`${patient.job || ""} (Mã: ${patient.jobCode || ""})`} />
            <InfoRow label="5. Dân tộc" value={typeof patient.ethnicity === 'object' ? patient.ethnicity.name : patient.ethnicity} />
            <InfoRow label="6. Ngoại kiều" value={patient.nationality} />
            <InfoRow label="7. Địa chỉ" value={patient.address} />
            <InfoRow label="8. Nơi làm việc" value={patient.workplace} />
            <InfoRow label="9. Đối tượng" value={patient.subjectType} />
            <InfoRow label="10. BHYT" value={`Số: ${patient.insuranceNumber || "---"} (Hạn: ${patient.insuranceExpiry || "---"})`} />
            <InfoRow label="11. Người nhà" value={`${patient.relativeInfo || "---"} - SĐT: ${patient.relativePhone || "---"}`} />
          </>
        ) : (
          <p className="text-red-500 italic">Không tìm thấy thông tin chi tiết bệnh nhân.</p>
        )}
      </div>
    </section>
  );
};
