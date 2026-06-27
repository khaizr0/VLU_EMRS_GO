import { useState, useEffect, useRef } from "react";
import { Download as DownloadIcon, FileText, User, Activity, LogOut, ClipboardList, Thermometer, Pill, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Record, Patient } from "@/types";
import { api } from "@/services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

import { AdministrativeSection } from "../EditRecord/sections/AdministrativeSection";
import { PatientManagementSection } from "../EditRecord/sections/PatientManagementSection";
import { DiagnosisSection } from "../EditRecord/sections/DiagnosisSection";
import { DischargeStatusSection } from "../EditRecord/sections/DischargeStatusSection";
import { MedicalHistorySection } from "../EditRecord/sections/MedicalHistorySection";
import { ExaminationSection } from "../EditRecord/sections/ExaminationSection";
import { TreatmentSection } from "../EditRecord/sections/TreatmentSection";
import { 
    AttachmentResultView,
    ClinicalResultsList 
} from "./sections/ClinicalResultViews";

import { MedicalRecordPDFTemplate } from "./sections/MedicalRecordPDFTemplate";

interface AttachmentDto {
  id: number;
  name: string;
  path: string;
  fileName?: string;
}

interface ViewRecordFormProps {
  record: Record;
  patient: Patient;
  onCancel: () => void;
}

const prepareRecordData = (record: Record): Record => {
  let transfers = record.managementData?.transfers || [];
  if (transfers.length === 0) {
    transfers = [{ department: record.department || "", date: record.admissionDate || "", time: "", days: 0 }];
  }
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
  { id: "forms", label: "V. Phiếu Cận Lâm Sàng", icon: Activity },
  { id: "documents", label: "VI. Tài Liệu Đính Kèm", icon: FileText },
];

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

