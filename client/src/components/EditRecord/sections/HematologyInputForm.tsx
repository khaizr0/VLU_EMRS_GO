import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CheckCircle2, Circle, Loader2, FileUp } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Department, Document, User } from "@/types";
import { MultiSelect } from "@/components/ui/multi-select";

interface HematologyStatusLog {
  status: number;
  departmentName: string;
  updatedByName: string;
  createdAt: string;
}

export interface HematologyData {
  id?: number;
  status: number;
  hematologyStatusLogs: HematologyStatusLog[];
  additionalUserIds?: string[];

  healthDept: string;
  hospital: string;
  testNumber: string;
  times: string;
  isEmergency: boolean;
  
  patientName: string;
  age: string;
  gender: string;
  address: string;
  insuranceNumber: string;
  department: string;
  room: string;
  bed: string;
  diagnosis: string;
  
  // Checkboxes
  check_rbc: boolean; check_hgb: boolean; check_hct: boolean; check_mcv: boolean; check_mch: boolean; check_mchc: boolean; check_nrbc: boolean; check_reticulocytes: boolean;
  check_wbc: boolean; check_neutrophils: boolean; check_eosinophils: boolean; check_basophils: boolean; check_monocytes: boolean; check_lymphocytes: boolean; check_abnormalCells: boolean;
  check_plt: boolean; check_esr: boolean; check_malaria: boolean;
  check_bleedingTime: boolean; check_clottingTime: boolean;
  check_bloodGroupABO: boolean; check_bloodGroupRh: boolean;

  // 1. Tế bào máu ngoại vi
  rbc: string; hgb: string; hct: string; mcv: string; mch: string; mchc: string; nrbc: string; reticulocytes: string;
  wbc: string; neutrophils: string; eosinophils: string; basophils: string; monocytes: string; lymphocytes: string; abnormalCells: string;
  plt: string; esr1: string; esr2: string; malaria: string;
  bleedingTime: string; clottingTime: string;
  bloodGroupABO: string; bloodGroupRh: string;

  doctor: string;
  technician: string;
  requestTime: string;
  requestDateDay: string;
  requestDateMonth: string;
  requestDateYear: string;
  resultTime: string;
  resultDateDay: string;
  resultDateMonth: string;
  resultDateYear: string;
  }
interface HematologyInputFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientName?: string;
  defaultAge?: number;
  defaultDob?: string;
  defaultGender?: string;
  defaultAddress?: string;
  defaultDepartment?: string;
  defaultDiagnosis?: string;
  defaultInsuranceNumber?: string;
  defaultBedCode?: string;
  initialData?: HematologyData;
  readOnly?: boolean;
  recordId?: number;
  onSaved?: (data: HematologyData) => void;
  existingDocs?: Document[];
}

const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  const parts = dateStr.split(/[/ -]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
        date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
        date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    if (!isNaN(date.getTime())) return date;
  }
  return null;
};

const calculateAgeAtDate = (dobString?: string, refDateString?: string) => {
  const dob = parseDate(dobString);
  const ref = parseDate(refDateString);
  if (!dob || !ref) return "";
  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }
  return age < 0 ? "0" : age.toString();
};

const STEPS = [
  "Chưa nhận mẫu",
  "Đã nhận mẫu",
  "Đang chạy",
  "Đã có kết quả"
];

const formatAddress = (address: string) => {
    if (!address) return "";
    const keywords = ["Thành phố", "Tỉnh"];
    let splitIndex = -1;
    for (const kw of keywords) {
        const idx = address.indexOf(kw);
        if (idx !== -1 && (splitIndex === -1 || idx < splitIndex)) {
            splitIndex = idx;
        }
    }
    if (splitIndex <= 0) return address;
    const part1 = address.substring(0, splitIndex);
    const part2 = address.substring(splitIndex);
    return (
        <>
            {part1}
            <span style={{ display: 'inline-block' }}>{part2}</span>
        </>
    );
};

