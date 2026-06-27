import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, Plus, FileText, User, Activity, LogOut, ClipboardList, Thermometer, Pill, ChevronDown, ChevronRight, Download as DownloadIcon, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Record, Patient, RelatedCharacteristics } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";

import { AdministrativeSection } from "./sections/AdministrativeSection";
import { PatientManagementSection } from "./sections/PatientManagementSection";
import { DiagnosisSection } from "./sections/DiagnosisSection";
import { DischargeStatusSection } from "./sections/DischargeStatusSection";
import { MedicalHistorySection } from "./sections/MedicalHistorySection";
import { ExaminationSection } from "./sections/ExaminationSection";
import { TreatmentSection } from "./sections/TreatmentSection";
import { DocumentSection } from "./sections/DocumentSection";
import { PhieuYSection } from "./sections/PhieuYSection";

interface RecordFormProps {
  record?: Record;
  patient: Patient;
  mode: "create" | "edit";
  initialType?: "internal" | "surgery";
  onSubmit: (data: Record, patient: Patient) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const mapDtoToRecord = (dto: any, patient: Patient): Record => {
  const type: "internal" | "surgery" = dto.recordType === 2 ? "surgery" : "internal";
  const departmentName = type === "surgery" ? "Ngoại Khoa" : "Nội Khoa";

  const admissionTypeMap: { [key: number]: string } = { 1: "Cấp cứu", 2: "KKB", 3: "Khoa điều trị" };
  const referralSourceMap: { [key: number]: string } = { 1: "Cơ quan y tế", 2: "Tự đến", 3: "Khác" };
  const hospitalTransferTypeMap: { [key: number]: string } = { 1: "Tuyến trên", 2: "Tuyến dưới", 3: "CK" };
  const dischargeTypeMap: { [key: number]: string } = { 1: "Ra viện", 2: "Xin về", 3: "Bỏ về", 4: "Đưa về" };
  
  const treatmentResultMap: { [key: number]: string } = { 1: "Khoi", 2: "DoGiam", 3: "KhongThayDoi", 4: "NangHon", 5: "TuVong" };
  const pathologyResultMap: { [key: number]: string } = { 1: "Lành tính", 2: "Nghi ngờ", 3: "Ác tính" };
  const deathCauseMap: { [key: number]: string } = { 1: "Do bệnh", 2: "Do tai biến điều trị", 3: "Khác" };
  const deathTimeGroupMap: { [key: number]: string } = { 1: "Trong 24 giờ vào viện", 2: "Sau 24 giờ vào viện" };

  const detail = dto.detail || {};
  
  const riskFactorMap: { [key: number]: string } = {
    1: "allergy",
    2: "drugs",
    3: "alcohol",
    4: "tobacco",
    5: "pipeTobacco",
    6: "other",
  };

  const relatedCharacteristics: RelatedCharacteristics = {
    allergy: { isChecked: false, time: "" },
    drugs: { isChecked: false, time: "" },
    alcohol: { isChecked: false, time: "" },
    tobacco: { isChecked: false, time: "" },
    pipeTobacco: { isChecked: false, time: "" },
    other: { isChecked: false, time: "" },
  };

  if (detail.riskFactors) {
    detail.riskFactors.forEach((rf: any) => {
      const key = riskFactorMap[rf.signed];
      if (key) {
        relatedCharacteristics[key] = {
          isChecked: true,
          time: rf.durationMonth ? String(rf.durationMonth) : "",
        };
      }
    });
  }

  const admissionDate = dto.admissionTime ? dto.admissionTime.split("T")[0] : "";
  const admissionTime = dto.admissionTime ? dto.admissionTime.split("T")[1]?.substring(0, 5) : "";
  
  const dischargeDate = dto.dischargeTime ? dto.dischargeTime.split("T")[0] : "";
  const dischargeTime = dto.dischargeTime ? dto.dischargeTime.split("T")[1]?.substring(0, 5) : "";

  return {
    id: dto.id ? String(dto.id) : `REC${Date.now()}`,
    numericId: dto.id,
    bedCode: dto.bedCode || "",
    patientId: String(dto.patientId || patient.id),
    patientName: dto.patient?.name || patient.fullName || patient.name,
    cccd: patient.cccd || "",
    insuranceNumber: dto.patient?.healthInsuranceNumber || patient.insuranceNumber || patient.healthInsuranceNumber || "",
    address: dto.address || patient.address || "",
    age: patient.age || 0,
    dob: patient.dob || patient.dateOfBirth?.split('T')[0] || "",
    gender: String(patient.gender),
    admissionDate,
    dischargeDate,
    department: departmentName,
    type,
    documents: [],
    managementData: {
      admissionTime,
      admissionType: admissionTypeMap[dto.admissionType] || "KKB",
      referralSource: referralSourceMap[dto.referralSource] || "Tự đến",
      admissionCount: dto.admissionCount || 1,
      hospitalTransfer: { 
        type: hospitalTransferTypeMap[dto.hospitalTransferType] || "", 
        destination: dto.hospitalTransferDestination || "" 
      },
      dischargeType: dischargeTypeMap[dto.dischargeType] || "",
      dischargeTime,
      totalDays: dto.totalTreatmentDays || 0,
      transfers: dto.departmentTransfers?.map((t: any) => ({
        department: t.name,
        date: t.admissionTime ? t.admissionTime.split("T")[0] : "",
        time: t.admissionTime ? t.admissionTime.split("T")[1]?.substring(0, 5) : "",
        days: t.treatmentDays || 0,
        transferType: t.transferType,
      })) || [],
    },
    diagnosisInfo: {
      transferDiagnosis: { name: dto.referralDiagnosis || "", code: dto.referralCode || "" },
      kkbDiagnosis: { name: dto.admissionDiagnosis || "", code: dto.admissionCode || "" },
      deptDiagnosis: { 
        name: dto.departmentDiagnosis || "", 
        code: dto.departmentCode || "", 
        isSurgery: dto.hasSurgery || false, 
        isProcedure: dto.hasProcedure || false 
      },
      dischargeDiagnosis: {
        mainDisease: { name: dto.dischargeMainDiagnosis || "", code: dto.dischargeMainCode || "" },
        comorbidities: { name: dto.dischargeSubDiagnosis || "", code: dto.dischargeSubCode || "" },
        isAccident: dto.hasAccident || false,
        isComplication: dto.hasComplication || false,
      },
    },
    dischargeStatusInfo: {
      treatmentResult: treatmentResultMap[dto.treatmentResult] || "",
      pathology: pathologyResultMap[dto.pathologyResult] || "",
      deathStatus: { 
        description: dto.deathReason || "", 
        cause: deathCauseMap[dto.deathCause] || "", 
        time: deathTimeGroupMap[dto.deathTimeGroup] || "" 
      },
      mainCauseOfDeath: { name: dto.deathMainReason || "", code: String(dto.deathMainCode || "") },
      isAutopsy: dto.hasAutopsy || false,
      autopsyDiagnosis: { name: dto.diagnosisAutopsy || "", code: String(dto.diagnosisCode || "") },
    },
    medicalRecordContent: {
      reason: detail.admissionReason || "",
      dayOfIllness: detail.illnessDay ? String(detail.illnessDay) : "",
      pathologicalProcess: detail.pathologicalProcess || "",
      personalHistory: detail.personalHistory || "",
      familyHistory: detail.familyHistory || "",
      relatedCharacteristics,
      overallExamination: detail.examGeneral || "",
      vitalSigns: {
        pulse: detail.pulseRate || "",
        temperature: detail.temperature || "",
        bloodPressure: detail.bloodPressure || "",
        respiratoryRate: detail.respiratoryRate || "",
        weight: detail.bodyWeight || "",
      },
      organs: {
        circulatory: detail.examCardio || "",
        respiratory: detail.examRespiratory || "",
        digestive: detail.examGastro || "",
        kidneyUrology: detail.examRenalUrology || "",
        neurological: detail.examNeurological || "",
        musculoskeletal: detail.examMusculoskeletal || "",
        ent: detail.examENT || "",
        maxillofacial: detail.examMaxillofacial || "",
        eye: detail.examOphthalmology || "",
        endocrineAndOthers: detail.examEndocrineOthers || "",
      },
      clinicalTests: detail.requiredClinicalTests || "",
      summary: detail.medicalSummary || "",
      admissionDiagnosis: { 
        mainDisease: detail.diagnosisMain || "", 
        comorbidities: detail.diagnosisSub || "", 
        differential: detail.diagnosisDifferential || "" 
      },
      prognosis: detail.prognosis || "",
      treatmentPlan: detail.treatmentPlan || "",
    },
  };
};

const mapDtoToPatient = (dto: any, currentPatient: Patient): Patient => {
  const p = dto.patient || {};
  
  const dobDate = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
  const age = (dobDate && !isNaN(dobDate.getTime())) ? new Date().getFullYear() - dobDate.getFullYear() : currentPatient.age;
  const genderText = p.gender === 1 ? "Nam" : p.gender === 2 ? "Nữ" : p.gender === 3 ? "Khác" : currentPatient.gender;

  const paymentCategoryMap: { [key: number]: string } = { 1: "BHYT", 2: "Thu phí", 3: "Miễn", 4: "Khác" };

  const fullAddress = dto.address || "";
  const addressParts = fullAddress.split(",").map((part: string) => part.trim()).filter(Boolean);
  
  let provinceName = dto.provinceName || "";
  let districtName = dto.districtName || "";
  let wardName = dto.wardName || "";
  let village = "";
  let houseNumber = "";

  // Nếu API trả về các trường riêng biệt, ưu tiên dùng nó. 
  // Nếu không, ta cố gắng bóc tách từ chuỗi gộp (thường là 5 phần hoặc 4 phần)
  const parts = [...addressParts];
  
  // Logic bóc tách ngược từ dưới lên: Tỉnh -> Huyện -> Xã -> Thôn -> Số nhà
  if (!provinceName && parts.length > 0) provinceName = parts.pop() || "";
  else if (provinceName && parts.length > 0 && parts[parts.length - 1].toLowerCase() === provinceName.toLowerCase()) parts.pop();

  if (!districtName && parts.length > 0) districtName = parts.pop() || "";
  else if (districtName && parts.length > 0 && parts[parts.length - 1].toLowerCase() === districtName.toLowerCase()) parts.pop();

  if (!wardName && parts.length > 0) wardName = parts.pop() || "";
  else if (wardName && parts.length > 0 && parts[parts.length - 1].toLowerCase() === wardName.toLowerCase()) parts.pop();

  if (parts.length >= 2) {
    houseNumber = parts[0];
    village = parts.slice(1).join(", ");
  } else if (parts.length === 1) {
    if (/^\d+/.test(parts[0])) {
      houseNumber = parts[0];
    } else {
      village = parts[0];
    }
  }

  return {
    ...currentPatient,
    name: p.name || currentPatient.name,
    fullName: p.name || currentPatient.fullName,
    dateOfBirth: p.dateOfBirth || currentPatient.dateOfBirth,
    dob: p.dateOfBirth?.split('T')[0] || currentPatient.dob,
    age: age,
    gender: genderText,
    healthInsuranceNumber: p.healthInsuranceNumber || currentPatient.healthInsuranceNumber,
    insuranceNumber: p.healthInsuranceNumber || currentPatient.insuranceNumber,
    
    job: dto.jobTitle || currentPatient.job,
    jobCode: dto.jobTitleCode || currentPatient.jobCode,
    workplace: dto.addressJob || currentPatient.workplace,
    address: fullAddress,
    
    insuranceExpiry: dto.healthInsuranceExpiryDate?.split('T')[0] || currentPatient.insuranceExpiry,
    relativeInfo: dto.relativeInfo || currentPatient.relativeInfo,
    relativePhone: dto.relativePhone || currentPatient.relativePhone,
    subjectType: paymentCategoryMap[dto.paymentCategory] || currentPatient.subjectType,
    
    provinceCode: dto.provinceCode || currentPatient.provinceCode,
    districtCode: dto.districtCode || currentPatient.districtCode,
    provinceName: provinceName,
    districtName: districtName,
    wardName: wardName,
    village: village,
    houseNumber: houseNumber,
  };
};

const buildFullAddress = (parts: {
  houseNumber?: string;
  village?: string;
  wardName?: string;
  districtName?: string;
  provinceName?: string;
}) => {
  const house = parts.houseNumber?.trim();
  const village = parts.village?.trim();
  const ward = parts.wardName?.trim();
  const district = parts.districtName?.trim();
  const province = parts.provinceName?.trim();

  return [house, village, ward, district, province].filter((p): p is string => Boolean(p)).join(", ");
};

const createInitialRecord = (patient: Patient, type: "internal" | "surgery" = "internal"): Record => {
  const departmentName = type === "surgery" ? "Ngoại Khoa" : "Nội Khoa";
  const address = buildFullAddress({
    houseNumber: patient.houseNumber,
    village: patient.village,
    wardName: patient.wardName,
    districtName: patient.districtName,
    provinceName: patient.provinceName
  });

  return {
    id: `REC${Date.now()}`,
    patientId: String(patient.id),
    patientName: patient.fullName || patient.name,
    cccd: patient.cccd || "",
    insuranceNumber: patient.insuranceNumber || patient.healthInsuranceNumber || "",
    address: address || patient.address || "",
    age: patient.age || 0,
    dob: patient.dob || patient.dateOfBirth?.split('T')[0] || "",
    gender: String(patient.gender),
    admissionDate: new Date().toISOString().split("T")[0],
    dischargeDate: "",
    department: departmentName,
    type: type,
    documents: [],
    managementData: {
      admissionTime: "",
      admissionType: "KKB",
      referralSource: "Tự đến",
      admissionCount: 1,
      hospitalTransfer: { type: "", destination: "" },
      dischargeType: "",
      dischargeTime: "00:00",
      totalDays: 0,
      transfers: [
        {
          department: departmentName,
          date: new Date().toISOString().split("T")[0],
          time: "",
          days: 0,
          // transfers[0] corresponds to Swagger TransferType.Admission (=1)
          transferType: 1,
        },
      ],
    },
    diagnosisInfo: {
      transferDiagnosis: { name: "", code: "" },
      kkbDiagnosis: { name: "", code: "" },
      deptDiagnosis: { name: "", code: "", isSurgery: type === "surgery", isProcedure: false },
      dischargeDiagnosis: {
        mainDisease: { name: "", code: "" },
        comorbidities: { name: "", code: "" },
        isAccident: false,
        isComplication: false,
      },
    },
    dischargeStatusInfo: {
      treatmentResult: "",
      pathology: "",
      deathStatus: { description: "", cause: "", time: "" },
      mainCauseOfDeath: { name: "", code: "" },
      isAutopsy: false,
      autopsyDiagnosis: { name: "", code: "" },
    },
    medicalRecordContent: {
      reason: "",
      dayOfIllness: "",
      pathologicalProcess: "",
      personalHistory: "",
      familyHistory: "",
      relatedCharacteristics: {
        allergy: { isChecked: false, time: "" },
        drugs: { isChecked: false, time: "" },
        alcohol: { isChecked: false, time: "" },
        tobacco: { isChecked: false, time: "" },
        pipeTobacco: { isChecked: false, time: "" },
        other: { isChecked: false, time: "" },
      },
      overallExamination: "",
      vitalSigns: { pulse: "", temperature: "", bloodPressure: "", respiratoryRate: "", weight: "" },
      organs: {
        circulatory: "",
        respiratory: "",
        digestive: "",
        kidneyUrology: "",
        neurological: "",
        musculoskeletal: "",
        ent: "",
        maxillofacial: "",
        eye: "",
        endocrineAndOthers: "",
      },
      clinicalTests: "",
      summary: "",
      admissionDiagnosis: { mainDisease: "", comorbidities: "", differential: "" },
      prognosis: "",
      treatmentPlan: "",
    },
  };
};

const prepareRecordData = (record: Record): Record => {
  let transfers = record.managementData?.transfers || [];
  if (transfers.length === 0) {
    transfers = [
      {
        department: record.department || "",
        date: record.admissionDate || "",
        time: "",
        days: 0,
        transferType: 1,
      },
    ];
  }

  // Normalize transferType for existing/mock data
  transfers = transfers.map((t, idx) => {
    const transferType = t.transferType ?? (idx === 0 ? 1 : 2);
    return { ...t, transferType };
  });
  const initializedData: Record = {
    ...record,
    managementData: { ...record.managementData, transfers: transfers },
    diagnosisInfo: record.diagnosisInfo || {
      transferDiagnosis: { name: "", code: "" },
      kkbDiagnosis: { name: "", code: "" },
      deptDiagnosis: { name: "", code: "", isSurgery: false, isProcedure: false },
      dischargeDiagnosis: {
        mainDisease: { name: "", code: "" },
        comorbidities: { name: "", code: "" },
        isAccident: false,
        isComplication: false,
      },
    },
    dischargeStatusInfo: record.dischargeStatusInfo || {
      treatmentResult: "",
      pathology: "",
      deathStatus: { description: "", cause: "", time: "" },
      mainCauseOfDeath: { name: "", code: "" },
      isAutopsy: false,
      autopsyDiagnosis: { name: "", code: "" },
    },
    medicalRecordContent: { ...record.medicalRecordContent },
  };
  if (record.medicalRecordContent?.vitalSigns) {
    initializedData.medicalRecordContent.vitalSigns = { ...initializedData.medicalRecordContent.vitalSigns, ...record.medicalRecordContent.vitalSigns };
  }
  if (record.medicalRecordContent?.organs) {
    initializedData.medicalRecordContent.organs = { ...initializedData.medicalRecordContent.organs, ...record.medicalRecordContent.organs };
  }
  return initializedData;
};

interface SectionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  subSections?: SectionItem[];
}

