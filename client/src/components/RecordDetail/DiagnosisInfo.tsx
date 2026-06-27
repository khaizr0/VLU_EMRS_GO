import type { Record } from "@/types";
import { SectionTitle, InfoRow } from "./RecordDetailUtils";

interface DiagnosisInfoProps {
  record: Record;
}

export const DiagnosisInfo = ({ record }: DiagnosisInfoProps) => {
  return (
    <section id="diagnosis" className="scroll-mt-6">
      <SectionTitle>III. CHẨN ĐOÁN</SectionTitle>
      <div className="pl-2 space-y-2">
        <InfoRow
          label="20. Nơi chuyển đến"
          value={`${record.diagnosisInfo?.transferDiagnosis?.name || ""} (${record.diagnosisInfo?.transferDiagnosis?.code || ""})`}
        />
        <InfoRow
          label="21. KKB, Cấp cứu"
          value={`${record.diagnosisInfo?.kkbDiagnosis?.name || ""} (${record.diagnosisInfo?.kkbDiagnosis?.code || ""})`}
        />
        <InfoRow
          label="22. Khoa điều trị"
          value={`${record.diagnosisInfo?.deptDiagnosis?.name || ""} (${record.diagnosisInfo?.deptDiagnosis?.code || ""})`}
        />
        <div className="pl-48 text-xs text-gray-500 italic -mt-1 mb-2">
          {record.diagnosisInfo?.deptDiagnosis?.isProcedure ? "[x] Thủ thuật " : "[ ] Thủ thuật "}
          {record.diagnosisInfo?.deptDiagnosis?.isSurgery ? "[x] Phẫu thuật" : "[ ] Phẫu thuật"}
        </div>
        <InfoRow
          label="23. Ra viện (Bệnh chính)"
          value={`${record.diagnosisInfo?.dischargeDiagnosis?.mainDisease?.name || ""} (${record.diagnosisInfo?.dischargeDiagnosis?.mainDisease?.code || ""})`}
        />
        <InfoRow
          label="    Bệnh kèm theo"
          value={`${record.diagnosisInfo?.dischargeDiagnosis?.comorbidities?.name || ""} (${record.diagnosisInfo?.dischargeDiagnosis?.comorbidities?.code || ""})`}
        />
      </div>
    </section>
  );
};
