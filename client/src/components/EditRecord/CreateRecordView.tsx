import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { RecordForm } from "./RecordForm";
import type { Record, Patient, RelatedCharacteristics } from "@/types";
import { toast } from "sonner";

export const CreateRecordView = () => {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get initial type from URL parameter (default to internal)
  const initialType = useMemo(() => {
    return (searchParams.get("type") as "internal" | "surgery") || "internal";
  }, [searchParams]);

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setPatient(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const id = Number(patientId);
        if (Number.isNaN(id)) throw new Error("Invalid patientId");

        const apiPatient = await api.patients.getById(id);

        // UI RecordForm đang dùng shape "mock patient" (fullName/cccd/...),
        // nên tạm map từ DTO API sang shape mà UI đang render.
        const dobDate = apiPatient.dateOfBirth ? new Date(apiPatient.dateOfBirth) : null;
        const age =
          dobDate && !Number.isNaN(dobDate.getTime())
            ? new Date().getFullYear() - dobDate.getFullYear()
            : 0;

        const genderText =
          apiPatient.gender === 1 ? "Nam" : apiPatient.gender === 2 ? "Nữ" : "Khác";

        const ethnicityName = typeof apiPatient.ethnicity === 'object' 
          ? apiPatient.ethnicity?.name 
          : (typeof apiPatient.ethnicity === 'string' ? apiPatient.ethnicity : "");

        setPatient({
          id: apiPatient.id,
          name: apiPatient.name,
          fullName: apiPatient.name,
          cccd: "",
          insuranceNumber: apiPatient.healthInsuranceNumber,
          dateOfBirth: apiPatient.dateOfBirth,
          dob: apiPatient.dateOfBirth?.split('T')[0] || "",
          age,
          gender: genderText,
          ethnicity: ethnicityName ?? "",
          // Các trường còn lại UI chưa có trong DTO Patient API
          job: "",
          jobCode: "",
          nationality: "",
          address: "",
          workplace: "",
          subjectType: "",
          insuranceExpiry: "",
          relativeInfo: "",
          relativePhone: "",
          ethnicityId: apiPatient.ethnicityId,
          healthInsuranceNumber: apiPatient.healthInsuranceNumber,
        });
      } catch (e) {
        console.error(e);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-xl font-semibold text-gray-700">Đang tải hồ sơ...</div>
      </div>
    );
  }

  if (!patient) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-xl font-semibold text-gray-700">Không tìm thấy thông tin bệnh nhân</div>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Quay lại</button>
      </div>
    );
  }

  const handleCreate = (newRecord: Record, patientSnapshot: Patient) => {
    // Map UI "III. Chuẩn đoán" (nested) -> Swagger "/api/medical-records" (flat)
    const diagnosis = newRecord.diagnosisInfo;
    const diagnosisPayload = {
      referralDiagnosis: diagnosis.transferDiagnosis?.name ?? "",
      referralCode: diagnosis.transferDiagnosis?.code ?? "",

      admissionDiagnosis: diagnosis.kkbDiagnosis?.name ?? "",
      admissionCode: diagnosis.kkbDiagnosis?.code ?? "",

      departmentDiagnosis: diagnosis.deptDiagnosis?.name ?? "",
      departmentCode: diagnosis.deptDiagnosis?.code ?? "",
      hasProcedure: Boolean(diagnosis.deptDiagnosis?.isProcedure),
      hasSurgery: Boolean(diagnosis.deptDiagnosis?.isSurgery),

      dischargeMainDiagnosis: diagnosis.dischargeDiagnosis?.mainDisease?.name ?? "",
      dischargeMainCode: diagnosis.dischargeDiagnosis?.mainDisease?.code ?? "",

      dischargeSubDiagnosis: diagnosis.dischargeDiagnosis?.comorbidities?.name ?? "",
      dischargeSubCode: diagnosis.dischargeDiagnosis?.comorbidities?.code ?? "",
      hasAccident: Boolean(diagnosis.dischargeDiagnosis?.isAccident),
      hasComplication: Boolean(diagnosis.dischargeDiagnosis?.isComplication),
    };

    console.log("Diagnosis payload (III) for /api/medical-records:", diagnosisPayload);

    // Map UI "IV. Tình trạng ra viện" (nested) -> Swagger "/api/medical-records" (flat)
    const discharge = newRecord.dischargeStatusInfo;

    const treatmentResultMap: { [key: string]: number } = {
      // DischargeStatusSection SelectItem values
      Khoi: 1,
      DoGiam: 2,
      KhongThayDoi: 3,
      NangHon: 4,
      TuVong: 5,
    };

    const pathologyResultMap: { [key: string]: number } = {
      "Lành tính": 1,
      "Nghi ngờ": 2,
      "Ác tính": 3,
    };

    const deathCauseMap: { [key: string]: number } = {
      "Do bệnh": 1,
      "Do tai biến điều trị": 2,
      Khác: 3,
    };

    const deathTimeGroupMap: { [key: string]: number } = {
      "Trong 24 giờ vào viện": 1, // Before24h
      "Sau 24 giờ vào viện": 2, // After24h
    };

    const toIntOrZero = (value: string) => {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : 0;
    };

    const dischargePayload = {
      treatmentResult: treatmentResultMap[discharge.treatmentResult] ?? 0,
      pathologyResult: pathologyResultMap[discharge.pathology] ?? 0,

      deathCause: deathCauseMap[discharge.deathStatus.cause] ?? 0,
      deathTimeGroup: deathTimeGroupMap[discharge.deathStatus.time] ?? 0,
      deathReason: discharge.deathStatus.description ?? "",

      // Swagger: deathMainReason / deathMainCode
      deathMainReason: discharge.mainCauseOfDeath.name ?? "",
      deathMainCode: toIntOrZero(discharge.mainCauseOfDeath.code ?? ""),

      hasAutopsy: Boolean(discharge.isAutopsy),
      diagnosisAutopsy: discharge.autopsyDiagnosis.name ?? "",
      diagnosisCode: toIntOrZero(discharge.autopsyDiagnosis.code ?? ""),
    };

    console.log("Discharge payload (IV) for /api/medical-records:", dischargePayload);

    // Map UI "A. Bệnh án" (medicalRecordContent) -> Swagger MedicalRecordDetailDto (detail)
    // Note: Swagger create command uses "detail" field (nested MedicalRecordDetailDto).
    const content = newRecord.medicalRecordContent;
    const riskFactorSignedMap: { [key: string]: number } = {
      allergy: 1,
      drugs: 2,
      alcohol: 3,
      tobacco: 4,
      pipeTobacco: 5,
      other: 6,
    };

    const riskFactors = Object.entries(riskFactorSignedMap)
      .map(([key, signed]) => {
        // UI has: relatedCharacteristics.{key}.isChecked / time
        const item = (content.relatedCharacteristics as RelatedCharacteristics)[key];
        if (!item?.isChecked) return null;

        const duration = item.time ? Number.parseInt(item.time, 10) : NaN;
        return {
          signed,
          isPossible: null, // UI does not capture this flag
          durationMonth: Number.isFinite(duration) ? duration : null,
        };
      })
      .filter(Boolean);

    const detailPayload = {
      illnessDay: content.dayOfIllness ? Number.parseInt(content.dayOfIllness, 10) : null,
      admissionReason: content.reason ?? "",
      pathologicalProcess: content.pathologicalProcess ?? "",
      personalHistory: content.personalHistory ?? "",
      familyHistory: content.familyHistory ?? "",

      examGeneral: content.overallExamination ?? "",
      examCardio: content.organs?.circulatory ?? "",
      examRespiratory: content.organs?.respiratory ?? "",
      examGastro: content.organs?.digestive ?? "",
      examRenalUrology: content.organs?.kidneyUrology ?? "",
      examNeurological: content.organs?.neurological ?? "",
      examMusculoskeletal: content.organs?.musculoskeletal ?? "",
      examENT: content.organs?.ent ?? "",
      examMaxillofacial: content.organs?.maxillofacial ?? "",
      examOphthalmology: content.organs?.eye ?? "",
      examEndocrineOthers: content.organs?.endocrineAndOthers ?? "",
      requiredClinicalTests: content.clinicalTests ?? "",
      medicalSummary: content.summary ?? "",

      diagnosisMain: content.admissionDiagnosis?.mainDisease ?? "",
      diagnosisSub: content.admissionDiagnosis?.comorbidities ?? "",
      diagnosisDifferential: content.admissionDiagnosis?.differential ?? "",
      prognosis: content.prognosis ?? "",
      treatmentPlan: content.treatmentPlan ?? "",

      pulseRate: content.vitalSigns?.pulse ?? "",
      temperature: content.vitalSigns?.temperature ?? "",
      bloodPressure: content.vitalSigns?.bloodPressure ?? "",
      respiratoryRate: content.vitalSigns?.respiratoryRate ?? "",
      bodyWeight: content.vitalSigns?.weight ?? "",

      // Optional: only if some characteristics are checked
      riskFactors: riskFactors.length ? riskFactors : [],
    };

    console.log("Detail payload (A - medicalRecordContent) for /api/medical-records:", detailPayload);

    // Combined partial payload you can merge into CreateMedicalRecordCommand later
    const createMedicalRecordPayloadPartial = {
      ...diagnosisPayload,
      ...dischargePayload,
      // CreateMedicalRecordCommand expects nested "detail"
      detail: detailPayload,
    };

    console.log(
      "CreateMedicalRecordCommand partial payload (III + IV + A) for /api/medical-records:",
      createMedicalRecordPayloadPartial,
    );

    // API call to create record
    const patientIdNum = Number(patientId);

    const isoDateAtMidnight = (dateStr?: string) => {
      if (!dateStr) return undefined;
      // Return YYYY-MM-DD format which C# treats as local/unspecified
      return `${dateStr}T00:00:00`;
    };

    const combineDateTimeToLocal = (dateStr?: string, timeStr?: string) => {
      if (!dateStr || !timeStr) return undefined;
      // Send as local string without Z suffix
      return `${dateStr}T${timeStr}:00`;
    };

    const recordTypeMap: { [k: string]: number } = {
      internal: 1,
      surgery: 2,
    };

    const admissionTypeMap: { [k: string]: number } = {
      "Cấp cứu": 1,
      KKB: 2,
      "Khoa điều trị": 3,
    };

    const referralSourceMap: { [k: string]: number } = {
      "Cơ quan y tế": 1,
      "Tự đến": 2,
      Khác: 3,
    };

    const paymentCategoryMap: { [k: string]: number } = {
      BHYT: 1,
      "Thu phí": 2,
      Miễn: 3,
      Khác: 4,
    };

    const hospitalTransferTypeMap: { [k: string]: number } = {
      "Tuyến trên": 1,
      "Tuyến dưới": 2,
      CK: 3,
    };

    const dischargeTypeMap: { [k: string]: number } = {
      "Ra viện": 1,
      "Xin về": 2,
      "Bỏ về": 3,
      "Đưa về": 4,
    };

    const admissionTimeLocal = combineDateTimeToLocal(newRecord.admissionDate, newRecord.managementData.admissionTime);
    const dischargeTimeLocal = combineDateTimeToLocal(newRecord.dischargeDate, newRecord.managementData.dischargeTime);

    const createCommand = {
      // route param overrides command.patientId in controller, but we still send it for clarity
      patientId: Number.isFinite(patientIdNum) ? patientIdNum : patientIdNum,
      recordType: recordTypeMap[newRecord.type] ?? 1,

      formCode: undefined,
      medicalCode: undefined,
      bedCode: undefined,

      jobTitle: patientSnapshot.job || "",
      jobTitleCode: patientSnapshot.jobCode || "",
      addressJob: patientSnapshot.workplace || "",

      address: patientSnapshot.address || "",
      provinceCode: patientSnapshot.provinceCode || null,
      districtCode: patientSnapshot.districtCode || null,
      provinceName: patientSnapshot.provinceName || null,
      districtName: patientSnapshot.districtName || null,
      wardName: patientSnapshot.wardName || null,

      healthInsuranceExpiryDate: isoDateAtMidnight(patientSnapshot.insuranceExpiry),
      relativeInfo: patientSnapshot.relativeInfo || "",
      relativePhone: patientSnapshot.relativePhone || "",
      paymentCategory: paymentCategoryMap[patientSnapshot.subjectType ?? ""] ?? null,

      admissionTime: admissionTimeLocal,
      admissionType: admissionTypeMap[newRecord.managementData.admissionType] ?? null,
      referralSource: referralSourceMap[newRecord.managementData.referralSource] ?? null,
      admissionCount: String(newRecord.managementData.admissionCount ?? ""),

      hospitalTransferType: hospitalTransferTypeMap[newRecord.managementData.hospitalTransfer?.type] ?? null,
      hospitalTransferDestination: newRecord.managementData.hospitalTransfer?.destination || "",

      dischargeTime: dischargeTimeLocal,
      dischargeType: dischargeTypeMap[newRecord.managementData.dischargeType] ?? null,
      totalTreatmentDays: String(newRecord.managementData.totalDays ?? ""),

      // III
      ...diagnosisPayload,
      // IV
      ...dischargePayload,
      // A detail
      departmentTransfers: newRecord.managementData.transfers.map((t, idx) => {
        const transferType = t.transferType ?? (idx === 0 ? 1 : 2);
        const localNow = new Date();
        const fallbackIso = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}T${String(localNow.getHours()).padStart(2, '0')}:${String(localNow.getMinutes()).padStart(2, '0')}:00`;
        
        return {
          name: t.department || "",
          admissionTime: combineDateTimeToLocal(t.date || newRecord.admissionDate, t.time || "00:00") ?? fallbackIso,
          transferType,
          treatmentDays: String(t.days ?? 0),
        };
      }),
      detail: detailPayload,
    };

    console.log("CreateMedicalRecordCommand full payload:", createCommand);

    if (!Number.isFinite(patientIdNum) || patientIdNum <= 0) {
      alert("Lỗi: patientId không hợp lệ để tạo bệnh án.");
      return;
    }

    api.medicalRecords.create(patientIdNum, createCommand)
      .then((recordIdCreated) => {
        toast.success(`Tạo hồ sơ bệnh án thành công! (ID: ${recordIdCreated})`);
        navigate("/"); // Quay về danh sách hồ sơ
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Tạo hồ sơ thất bại: ${err instanceof Error ? err.message : String(err)}`);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 pt-6">
      <div className="w-full px-6">
         <RecordForm 
            mode="create"
            patient={patient}
            initialType={initialType}
            onSubmit={handleCreate}
            onCancel={() => navigate(-1)}
         />
      </div>
    </div>
  );
};
