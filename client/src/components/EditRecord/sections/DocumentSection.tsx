import { useState, useEffect } from "react";
import { FileText, Upload, Trash2, Eye, Loader2 } from "lucide-react";
import type { Record } from "@/types";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";

interface AttachmentDto {
  id: number;
  name: string;
  path: string;
}

interface DocumentSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const DocumentSection = ({ formData, readOnly = false }: DocumentSectionProps) => {
  const DOCUMENT_TYPES = [
    { label: "Huyết học (17/BV2)", value: "HuyetHoc" },
    { label: "Huyết – Tủy đồ", value: "HuyetTuyDo" },
    { label: "Rối loạn đông cầm máu", value: "RoiLoanDongCamMau" },
    { label: "Hóa sinh máu", value: "HoaSinhMau" },
    { label: "Nước tiểu, phân, dịch chọc dò", value: "NuocTieuPhan" },
    { label: "Dịch não tủy", value: "DichNaoTuy" },
    { label: "Vi sinh", value: "ViSinh" },
    { label: "X-quang (08/BV2)", value: "XQuang" },
    { label: "Siêu âm", value: "SieuAm" },
    { label: "CT-scanner", value: "CTScanner" },
    { label: "MRI", value: "MRI" },
    { label: "Điện tim (ECG)", value: "DienTim" },
    { label: "Điện não", value: "DienNao" },
    { label: "Đo chức năng hô hấp", value: "HoHap" },
    { label: "Dạ dày – đại tràng", value: "DaDayDaiTrang" },
    { label: "Tai mũi họng", value: "TaiMuiHong" },
    { label: "Phế quản", value: "PheQuan" },
    { label: "Giải phẫu bệnh sinh thiết", value: "GiaiPhauBenh" },
  ];

  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>("HuyetHoc");

  const fetchAttachments = async () => {
    if (!formData.numericId) return;
    setLoading(true);
    try {
      const data = await api.medicalAttachments.getAll(formData.numericId);
      setAttachments(data);
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [formData.numericId]);

  const handleView = (attachment: AttachmentDto) => {
    if (attachment.path) {
      window.open(attachment.path, "_blank");
    } else {
      toast.error("Không tìm thấy đường dẫn tài liệu");
    }
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (readOnly || !formData.numericId) return;
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const existingFilesOfType = attachments.filter(doc => doc.name.startsWith(selectedType));
      
      let nextNumber = 1;
      if (existingFilesOfType.length > 0) {
        const numbers = existingFilesOfType.map(doc => {
          // Remove the prefix to isolate the suffix (e.g., "HuyetHocA" -> "A")
          const suffix = doc.name.substring(selectedType.length);
          const letterMatch = suffix.match(/^[a-zA-Z]+$/);
          
          if (letterMatch) {
             const letters = letterMatch[0].toUpperCase();
             let num = 0;
             for (let i = 0; i < letters.length; i++) {
                 num = num * 26 + (letters.charCodeAt(i) - 64);
             }
             return num;
          }
          return 0;
        });
        nextNumber = Math.max(...numbers) + 1;
      }
      
      // We pass the number (e.g. 1, 2) to the API. 
      // The API service will convert it to A, B before sending to the backend to bypass the regex bug.
      const customFileName = `${selectedType}${nextNumber}`;

      await api.medicalAttachments.create(formData.numericId, selectedFile, customFileName);
      toast.success("Tải lên tài liệu thành công");
      setSelectedFile(null);
      fetchAttachments();
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.message || "Tải lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (readOnly || !formData.numericId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    
    try {
      await api.medicalAttachments.delete(formData.numericId, attachmentId);
      toast.success("Đã xóa tài liệu");
      fetchAttachments();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Xóa tài liệu thất bại");
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-end mb-3">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <FileText size={16} className="mr-2 text-vlu-red" />
          Tài liệu đính kèm ({attachments.length})
        </h4>
      </div>

      {/* Upload Form - Hide if readOnly */}
      {!readOnly && (
        <div className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 px-3 py-1 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-vlu-red/50 bg-white min-w-[200px]"
              disabled={uploading}
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <input
                type="file"
                accept=".pdf"
                className="block flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-vlu-red file:text-white hover:file:bg-red-700"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={uploading}
            />
            <Button
                disabled={!selectedFile || uploading}
                type="button"
                onClick={() => handleUpload()}
                className="bg-vlu-red hover:bg-red-700 min-w-[120px]"
            >
                {uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                {uploading ? "Đang tải..." : "Tải lên"}
            </Button>
            </div>
        </div>
      )}

      {/* Document List Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-center">STT</th>
              <th className="px-4 py-3">Tên tài liệu</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        <div className="flex justify-center items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Đang tải danh sách tài liệu...</span>
                        </div>
                    </td>
                </tr>
            ) : attachments.length > 0 ? (
              attachments.map((doc, index) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                  
                  <td className="px-4 py-3 font-medium text-gray-800">
                     <div className="flex items-center gap-2 group">
                         <FileText size={16} className="text-gray-400" />
                         <span title={doc.name} className="truncate max-w-[500px]">{doc.name}</span>
                     </div>
                  </td>

                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button type="button" size="icon-sm" variant="ghost" onClick={() => handleView(doc)} className="text-blue-600 bg-blue-50 hover:bg-blue-100" title="Xem">
                        <Eye size={16} />
                    </Button>
                    {!readOnly && (
                        <Button type="button" size="icon-sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-red-600 bg-red-50 hover:bg-red-100" title="Xóa">
                            <Trash2 size={16} />
                        </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                  Chưa có tài liệu đính kèm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};