const FORM_SECTIONS: SectionItem[] = [
  { id: "administrative", label: "I. Hành Chính", icon: User },
  { id: "management", label: "II. Quản Lý Người Bệnh", icon: LogOut },
  { id: "diagnosis", label: "III. Chẩn Đoán", icon: Activity },
  { id: "discharge", label: "IV. Tình Trạng Ra Viện", icon: FileText },
  {
    id: "medical_record_group",
    label: "A. Bệnh Án",
    icon: ClipboardList,
    subSections: [
      { id: "history", label: "Lý do vào viện & Hỏi bệnh", icon: ClipboardList },
      { id: "examination", label: "Khám Bệnh", icon: Thermometer },
      { id: "treatment", label: "Chẩn Đoán & Điều Trị", icon: Pill },
    ],
  },
];

// Helper to flatten sections for navigation
const getFlattenedSections = () => {
  const flattened: { id: string; label: string }[] = [];
  FORM_SECTIONS.forEach((section) => {
    if (section.subSections) {
      section.subSections.forEach((sub) => {
        flattened.push({ id: sub.id, label: sub.label });
      });
    } else {
      flattened.push({ id: section.id, label: section.label });
    }
  });
  return flattened;
};

export const RecordForm = ({ record, patient, mode, initialType = "internal", onSubmit, onCancel, readOnly = false }: RecordFormProps) => {
  const [formData, setFormData] = useState<Record | null>(null);
  const [editablePatient, setEditablePatient] = useState<Patient>(patient);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "details";
  
  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      prev.set("tab", value);
      return prev;
    }, { replace: true });
  };
  
  // Initialize with the first section
  const [activeSection, setActiveSection] = useState("administrative");
  
  // State for collapsible sidebar group
  const [isMedicalGroupOpen, setIsMedicalGroupOpen] = useState(true);

  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize if not already done
    if (initializedRef.current) return;

    if (mode === "create" && patient) {
      setFormData(createInitialRecord(patient, initialType));
      setEditablePatient(patient);
      initializedRef.current = true;
    } else if (mode === "edit" && record) {
      setFormData(prepareRecordData(record));
      setEditablePatient(patient); 
      initializedRef.current = true;
    }
  }, [mode, record, patient, initialType]);

  // Sync editablePatient changes to formData (important for PhieuYSection)
  useEffect(() => {
    if (formData && editablePatient) {
      // Reconstruct address from parts as requested by user
      const parts = [
        editablePatient.houseNumber,
        editablePatient.village,
        editablePatient.wardName,
        editablePatient.districtName,
        editablePatient.provinceName
      ].filter((p): p is string => Boolean(p)).map(p => p.trim());
      
      const fullAddress = parts.join(", ");
      
      // Re-calculate age accurately
      const dob = new Date(editablePatient.dateOfBirth);
      const today = new Date();
      let newAge = 0;
      if (!isNaN(dob.getTime())) {
        newAge = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          newAge--;
        }
        if (newAge < 0) newAge = 0;
      }

      if (formData.address !== fullAddress || formData.age !== newAge || formData.patientName !== (editablePatient.fullName || editablePatient.name)) {
        setFormData(prev => prev ? ({
          ...prev,
          patientName: editablePatient.fullName || editablePatient.name,
          address: fullAddress,
          age: newAge,
          dob: editablePatient.dateOfBirth?.split('T')[0] || ""
        }) : null);
      }
    }
  }, [editablePatient, formData]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (formData && !readOnly) {
      // Validate dates
      const now = new Date();
      // Calculate local ISO string parts
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const todayStr = localTime.toISOString().split("T")[0];
      
      // For datetime-local comparison, add 1 minute grace period to account for slow typing
      const nowWithGrace = new Date(now.getTime() + 60000 - now.getTimezoneOffset() * 60000);
      const nowTimeStrWithGrace = nowWithGrace.toISOString().slice(0, 16);
      const currentTimeStr = localTime.toTimeString().slice(0, 5);

      // 1. Check admissionDate
      if (formData.admissionDate && formData.admissionDate > todayStr) {
        toast.error("Ngày vào viện không được vượt quá ngày hiện tại.");
        return;
      }

      // 2. Check admission date/time
      if (formData.admissionDate && formData.managementData.admissionTime) {
        const admissionDateTime = `${formData.admissionDate}T${formData.managementData.admissionTime}`;
        if (admissionDateTime > nowTimeStrWithGrace) {
          toast.error("Thời gian vào viện không được vượt quá thời gian hiện tại.");
          return;
        }
      }

      // 3. Check dischargeDate if it exists
      if (formData.dischargeDate && formData.dischargeDate > todayStr) {
        toast.error("Ngày ra viện không được vượt quá ngày hiện tại.");
        return;
      }

      // 4. Check discharge date/time if it exists
      if (formData.dischargeDate && formData.managementData.dischargeTime) {
        const dischargeDateTime = `${formData.dischargeDate}T${formData.managementData.dischargeTime}`;
        if (dischargeDateTime > nowTimeStrWithGrace) {
          toast.error("Thời gian ra viện không được vượt quá thời gian hiện tại.");
          return;
        }
      }

      // 5. Check transfers
      if (formData.managementData.transfers) {
        for (const transfer of formData.managementData.transfers) {
          if (transfer.date && transfer.date > todayStr) {
            toast.error(`Ngày chuyển khoa (${transfer.department || "N/A"}) không được vượt quá ngày hiện tại.`);
            return;
          }
          if (transfer.date === todayStr && transfer.time && transfer.time > currentTimeStr) {
            // Give a bit of grace for time as well? (optional, usually users pick exact time)
            toast.error(`Thời gian chuyển khoa (${transfer.department || "N/A"}) không được vượt quá thời gian hiện tại.`);
            return;
          }
        }
      }

      // 6. Check Patient date of birth
      if (editablePatient.dateOfBirth) {
        const dobDateOnly = editablePatient.dateOfBirth.split('T')[0];
        if (dobDateOnly > todayStr) {
          toast.error("Ngày sinh bệnh nhân không được vượt quá ngày hiện tại.");
          return;
        }
      }

      onSubmit(formData, editablePatient);
    }
  };

  if (!formData) return null;

  const isCreate = mode === "create";
  const typeLabel = (formData?.type || initialType) === "surgery" ? "Ngoại Khoa" : "Nội Khoa";
  const flattenedSections = getFlattenedSections();
  const currentSectionIndex = flattenedSections.findIndex((s) => s.id === activeSection);

  const handleNextSection = () => {
    if (currentSectionIndex < flattenedSections.length - 1) {
      const nextId = flattenedSections[currentSectionIndex + 1].id;
      setActiveSection(nextId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-open group if navigating into it
      if (["history", "examination", "treatment"].includes(nextId)) {
        setIsMedicalGroupOpen(true);
      }
    } else {
      // In create mode, do not navigate to "forms/documents" yet.
      // The user should finish the "mục 1..A" in the details tab first.
      if (!isCreate) {
        handleTabChange("forms"); // Navigate to Phiếu cận lâm sàng first
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const prevId = flattenedSections[currentSectionIndex - 1].id;
      setActiveSection(prevId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-open group if navigating into it
       if (["history", "examination", "treatment"].includes(prevId)) {
        setIsMedicalGroupOpen(true);
      }
    }
  };

  const pageTitle = readOnly 
    ? "Chi Tiết Hồ Sơ Bệnh Án"
    : isCreate ? "Tạo Hồ Sơ Bệnh Án Mới" : "Chỉnh Sửa Hồ Sơ Bệnh Án";

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setImportStatus({type: 'error', message: "Vui lòng chọn file PDF"});
      setTimeout(() => setImportStatus({type: null, message: ""}), 5000);
      return;
    }

    setIsImporting(true);
    setImportStatus({type: null, message: ""});

    try {
      const result = await api.medicalRecords.importPdf(patient.id, file);
      
      const updatedPatient = mapDtoToPatient(result, editablePatient);
      const updatedRecord = mapDtoToRecord(result, updatedPatient);
      
      setEditablePatient(updatedPatient);
      setFormData(updatedRecord);
      
      setImportStatus({type: 'success', message: "Import PDF thành công!"});
    } catch (error: any) {
      console.error("PDF Import error:", error);
      setImportStatus({type: 'error', message: error.message || "Lỗi khi import PDF"});
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setImportStatus({type: null, message: ""}), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 h-[calc(100vh-100px)] flex flex-col relative">
      {(isImporting || importStatus.type) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 flex flex-col items-center gap-4 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="relative flex items-center justify-center">
              {isImporting ? (
                <Loader2 className="w-12 h-12 animate-spin text-vlu-red" />
              ) : importStatus.type === 'success' ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in duration-300">
                   <CheckCircle size={28} />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-in zoom-in duration-300">
                   <AlertCircle size={28} />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className={`text-lg font-bold ${
                importStatus.type === 'error' ? 'text-red-600' : 
                importStatus.type === 'success' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {isImporting ? "Đang xử lý PDF" : 
                 importStatus.type === 'success' ? "Import Thành Công" : "Lỗi Xử Lý PDF"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isImporting ? "Vui lòng chờ trong giây lát, hệ thống đang tự động trích xuất thông tin hồ sơ..." : importStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf" 
        onChange={handleImportPdf}
      />
      <div className="flex-none flex items-center justify-between mb-2 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {pageTitle}
            <span className="text-gray-400 font-light">|</span>
            <span className="text-vlu-red">{typeLabel}</span>
          </h1>
          <p className="text-gray-500">
            {isCreate ? `Bệnh nhân: ${patient.fullName || patient.name}` : `Mã lưu trữ: ${record?.id}`}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button 
            type="button" 
            onClick={onCancel}
            className="bg-vlu-red hover:bg-red-800 text-white"
          >
            {readOnly ? "Quay lại" : "Hủy bỏ"}
          </Button>
          {isCreate && (
            <Button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="bg-vlu-red hover:bg-red-800 text-white flex items-center gap-2"
            >
              <FileUp size={18} />
              Import PDF
            </Button>
          )}
          {readOnly && (
            <Button type="button" className="bg-vlu-red hover:bg-red-800 text-white flex items-center gap-2">
              <DownloadIcon size={18} />
              Xuất PDF
            </Button>
          )}
          {!readOnly && (
            <Button type="button" onClick={() => handleSubmit()} className="bg-red-700 hover:bg-red-800 text-white min-w-[120px]">
                {isCreate ? <Plus size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
                {isCreate ? "Tạo Hồ Sơ" : "Lưu Thay Đổi"}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-1 flex flex-col overflow-hidden">
        <div className="flex-none flex justify-start mb-6">
            <TabsList className="flex items-center justify-center bg-gray-900 p-1 rounded-xl border border-gray-800 shadow-lg h-auto">
              <TabsTrigger 
                value="details" 
                className="rounded-lg px-4 py-2 text-[12px] font-bold text-gray-400 transition-all duration-200 data-[state=active]:bg-vlu-red data-[state=active]:text-white"
              >
                <ClipboardList size={16} className="mr-2" />
                Thông Tin Chi Tiết
              </TabsTrigger>
              <TabsTrigger 
                value="forms"
                disabled={isCreate}
                className={`rounded-lg px-4 py-2 text-[12px] font-bold text-gray-400 transition-all duration-200 data-[state=active]:bg-vlu-red data-[state=active]:text-white ${
                  isCreate ? "blur-[1px]" : ""
                }`}
              >
                <Activity size={16} className="mr-2" />
                Phiếu cận lâm sàng
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                disabled={isCreate}
                className={`dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-lg px-4 py-2 text-[12px] font-bold text-gray-400 transition-all duration-200 data-[state=active]:bg-vlu-red data-[state=active]:text-white ${
                  isCreate ? "blur-[1px]" : ""
                }`}
              >
                <FileText size={16} className="mr-2" />
                Tài Liệu Đính Kèm
              </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="details" className="mt-6 animate-in fade-in slide-in-from-bottom-2 flex-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-1 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {FORM_SECTIONS.map((section) => {
                const Icon = section.icon;
                
                if (section.subSections) {
                  const isChildActive = section.subSections.some(sub => sub.id === activeSection);
                  
                  return (
                    <Collapsible
                      key={section.id}
                      open={isMedicalGroupOpen}
                      onOpenChange={setIsMedicalGroupOpen}
                      className="space-y-1"
                    >
                      <CollapsibleTrigger asChild>
                         <Button
                          type="button"
                          variant="ghost"
                          className={`w-full justify-between text-left h-auto py-3 px-4 rounded-lg font-bold transition-all ${
                            isChildActive ? "text-vlu-red bg-red-50" : "text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon size={18} className="mr-3" />
                            {section.label}
                          </div>
                          {isMedicalGroupOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-1">
                        {section.subSections.map((sub) => {
                           const isSubActive = activeSection === sub.id;
                           return (
                             <Button
                              key={sub.id}
                              type="button"
                              variant="ghost"
                              onClick={() => { setActiveSection(sub.id); }}
                              className={`w-full justify-start text-left h-auto py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                                isSubActive 
                                  ? "bg-vlu-red text-white hover:bg-red-800 shadow-sm" 
                                  : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <span className="mr-2 opacity-70">•</span>
                              {sub.label}
                            </Button>
                           );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                const isActive = activeSection === section.id;
                return (
                  <Button
                    key={section.id}
                    type="button"
                    variant="ghost"
                    onClick={() => { setActiveSection(section.id); }}
                    className={`w-full justify-start text-left h-auto py-3 px-4 rounded-lg font-bold transition-all ${
                      isActive ? "bg-vlu-red text-white hover:bg-red-800 shadow-sm" : "bg-white text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    <Icon size={18} className={`mr-3 ${isActive ? "text-white" : "text-gray-700"}`} />
                    {section.label}
                  </Button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0 h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-full flex flex-col">
                 <div className="flex-1">
                    {activeSection === "administrative" && <AdministrativeSection patient={editablePatient} setPatient={setEditablePatient} record={formData} setRecord={setFormData} readOnly={readOnly} />}
                    {activeSection === "management" && <PatientManagementSection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    {activeSection === "diagnosis" && <DiagnosisSection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    {activeSection === "discharge" && <DischargeStatusSection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    
                    {activeSection === "history" && <MedicalHistorySection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    {activeSection === "examination" && <ExaminationSection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    {activeSection === "treatment" && <TreatmentSection formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                 </div>
              
                  {/* Navigation Footer */}
                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200 pb-10">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevSection} 
                      disabled={currentSectionIndex === 0} 
                      className={currentSectionIndex === 0 ? "opacity-0 pointer-events-none" : ""}
                    >
                      <ArrowLeft size={16} className="mr-2" /> Quay lại
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handleNextSection}
                      disabled={isCreate && currentSectionIndex === flattenedSections.length - 1}
                      className="bg-vlu-red hover:bg-red-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {currentSectionIndex < flattenedSections.length - 1
                        ? flattenedSections[currentSectionIndex + 1].label.replace(/^[IV0-9]+\.\s/, "")
                        : "Phiếu cận lâm sàng"}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="mt-6 animate-in fade-in slide-in-from-bottom-2 flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 min-h-0 pr-4 pb-2">
                <PhieuYSection formData={formData} setFormData={setFormData} readOnly={readOnly} />
             </div>
                
             <div className="flex-none mt-2 flex justify-between items-center pt-4 border-t border-gray-200 pb-6 pr-4">
                <Button type="button" variant="outline" onClick={() => { handleTabChange("details"); setActiveSection("treatment"); }}>
                    <ArrowLeft size={16} className="mr-2" /> Quay lại
                </Button>
                <Button type="button" onClick={() => handleTabChange("documents")} className="bg-vlu-red hover:bg-red-800 text-white">
                    Tài Liệu Đính Kèm
                    <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 animate-in fade-in slide-in-from-bottom-2 flex-1 overflow-hidden">
             <div className="h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-10">
                <DocumentSection formData={formData} setFormData={setFormData} readOnly={readOnly} />
                
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => handleTabChange("forms")}>
                      <ArrowLeft size={16} className="mr-2" /> Quay lại
                    </Button>
                </div>            </div>
        </TabsContent>
      </Tabs>
    </form>
  );
};
