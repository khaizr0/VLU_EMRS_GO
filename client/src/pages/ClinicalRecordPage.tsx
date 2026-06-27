import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { XRayInputForm } from "@/components/EditRecord/sections/XRayInputForm";
import type { XRayData } from "@/components/EditRecord/sections/XRayInputForm";
import { HematologyInputForm } from "@/components/EditRecord/sections/HematologyInputForm";
import type { HematologyData } from "@/components/EditRecord/sections/HematologyInputForm";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Record } from "@/types";

export const ClinicalRecordPage = ({ type }: { type: "xray" | "hematology" }) => {
  const { recordId, id } = useParams<{ recordId: string; id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) return;
      try {
        setLoading(true);
        let numericId: number;

        // 1. Resolve storageCode or ID
        if (/^\d+$/.test(recordId)) {
          numericId = parseInt(recordId);
        } else {
          const searchResult = await api.medicalRecords.getAll({ searchPhrase: recordId, pageSize: 5 });
          const recordItem = searchResult.items?.find((item: any) => item.storageCode === recordId);
          if (!recordItem) {
            toast.error("Không tìm thấy hồ sơ với mã lưu trữ này");
            return;
          }
          numericId = recordItem.id;
        }

        // 2. Fetch full detail
        const dto = await api.medicalRecords.getById(numericId);
        
        // 3. Map DTO to Record interface with documents
        const mappedRecord: Record = {
          id: dto.storageCode || dto.id.toString(),
          numericId: dto.id,
          patientName: dto.patient?.name || "",
          dob: dto.patient?.dateOfBirth?.split('T')[0] || "",
          age: dto.patient?.dateOfBirth ? new Date().getFullYear() - new Date(dto.patient.dateOfBirth).getFullYear() : 0,
          gender: dto.patient?.gender === 1 ? "Nam" : "Nữ",
          address: dto.address || "",
          department: dto.recordType === 1 ? "Nội Khoa" : "Ngoại Khoa",
          insuranceNumber: dto.patient?.healthInsuranceNumber || "",
          admissionDate: dto.admissionTime,
          dischargeDate: dto.dischargeTime,
          bedCode: dto.bedCode || "",
          diagnosisInfo: {
            deptDiagnosis: { name: dto.detail?.diagnosisMain || dto.departmentDiagnosis, code: dto.departmentCode },
            kkbDiagnosis: { name: dto.admissionDiagnosis, code: dto.admissionCode },
            dischargeDiagnosis: {
              mainDisease: { name: dto.dischargeMainDiagnosis, code: dto.dischargeMainCode },
              comorbidities: { name: dto.dischargeSubDiagnosis, code: dto.dischargeSubCode }
            }
          },
          managementData: {
            admissionTime: dto.admissionTime,
            dischargeTime: dto.dischargeTime,
            transfers: (dto.departmentTransfers || []).map((t: any) => ({
              department: t.departmentName,
              date: t.transferDate,
              days: t.treatmentDays
            }))
          },
          documents: [
            ...(dto.xRays || []).map((x: any) => ({
              id: `XRAY_${x.id}`,
              data: {
                id: x.id,
                status: x.status || 0,
                healthDept: x.healthDept || x.departmentOfHealth || "",
                hospital: x.hospital || x.hospitalName || "",
                xrayNumber: x.xrayNumber || x.formNumber || "",
                times: x.times || "",
                department: x.departmentName || "",
                room: x.room || x.roomNumber || "",
                bed: x.bed || "",
                diagnosis: x.diagnosis || "",
                request: x.requestDescription || "",
                result: x.resultDescription || "",
                advice: x.doctorAdvice || "",
                doctor: x.requestedByName || "",
                specialist: x.performedByName || "",
                xRayStatusLogs: x.xRayStatusLogs || [],
                requestDateDay: x.requestedAt ? new Date(x.requestedAt).getDate().toString() : "",
                requestDateMonth: x.requestedAt ? (new Date(x.requestedAt).getMonth() + 1).toString() : "",
                requestDateYear: x.requestedAt ? new Date(x.requestedAt).getFullYear().toString() : "",
                resultDateDay: x.completedAt ? new Date(x.completedAt).getDate().toString() : "",
                resultDateMonth: x.completedAt ? (new Date(x.completedAt).getMonth() + 1).toString() : "",
                resultDateYear: x.completedAt ? new Date(x.completedAt).getFullYear().toString() : "",
              }
            })),
            ...(dto.hematologies || []).map((h: any) => ({
              id: `HEMA_${h.id}`,
              data: {
                id: h.id,
                status: h.status || 0,
                healthDept: h.healthDept || h.departmentOfHealth || "",
                hospital: h.hospital || h.hospitalName || "",
                testNumber: h.testNumber || h.formNumber || "",
                isEmergency: h.isEmergency || false,
                department: h.departmentName || "",
                room: h.room || h.roomNumber || "",
                bed: "",
                diagnosis: h.diagnosis || h.requestDescription || "",
                doctor: h.requestedByName || "",
                technician: h.performedByName || "",
                hematologyStatusLogs: h.hematologyStatusLogs || [],
                rbc: h.redBloodCellCount?.toString() || "",
                wbc: h.whiteBloodCellCount?.toString() || "",
                hgb: h.hemoglobin?.toString() || "",
                hct: h.hematocrit?.toString() || "",
                mcv: h.mcv?.toString() || "",
                mch: h.mch?.toString() || "",
                mchc: h.mchc?.toString() || "",
                reticulocytes: h.reticulocyteCount?.toString() || "",
                plt: h.plateletCount?.toString() || "",
                neutrophils: h.neutrophil?.toString() || "",
                eosinophils: h.eosinophil || "",
                basophils: h.basophil || "",
                monocytes: h.monocyte || "",
                lymphocytes: h.lymphocyte || "",
                nrbc: h.nucleatedRedBloodCell || "",
                abnormalCells: h.abnormalCells || "",
                malaria: h.malariaParasite || "",
                esr1: h.esr1h?.toString() || "",
                esr2: h.esr2h?.toString() || "",
                bleedingTime: h.bleedingTime?.toString() || "",
                clottingTime: h.clottingTime?.toString() || "",
                bloodGroupABO: h.bloodTypeAbo === 1 ? "A" : h.bloodTypeAbo === 2 ? "B" : h.bloodTypeAbo === 3 ? "AB" : h.bloodTypeAbo === 4 ? "O" : "",
                bloodGroupRh: h.bloodTypeRh === 1 ? "+" : h.bloodTypeRh === 2 ? "-" : "",
                requestDateDay: h.requestedAt ? new Date(h.requestedAt).getDate().toString() : "",
                requestDateMonth: h.requestedAt ? (new Date(h.requestedAt).getMonth() + 1).toString() : "",
                requestDateYear: h.requestedAt ? new Date(h.requestedAt).getFullYear().toString() : "",
                resultDateDay: h.completedAt ? new Date(h.completedAt).getDate().toString() : "",
                resultDateMonth: h.completedAt ? (new Date(h.completedAt).getMonth() + 1).toString() : "",
                resultDateYear: h.completedAt ? new Date(h.completedAt).getFullYear().toString() : "",
              }
            }))
          ]
        } as any;

        setRecord(mappedRecord);
      } catch (error) {
        console.error("Failed to fetch medical record", error);
        toast.error("Không thể tải thông tin bệnh án.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId, navigate]);

  const handleClose = () => {
    navigate(`/record/edit/${recordId}?tab=forms`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-vlu-red" />
      </div>
    );
  }

  if (!record) {
    return <div className="text-center p-12 text-gray-500">Không tìm thấy bệnh án</div>;
  }

  // Find specific document
  const prefix = type === "xray" ? "XRAY_" : "HEMA_";
  const doc = record.documents.find(d => d.id === `${prefix}${id}`);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200 max-w-xl mx-auto mt-20">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy phiếu yêu cầu</h2>
        <p className="text-gray-500 mb-6">Phiếu lâm sàng này không tồn tại hoặc đã bị xóa.</p>
        <button 
          onClick={handleClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition-colors"
        >
          Quay lại Bệnh án
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {type === "xray" && (
        <XRayInputForm
          isOpen={true}
          onClose={handleClose}
          initialData={doc.data as XRayData}
          defaultPatientName={record.patientName}
          defaultAge={record.age}
          defaultDob={record.dob}
          defaultGender={record.gender}
          defaultAddress={record.address}
          defaultDepartment={record.department}
          defaultDiagnosis={record.diagnosisInfo?.deptDiagnosis?.name || record.diagnosisInfo?.kkbDiagnosis?.name}
          defaultBedCode={record.bedCode}
          readOnly={false}
          recordId={record.numericId}
        />
      )}
      
      {type === "hematology" && (
        <HematologyInputForm
          isOpen={true}
          onClose={handleClose}
          initialData={doc.data as HematologyData}
          defaultPatientName={record.patientName}
          defaultAge={record.age}
          defaultDob={record.dob}
          defaultGender={record.gender}
          defaultAddress={record.address}
          defaultDepartment={record.department}
          defaultDiagnosis={record.diagnosisInfo?.deptDiagnosis?.name || record.diagnosisInfo?.kkbDiagnosis?.name}
          readOnly={false}
          recordId={record.numericId}
        />
      )}
    </div>
  );
};
