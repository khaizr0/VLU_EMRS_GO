import type { Record, Patient } from "@/types";
import { AdministrativeInfo } from "./AdministrativeInfo";
import { PatientManagementInfo } from "./PatientManagementInfo";
import { DiagnosisInfo } from "./DiagnosisInfo";
import { DischargeInfo } from "./DischargeInfo";
import { DetailedMedicalRecord } from "./DetailedMedicalRecord";

interface RecordContentProps {
  record: Record;
  patient?: Patient;
}

export const RecordContent = ({ record, patient }: RecordContentProps) => {
  return (
    <div
      className="bg-white rounded-none shadow-lg border border-gray-200 p-8 md:p-12 printable-content max-w-4xl mx-auto min-h-[1123px] relative text-sm leading-relaxed text-gray-800"
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">HỒ SƠ BỆNH ÁN</h1>
        <p className="text-gray-500 text-lg">Van Lang Clinic</p>
        <p className="text-xs text-gray-400 mt-2">Mã hồ sơ: {record.id}</p>
      </div>

      <div className="space-y-8 mb-10">
        <AdministrativeInfo patient={patient} record={record} />
        <PatientManagementInfo record={record} />
        <DiagnosisInfo record={record} />
        <DischargeInfo record={record} />
        <DetailedMedicalRecord record={record} />
      </div>

      {/* Footer Signature */}
      <div className="flex justify-end mt-16 pt-8 break-inside-avoid">
        <div className="text-center w-64">
          <p className="italic mb-1">
            Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </p>
          <p className="font-bold uppercase text-sm mb-12">Bác sĩ điều trị</p>
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
};