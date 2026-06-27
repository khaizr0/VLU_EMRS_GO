import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Eye, Edit2, Trash2 } from "lucide-react";
import type { Record as MedicalRecord, Document } from "@/types";
import { XRayInputForm } from "./XRayInputForm";
import { HematologyInputForm } from "./HematologyInputForm";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PhieuYSectionProps {
  formData: MedicalRecord;
  setFormData: React.Dispatch<React.SetStateAction<MedicalRecord | null>>;
  readOnly?: boolean;
}

export const PhieuYSection = ({ formData, setFormData, readOnly = false }: PhieuYSectionProps) => {
  const { isAdmin } = useAuth();
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  
  // XRay State
  const [isXRayFormOpen, setIsXRayFormOpen] = useState(false);
  const [editingXRayDoc, setEditingXRayDoc] = useState<Document | null>(null);
  const [viewingXRayDoc, setViewingXRayDoc] = useState<Document | null>(null);

  // Hematology State
  const [isHematologyFormOpen, setIsHematologyFormOpen] = useState(false);
  const [editingHematologyDoc, setEditingHematologyDoc] = useState<Document | null>(null);
  const [viewingHematologyDoc, setViewingHematologyDoc] = useState<Document | null>(null);


  const handleDelete = async (docId: string) => {
    if (readOnly) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu này?")) return;

    if (docId.startsWith("XRAY_") || docId.startsWith("HEMA_")) {
      const isXRay = docId.startsWith("XRAY_");
      const id = parseInt(docId.split("_")[1]);
      const recordId = formData.numericId;

      if (!recordId || isNaN(id)) {
        toast.error("Không thể xác định mã bệnh án hoặc phiếu");
        return;
      }

      try {
        if (isXRay) {
          await api.xRays.delete(recordId, id);
        } else {
          await api.hematologies.delete(recordId, id);
        }
        
        toast.success("Xóa phiếu thành công");
        
        setFormData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            documents: prev.documents.filter((d) => d.id !== docId),
          };
        });
      } catch (error: any) {
        console.error("Lỗi khi xóa phiếu:", error);
        toast.error(error.message || "Lỗi khi xóa phiếu");
      }
      return;
    }

    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        documents: prev.documents.filter((d) => d.id !== docId),
      };
    });
  };

  const handleView = (doc: Document) => {
     if (doc.url) {
        window.open(doc.url, "_blank");
     } else if (doc.data) {
        if (doc.type === "X-Quang") {
            setViewingXRayDoc(doc);
            setIsXRayFormOpen(true);
        } else if (doc.type === "XN-HuyetHoc") {
            setViewingHematologyDoc(doc);
            setIsHematologyFormOpen(true);
        }
     }
  };

  const handleEdit = (doc: Document) => {
    if (readOnly) return;
    if (doc.type === "X-Quang") {
        setEditingXRayDoc(doc);
        setIsXRayFormOpen(true);
    } else if (doc.type === "XN-HuyetHoc") {
        setEditingHematologyDoc(doc);
        setIsHematologyFormOpen(true);
    }
  };

  const phieuYDocuments = (formData.documents || []).filter(doc => doc.type === "X-Quang" || doc.type === "XN-HuyetHoc");

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
      {/* Sidebar for Phiếu cận lâm sàng Types */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-1 h-full overflow-y-auto pr-2 scrollbar-thin">
        <div className="font-bold text-gray-700 px-2 py-2 mb-2 uppercase text-sm">Danh sách phiếu</div>
        <Accordion type="single" collapsible className="w-full border-none">
            <AccordionItem value="xet-nghiem" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-bold hover:no-underline hover:bg-gray-50 rounded-md transition-all">1. Xét nghiệm</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                         setActiveFormType("blood_test");
                         if (!readOnly) {
                             setEditingHematologyDoc(null);
                             setIsHematologyFormOpen(true);
                         }
                      }}
                      className={`w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium transition-all text-[12px] ml-6 ${
                        activeFormType === "blood_test" 
                          ? "bg-vlu-red text-white hover:bg-red-800 shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-2 opacity-50">•</span> Huyết học (17/BV2)
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Huyết – Tủy đồ
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Rối loạn đông cầm máu
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Hóa sinh máu
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Nước tiểu, phân, dịch chọc dò
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Vi sinh
                    </Button>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cdha" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-bold hover:no-underline hover:bg-gray-50 rounded-md transition-all">2. Chẩn đoán hình ảnh</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                         setActiveFormType("xray");
                         if (!readOnly) {
                             setEditingXRayDoc(null);
                             setIsXRayFormOpen(true);
                         }
                      }}
                      className={`w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium transition-all text-[12px] ml-6 ${
                        activeFormType === "xray" 
                          ? "bg-vlu-red text-white hover:bg-red-800 shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-2 opacity-50">•</span> X-quang (08/BV2)
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Siêu âm
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> CT-scanner
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> MRI
                    </Button>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tdcn" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-bold hover:no-underline hover:bg-gray-50 rounded-md transition-all">3. Thăm dò chức năng</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-2">
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Điện tim (ECG)
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Điện não
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Đo chức năng hô hấp
                    </Button>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ns-tdct" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-bold hover:no-underline hover:bg-gray-50 rounded-md transition-all">4. Nội soi - thăm dò can thiệp</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-2">
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Dạ dày – đại tràng
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Tai mũi họng
                    </Button>
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Phế quản
                    </Button>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gpb" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-bold hover:no-underline hover:bg-gray-50 rounded-md transition-all">5. Giải phẫu bệnh - tế bào học</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-2">
                    <Button variant="ghost" disabled className="w-[calc(100%-1.5rem)] justify-start text-left h-auto py-1.5 px-3 rounded-md font-medium text-[12px] ml-6 opacity-40 cursor-not-allowed text-gray-400">
                        <span className="mr-2">•</span> Giải phẫu bệnh sinh thiết
                    </Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <FileText className="mr-2 text-vlu-red" />
                Danh sách các phiếu cận lâm sàng
            </h3>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="px-4 py-3 w-16 text-center">STT</th>
                        <th className="px-4 py-3">Tên phiếu</th>
                        <th className="px-4 py-3">Loại phiếu</th>
                        <th className="px-4 py-3">Ngày tạo</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {phieuYDocuments.length > 0 ? (
                        phieuYDocuments.map((doc, index) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">{doc.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                            {doc.type === "X-Quang" ? "X-Quang" : doc.type === "XN-HuyetHoc" ? "Huyết học" : doc.type}
                                        </span>
                                        {(doc.type === "X-Quang" || doc.type === "XN-HuyetHoc") && doc.data?.status !== undefined && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                doc.data.status === 0 ? "bg-gray-100 text-gray-600" :
                                                doc.data.status === 1 ? "bg-blue-100 text-blue-600" :
                                                doc.data.status === 2 ? "bg-orange-100 text-orange-600" :
                                                "bg-green-100 text-green-600"
                                            }`}>
                                                {doc.data.status === 0 ? "Chưa nhận mẫu" :
                                                 doc.data.status === 1 ? "Đã nhận mẫu" :
                                                 doc.data.status === 2 ? "Đang chạy kết quả" : "Đã có kết quả"}                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {(() => {
                                        if (!doc.date) return "";
                                        const parts = doc.date.split('-');
                                        if (parts.length === 3) {
                                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                        }
                                        return doc.date;
                                    })()}
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <Button type="button" size="icon-sm" variant="ghost" onClick={() => handleView(doc)} className="text-blue-600 bg-blue-50 hover:bg-blue-100">
                                        <Eye size={16} />
                                    </Button>
                                    {!readOnly && (
                                        <>
                                            <Button type="button" size="icon-sm" variant="ghost" onClick={() => handleEdit(doc)} className="text-orange-600 bg-orange-50 hover:bg-orange-100">
                                                <Edit2 size={16} />
                                            </Button>
                                            {isAdmin && (
                                                <Button type="button" size="icon-sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-red-600 bg-red-50 hover:bg-red-100">
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                                Chưa có phiếu nào được tạo. Vui lòng chọn loại phiếu từ danh sách bên trái để bắt đầu.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <XRayInputForm 
        key={isXRayFormOpen ? (editingXRayDoc?.id || viewingXRayDoc?.id || 'new_xray') : 'closed_xray'}
        isOpen={isXRayFormOpen}
        onClose={() => {
            setIsXRayFormOpen(false);
            setEditingXRayDoc(null);
            setViewingXRayDoc(null);
        }}
        defaultPatientName={formData.patientName}
        defaultAge={formData.age}
        defaultDob={formData.dob}
        defaultGender={formData.gender}
        defaultAddress={formData.address}
        defaultDepartment={formData.department}
        defaultDiagnosis={formData.medicalRecordContent?.admissionDiagnosis?.mainDisease || formData.diagnosisInfo?.deptDiagnosis?.name || formData.diagnosisInfo?.kkbDiagnosis?.name || ""}
        defaultBedCode={formData.bedCode || ""}
        initialData={editingXRayDoc?.data || viewingXRayDoc?.data}
        onSaved={(updatedData) => {
            setFormData(prev => {
                if (!prev) return prev;
                const newDocs = [...prev.documents];
                const docIndex = newDocs.findIndex(d => d.id === `XRAY_${updatedData.id}`);
                if (docIndex >= 0) {
                    newDocs[docIndex] = { ...newDocs[docIndex], data: updatedData };
                } else {
                    newDocs.unshift({
                        id: `XRAY_${updatedData.id}`,
                        name: "Phiếu X-Quang",
                        type: "X-Quang",
                        fileName: "X-Quang.pdf",
                        date: new Date().toISOString().split('T')[0],
                        data: updatedData
                    });
                }
                return { ...prev, documents: newDocs };
            });
        }}
        readOnly={!!viewingXRayDoc || readOnly} 
        recordId={formData.numericId}
        existingDocs={formData.documents}
      />

       <HematologyInputForm 
        key={isHematologyFormOpen ? (editingHematologyDoc?.id || viewingHematologyDoc?.id || 'new_hema') : 'closed_hema'}
        isOpen={isHematologyFormOpen}
        onClose={() => {
            setIsHematologyFormOpen(false);
            setEditingHematologyDoc(null);
            setViewingHematologyDoc(null);
        }}
        defaultPatientName={formData.patientName}
        defaultAge={formData.age}
        defaultDob={formData.dob}
        defaultGender={formData.gender}
        defaultAddress={formData.address}
        defaultDepartment={formData.department}
        defaultDiagnosis={formData.medicalRecordContent?.admissionDiagnosis?.mainDisease || formData.diagnosisInfo?.deptDiagnosis?.name || formData.diagnosisInfo?.kkbDiagnosis?.name || ""}
        defaultInsuranceNumber={formData.insuranceNumber}
        defaultBedCode={formData.bedCode || ""}
        initialData={editingHematologyDoc?.data || viewingHematologyDoc?.data}
        onSaved={(updatedData) => {
            setFormData(prev => {
                if (!prev) return prev;
                const newDocs = [...prev.documents];
                const docIndex = newDocs.findIndex(d => d.id === `HEMA_${updatedData.id}`);
                if (docIndex >= 0) {
                    newDocs[docIndex] = { ...newDocs[docIndex], data: updatedData };
                } else {
                    newDocs.unshift({
                        id: `HEMA_${updatedData.id}`,
                        name: "Phiếu Huyết học",
                        type: "XN-HuyetHoc",
                        fileName: "HuyetHoc.pdf",
                        date: new Date().toISOString().split('T')[0],
                        data: updatedData
                    });
                }
                return { ...prev, documents: newDocs };
            });
        }}
        readOnly={!!viewingHematologyDoc || readOnly} 
        recordId={formData.numericId}
        existingDocs={formData.documents}
      />
    </div>
  );
};
