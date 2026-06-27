import type { Record } from "@/types";
import { DetailedReason, DetailedHistory, DetailedExamination, DetailedTreatment } from "./DetailedSubSections";

interface DetailedMedicalRecordProps {
  record: Record;
}

export const DetailedMedicalRecord = ({ record }: DetailedMedicalRecordProps) => {
  return (
    <section id="reason" className="scroll-mt-6 border-t-2 border-dashed border-gray-300 pt-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-6">A. BỆNH ÁN CHI TIẾT</h2>
      <div className="space-y-6">
        <DetailedReason record={record} />
        <DetailedHistory record={record} />
        <DetailedExamination record={record} />
        <DetailedTreatment record={record} />
      </div>
    </section>
  );
};
