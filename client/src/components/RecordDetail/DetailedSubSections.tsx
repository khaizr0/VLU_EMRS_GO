import type { Record, RelatedCharacteristics, VitalSigns, Organs } from "@/types";
import { InfoRow, CHARACTERISTICS_LIST, ORGAN_FIELDS } from "./RecordDetailUtils";

interface SectionProps {
  record: Record;
}

export const DetailedReason = ({ record }: SectionProps) => (
  <div>
    <h4 className="font-bold underline mb-2">I. LÝ DO VÀO VIỆN</h4>
    <p className="pl-4">
      {record.medicalRecordContent?.reason} (Ngày thứ {record.medicalRecordContent?.dayOfIllness} của bệnh)
    </p>
  </div>
);

export const DetailedHistory = ({ record }: SectionProps) => (
  <div>
    <h4 className="font-bold underline mb-2">II. HỎI BỆNH</h4>
    <div className="pl-4 space-y-3">
      <div>
        <span className="font-bold">1. Quá trình bệnh lý:</span> <p className="mt-1 text-justify">{record.medicalRecordContent?.pathologicalProcess}</p>
      </div>
      <div>
        <span className="font-bold">2. Tiền sử bản thân:</span> <p className="mt-1 text-justify">{record.medicalRecordContent?.personalHistory}</p>
      </div>
      <div>
        <span className="font-bold">3. Đặc điểm liên quan:</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
          {CHARACTERISTICS_LIST.map((item) => {
            const data = record.medicalRecordContent?.relatedCharacteristics?.[item.key as keyof RelatedCharacteristics];
            if (!data?.isChecked) return null;
            return (
              <span key={item.key} className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                {item.label} ({data.time})
              </span>
            );
          })}
          {!Object.values(record.medicalRecordContent?.relatedCharacteristics || {}).some((v) => v.isChecked) && (
            <span>Không có ghi nhận đặc biệt.</span>
          )}
        </div>
      </div>
      <div>
        <span className="font-bold">4. Tiền sử gia đình:</span> <p className="mt-1 text-justify">{record.medicalRecordContent?.familyHistory}</p>
      </div>
    </div>
  </div>
);

export const DetailedExamination = ({ record }: SectionProps) => (
  <div>
    <h4 className="font-bold underline mb-2">III. KHÁM BỆNH</h4>
    <div className="pl-4 space-y-4">
      <div>
        <span className="font-bold">1. Toàn thân:</span> <p className="mt-1 whitespace-pre-line">{record.medicalRecordContent?.overallExamination}</p>
      </div>
      <div>
        <span className="font-bold mb-2 block">Dấu hiệu sinh tồn:</span>
        <div className="grid grid-cols-5 gap-2 text-center text-sm border border-gray-300 p-2 bg-gray-50">
          {[
            { f: "pulse", l: "Mạch", u: "l/p" },
            { f: "temperature", l: "Nhiệt", u: "°C" },
            { f: "bloodPressure", l: "Huyết áp", u: "mmHg" },
            { f: "respiratoryRate", l: "Nhịp thở", u: "l/p" },
            { f: "weight", l: "Cân nặng", u: "kg" },
          ].map((v) => (
            <div key={v.f}>
              <div className="font-bold text-gray-600">{v.l}</div>
              <div>
                {record.medicalRecordContent?.vitalSigns?.[v.f as keyof VitalSigns] || "--"} {v.u}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="font-bold">2. Các cơ quan:</span>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
          {ORGAN_FIELDS.map((field) => (
            <div key={field.key} className="text-sm">
              <span className="font-semibold italic">{field.label}:</span> {record.medicalRecordContent?.organs?.[field.key as keyof Organs] || "Bình thường"}
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="font-bold">3. Tóm tắt bệnh án:</span> <p className="mt-1 text-justify bg-gray-50 p-2 border border-gray-200">{record.medicalRecordContent?.summary}</p>
      </div>
    </div>
  </div>
);

export const DetailedTreatment = ({ record }: SectionProps) => (
  <div>
    <h4 className="font-bold underline mb-2">IV. ĐIỀU TRỊ</h4>
    <div className="pl-4">
      <InfoRow label="Chẩn đoán vào khoa" value={record.medicalRecordContent?.admissionDiagnosis?.mainDisease} />
      <InfoRow label="Tiên lượng" value={record.medicalRecordContent?.prognosis} />
      <InfoRow label="Hướng điều trị" value={record.medicalRecordContent?.treatmentPlan} />
    </div>
  </div>
);
