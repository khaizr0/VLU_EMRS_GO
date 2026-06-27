import type { Record } from "@/types";
import { SectionTitle, InfoRow } from "./RecordDetailUtils";

interface DischargeInfoProps {
  record: Record;
}

export const DischargeInfo = ({ record }: DischargeInfoProps) => {
  return (
    <section id="discharge" className="scroll-mt-6">
      <SectionTitle>IV. TÌNH TRẠNG RA VIỆN</SectionTitle>
      <div className="pl-2 space-y-2">
        <InfoRow label="24. Kết quả điều trị" value={record.dischargeStatusInfo?.treatmentResult} />
        <InfoRow label="25. Giải phẫu bệnh" value={record.dischargeStatusInfo?.pathology} />
        <InfoRow label="26. Tình hình tử vong" value={record.dischargeStatusInfo?.deathStatus?.description || "Không"} />
        {record.dischargeStatusInfo?.deathStatus?.description && (
          <div className="pl-48 text-xs text-gray-500 italic -mt-1 mb-2">
            Nguyên nhân: {record.dischargeStatusInfo?.deathStatus?.cause} - Thời gian: {record.dischargeStatusInfo?.deathStatus?.time}
          </div>
        )}
        <InfoRow
          label="27. Nguyên nhân chính"
          value={`${record.dischargeStatusInfo?.mainCauseOfDeath?.name || ""} (${record.dischargeStatusInfo?.mainCauseOfDeath?.code || ""})`}
        />
        <InfoRow label="28. Khám nghiệm tử thi" value={record.dischargeStatusInfo?.isAutopsy ? "Có" : "Không"} />
      </div>
    </section>
  );
};
