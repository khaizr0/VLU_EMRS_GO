import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { ViewRecordForm } from "../ViewRecord/RecordForm";
import { Button } from "@/components/ui/button";
import type { Record as MedicalRecord, Patient, RelatedCharacteristics, Document as MedicalDocument } from "@/types";
import { toast } from "sonner";

// --- API DTO TYPES ---

interface PatientDto {
  id: number;
  name: string;
  dateOfBirth: string;
  gender: number;
  healthInsuranceNumber: string;
  ethnicityId: number;
  ethnicity?: {
    id: number;
    name: string;
  };
}

interface RiskFactorDto {
  signed: number;
  durationMonth?: number;
}

interface XRayStatusLogDto {
  status: number;
  departmentName: string;
  updatedByName: string;
  createdAt: string;
}

interface XRayDto {
  id: number;
  status: number;
  departmentOfHealth?: string;
  hospitalName?: string;
  formNumber?: string;
  roomNumber?: string;
  departmentName: string;
  requestDescription: string;
  resultDescription: string;
  doctorAdvice: string;
  requestedByName: string;
  performedByName: string;
  requestedAt: string;
  completedAt: string;
  xRayStatusLogs: XRayStatusLogDto[];
}

interface HematologyStatusLogDto {
  status: number;
  departmentName: string;
  updatedByName: string;
  createdAt: string;
}

interface HematologyDto {
  id: number;
  status: number;
  departmentOfHealth?: string;
  hospitalName?: string;
  formNumber?: string;
  roomNumber?: string;
  departmentName: string;
  requestDescription: string;
  requestedByName: string;
  performedByName: string;
  requestedAt: string;
  completedAt: string;
  hematologyStatusLogs: HematologyStatusLogDto[];
  redBloodCellCount?: number;
  whiteBloodCellCount?: number;
  hemoglobin?: number;
  hematocrit?: number;
  mcv?: number;
  mch?: number;
  mchc?: number;
  reticulocyteCount?: number;
  plateletCount?: number;
  neutrophil?: number;
  eosinophil?: number;
  basophil?: number;
  monocyte?: number;
  lymphocyte?: number;
  nucleatedRedBloodCell?: string;
  abnormalCells?: string;
  malariaParasite?: string;
  esr1h?: number;
  esr2h?: number;
  bleedingTime?: number;
  clottingTime?: number;
  bloodTypeAbo?: number;
  bloodTypeRh?: number;
}

interface DepartmentTransferDto {
  name: string;
  admissionTime: string;
  treatmentDays: number;
  transferType: number;
}

interface MedicalRecordDetailDto {
  admissionReason: string;
  illnessDay: number;
  pathologicalProcess: string;
  personalHistory: string;
  familyHistory: string;
  examGeneral: string;
  examCardio: string;
  examRespiratory: string;
  examGastro: string;
  examRenalUrology: string;
  examNeurological: string;
  examMusculoskeletal: string;
  examENT: string;
  examMaxillofacial: string;
  examOphthalmology: string;
  examEndocrineOthers: string;
  requiredClinicalTests: string;
  medicalSummary: string;
  diagnosisMain: string;
  diagnosisSub: string;
  diagnosisDifferential: string;
  pulseRate: string;
  temperature: string;
  bloodPressure: string;
  respiratoryRate: string;
  bodyWeight: string;
  prognosis: string;
  treatmentPlan: string;
  riskFactors: RiskFactorDto[];
}

interface MedicalRecordDto {
  id: number;
  storageCode: string;
  bedCode?: string;
  patientId: number;
  patient: PatientDto;
  recordType: number;
  admissionTime: string;
  admissionType: number;
  referralSource: number;
  admissionCount: number;
  hospitalTransferType: number;
  hospitalTransferDestination: string;
  dischargeTime: string;
  dischargeType: number;
  totalTreatmentDays: number;
  referralDiagnosis: string;
  referralCode: string;
  admissionDiagnosis: string;
  admissionCode: string;
  departmentDiagnosis: string;
  departmentCode: string;
  hasSurgery: boolean;
  hasProcedure: boolean;
  dischargeMainDiagnosis: string;
  dischargeMainCode: string;
  dischargeSubDiagnosis: string;
  dischargeSubCode: string;
  hasAccident: boolean;
  hasComplication: boolean;
  treatmentResult: number;
  pathologyResult: number;
  deathCause: number;
  deathTimeGroup: number;
  deathReason: string;
  deathMainReason: string;
  deathMainCode: number;
  hasAutopsy: boolean;
  diagnosisAutopsy: string;
  diagnosisCode: number;
  jobTitle: string;
  jobTitleCode: string;
  addressJob: string;
  address: string;
  provinceCode: string;
  districtCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  healthInsuranceExpiryDate: string;
  relativeInfo: string;
  relativePhone: string;
  paymentCategory: number;
  detail: MedicalRecordDetailDto;
  departmentTransfers: DepartmentTransferDto[];
  xRays: XRayDto[];
  hematologies: HematologyDto[];
}

