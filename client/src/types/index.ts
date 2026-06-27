export interface Patient {
  id: number;
  name: string;
  fullName?: string;
  cccd?: string;
  dateOfBirth: string;
  dob?: string;
  age?: number;
  gender: number | string; // API uses number (1,2,3), UI uses string (Nam, Nữ, Khác)
  healthInsuranceNumber: string;
  insuranceNumber?: string;
  ethnicityId: number;
  ethnicity?: {
    id: number;
    name: string;
  } | string;
  job?: string;
  jobCode?: string;
  nationality?: string;
  address?: string;
  houseNumber?: string;
  village?: string;
  wardName?: string;
  districtName?: string;
  provinceName?: string;
  provinceCode?: string;
  districtCode?: string;
  workplace?: string;
  subjectType?: string;
  insuranceExpiry?: string;
  relativeInfo?: string;
  relativePhone?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  fileName: string;
  date: string;
  url?: string;
  data?: any;
}

export interface Transfer {
  department: string;
  date: string;
  days: number | string;
  time?: string;
  transferType?: number;
}

export interface HospitalTransfer {
  type: string;
  destination: string;
}

export interface ManagementData {
  admissionTime: string;
  admissionType: string;
  referralSource: string;
  admissionCount: number | string;
  transfers: Transfer[];
  hospitalTransfer: HospitalTransfer;
  dischargeType: string;
  dischargeTime?: string;
  totalDays: number | string;
}

export interface RelatedCharacteristic {
  isChecked: boolean;
  time: string;
}

export interface RelatedCharacteristics {
  [key: string]: RelatedCharacteristic;
  allergy: RelatedCharacteristic;
  drugs: RelatedCharacteristic;
  alcohol: RelatedCharacteristic;
  tobacco: RelatedCharacteristic;
  pipeTobacco: RelatedCharacteristic;
  other: RelatedCharacteristic;
}

export interface VitalSigns {
  [key: string]: string;
  pulse: string;
  temperature: string;
  bloodPressure: string;
  respiratoryRate: string;
  weight: string;
}

export interface Organs {
  [key: string]: string;
  circulatory: string;
  respiratory: string;
  digestive: string;
  kidneyUrology: string;
  neurological: string;
  musculoskeletal: string;
  ent: string;
  maxillofacial: string;
  eye: string;
  endocrineAndOthers: string;
}

export interface AdmissionDiagnosis {
  mainDisease: string;
  comorbidities: string;
  differential: string;
}

export interface MedicalRecordContent {
  reason: string;
  dayOfIllness: string;
  pathologicalProcess: string;
  personalHistory: string;
  familyHistory: string;
  relatedCharacteristics: RelatedCharacteristics;
  overallExamination: string;
  vitalSigns: VitalSigns;
  organs: Organs;
  clinicalTests: string;
  summary: string;
  admissionDiagnosis: AdmissionDiagnosis;
  prognosis: string;
  treatmentPlan: string;
}

export interface DiagnosisCode {
  name: string;
  code: string;
}

export interface DeptDiagnosis extends DiagnosisCode {
  isSurgery: boolean;
  isProcedure: boolean;
}

export interface DischargeDiagnosis {
  mainDisease: DiagnosisCode;
  comorbidities: DiagnosisCode;
  isAccident: boolean;
  isComplication: boolean;
}

export interface DiagnosisInfo {
  transferDiagnosis: DiagnosisCode;
  kkbDiagnosis: DiagnosisCode;
  deptDiagnosis: DeptDiagnosis;
  dischargeDiagnosis: DischargeDiagnosis;
}

export interface DeathStatus {
  description: string;
  cause: string;
  time: string;
}

export interface DischargeStatusInfo {
  treatmentResult: string;
  pathology: string;
  deathStatus: DeathStatus;
  mainCauseOfDeath: DiagnosisCode;
  isAutopsy: boolean;
  autopsyDiagnosis: DiagnosisCode;
}

export interface Record {
  id: string;
  numericId?: number;
  bedCode?: string;
  storageCode?: string;
  healthDept?: string;
  hospital?: string;
  patientId: string;
  patientName: string;
  cccd: string;
  insuranceNumber: string;
  address: string;
  dob: string;
  age: number;
  gender: string;
  admissionDate: string;
  dischargeDate: string;
  department: string;
  type: string;
  documents: Document[];
  managementData: ManagementData;
  medicalRecordContent: MedicalRecordContent;
  diagnosisInfo: DiagnosisInfo;
  dischargeStatusInfo: DischargeStatusInfo;
}

export interface RecordType {
  id: string;
  name: string;
  active: boolean;
}

export interface User {
  id: number;
  identityId: string;
  email: string;
  name: string;
  pictureUrl?: string;
  active: boolean;
  roleName: string;
  departmentId?: number;
  departmentName?: string;
  createAt: string;
  isReceivedEmail?: boolean;
}

export interface Department {
  id: number;
  name: string;
  headUserId?: number;
  headUser?: User;
  users?: User[];
  createdAt: string;
}

export interface Notification {
  id: number;
  appTitle?: string;
  appContent?: string;
  type?: number;
  resourceUrl?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface UserNotification {
  id: number;
  notificationId: number;
  userId: number;
  isRead: boolean;
  readAt?: string;
  notification: Notification;
}

export interface SummaryDto {
  totalRecords: number;
  surgicalRate: number;
  procedureRate: number;
  emergencyRate: number;
}

export interface UserGrowthDto {
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  growthPercentage: number;
  isIncrease: boolean;
}

export interface DataPointDto {
  label: string;
  value: number;
  percentage?: number;
}

export interface TrendStatsDto {
  medicalRecords: DataPointDto[];
  userOnboarding: DataPointDto[];
}

export interface MortalityStatsDto {
  before24h: number;
  after24h: number;
  autopsyRate: number;
}

export interface DashboardDto {
  summary: SummaryDto;
  userGrowth: UserGrowthDto;
  trends: TrendStatsDto;
  outcomeDistribution: DataPointDto[];
  admissionTypeDistribution: DataPointDto[];
  mortalityStats: MortalityStatsDto;
}