export const ViewRecordForm = ({ record, patient, onCancel }: ViewRecordFormProps) => {
  const [formData, setFormData] = useState<Record | null>(() => prepareRecordData(record));
  const [editablePatient, setEditablePatient] = useState<Patient>(patient);
  
  const [activeSection, setActiveSection] = useState("administrative");
  const [isMedicalGroupOpen, setIsMedicalGroupOpen] = useState(true);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!printRef.current) return;
    try {
        setIsGenerating(true);
        toast.info("Đang tạo hồ sơ PDF tổng hợp...");
        
        const pdfContainer = printRef.current.querySelector('.pdf-container');
        const pages = pdfContainer ? Array.from(pdfContainer.children) : [];
        
        if (pages.length === 0) {
            toast.error("Không tìm thấy nội dung để xuất PDF.");
            return;
        }

        const jspdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = jspdf.internal.pageSize.getWidth();
        const pdfHeight = jspdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            const canvas = await html2canvas(page, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 210 * 3.78,
                height: 297 * 3.78
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            if (i > 0) jspdf.addPage();
            jspdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        }

        // --- MERGE WITH ATTACHMENTS USING PDF-LIB ---
        const mainPdfBytes = jspdf.output("arraybuffer");
        const mergedPdf = await PDFDocument.create();
        
        // 1. Add main medical record pages (including images rendered by html2canvas)
        const mainPdfDoc = await PDFDocument.load(mainPdfBytes);
        const mainPages = await mergedPdf.copyPages(mainPdfDoc, mainPdfDoc.getPageIndices());
        mainPages.forEach(p => mergedPdf.addPage(p));

        // 2. Fetch and Merge actual PDF files from MinIO
        const pdfAttachments = attachments.filter(att => {
            const cleanPath = (att.path || "").split('?')[0];
            return cleanPath.toLowerCase().endsWith('.pdf') || 
                   att.fileName?.toLowerCase().endsWith('.pdf');
        });
        
        if (pdfAttachments.length > 0) {
            toast.info(`Đang nạp ${pdfAttachments.length} nội dung file PDF gốc...`);
            for (const att of pdfAttachments) {
                try {
                    // Fetch the original PDF from MinIO
                    const response = await fetch(att.path);
                    if (!response.ok) {
                        console.warn(`Lỗi fetch file: ${att.name}`);
                        continue;
                    }
                    const attPdfBytes = await response.arrayBuffer();
                    const attPdfDoc = await PDFDocument.load(attPdfBytes);
                    const attPages = await mergedPdf.copyPages(attPdfDoc, attPdfDoc.getPageIndices());
                    
                    // Add all pages of this attachment
                    attPages.forEach(p => mergedPdf.addPage(p));
                } catch (err) {
                    console.error(`Lỗi gộp PDF: ${att.name}`, err);
                }
            }
        }

        const finalPdfBytes = await mergedPdf.save();
        const blob = new Blob([finalPdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        window.open(url, "_blank");
        
        toast.success("Hồ sơ bệnh án và tài liệu đã được xuất thành công!");
    } catch (error) {
        console.error("Lỗi khi tạo PDF:", error);
        toast.error("Không thể xuất file PDF tổng hợp. Vui lòng thử lại.");
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!record.numericId) return;
      setLoadingAttachments(true);
      try {
        const data = await api.medicalAttachments.getAll(record.numericId);
        setAttachments(data);
      } catch (error) {
        console.error("Failed to fetch attachments:", error);
      } finally {
        setLoadingAttachments(false);
      }
    };
    fetchAttachments();
  }, [record.numericId]);

  const isScrollingByClick = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingByClick.current) return;
      
      const sections = getFlattenedSections();
      const scrollPosition = window.scrollY + 200;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sections[i].id}`);
        if (el) {
          const { top } = el.getBoundingClientRect();
          const elementOffsetTop = window.scrollY + top;
          
          if (scrollPosition >= elementOffsetTop) {
            if (activeSection !== sections[i].id) {
              setActiveSection(sections[i].id);
              if (["history", "examination", "treatment"].includes(sections[i].id)) {
                setIsMedicalGroupOpen(true);
              }
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    isScrollingByClick.current = true;
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => {
        isScrollingByClick.current = false;
      }, 800);
    }
  };

  if (!formData) return null;

  const typeLabel = formData?.type === "surgery" ? "Ngoại Khoa" : "Nội Khoa";
  const pageTitle = "Chi Tiết Hồ Sơ Bệnh Án";

  return (
    <div className="space-y-6 flex flex-col min-h-screen">
      <div className="flex-none flex items-center justify-between mb-2 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {pageTitle}
            <span className="text-gray-400 font-light">|</span>
            <span className="text-vlu-red">{typeLabel}</span>
          </h1>
          <p className="text-gray-500">
            {`Mã lưu trữ: ${record?.id}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={onCancel}
            className="bg-vlu-red hover:bg-red-800 text-white"
          >
            Quay lại
          </Button>
          <Button 
            type="button" 
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-vlu-red hover:bg-red-800 text-white flex items-center gap-2"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <DownloadIcon size={18} />}
            Xuất PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start mt-2">
        {/* Sidebar TOC */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-1 lg:sticky lg:top-24 pr-2 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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
                          onClick={() => scrollToSection(sub.id)}
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
                onClick={() => scrollToSection(section.id)}
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

        {/* Hidden PDF Template */}
        <div style={{ position: "fixed", left: "-10000px", top: 0 }}>
          <div ref={printRef}>
            <MedicalRecordPDFTemplate record={formData} patient={patient} attachments={attachments} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0 pr-4">
          <div className="space-y-12 pb-24">
            <div id="section-administrative" className="scroll-mt-8">
              <AdministrativeSection 
                patient={editablePatient} 
                setPatient={setEditablePatient} 
                record={formData}
                setRecord={setFormData as any}
                readOnly={true} 
              />
            </div>
            
            <div id="section-management" className="scroll-mt-8">
              <PatientManagementSection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>
            
            <div id="section-diagnosis" className="scroll-mt-8">
              <DiagnosisSection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>
            
            <div id="section-discharge" className="scroll-mt-8">
              <DischargeStatusSection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>
            
            <div id="section-history" className="scroll-mt-8">
              <MedicalHistorySection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>
            
            <div id="section-examination" className="scroll-mt-8">
              <ExaminationSection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>
            
            <div id="section-treatment" className="scroll-mt-8">
              <TreatmentSection formData={formData} setFormData={setFormData} readOnly={true} />
            </div>

            <div id="section-forms" className="scroll-mt-8">
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6 text-xl">V. Phiếu Cận Lâm Sàng</h3>
              <ClinicalResultsList documents={formData.documents || []} record={formData} />
            </div>

            <div id="section-documents" className="scroll-mt-8">
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6 text-xl">VI. Tài Liệu Đính Kèm</h3>
              <div className="space-y-8">
                {loadingAttachments ? (
                    <div className="flex justify-center items-center py-10 gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Đang tải tài liệu đính kèm...</span>
                    </div>
                ) : attachments.length > 0 ? (
                    attachments.map((att) => (
                        <AttachmentResultView key={att.id} path={att.path} name={att.name} />
                    ))
                ) : (
                    <div className="bg-white p-10 text-center rounded-lg border border-dashed border-gray-300 text-gray-400 italic">
                        Chưa có tài liệu đính kèm nào.
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};