// --- VIEW COMPONENT ---

export const RecordDetailView = () => {
  const { id } = useParams(); // storageCode from URL
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Resolve storageCode to numericId
      const searchResult = await api.medicalRecords.getAll({ searchPhrase: id, pageSize: 5 });
      const recordItem = searchResult.items?.find((item: { storageCode: string }) => item.storageCode === id);
      
      if (!recordItem) {
        throw new Error("Không tìm thấy hồ sơ với mã lưu trữ này");
      }

      // 2. Fetch full detail
      const dto: MedicalRecordDto = await api.medicalRecords.getById(recordItem.id);
      
      // 3. Map API DTO to Frontend
      const mappedRecord: MedicalRecord = mapDtoToRecord(dto);
      const mappedPatient: Patient = mapDtoToPatient(dto.patient, dto);

      setRecord(mappedRecord);
      setPatient(mappedPatient);
    } catch (error: unknown) {
      console.error("Failed to fetch record detail:", error);
      const message = error instanceof Error ? error.message : "Lỗi khi tải chi tiết hồ sơ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-xl font-semibold text-gray-700">Đang tải chi tiết hồ sơ...</div>
      </div>
    );
  }

  if (!record || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-gray-700">Không tìm thấy hồ sơ hoặc thông tin bệnh nhân</h2>
        <Button onClick={() => navigate(-1)} variant="link" className="text-vlu-red">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-8 max-w-[1600px] mx-auto bg-white min-h-screen">
      <ViewRecordForm
        record={record}
        patient={patient}
        onCancel={() => navigate("/")}
      />
    </div>
  );
};

// --- MAPPING HELPERS ---

const formatIsoToLocal = (isoString?: string) => {
  if (!isoString) return { date: "", time: "" };
  const parts = isoString.split('T');
  const date = parts[0] || "";
  const time = parts[1] ? parts[1].substring(0, 5) : "";
  return { date, time };
};

const mapDtoToPatient = (apiPatient: PatientDto, recordDto: MedicalRecordDto): Patient => {
  const dobDate = apiPatient.dateOfBirth ? new Date(apiPatient.dateOfBirth) : null;
  const age = dobDate && !isNaN(dobDate.getTime()) ? new Date().getFullYear() - dobDate.getFullYear() : 0;
  const genderText = apiPatient.gender === 1 ? "Nam" : apiPatient.gender === 2 ? "Nữ" : "Khác";
  const paymentCategoryMapInv: { [key: number]: string } = { 1: "BHYT", 2: "Thu phí", 3: "Miễn", 4: "Khác" };

  // Parse address parts from the combined address string
  const fullAddress = recordDto.address || "";
  const addressParts = fullAddress.split(",").map((p: string) => p.trim());
  
  let houseNumber = "";
  let village = "";
  
  const knownWard = recordDto.wardName?.trim();
  const knownDistrict = recordDto.districtName?.trim();
  const knownProvince = recordDto.provinceName?.trim();

  const remainingParts = [...addressParts];
  if (knownProvince && remainingParts[remainingParts.length - 1] === knownProvince) remainingParts.pop();
  if (knownDistrict && remainingParts[remainingParts.length - 1] === knownDistrict) remainingParts.pop();
  if (knownWard && remainingParts[remainingParts.length - 1] === knownWard) remainingParts.pop();

  if (remainingParts.length >= 2) {
    houseNumber = remainingParts[0];
    village = remainingParts.slice(1).join(", ");
  } else if (remainingParts.length === 1) {
    if (/^\d+/.test(remainingParts[0])) {
      houseNumber = remainingParts[0];
    } else {
      village = remainingParts[0];
    }
  }

  return {
    id: apiPatient.id,
    name: apiPatient.name,
    fullName: apiPatient.name,
    cccd: "", 
    insuranceNumber: apiPatient.healthInsuranceNumber,
    dateOfBirth: apiPatient.dateOfBirth,
    dob: apiPatient.dateOfBirth?.split('T')[0] || "",
    age: age,
    gender: genderText,
    ethnicity: apiPatient.ethnicity?.name ?? "",
    ethnicityId: apiPatient.ethnicityId,
    healthInsuranceNumber: apiPatient.healthInsuranceNumber,
    
    // Snapshots from recordDto
    job: recordDto.jobTitle || "",
    jobCode: recordDto.jobTitleCode || "",
    nationality: "Việt Nam",
    address: recordDto.address || "",
    workplace: recordDto.addressJob || "",
    subjectType: paymentCategoryMapInv[recordDto.paymentCategory] || "",
    insuranceExpiry: recordDto.healthInsuranceExpiryDate?.split('T')[0] || "",
    relativeInfo: recordDto.relativeInfo || "",
    relativePhone: recordDto.relativePhone || "",
    
    // Address parts for UI
    houseNumber,
    village,
    provinceName: recordDto.provinceName || "",
    districtName: recordDto.districtName || "",
    wardName: recordDto.wardName || "",
    provinceCode: recordDto.provinceCode,
    districtCode: recordDto.districtCode,
  };
};