export const HematologyInputForm = ({
  isOpen,
  onClose,
  defaultPatientName = "",
  defaultAge,
  defaultDob = "",
  defaultGender = "",
  defaultAddress = "",
  defaultDepartment = "",
  defaultDiagnosis = "",
  defaultInsuranceNumber = "",
  defaultBedCode = "",
  initialData,
  readOnly = false,
  recordId,
  onSaved,
  existingDocs = []
}: HematologyInputFormProps) => {  const { currentUser } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportMode, setIsImportMode] = useState(false);

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !recordId) return;

    if (file.type !== "application/pdf") {
      toast.error("Vui lòng chọn file PDF");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Đang xử lý PDF Huyết học...");

    try {
      const result = await api.hematologies.importPdf(recordId, file);

      const reqDate = result.requestedAt ? new Date(result.requestedAt) : new Date();
      const resDate = result.completedAt ? new Date(result.completedAt) : new Date();

      setFormData(prev => ({
        ...prev,
        healthDept: result.departmentOfHealth || prev.healthDept,
        hospital: result.hospitalName || prev.hospital,
        testNumber: result.formNumber || prev.testNumber,
        room: result.roomNumber || prev.room,
        diagnosis: result.requestDescription || prev.diagnosis,
        rbc: result.redBloodCellCount?.toString() || "",
        wbc: result.whiteBloodCellCount?.toString() || "",
        hgb: result.hemoglobin?.toString() || "",
        hct: result.hematocrit?.toString() || "",
        mcv: result.mcv?.toString() || "",
        mch: result.mch?.toString() || "",
        mchc: result.mchc?.toString() || "",
        reticulocytes: result.reticulocyteCount?.toString() || "",
        plt: result.plateletCount?.toString() || "",
        neutrophils: result.neutrophil?.toString() || "",
        eosinophils: result.eosinophil?.toString() || "",
        basophils: result.basophil?.toString() || "",
        monocytes: result.monocyte?.toString() || "",
        lymphocytes: result.lymphocyte?.toString() || "",
        nrbc: result.nucleatedRedBloodCell || "",
        abnormalCells: result.abnormalCells || "",
        malaria: result.malariaParasite || "",
        esr1: result.esr1h?.toString() || "",
        esr2: result.esr2h?.toString() || "",
        bleedingTime: result.bleedingTime?.toString() || "",
        clottingTime: result.clottingTime?.toString() || "",
        bloodGroupABO: result.bloodTypeAbo?.toString() || "",
        bloodGroupRh: result.bloodTypeRh?.toString() || "",
        doctor: result.requestedByName || prev.doctor,
        technician: result.performedByName || prev.technician,
        requestDateDay: reqDate.getDate().toString(),
        requestDateMonth: (reqDate.getMonth() + 1).toString(),
        requestDateYear: reqDate.getFullYear().toString(),
        resultDateDay: resDate.getDate().toString(),
        resultDateMonth: (resDate.getMonth() + 1).toString(),
        resultDateYear: resDate.getFullYear().toString(),
        // Checkboxes based on data
        check_rbc: result.redBloodCellCount != null,
        check_wbc: result.whiteBloodCellCount != null,
        check_hgb: result.hemoglobin != null,
        check_hct: result.hematocrit != null,
        check_mcv: result.mcv != null,
        check_mch: result.mch != null,
        check_mchc: result.mchc != null,
        check_reticulocytes: result.reticulocyteCount != null,
        check_plt: result.plateletCount != null,
        check_neutrophils: result.neutrophil != null,
        check_eosinophils: result.eosinophil != null,
        check_basophils: result.basophil != null,
        check_monocytes: result.monocyte != null,
        check_lymphocytes: result.lymphocyte != null,
        check_nrbc: !!result.nucleatedRedRedCell,
        check_abnormalCells: !!result.abnormalCells,
        check_malaria: !!result.malariaParasite,
        check_esr: result.esr1h != null || result.esr2h != null,
        check_bleedingTime: result.bleedingTime != null,
        check_clottingTime: result.clottingTime != null,
        check_bloodGroupABO: !!result.bloodTypeAbo,
        check_bloodGroupRh: !!result.bloodTypeRh,
      }));

      setIsImportMode(true);
      toast.success("Trích xuất dữ liệu Huyết học thành công", { id: toastId });
    } catch (error: any) {
      console.error("Hematology PDF Import error:", error);
      toast.error(error.message || "Lỗi khi import PDF", { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const calculateHematologyOrder = (currentId?: number) => {
    const hemaDocs = existingDocs
      .filter(doc => doc.type === "XN-HuyetHoc")
      .map(doc => {
        const d = doc.data as HematologyData;
        const firstLog = d?.hematologyStatusLogs && d.hematologyStatusLogs.length > 0 
          ? new Date(d.hematologyStatusLogs[0].createdAt).getTime()
          : 0;

        let requestedTime = 0;
        if (d?.requestDateYear && d?.requestDateMonth && d?.requestDateDay) {
          requestedTime = new Date(
            parseInt(d.requestDateYear), 
            parseInt(d.requestDateMonth) - 1, 
            parseInt(d.requestDateDay)
          ).getTime();
        }

        return {
          id: d?.id || 0,
          timestamp: firstLog || requestedTime || 0
        };
      });

    const otherHemas = currentId ? hemaDocs.filter(x => x.id !== currentId) : hemaDocs;

    if (!currentId) {
      return (otherHemas.length + 1).toString();
    }

    const allSorted = [...otherHemas];
    const current = hemaDocs.find(x => x.id === currentId);
    if (current) {
        allSorted.push(current);
    }

    allSorted.sort((a, b) => {
      if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
      return a.id - b.id;
    });

    const index = allSorted.findIndex(x => x.id === currentId);
    return (index >= 0 ? index + 1 : otherHemas.length + 1).toString();
  };

  const defaultState: HematologyData = {
    id: undefined,
    status: 0,
    hematologyStatusLogs: [],
    healthDept: "",
    hospital: "",
    testNumber: "",
    times: calculateHematologyOrder(),
    isEmergency: false,
    
    patientName: "",
    age: "",
    gender: "",
    address: "",
    insuranceNumber: "",
    department: "",
    room: "",
    bed: "",
    diagnosis: "",
    
    // Checkboxes
    check_rbc: false, check_hgb: false, check_hct: false, check_mcv: false, check_mch: false, check_mchc: false, check_nrbc: false, check_reticulocytes: false,
    check_wbc: false, check_neutrophils: false, check_eosinophils: false, check_basophils: false, check_monocytes: false, check_lymphocytes: false, check_abnormalCells: false,
    check_plt: false, check_esr: false, check_malaria: false,
    check_bleedingTime: false, check_clottingTime: false,
    check_bloodGroupABO: false, check_bloodGroupRh: false,

    // 1. Tế bào máu ngoại vi
    rbc: "", hgb: "", hct: "", mcv: "", mch: "", mchc: "", nrbc: "", reticulocytes: "",
    wbc: "", neutrophils: "", eosinophils: "", basophils: "", monocytes: "", lymphocytes: "", abnormalCells: "",
    plt: "", esr1: "", esr2: "", malaria: "",
    bleedingTime: "", clottingTime: "",
    bloodGroupABO: "", bloodGroupRh: "",

    doctor: "",
    technician: "",
    requestTime: "",
    requestDateDay: new Date().getDate().toString(),
    requestDateMonth: (new Date().getMonth() + 1).toString(),
    requestDateYear: new Date().getFullYear().toString(),
    resultTime: "",
    resultDateDay: new Date().getDate().toString(),
    resultDateMonth: (new Date().getMonth() + 1).toString(),
    resultDateYear: new Date().getFullYear().toString(),
  };

  const getRequestDateString = (data: HematologyData) => {
    const year = data.requestDateYear || new Date().getFullYear().toString();
    const month = (data.requestDateMonth || "1").padStart(2, '0');
    const day = (data.requestDateDay || "1").padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<HematologyData>(() => {
    if (initialData) {
        const data: HematologyData = {
            ...defaultState,
            ...initialData,
            times: initialData.times || calculateHematologyOrder(initialData.id),
            patientName: defaultPatientName || initialData.patientName,
            gender: defaultGender || initialData.gender,
            address: defaultAddress || initialData.address,
            insuranceNumber: defaultInsuranceNumber || initialData.insuranceNumber,
            department: initialData.department || defaultDepartment || "",
            bed: initialData.bed || defaultBedCode || "",
            room: initialData.room || "",
            diagnosis: initialData.diagnosis || defaultDiagnosis || "",
            status: initialData.status !== undefined ? initialData.status : 0,
            hematologyStatusLogs: initialData.hematologyStatusLogs || []
        };
        
        // Ensure default location fields if missing
        if (!data.healthDept) data.healthDept = "";
        if (!data.hospital) data.hospital = "";
        
        const calculatedAge = calculateAgeAtDate(defaultDob, getRequestDateString(data));
        data.age = (calculatedAge === "" && defaultAge && defaultAge > 0) ? defaultAge.toString() : calculatedAge;

        if (!readOnly && data.status === 2) {
            if (!data.technician && currentUser?.name) {
                data.technician = currentUser.name;
            }
            if (!data.resultDateDay || data.resultDateDay === "") {
                data.resultDateDay = new Date().getDate().toString();
            }
            if (!data.resultDateMonth || data.resultDateMonth === "") {
                data.resultDateMonth = (new Date().getMonth() + 1).toString();
            }
            if (!data.resultDateYear || data.resultDateYear === "") {
                data.resultDateYear = new Date().getFullYear().toString();
            }
        }

        return data;
    } else {
        const data: HematologyData = {
            ...defaultState,
            patientName: defaultPatientName,
            gender: defaultGender,
            address: defaultAddress,
            insuranceNumber: defaultInsuranceNumber,
            department: defaultDepartment || "",
            bed: defaultBedCode || "",
            diagnosis: defaultDiagnosis || "",
            doctor: currentUser?.name || ""
        };
        const calculatedAge = calculateAgeAtDate(defaultDob, getRequestDateString(data));
        data.age = (calculatedAge === "" && defaultAge && defaultAge > 0) ? defaultAge.toString() : calculatedAge;
        return data;
    }
  });

  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [departmentInput, setDepartmentInput] = useState("");
  const [ccDepartmentInputs, setCcDepartmentInputs] = useState<string[]>([]);
  const [openCcCombobox, setOpenCcCombobox] = useState(false);
  const [targetAction, setTargetAction] = useState<"SAVE" | "NEXT" | "FAST_TRACK" | "PDF">("SAVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(!!(isOpen && initialData && readOnly));

  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    if (isDeptDialogOpen) {
      const fetchDeptsAndUsers = async () => {
        try {
          const [depts, users] = await Promise.all([
            api.departments.getAll(),
            api.identities.getAllUsers()
          ]);
          setDepartmentsList(depts);
          setUsersList(users);
        } catch (error) {
          console.error("Failed to fetch departments or users", error);
        }
      };
      fetchDeptsAndUsers();
    }
  }, [isDeptDialogOpen]);

  const generateAndOpenPDF = async (dataToSave: HematologyData) => {
    if (!printRef.current) return;
    try {
        const canvas = await html2canvas(printRef.current, {
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
                const styles = clonedDoc.getElementsByTagName('style');
                for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();
                const links = clonedDoc.getElementsByTagName('link');
                for (let i = links.length - 1; i >= 0; i--) {
                    if (links[i].rel === 'stylesheet') links[i].remove();
                }
                const root = clonedDoc.documentElement;
                root.style.setProperty('--background', '#ffffff');
                root.style.setProperty('--foreground', '#000000');
                root.style.setProperty('--primary', '#000000');
                root.style.setProperty('--card', '#ffffff');
                root.style.setProperty('--popover', '#ffffff');
                root.style.setProperty('--muted', '#f3f4f6');
                root.style.setProperty('--border', '#e5e7eb');
            }
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
        
        console.log(`Opening PDF for ${dataToSave.patientName}`);
        
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    } catch (error) {
        console.error("Error viewing PDF:", error);
        toast.error("Không thể tạo bản xem trước PDF");
    }
  };

  const handleGeneratePDF = async (dataToSave: HematologyData) => {
    if (!printRef.current) return;
    try {
        const canvas = await html2canvas(printRef.current, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff', 
            onclone: (clonedDoc) => {
                const styles = clonedDoc.getElementsByTagName('style');
                for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();
                const links = clonedDoc.getElementsByTagName('link');
                for (let i = links.length - 1; i >= 0; i--) {
                    if (links[i].rel === 'stylesheet') links[i].remove();
                }
                const root = clonedDoc.documentElement;
                root.style.setProperty('--background', '#ffffff');
                root.style.setProperty('--foreground', '#000000');
                root.style.setProperty('--primary', '#000000');
                root.style.setProperty('--card', '#ffffff');
                root.style.setProperty('--popover', '#ffffff');
                root.style.setProperty('--muted', '#f3f4f6');
                root.style.setProperty('--border', '#e5e7eb');
            }
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
        pdf.save(`XNHuyetHoc_${dataToSave.patientName}.pdf`);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isGenerating) {
        const timer = setTimeout(async () => {
            await generateAndOpenPDF(formData);
            setIsGenerating(false);
            onClose();
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [isGenerating, formData, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Only allow numeric characters for testNumber
    if (name === "testNumber" && value !== "" && !/^\d+$/.test(value)) {
        return;
    }

    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (["requestDateDay", "requestDateMonth", "requestDateYear"].includes(name) && defaultDob && !readOnly) {
            const newAge = calculateAgeAtDate(defaultDob, getRequestDateString(newData));
            if (newAge !== "" && newAge !== newData.age) {
                newData.age = newAge;
            }
        }
        return newData;
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
      setFormData(prev => ({ ...prev, isEmergency: checked }));
  }

  const validateForm = (action: "SAVE" | "NEXT" | "FAST_TRACK") => {
    // New location fields validation
    if (!formData.healthDept?.trim()) {
        toast.error("Vui lòng nhập 'Sở Y tế'.");
        return false;
    }
    if (formData.healthDept.length > 255) {
        toast.error("'Sở Y tế' không được vượt quá 255 ký tự.");
        return false;
    }
    if (!formData.hospital?.trim()) {
        toast.error("Vui lòng nhập 'Bệnh viện'.");
        return false;
    }
    if (formData.hospital.length > 255) {
        toast.error("'Tên bệnh viện' không được vượt quá 255 ký tự.");
        return false;
    }
    if (!formData.testNumber?.trim()) {
        toast.error("Vui lòng nhập 'Số'.");
        return false;
    }
    if (formData.testNumber.length > 50) {
        toast.error("'Số' không được vượt quá 50 ký tự.");
        return false;
    }
    if (!/^\d+$/.test(formData.testNumber)) {
        toast.error("'Số' phải là định dạng số.");
        return false;
    }
    if (!formData.room?.trim()) {
        toast.error("Vui lòng nhập 'Số buồng'.");
        return false;
    }
    if (formData.room.length > 50) {
        toast.error("'Số buồng' không được vượt quá 50 ký tự.");
        return false;
    }

    if (!formData.diagnosis?.trim()) {
        toast.error("Vui lòng nhập 'Chẩn đoán'.");
        return false;
    }
    if (!formData.requestDateYear?.trim()) {
        toast.error("Vui lòng nhập 'Năm' của ngày yêu cầu.");
        return false;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (formData.requestDateDay?.trim() && formData.requestDateMonth?.trim() && formData.requestDateYear?.trim()) {
        const reqDate = new Date(parseInt(formData.requestDateYear), parseInt(formData.requestDateMonth) - 1, parseInt(formData.requestDateDay));
        if (reqDate > today) {
            toast.error("Ngày yêu cầu không được vượt quá ngày hiện tại.");
            return false;
        }
    }
    if (action === "NEXT" && formData.status === 2) {
        const requiredResults = [
            { field: 'rbc', label: 'Số lượng HC' },
            { field: 'wbc', label: 'Số lượng BC' },
            { field: 'hgb', label: 'Huyết sắc tố' },
            { field: 'hct', label: 'Hematocrit' },
            { field: 'bloodGroupABO', label: 'Nhóm máu hệ ABO' },
            { field: 'bloodGroupRh', label: 'Nhóm máu hệ Rh' },
            { field: 'resultDateYear', label: 'Năm trả kết quả' }
        ];
        for (const item of requiredResults) {
            const val = (formData as any)[item.field];
            if (!val?.toString().trim()) {
                toast.error(`Vui lòng điền '${item.label}' để hoàn thành phiếu.`);
                return false;
            }
        }
        
        if (formData.resultDateDay?.trim() && formData.resultDateMonth?.trim() && formData.resultDateYear?.trim()) {
            const resDate = new Date(parseInt(formData.resultDateYear), parseInt(formData.resultDateMonth) - 1, parseInt(formData.resultDateDay));
            if (resDate > today) {
                toast.error("Ngày trả kết quả không được vượt quá ngày hiện tại.");
                return false;
            }
        }

        // Validate bounds
        if (formData.rbc && (parseFloat(formData.rbc) <= 0 || parseFloat(formData.rbc) >= 10)) {
            toast.error("Số lượng hồng cầu phải lớn hơn 0 và nhỏ hơn 10."); return false;
        }
        if (formData.wbc && (parseFloat(formData.wbc) <= 0 || parseFloat(formData.wbc) >= 100)) {
            toast.error("Số lượng bạch cầu phải lớn hơn 0 và nhỏ hơn 100."); return false;
        }
        if (formData.hgb && (parseFloat(formData.hgb) <= 0 || parseFloat(formData.hgb) >= 300)) {
            toast.error("Huyết sắc tố phải lớn hơn 0 và nhỏ hơn 300."); return false;
        }
        if (formData.hct && (parseFloat(formData.hct) <= 0 || parseFloat(formData.hct) >= 100)) {
            toast.error("Hematocrit không hợp lệ."); return false;
        }
        if (formData.mcv && (parseFloat(formData.mcv) <= 0 || parseFloat(formData.mcv) >= 200)) {
            toast.error("MCV phải lớn hơn 0 và nhỏ hơn 200."); return false;
        }
        if (formData.mch && (parseFloat(formData.mch) <= 0 || parseFloat(formData.mch) >= 100)) {
            toast.error("MCH phải lớn hơn 0 và nhỏ hơn 100."); return false;
        }
        if (formData.mchc && (parseFloat(formData.mchc) <= 0 || parseFloat(formData.mchc) >= 500)) {
            toast.error("MCHC phải lớn hơn 0 và nhỏ hơn 500."); return false;
        }
        if (formData.reticulocytes && (parseFloat(formData.reticulocytes) < 0 || parseFloat(formData.reticulocytes) > 100)) {
            toast.error("Hồng cầu lưới không hợp lệ (0-100)."); return false;
        }
        if (formData.plt && (parseFloat(formData.plt) <= 0 || parseFloat(formData.plt) >= 2000)) {
            toast.error("Số lượng tiểu cầu phải lớn hơn 0 và nhỏ hơn 2000."); return false;
        }
        
        // Sum of WBC
        const wbcFields = [formData.neutrophils, formData.eosinophils, formData.basophils, formData.monocytes, formData.lymphocytes];
        const sumWbc = wbcFields.reduce((sum, val) => sum + (val ? parseFloat(val) : 0), 0);
        if (sumWbc > 100) {
            toast.error("Tổng tỷ lệ các loại bạch cầu không được vượt quá 100%."); return false;
        }
    }
    return true;
  };

  const handleActionClick = (action: "SAVE" | "NEXT" | "PDF" | "FAST_TRACK") => {
    if (action !== "PDF" && !validateForm(action)) return;
    setTargetAction(action);
    if (action === "PDF") {
      handleGeneratePDF(formData);
      return;
    }

    // If importing from PDF, skip notification dialog and save directly
    if (isImportMode) {
      handleConfirmDepartmentDirect(action, formData.department || defaultDepartment || "");
      return;
    }

    // Only show department selection dialog for completely new requests (non-import)
    if (!formData.id) {
      setDepartmentInput("");
      setCcDepartmentInputs([]); // Reset CC selections
      setIsDeptDialogOpen(true);
    } else {
      // For existing requests, proceed directly using the existing department
      handleConfirmDepartmentDirect(action, formData.department || "");
    }
  };
  const handleConfirmDepartmentDirect = async (action: "SAVE" | "NEXT" | "FAST_TRACK", deptName: string) => {
    if (!recordId) {
        toast.error("Vui lòng lưu hồ sơ bệnh án trước.");
        return;
    }

    setIsSubmitting(true);
    try {
        if (isImportMode && (action === "SAVE" || action === "NEXT")) {
            const completedAt = `${formData.resultDateYear}-${formData.resultDateMonth.padStart(2, '0')}-${formData.resultDateDay.padStart(2, '0')}`;
            const requestedAt = `${formData.requestDateYear}-${formData.requestDateMonth.padStart(2, '0')}-${formData.requestDateDay.padStart(2, '0')}`;

            const importPayload = {
                medicalRecordId: recordId,
                departmentOfHealth: formData.healthDept,
                hospitalName: formData.hospital,
                formNumber: formData.testNumber,
                roomNumber: formData.room,
                isEmergency: formData.isEmergency,
                requestedAt: requestedAt,
                completedAt: completedAt,
                requestDescription: formData.diagnosis,
                requestDepartmentName: formData.department || defaultDepartment,
                performDepartmentName: deptName || "Khoa Xét nghiệm",
                redBloodCellCount: formData.rbc ? parseFloat(formData.rbc) : 0,
                whiteBloodCellCount: formData.wbc ? parseFloat(formData.wbc) : 0,
                hemoglobin: formData.hgb ? parseFloat(formData.hgb) : 0,
                hematocrit: formData.hct ? (parseFloat(formData.hct) > 1 ? parseFloat(formData.hct) / 100 : parseFloat(formData.hct)) : 0,
                mcv: formData.mcv ? parseFloat(formData.mcv) : 0,
                mch: formData.mch ? parseFloat(formData.mch) : 0,
                mchc: formData.mchc ? parseFloat(formData.mchc) : 0,
                reticulocyteCount: formData.reticulocytes ? parseFloat(formData.reticulocytes) : 0,
                plateletCount: formData.plt ? parseFloat(formData.plt) : 0,
                neutrophil: formData.neutrophils ? parseFloat(formData.neutrophils) : 0,
                eosinophil: formData.eosinophils ? parseFloat(formData.eosinophils) : 0,
                basophil: formData.basophils ? parseFloat(formData.basophils) : 0,
                monocyte: formData.monocytes ? parseFloat(formData.monocytes) : 0,
                lymphocyte: formData.lymphocytes ? parseFloat(formData.lymphocytes) : 0,
                nucleatedRedBloodCell: formData.nrbc,
                abnormalCells: formData.abnormalCells,
                malariaParasite: formData.malaria,
                esr1h: formData.esr1 ? parseFloat(formData.esr1) : 0,
                esr2h: formData.esr2 ? parseFloat(formData.esr2) : 0,
                bleedingTime: formData.bleedingTime ? parseInt(formData.bleedingTime, 10) : 0,
                clottingTime: formData.clottingTime ? parseInt(formData.clottingTime, 10) : 0,
                bloodTypeAbo: formData.bloodGroupABO ? parseInt(formData.bloodGroupABO, 10) : 0,
                bloodTypeRh: formData.bloodGroupRh ? parseInt(formData.bloodGroupRh, 10) : 0
            };

            await api.hematologies.importCompleted(recordId, importPayload);
            toast.success("Đã nhập hồ sơ Huyết học từ PDF thành công");
            if (onSaved) setTimeout(() => onSaved(formData), 0);
            // Refresh the page to show imported data
            setTimeout(() => { window.location.search = "?tab=forms"; }, 1000);
            return;
        }

        let currentHematologyId = formData.id;
        const requestedAt = getRequestDateString(formData);

        if (!currentHematologyId) {            // Find department ID from name
            const selectedDept = departmentsList.find(d => d.name === deptName);
            const deptIds = selectedDept ? [selectedDept.id] : [];
            
            // Gộp danh sách các khoa CC
            if (ccDepartmentInputs && ccDepartmentInputs.length > 0) {
              ccDepartmentInputs.forEach(ccName => {
                const ccDept = departmentsList.find(d => d.name === ccName);
                if (ccDept && !deptIds.includes(ccDept.id)) {
                  deptIds.push(ccDept.id);
                }
              });
            }

            const createPayload = {
                listDepartmentId: deptIds,
                requestDescription: formData.diagnosis || "Yêu cầu xét nghiệm Huyết học",
                requestedAt: requestedAt,
                departmentOfHealth: formData.healthDept,
                hospitalName: formData.hospital,
                formNumber: formData.testNumber,
                roomNumber: formData.room,
                additionalUserIds: formData.additionalUserIds?.map(id => parseInt(id, 10)) || []
            };
            const newIdStr = await api.hematologies.create(recordId, createPayload);
            currentHematologyId = parseInt(newIdStr, 10);
            if (!isNaN(currentHematologyId)) {
                setFormData(prev => ({ ...prev, id: currentHematologyId }));
            }
        }

        let newStatus = formData.status;
        const newLogs: HematologyStatusLog[] = [];

        if (action === "NEXT") {
            newStatus = Math.min(formData.status + 1, 3);
            if (newStatus === 1 || newStatus === 2) {
                 if (currentHematologyId) {
                     await api.hematologies.changeStatus(recordId, currentHematologyId, { status: newStatus, departmentName: deptName });
                 }
            } else if (newStatus === 3) {
                 if (currentHematologyId) {
                     const resYear = formData.resultDateYear || "";
                     const resMonth = formData.resultDateMonth || "";
                     const resDay = formData.resultDateDay || "";
                     const completedAt = resYear && resMonth && resDay ? `${resYear}-${resMonth.padStart(2, '0')}-${resDay.padStart(2, '0')}` : new Date().toISOString().split('T')[0];
                     
                     const completePayload = {
                         id: currentHematologyId,
                         medicalRecordId: recordId,
                         completedAt: completedAt,
                         departmentOfHealth: formData.healthDept,
                         hospitalName: formData.hospital,
                         formNumber: formData.testNumber,
                         roomNumber: formData.room,
                         redBloodCellCount: formData.rbc ? parseFloat(formData.rbc) : null,
                         whiteBloodCellCount: formData.wbc ? parseFloat(formData.wbc) : null,
                         hemoglobin: formData.hgb ? parseFloat(formData.hgb) : null,
                         hematocrit: formData.hct ? (parseFloat(formData.hct) > 1 ? parseFloat(formData.hct) / 100 : parseFloat(formData.hct)) : null,
                         mcv: formData.mcv ? parseFloat(formData.mcv) : null,
                         mch: formData.mch ? parseFloat(formData.mch) : null,
                         mchc: formData.mchc ? parseFloat(formData.mchc) : null,
                         reticulocyteCount: formData.reticulocytes ? parseFloat(formData.reticulocytes) : null,
                         plateletCount: formData.plt ? parseFloat(formData.plt) : null,
                         neutrophil: formData.neutrophils ? parseFloat(formData.neutrophils) : null,
                         eosinophil: formData.eosinophils ? parseFloat(formData.eosinophils) : null,
                         basophil: formData.basophils ? parseFloat(formData.basophils) : null,
                         monocyte: formData.monocytes ? parseFloat(formData.monocytes) : null,
                         lymphocyte: formData.lymphocytes ? parseFloat(formData.lymphocytes) : null,
                         nucleatedRedBloodCell: formData.nrbc || null,
                         abnormalCells: formData.abnormalCells || null,
                         malariaParasite: formData.malaria || null,
                         esr1h: formData.esr1 ? parseFloat(formData.esr1) : null,
                         esr2h: formData.esr2 ? parseFloat(formData.esr2) : null,
                         bleedingTime: formData.bleedingTime ? parseInt(formData.bleedingTime, 10) : null,
                         clottingTime: formData.clottingTime ? parseInt(formData.clottingTime, 10) : null,
                         bloodTypeAbo: formData.bloodGroupABO === "A" ? 1 : formData.bloodGroupABO === "B" ? 2 : formData.bloodGroupABO === "AB" ? 3 : formData.bloodGroupABO === "O" ? 4 : undefined,
                         bloodTypeRh: formData.bloodGroupRh === "+" ? 1 : formData.bloodGroupRh === "-" ? 2 : undefined
                     };

                     await api.hematologies.complete(recordId, currentHematologyId, completePayload);
                     await api.hematologies.changeStatus(recordId, currentHematologyId, { status: 3, departmentName: deptName });
                 }
            }
            newLogs.push({ status: newStatus, departmentName: deptName, updatedByName: currentUser?.name || "Người dùng", createdAt: new Date().toISOString() });
        } else if (action === "FAST_TRACK") {
            if (currentHematologyId) {
                await api.hematologies.changeStatus(recordId, currentHematologyId, { status: 1, departmentName: deptName });
                await api.hematologies.changeStatus(recordId, currentHematologyId, { status: 2, departmentName: deptName });
                newStatus = 2;
                newLogs.push({ status: 1, departmentName: deptName, updatedByName: currentUser?.name || "Người dùng", createdAt: new Date().toISOString() });
                newLogs.push({ status: 2, departmentName: deptName, updatedByName: currentUser?.name || "Người dùng", createdAt: new Date().toISOString() });
            }
        }

        setFormData(prev => {
            const updated = { ...prev, status: newStatus, hematologyStatusLogs: [...(prev.hematologyStatusLogs || []), ...newLogs] };
            if (!readOnly && updated.status === 2) {
                if (!updated.technician && currentUser?.name) {
                    updated.technician = currentUser.name;
                }
                if (!updated.resultDateDay || updated.resultDateDay === "") {
                    updated.resultDateDay = new Date().getDate().toString();
                }
                if (!updated.resultDateMonth || updated.resultDateMonth === "") {
                    updated.resultDateMonth = (new Date().getMonth() + 1).toString();
                }
                if (!updated.resultDateYear || updated.resultDateYear === "") {
                    updated.resultDateYear = new Date().getFullYear().toString();
                }
            }
            if (onSaved) setTimeout(() => onSaved(updated), 0);
            return updated;
        });
        toast.success(`Cập nhật thành công`);
        
        // Refresh the page if it's a completely new request being created
        if (!currentHematologyId) {
            setTimeout(() => { window.location.search = "?tab=forms"; }, 1000);
        }
    } catch (error: unknown) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Lỗi đồng bộ server.";
        toast.error(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleConfirmDepartment = async () => {
    setIsDeptDialogOpen(false);
    await handleConfirmDepartmentDirect(targetAction as any, departmentInput);
  };

  const isRequestReadOnly = readOnly || formData.status > 0 || !!initialData;
  const showResultSection = formData.status >= 2;
  const isResultReadOnly = readOnly || formData.status === 3;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] !max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Phiếu Xét Nghiệm Huyết Học</DialogTitle>
          <DialogDescription>Xem hoặc nhập kết quả xét nghiệm huyết học</DialogDescription>
        </DialogHeader>

        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleImportPdf}
        />

        {isGenerating || isImporting ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-vlu-red" />
                <p className="text-lg font-medium text-gray-600">
                    {isGenerating ? "Đang chuẩn bị bản in PDF..." : "Đang trích xuất dữ liệu từ PDF Huyết học..."}
                </p>
            </div>
        ) : (
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between mb-8 px-8 relative mt-2 print:hidden">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-vlu-red z-0 transition-all duration-300" style={{ width: `calc(${(formData.status / 3) * 100}% - 40px)` }}></div>
            {STEPS.map((step, index) => {
              const isActive = formData.status >= index;
              const logForStep = formData.hematologyStatusLogs?.find(l => l.status === index);
              return (
                <div key={index} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-vlu-red border-vlu-red text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                    {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col items-center">
                      <span className={`text-xs font-medium ${isActive ? 'text-vlu-red' : 'text-gray-500'}`}>{step}</span>
                      {logForStep && (
                          <div className="text-[10px] text-gray-400 text-center mt-1 w-24 leading-tight">
                              <p className="font-semibold text-gray-500 truncate">{logForStep.updatedByName}</p>
                              <p>{new Date(logForStep.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 items-start border-b pb-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0">Sở Y tế: <span className="text-red-500">*</span></Label>
                <Input name="healthDept" value={formData.healthDept} onChange={handleChange} className="h-7 border-b border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0" disabled={isRequestReadOnly} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0">Bệnh viện: <span className="text-red-500">*</span></Label>
                <Input name="hospital" value={formData.hospital} onChange={handleChange} className="h-7 border-b border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0" disabled={isRequestReadOnly} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-sm font-bold uppercase">Phiếu xét nghiệm</h2>
              <h3 className="text-base font-bold uppercase text-vlu-red">Huyết học</h3>
              <div className="flex justify-center items-center gap-1">
                <span className="text-xs italic">(lần thứ</span>
                <Input name="times" value={formData.times} onChange={handleChange} className="w-10 h-5 p-0 text-center text-xs border-b border-x-0 border-t-0 rounded-none bg-transparent" disabled={true} />
                <span className="text-xs italic">)</span>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">MS: 17/BV-02</p>
              <div className="flex items-center justify-end gap-2">
                <Label className="shrink-0">Số: <span className="text-red-500">*</span></Label>
                <Input name="testNumber" value={formData.testNumber} onChange={handleChange} className="w-24 h-7 border-b border-t-0 border-x-0 rounded-none text-right focus-visible:ring-0" disabled={isRequestReadOnly} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start gap-8 text-sm pl-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="normal" isX checked={!formData.isEmergency} onCheckedChange={() => handleCheckboxChange(false)} disabled={isRequestReadOnly} />
                <label htmlFor="normal" className="font-medium">Thường</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="emergency" isX checked={formData.isEmergency} onCheckedChange={() => handleCheckboxChange(true)} disabled={isRequestReadOnly} />
                <label htmlFor="emergency" className="font-medium">Cấp cứu</label>
              </div>
          </div>

          <div className="space-y-3 border border-gray-300 rounded-sm p-4 bg-gray-50/20 text-sm">
             <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 flex items-end gap-2 min-w-[200px]">
                <Label className="shrink-0">Họ tên người bệnh:</Label>
                <Input name="patientName" value={formData.patientName} className="border-b border-t-0 border-x-0 rounded-none px-0 font-bold uppercase" disabled={true} />
              </div>
              <div className="w-24 flex items-end gap-2">
                <Label className="shrink-0">Tuổi:</Label>
                <Input name="age" value={formData.age} className="border-b border-t-0 border-x-0 rounded-none px-0" disabled={true} />
              </div>
              <div className="w-32 flex items-end gap-2">
                <Label className="shrink-0">Nam/Nữ:</Label>
                <Input name="gender" value={formData.gender} className="border-b border-t-0 border-x-0 rounded-none px-0" disabled={true} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-start pt-1">
                <div className="flex-1 flex items-start gap-2">
                    <Label className="shrink-0 mt-1">Địa chỉ:</Label>
                    <div className="flex-1 border-b border-gray-200 pb-1 text-sm text-gray-500 break-words min-h-[28px]">{formData.address}</div>
                </div>
                <div className="flex-1 flex items-start gap-2">
                    <Label className="shrink-0 mt-1">Số thẻ BHYT:</Label>
                    <div className="flex-1 border-b border-gray-200 pb-1 text-sm text-gray-500 min-h-[28px]">{formData.insuranceNumber}</div>
                </div>
            </div>
             <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 flex items-end gap-2">
                <Label className="shrink-0">Khoa:</Label>
                <Input name="department" value={formData.department} onChange={handleChange} className="border-b border-t-0 border-x-0 rounded-none px-0" disabled={isRequestReadOnly} />
              </div>
              <div className="flex items-center gap-1">
                <Label className="shrink-0">Buồng: <span className="text-red-500">*</span></Label>
                <Input name="room" value={formData.room} onChange={handleChange} className="border-b border-t-0 border-x-0 rounded-none px-0" disabled={isRequestReadOnly} />
              </div>
              <div className="w-32 flex items-end gap-2">
                <Label className="shrink-0">Giường:</Label>
                <Input name="bed" value={formData.bed} className="border-b border-t-0 border-x-0 rounded-none px-0" disabled={true} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">Chẩn đoán:</Label>
              <Textarea 
                name="diagnosis" 
                value={formData.diagnosis} 
                className="w-full min-h-[60px] border border-gray-300 rounded-sm p-2 focus-visible:ring-0 break-words bg-transparent disabled:opacity-100 disabled:cursor-not-allowed" 
                disabled 
              />
            </div>
            <div className="flex justify-end pt-4 italic text-xs">
                  <div className="text-center w-1/3">
                      <div className="flex justify-center gap-1 mb-2 items-center">
                          <span>Ngày</span>
                          <Input name="requestDateDay" value={formData.requestDateDay} onChange={handleChange} className="w-10 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isRequestReadOnly} />
                          <span>tháng</span>
                          <Input name="requestDateMonth" value={formData.requestDateMonth} onChange={handleChange} className="w-10 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isRequestReadOnly} />
                          <span>năm <span className="text-red-500">*</span></span>
                          <Input name="requestDateYear" value={formData.requestDateYear} onChange={handleChange} className="w-14 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isRequestReadOnly} />
                      </div>
                      <p className="font-bold uppercase not-italic">Bác sĩ điều trị</p>
                      <div className="pt-12">
                          <div className="h-7 border-b border-gray-300 w-full"></div>
                      </div>
                  </div>
            </div>
          </div>

          <div className="relative">
              {!showResultSection && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-500 border border-gray-200">
                          {formData.status === 0 ? "Chưa nhận mẫu xét nghiệm" : "Đã nhận mẫu. Chuyển sang 'Đang chạy kết quả' để nhập KQ."}
                      </div>
                  </div>
              )}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-200 rounded-lg p-4 bg-gray-50/10 ${!showResultSection ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="col-span-full border-b pb-2 flex justify-between items-center"><Label className="font-bold text-base">Kết quả xét nghiệm</Label></div>
                <div className="space-y-4">
                    <h4 className="font-bold">1. Tế bào máu ngoại vi:</h4>
                    <div className="border border-gray-300 rounded p-4 space-y-3 bg-white text-xs">
                        {[
                            { label: "Số lượng HC", sub: "nam (4.0-5.8); nữ (3.9-5.4 x10^12/l)", name: "rbc", check: "check_rbc", r: true },
                            { label: "Huyết sắc tố", sub: "nam (140-160); nữ (125-145 g/l)", name: "hgb", check: "check_hgb", r: true },
                            { label: "Hematocrit", sub: "nam (0.38-0.50); nữ (0.35-0.47 l/l)", name: "hct", check: "check_hct", r: true },
                            { label: "MCV", sub: "(83-92 fl)", name: "mcv", check: "check_mcv" },
                            { label: "MCH", sub: "(27-32 pg)", name: "mch", check: "check_mch" },
                            { label: "MCHC", sub: "(320-356 g/l)", name: "mchc", check: "check_mchc" },
                            { label: "Hồng cầu có nhân", sub: "(0 x 10^9/l)", name: "nrbc", check: "check_nrbc" },
                            { label: "Hồng cầu lưới", sub: "(0.1-0.5 %)", name: "reticulocytes", check: "check_reticulocytes" },
                        ].map(item => (
                            <div key={item.name} className="grid grid-cols-3 gap-2 items-center">
                                <div className="col-span-2 flex items-start gap-2">
                                    <div><p className="font-medium">{item.label} {item.r && <span className="text-red-500">*</span>}</p><p className="text-[10px] text-gray-500 italic">{item.sub}</p></div>
                                </div>
                                <Input name={item.name} value={(formData as any)[item.name]} onChange={handleChange} className="h-7 text-center font-bold" disabled={isResultReadOnly} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold invisible">.</h4>
                    <div className="border border-gray-300 rounded p-4 space-y-3 bg-white text-xs">
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <div className="col-span-2 flex items-start gap-2">
                                <div><p className="font-medium">Số lượng BC <span className="text-red-500">*</span></p><p className="text-[10px] text-gray-500 italic">(4-10 x 10^9/l)</p></div>
                            </div>
                            <Input name="wbc" value={formData.wbc} onChange={handleChange} className="h-7 text-center font-bold" disabled={isResultReadOnly} />
                        </div>
                        <div className="pl-6 space-y-2 text-xs">
                            <p className="font-medium italic text-gray-600">Thành phần bạch cầu (%):</p>
                            {[ { label: "- Đoạn trung tính", name: "neutrophils" }, { label: "- Đoạn ưa a xít", name: "eosinophils" }, { label: "- Đoạn ưa ba zơ", name: "basophils" }, { label: "- Mono", name: "monocytes" }, { label: "- Lympho", name: "lymphocytes" }, { label: "- Tế bào bất thường", name: "abnormalCells" } ].map(item => (
                                <div key={item.name} className="grid grid-cols-3 gap-2 items-center"><span className="col-span-2 pl-2">{item.label}</span><Input name={item.name} value={(formData as any)[item.name]} onChange={handleChange} className="h-6 text-center font-bold" disabled={isResultReadOnly} /></div>
                            ))}
                        </div>
                        {[ { label: "Số lượng tiểu cầu", sub: "(150-400 x10^9/l)", name: "plt", check: "check_plt" }, { label: "KSV sốt rét", sub: "", name: "malaria", check: "check_malaria" } ].map(item => (
                            <div key={item.name} className="grid grid-cols-3 gap-2 items-center">
                                <div className="col-span-2 flex items-start gap-2">
                                    <div><p className="font-medium">{item.label}</p>{item.sub && <p className="text-[10px] text-gray-500 italic">{item.sub}</p>}</div>
                                </div>
                                <Input name={item.name} value={(formData as any)[item.name]} onChange={handleChange} className="h-7 text-center font-bold" disabled={isResultReadOnly} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-full grid grid-cols-2 gap-8 text-xs">
                    <div className="border border-gray-300 rounded p-4 space-y-2 bg-white">
                        <h4 className="font-bold underline">2. Đông máu:</h4>
                        {[ {l:"Máu chảy:", n:"bleedingTime", c:"check_bleedingTime"}, {l:"Máu đông:", n:"clottingTime", c:"check_clottingTime"} ].map(i => (
                            <div key={i.n} className="flex items-center gap-2"><span>{i.l}</span><Input name={i.n} value={(formData as any)[i.n]} onChange={handleChange} className="w-16 h-6 text-center font-bold" disabled={isResultReadOnly} /><span>phút</span></div>
                        ))}
                    </div>
                    <div className="border border-gray-300 rounded p-4 space-y-2 bg-white">
                        <h4 className="font-bold underline">3. Nhóm máu:</h4>
                        {[ {l:"Hệ ABO:", n:"bloodGroupABO", c:"check_bloodGroupABO", p:"A, B, AB, O", r:true}, {l:"Hệ Rh:", n:"bloodGroupRh", c:"check_bloodGroupRh", p:"+ / -", r:true} ].map(i => (
                            <div key={i.n} className="flex items-center gap-2"><span>{i.l} {i.r && <span className="text-red-500">*</span>}</span><Input name={i.n} value={(formData as any)[i.n]} onChange={handleChange} className="w-20 h-6 text-center font-bold" disabled={isResultReadOnly} placeholder={i.p} /></div>
                        ))}
                    </div>
                </div>
                <div className="col-span-full flex justify-end pt-6 border-t italic text-xs">
                      <div className="text-center w-1/3">
                          <div className="flex justify-center gap-1 mb-2 items-center">
                              <span>Ngày</span>
                              <Input name="resultDateDay" value={formData.resultDateDay} onChange={handleChange} className="w-10 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isResultReadOnly} />
                              <span>tháng</span>
                              <Input name="resultDateMonth" value={formData.resultDateMonth} onChange={handleChange} className="w-10 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isResultReadOnly} />
                              <span>năm <span className="text-red-500">*</span></span>
                              <Input name="resultDateYear" value={formData.resultDateYear} onChange={handleChange} className="w-14 h-6 p-0 text-center border-b border-x-0 border-t-0" disabled={isResultReadOnly} />
                          </div>
                          <p className="font-bold uppercase not-italic">Trưởng khoa xét nghiệm</p>
                          <div className="pt-12">
                              <div className="h-7 border-b border-gray-300 w-full"></div>
                          </div>
                      </div>
                </div>
              </div>
          </div>
        </div>
        )}

        {/* Hidden PDF Template */}
        <div 
            ref={printRef}
            className="fixed"
            style={{
                position: 'fixed',
                left: '-10000px',
                top: '0',
                width: '210mm',
                padding: '10mm',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontFamily: 'Times New Roman, serif',
                fontSize: '11pt',
                lineHeight: '1.2',
                ['--background' as any]: '#ffffff',
                ['--foreground' as any]: '#000000',
            }}
        >
            <div>
                 {/* Header */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ width: '30%' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt' }}>Sở Y tế: {formData.healthDept}</p>
                        <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt' }}>Bệnh viện: {formData.hospital}</p>
                    </div>
                    <div style={{ width: '40%', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Phiếu Xét Nghiệm</h1>
                        <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Huyết Học</h2>
                        <p style={{ fontStyle: 'italic', margin: 0, fontSize: '10pt' }}>(lần thứ: {formData.times})</p>
                    </div>
                    <div style={{ width: '30%', textAlign: 'right' }}>
                         <p style={{ margin: 0, fontWeight: 'bold' }}>MS: 17/BV-02</p>
                         <p style={{ margin: 0 }}>Số: {formData.testNumber}</p>
                    </div>
                </div>

                <div style={{ marginTop: '5px', marginBottom: '10px', fontSize: '10pt' }}>
                     <span style={{ marginRight: '30px' }}>
                        <span style={{ verticalAlign: 'middle' }}>Thường: </span>
                        <span style={{ border: '1px solid #000', width: '14px', height: '14px', display: 'inline-block', textAlign: 'center', lineHeight: '12px', fontSize: '12px', verticalAlign: 'middle', marginLeft: '5px' }}>
                            {formData.isEmergency ? '' : 'x'}
                        </span>
                     </span>
                     <span>
                        <span style={{ verticalAlign: 'middle' }}>Cấp cứu: </span>
                        <span style={{ border: '1px solid #000', width: '14px', height: '14px', display: 'inline-block', textAlign: 'center', lineHeight: '12px', fontSize: '12px', verticalAlign: 'middle', marginLeft: '5px' }}>
                            {formData.isEmergency ? 'x' : ''}
                        </span>
                     </span>
                </div>

                {/* Patient Info */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ flex: 1 }}>- Họ tên người bệnh: <b style={{ textTransform: 'uppercase' }}>{formData.patientName}</b></div>
                        <div style={{ width: '15%' }}>Tuổi: {formData.age}</div>
                        <div style={{ width: '15%', textAlign: 'right' }}>Nam/Nữ: {formData.gender}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ flex: 1 }}>- Địa chỉ: {formatAddress(formData.address)}</div>
                        <div style={{ width: '40%' }}>Số thẻ BHYT: {formData.insuranceNumber}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ flex: 1 }}>- Khoa: {formData.department}</div>
                        <div style={{ width: '25%' }}>Buồng: {formData.room}</div>
                        <div style={{ width: '25%', textAlign: 'right' }}>Giường: {formData.bed}</div>
                    </div>
                    <div style={{ wordBreak: 'break-all' }}>- Chẩn đoán: {formData.diagnosis}</div>
                </div>

                {/* Content Body - Table Layout for PDF */}
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>1. Tế bào máu ngoại vi:</div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '1px solid black' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', width: '30%' }}>Chỉ số</th>
                            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '20%' }}>Kết quả</th>
                            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', width: '30%' }}>Chỉ số</th>
                            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '20%' }}>Kết quả</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            // Row 1
                            { 
                                l1: { l: "Số lượng HC", s: "nam (4.0-5.8); nữ (3.9-5.4 x10^12/l)", c: formData.check_rbc }, v1: formData.rbc,
                                l2: { l: "Số lượng BC", s: "(4-10 x 10^9/l)", c: formData.check_wbc }, v2: formData.wbc
                            },
                            // Row 2
                            { 
                                l1: { l: "Huyết sắc tố", s: "nam (140-160); nữ (125-145 g/l)", c: formData.check_hgb }, v1: formData.hgb,
                                l2: { type: 'header', l: "Thành phần bạch cầu (%):" }, v2: null
                            },
                            // Row 3
                            { 
                                l1: { l: "Hematocrit", s: "nam (0.38-0.50); nữ (0.35-0.47 l/l)", c: formData.check_hct }, v1: formData.hct,
                                l2: { l: "- Đoạn trung tính", c: null, indent: true }, v2: formData.neutrophils
                            },
                            // Row 4
                            { 
                                l1: { l: "MCV", s: "(83-92 fl)", c: formData.check_mcv }, v1: formData.mcv,
                                l2: { l: "- Đoạn ưa a xít", c: null, indent: true }, v2: formData.eosinophils
                            },
                            // Row 5
                            { 
                                l1: { l: "MCH", s: "(27-32 pg)", c: formData.check_mch }, v1: formData.mch,
                                l2: { l: "- Đoạn ưa ba zơ", c: null, indent: true }, v2: formData.basophils
                            },
                            // Row 6
                            { 
                                l1: { l: "MCHC", s: "(320-356 g/l)", c: formData.check_mchc }, v1: formData.mchc,
                                l2: { l: "- Mono", c: null, indent: true }, v2: formData.monocytes
                            },
                            // Row 7
                            { 
                                l1: { l: "Hồng cầu có nhân", s: "(0 x 10^9/l)", c: formData.check_nrbc }, v1: formData.nrbc,
                                l2: { l: "- Lympho", c: null, indent: true }, v2: formData.lymphocytes
                            },
                            // Row 8
                            { 
                                l1: { l: "Hồng cầu lưới", s: "(0.1-0.5 %)", c: formData.check_reticulocytes }, v1: formData.reticulocytes,
                                l2: { l: "- Tế bào bất thường", c: null, indent: true }, v2: formData.abnormalCells
                            },
                            // Row 9
                            { 
                                l1: null, v1: null,
                                l2: { l: "Số lượng tiểu cầu", s: "(150-400 x10^9/l)", c: formData.check_plt }, v2: formData.plt
                            },
                            // Row 10
                            { 
                                l1: null, v1: null,
                                l2: { l: "KSV sốt rét", c: formData.check_malaria }, v2: formData.malaria
                            },
                        ].map((row, idx) => (
                            <tr key={idx}>
                                {/* Left Side */}
                                <td style={{ border: '1px solid black', padding: '4px', verticalAlign: 'middle' }}>
                                    {row.l1 && (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            
                                            <div style={{ display: 'inline-block' }}>
                                                <span style={{ verticalAlign: 'middle' }}>{row.l1.l}</span>
                                                {row.l1.s && <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#444' }}>{row.l1.s}</div>}
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                    {row.v1}
                                </td>

                                {/* Right Side */}
                                <td style={{ border: '1px solid black', padding: '4px', verticalAlign: 'middle' }}>
                                    {row.l2 && (
                                        <>
                                            {row.l2.type === 'header' ? (
                                                <div style={{ fontStyle: 'italic' }}>{row.l2.l}</div>
                                            ) : row.l2.type === 'esr' ? (
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    
                                                    <div style={{ display: 'inline-block' }}>
                                                        <span style={{ verticalAlign: 'middle' }}>{row.l2.l}</span>
                                                        <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>giờ 1 (&lt; 15 mm)</div>
                                                        <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>giờ 2 (&lt; 20 mm)</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: row.l2.indent ? '20px' : '0' }}>
                                                    <span style={{ verticalAlign: 'middle' }}>{row.l2.l}</span>
                                                </div>
                                            )}
                                            {row.l2.s && <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#444', marginLeft: '20px' }}>{row.l2.s}</div>}
                                        </>
                                    )}
                                </td>
                                <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                    {row.l2?.type === 'esr' && typeof row.v2 === 'object' && row.v2 ? (
                                        <>
                                            <div style={{ marginBottom: '5px' }}>{((row as any).v2 as any).v1}</div>
                                            <div>{((row as any).v2 as any).v2}</div>
                                        </>
                                    ) : (
                                        row.v2 as React.ReactNode
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Section 2 & 3 - Side by Side */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '50%', verticalAlign: 'top', border: 'none', paddingRight: '10px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>2. Đông máu:</div>
                                <div style={{ paddingLeft: '5px' }}>
                                    <div style={{ marginBottom: '5px' }}>
                                        
                                        <span style={{ verticalAlign: 'middle' }}>Thời gian máu chảy: ...........{formData.bleedingTime}......... phút </span>
                                    </div>
                                    <div>
                                        
                                        <span style={{ verticalAlign: 'middle' }}>Thời gian máu đông: ...........{formData.clottingTime}......... phút </span>
                                    </div>
                                </div>
                            </td>
                            <td style={{ width: '50%', verticalAlign: 'top', border: 'none', paddingLeft: '10px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>3. Nhóm máu:</div>
                                <div style={{ paddingLeft: '5px' }}>
                                    <div style={{ marginBottom: '5px' }}>
                                        
                                        <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>Hệ ABO: <b>{formData.bloodGroupABO}</b></span>
                                    </div>
                                    <div>
                                        
                                        <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>Hệ Rh: <b>{formData.bloodGroupRh}</b></span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div>Ngày {formData.requestDateDay} tháng {formData.requestDateMonth} năm {formData.requestDateYear}</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>Bác sĩ điều trị</div>
                        <div style={{ height: '25mm' }}></div>
                        <div style={{ fontWeight: 'bold' }}></div>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <div>Ngày {formData.resultDateDay} tháng {formData.resultDateMonth} năm {formData.resultDateYear}</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>Trưởng khoa xét nghiệm</div>
                        <div style={{ height: '25mm' }}></div>
                        <div style={{ fontWeight: 'bold' }}></div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{ marginTop: '20px', fontSize: '9pt', borderTop: '1px solid #000', paddingTop: '5px' }}>
                    <b>Hướng dẫn:</b>
                    <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        <li>Quy ước quốc tế: số lượng hồng cầu, bạch cầu... tính trong đơn vị lít (l).</li>
                        <li>Vì: 1.000.000.000 = 10^9 = G (Giga); 1.000.000.000.000 = 10^12 = T (Tera).</li>
                        <li>Số lượng hồng cầu trước đây tính trong 1ml, ví dụ là 4 triệu; nay quy ra trong 1 lít là 4 triệu triệu/ l hay 4 x 10^12/ l hay 4T/l.</li>
                    </ul>
                </div>
            </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <div className="flex justify-between w-full items-center">
            <div>
              {!readOnly && !initialData && !isImportMode && (
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-vlu-red text-white shadow-sm hover:bg-red-800"
                >
                  <FileUp size={18} />
                  Import PDF
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Đóng</Button>
              {!readOnly && (
                <>
                  {isImportMode ? (
                    <Button disabled={isSubmitting} onClick={() => handleActionClick("SAVE")} className="bg-vlu-red text-white shadow-sm">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Hoàn thành
                    </Button>
                  ) : (
                    <>
                      {formData.status === 0 && (
                        initialData ? (
                          <Button disabled={isSubmitting} onClick={() => handleActionClick("FAST_TRACK")} className="bg-orange-500 text-white shadow-sm">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tiếp nhận                          </Button>
                        ) : (
                          <Button disabled={isSubmitting} onClick={() => handleActionClick("SAVE")} className="bg-vlu-red text-white shadow-sm">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gửi đi                          </Button>
                        )
                      )}
                      {formData.status === 1 && (
                        <Button disabled={isSubmitting} onClick={() => handleActionClick("NEXT")} className="bg-orange-500 text-white shadow-sm">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Bắt Đầu Chạy (Chuyển TT2)
                        </Button>
                      )}
                      {formData.status === 2 && (
                        <Button disabled={isSubmitting} onClick={() => handleActionClick("NEXT")} className="bg-vlu-red text-white shadow-sm">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Gửi kết quả
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Dialog xác nhận đơn vị thực hiện */}
    <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
      <DialogContent className="sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Gửi thông báo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="w-full flex flex-col gap-2">
            <Popover open={openCcCombobox} onOpenChange={setOpenCcCombobox}>
              <PopoverTrigger asChild>
                <Button
                  id="cc-dept"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCcCombobox}
                  className="w-full justify-between font-normal text-left h-auto min-h-10 py-2 px-4 whitespace-normal"
                >
                  <span className="flex-1 break-words">
                    {ccDepartmentInputs.length > 0
                      ? ccDepartmentInputs.join(", ")
                      : "Chọn các khoa nhận thông báo..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Tìm khoa..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy khoa phù hợp.</CommandEmpty>
                    <CommandGroup className="max-h-48 overflow-y-auto">
                      {departmentsList.map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => {
                            setCcDepartmentInputs(prev => 
                              prev.includes(d.name) 
                                ? prev.filter(name => name !== d.name)
                                : [...prev, d.name]
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              ccDepartmentInputs.includes(d.name) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{d.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {ccDepartmentInputs.length > 0 && (
            <div className="w-full mt-4">
              <Label className="mb-2 block text-sm font-medium">Thêm người nhận thông báo (Tuỳ chọn)</Label>
              <MultiSelect
                options={usersList
                  .filter((u: User) => {
                    const userDept = departmentsList.find((d: Department) => 
                      d.users?.some((deptUser: User) => deptUser.id === u.id) || d.headUser?.id === u.id
                    );
                    // Hiển thị user nếu họ thuộc một trong các khoa đang chọn, VÀ họ không phải là trưởng khoa của khoa đó
                    return userDept && ccDepartmentInputs.includes(userDept.name) && userDept.headUser?.id !== u.id;
                  })
                  .map((u: User) => ({ label: `${u.name} (${u.email})`, value: u.id.toString() }))
                }
                selected={formData.additionalUserIds || []}
                onChange={(newSelected: any) => {
                   setFormData(prev => ({ ...prev, additionalUserIds: Array.isArray(newSelected) ? newSelected : newSelected(prev.additionalUserIds || []) }));
                }}
                placeholder="Chọn người dùng..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)} disabled={isSubmitting}>Hủy</Button>
          <Button type="button" onClick={handleConfirmDepartment} className="bg-vlu-red text-white hover:bg-vlu-red/90" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