const mapDtoToRecord = (dto: MedicalRecordDto): MedicalRecord => {
  const { date: admissionDate, time: admissionTime } = formatIsoToLocal(dto.admissionTime);
  const { date: dischargeDate, time: dischargeTime } = formatIsoToLocal(dto.dischargeTime);

  const treatmentResultMapInv: { [key: number]: string } = { 1: "Khoi", 2: "DoGiam", 3: "KhongThayDoi", 4: "NangHon", 5: "TuVong" };
  const pathologyResultMapInv: { [key: number]: string } = { 1: "Lành tính", 2: "Nghi ngờ", 3: "Ác tính" };
  const deathCauseMapInv: { [key: number]: string } = { 1: "Do bệnh", 2: "Do tai biến điều trị", 3: "Khác" };
  const deathTimeGroupMapInv: { [key: number]: string } = { 1: "Trong 24 giờ vào viện", 2: "Sau 24 giờ vào viện" };
  const recordTypeMapInv: { [key: number]: string } = { 1: "internal", 2: "surgery" };
  const admissionTypeMapInv: { [key: number]: string } = { 1: "Cấp cứu", 2: "KKB", 3: "Khoa điều trị" };
  const referralSourceMapInv: { [key: number]: string } = { 1: "Cơ quan y tế", 2: "Tự đến", 3: "Khác" };
  const hospitalTransferTypeMapInv: { [key: number]: string } = { 1: "Tuyến trên", 2: "Tuyến dưới", 3: "CK" };
  const dischargeTypeMapInv: { [key: number]: string } = { 1: "Ra viện", 2: "Xin về", 3: "Bỏ về", 4: "Đưa về" };

  const riskFactors: RelatedCharacteristics = {
    allergy: { isChecked: false, time: "" },
    drugs: { isChecked: false, time: "" },
    alcohol: { isChecked: false, time: "" },
    tobacco: { isChecked: false, time: "" },
    pipeTobacco: { isChecked: false, time: "" },
    other: { isChecked: false, time: "" }
  };

  const riskFactorKeyMap: { [key: number]: string } = { 1: "allergy", 2: "drugs", 3: "alcohol", 4: "tobacco", 5: "pipeTobacco", 6: "other" };
  dto.detail?.riskFactors?.forEach((rf: RiskFactorDto) => {
    const key = riskFactorKeyMap[rf.signed];
    if (key) {
      riskFactors[key as keyof RelatedCharacteristics] = { isChecked: true, time: rf.durationMonth?.toString() || "" };
    }
  });

  const documents: MedicalDocument[] = [];
  if (dto.xRays && Array.isArray(dto.xRays)) {
    dto.xRays.forEach((x: XRayDto) => {
      const reqDate = x.requestedAt ? new Date(x.requestedAt) : null;
      const resDate = x.completedAt ? new Date(x.completedAt) : null;
      
      documents.push({
        id: `XRAY_${x.id}`,
        name: "Phiếu X-Quang",
        type: "X-Quang",
        fileName: "X-Quang.pdf",
        date: x.requestedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        data: {
          id: x.id,
          status: x.status,
          healthDept: x.departmentOfHealth || "",
          hospital: x.hospitalName || "",
          xrayNumber: x.formNumber || "",
          room: x.roomNumber || "",
          department: x.departmentName || "",
          request: x.requestDescription || "",
          result: x.resultDescription || "",
          advice: x.doctorAdvice || "",
          doctor: x.requestedByName || "",
          specialist: x.performedByName || "",
          xRayStatusLogs: x.xRayStatusLogs || [],
          requestDateDay: reqDate ? reqDate.getDate().toString() : "",
          requestDateMonth: reqDate ? (reqDate.getMonth() + 1).toString() : "",
          requestDateYear: reqDate ? reqDate.getFullYear().toString() : "",
          resultDateDay: resDate ? resDate.getDate().toString() : "",
          resultDateMonth: resDate ? (resDate.getMonth() + 1).toString() : "",
          resultDateYear: resDate ? resDate.getFullYear().toString() : ""
        }
      });
    });
  }
  if (dto.hematologies && Array.isArray(dto.hematologies)) {
    dto.hematologies.forEach((h: HematologyDto) => {
      const reqDate = h.requestedAt ? new Date(h.requestedAt) : null;
      const resDate = h.completedAt ? new Date(h.completedAt) : null;

      documents.push({
        id: `HEMA_${h.id}`,
        name: "Phiếu Xét Nghiệm Huyết Học",
        type: "XN-HuyetHoc",
        fileName: "XN_HuyetHoc.pdf",
        date: h.requestedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        data: {
          id: h.id,
          status: h.status,
          healthDept: h.departmentOfHealth || "",
          hospital: h.hospitalName || "",
          testNumber: h.formNumber || "",
          room: h.roomNumber || "",
          diagnosis: h.requestDescription || "",
          department: h.departmentName || "",
          doctor: h.requestedByName || "",
          technician: h.performedByName || "",
          hematologyStatusLogs: h.hematologyStatusLogs || [],
          requestDateDay: reqDate ? reqDate.getDate().toString() : "",
          requestDateMonth: reqDate ? (reqDate.getMonth() + 1).toString() : "",
          requestDateYear: reqDate ? reqDate.getFullYear().toString() : "",
          resultDateDay: resDate ? resDate.getDate().toString() : "",
          resultDateMonth: resDate ? (resDate.getMonth() + 1).toString() : "",
          resultDateYear: resDate ? resDate.getFullYear().toString() : "",
          check_rbc: h.redBloodCellCount != null,
          check_wbc: h.whiteBloodCellCount != null,
          check_hgb: h.hemoglobin != null,
          check_hct: h.hematocrit != null,
          check_mcv: h.mcv != null,
          check_mch: h.mch != null,
          check_mchc: h.mchc != null,
          check_reticulocytes: h.reticulocyteCount != null,
          check_plt: h.plateletCount != null,
          check_neutrophils: h.neutrophil != null,
          check_eosinophils: h.eosinophil != null,
          check_basophils: h.basophil != null,
          check_monocytes: h.monocyte != null,
          check_lymphocytes: h.lymphocyte != null,
          check_nrbc: h.nucleatedRedBloodCell != null,
          check_malaria: h.malariaParasite != null,
          check_esr: h.esr1h != null || h.esr2h != null,
          check_bleedingTime: h.bleedingTime != null,
          check_clottingTime: h.clottingTime != null,
          check_bloodGroupABO: h.bloodTypeAbo != null,
          check_bloodGroupRh: h.bloodTypeRh != null,
          rbc: h.redBloodCellCount || "",
          wbc: h.whiteBloodCellCount || "",
          hgb: h.hemoglobin || "",
          hct: h.hematocrit || "",
          mcv: h.mcv || "",
          mch: h.mch || "",
          mchc: h.mchc || "",
          reticulocytes: h.reticulocyteCount || "",
          plt: h.plateletCount || "",
          neutrophils: h.neutrophil || "",
          eosinophils: h.eosinophil || "",
          basophils: h.basophil || "",
          monocytes: h.monocyte || "",
          lymphocytes: h.lymphocyte || "",
          nrbc: h.nucleatedRedBloodCell || "",
          abnormalCells: h.abnormalCells || "",
          malaria: h.malariaParasite || "",
          esr1: h.esr1h || "",
          esr2: h.esr2h || "",
          bleedingTime: h.bleedingTime || "",
          clottingTime: h.clottingTime || "",
          bloodGroupABO: h.bloodTypeAbo === 1 ? "A" : h.bloodTypeAbo === 2 ? "B" : h.bloodTypeAbo === 3 ? "AB" : h.bloodTypeAbo === 4 ? "O" : "",
          bloodGroupRh: h.bloodTypeRh === 1 ? "+" : h.bloodTypeRh === 2 ? "-" : ""
        }
      });
    });
  }

  return {
    id: dto.storageCode || dto.id.toString(),
    numericId: dto.id,
    storageCode: dto.storageCode,
    bedCode: dto.bedCode || "",
    patientId: dto.patientId.toString(),
    patientName: dto.patient.name,
    cccd: "",
    insuranceNumber: dto.patient.healthInsuranceNumber,
    address: dto.address || "",
    dob: dto.patient.dateOfBirth?.split('T')[0] || "",
    age: 0,
    gender: dto.patient.gender === 1 ? "Nam" : "Nữ",
    admissionDate: admissionDate,
    dischargeDate: dischargeDate,
    department: dto.recordType === 1 ? "Nội Khoa" : "Ngoại Khoa",
    type: recordTypeMapInv[dto.recordType] || "internal",
    documents: documents,
    managementData: {
      admissionTime: admissionTime,
      admissionType: admissionTypeMapInv[dto.admissionType] || "",
      referralSource: referralSourceMapInv[dto.referralSource] || "",
      admissionCount: dto.admissionCount || "1",
      transfers: dto.departmentTransfers?.map((t: DepartmentTransferDto) => {
        const { date, time } = formatIsoToLocal(t.admissionTime);
        return {
          department: t.name,
          date,
          time,
          days: t.treatmentDays || "0",
          transferType: t.transferType
        };
      }) || [],
      hospitalTransfer: { 
        type: hospitalTransferTypeMapInv[dto.hospitalTransferType] || "", 
        destination: dto.hospitalTransferDestination || "" 
      },
      dischargeType: dischargeTypeMapInv[dto.dischargeType] || "",
      dischargeTime: dischargeTime,
      totalDays: dto.totalTreatmentDays || "0"
    },
    diagnosisInfo: {
      transferDiagnosis: { name: dto.referralDiagnosis || "", code: dto.referralCode || "" },
      kkbDiagnosis: { name: dto.admissionDiagnosis || "", code: dto.admissionCode || "" },
      deptDiagnosis: { 
        name: dto.departmentDiagnosis || "", 
        code: dto.departmentCode || "", 
        isSurgery: dto.hasSurgery, 
        isProcedure: dto.hasProcedure 
      },
      dischargeDiagnosis: {
        mainDisease: { name: dto.dischargeMainDiagnosis || "", code: dto.dischargeMainCode || "" },
        comorbidities: { name: dto.dischargeSubDiagnosis || "", code: dto.dischargeSubCode || "" },
        isAccident: dto.hasAccident,
        isComplication: dto.hasComplication
      }
    },
    dischargeStatusInfo: {
      treatmentResult: treatmentResultMapInv[dto.treatmentResult] || "",
      pathology: pathologyResultMapInv[dto.pathologyResult] || "",
      deathStatus: { 
        description: dto.deathReason || "", 
        cause: deathCauseMapInv[dto.deathCause] || "", 
        time: deathTimeGroupMapInv[dto.deathTimeGroup] || "" 
      },
      mainCauseOfDeath: { name: dto.deathMainReason || "", code: dto.deathMainCode?.toString() || "" },
      isAutopsy: dto.hasAutopsy,
      autopsyDiagnosis: { name: dto.diagnosisAutopsy || "", code: dto.diagnosisCode?.toString() || "" }
    },
    medicalRecordContent: {
      reason: dto.detail?.admissionReason || "",
      dayOfIllness: dto.detail?.illnessDay?.toString() || "",
      pathologicalProcess: dto.detail?.pathologicalProcess || "",
      personalHistory: dto.detail?.personalHistory || "",
      familyHistory: dto.detail?.familyHistory || "",
      relatedCharacteristics: riskFactors,
      overallExamination: dto.detail?.examGeneral || "",
      vitalSigns: {
        pulse: dto.detail?.pulseRate || "",
        temperature: dto.detail?.temperature || "",
        bloodPressure: dto.detail?.bloodPressure || "",
        respiratoryRate: dto.detail?.respiratoryRate || "",
        weight: dto.detail?.bodyWeight || ""
      },
      organs: {
        circulatory: dto.detail?.examCardio || "",
        respiratory: dto.detail?.examRespiratory || "",
        digestive: dto.detail?.examGastro || "",
        kidneyUrology: dto.detail?.examRenalUrology || "",
        neurological: dto.detail?.examNeurological || "",
        musculoskeletal: dto.detail?.examMusculoskeletal || "",
        ent: dto.detail?.examENT || "",
        maxillofacial: dto.detail?.examMaxillofacial || "",
        eye: dto.detail?.examOphthalmology || "",
        endocrineAndOthers: dto.detail?.examEndocrineOthers || ""
      },
      clinicalTests: dto.detail?.requiredClinicalTests || "",
      summary: dto.detail?.medicalSummary || "",
      admissionDiagnosis: {
        mainDisease: dto.detail?.diagnosisMain || "",
        comorbidities: dto.detail?.diagnosisSub || "",
        differential: dto.detail?.diagnosisDifferential || ""
      },
      prognosis: dto.detail?.prognosis || "",
      treatmentPlan: dto.detail?.treatmentPlan || ""
    }
  };
};
