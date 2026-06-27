import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoRow } from "./InfoRow";
import { formatDate } from "@/lib/utils";
import type { Patient, Record as MedicalRecord } from "@/types";

interface AdministrativeSectionProps {
  patient: Patient;
  setPatient: (patient: Patient) => void;
  record: MedicalRecord;
  setRecord: React.Dispatch<React.SetStateAction<MedicalRecord | null>>;
  readOnly?: boolean;
}

export const AdministrativeSection = ({ patient, setPatient, record, setRecord, readOnly = false }: AdministrativeSectionProps) => {
  
  const handleChange = <K extends keyof Patient>(field: K, value: Patient[K]) => {
    if (readOnly) return;
    const updatedPatient = { ...patient, [field]: value };
    
    // Auto-build full address if any part changes
    if (["houseNumber", "village", "wardName", "districtName", "provinceName"].includes(field)) {
        updatedPatient.address = buildFullAddress(updatedPatient);
    }
    
    setPatient(updatedPatient);
  };

  const handleRecordChange = (field: keyof MedicalRecord, value: any) => {
    if (readOnly) return;
    setRecord(prev => prev ? { ...prev, [field]: value } : prev);
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

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-2">
        {/* 0. Giường */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
          <Label className="text-sm text-gray-700 font-medium">Giường</Label>
          <Input 
            className="h-8 text-sm w-full md:w-64"
            placeholder="Nhập mã giường..."
            value={record.bedCode || ""}
            onChange={(e) => handleRecordChange("bedCode", e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* 1. Họ và tên */}
        <InfoRow
          label="1. Họ và tên"
          value={<span className="font-bold uppercase">{patient.fullName || patient.name}</span>}
        />

        {/* 2. Sinh ngày & Tuổi */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
             <label className="text-sm text-gray-700 font-medium">2. Sinh ngày</label>
             <div className="flex items-center gap-4">
                 <span>{formatDate(patient.dob || patient.dateOfBirth || "")}</span>
                 <span className="text-gray-400">|</span>
                 <span className="text-gray-700">Tuổi: {patient.age}</span>
             </div>
        </div>

        {/* 3. Giới tính */}
        <InfoRow label="3. Giới tính" value={String(patient.gender)} />

        {/* 4. Nghề nghiệp & Mã nghề */}
         <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">4. Nghề nghiệp</label>
            <div className="flex items-center gap-2">
                <Input
                    value={patient.job || ""}
                    onChange={(e) => handleChange("job", e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="Nhập nghề nghiệp..."
                    disabled={readOnly}
                />
                <Input 
                    value={patient.jobCode || ""} 
                    onChange={(e) => handleChange("jobCode", e.target.value)}
                    className="h-8 text-sm w-24"
                    placeholder="Mã"
                    disabled={readOnly}
                />
            </div>
        </div>

        {/* 5. Dân tộc */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">5. Dân tộc</label>
            <Input
                value={typeof patient.ethnicity === 'string' ? patient.ethnicity : patient.ethnicity?.name || ""} 
                readOnly
                className="h-8 text-sm w-full md:w-64 bg-gray-50 text-gray-900 pointer-events-none"
            />
        </div>

        {/* 6. Địa chỉ */}
        <div className="py-2 border-b border-gray-100 last:border-0">
          <label className="text-sm text-gray-700 font-medium">6. Địa chỉ</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 font-medium">Số nhà</Label>
              <Input
                value={patient.houseNumber || ""}
                onChange={(e) => handleChange("houseNumber", e.target.value)}
                className="h-8 text-sm"
                placeholder="Ví dụ: 123/45"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 font-medium">Thôn, phố</Label>
              <Input
                value={patient.village || ""}
                onChange={(e) => handleChange("village", e.target.value)}
                className="h-8 text-sm"
                placeholder="Ví dụ: Đường Lê Lợi"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 font-medium">Xã, phường</Label>
              <Input
                value={patient.wardName || ""}
                onChange={(e) => handleChange("wardName", e.target.value)}
                className="h-8 text-sm"
                placeholder="Ví dụ: Phường Bến Nghé"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700 font-medium">Huyện, quận</Label>
              <Input
                value={patient.districtName || ""}
                onChange={(e) => handleChange("districtName", e.target.value)}
                className="h-8 text-sm"
                placeholder="Ví dụ: Quận 1"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs text-gray-700 font-medium">Tỉnh, thành phố</Label>
              <Input
                value={patient.provinceName || ""}
                onChange={(e) => handleChange("provinceName", e.target.value)}
                className="h-8 text-sm"
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                disabled={readOnly}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50/50 rounded-md border border-blue-100">
             <Label className="text-[10px] uppercase text-blue-600 font-bold mb-1 block">Địa chỉ đầy đủ</Label>
             <p className="text-sm font-medium text-blue-900 italic">
                {patient.address || "Chưa nhập địa chỉ"}
             </p>
          </div>
        </div>

        {/* 7. Nơi làm việc */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">7. Nơi làm việc</label>
            <Input
                value={patient.workplace || ""}
                onChange={(e) => handleChange("workplace", e.target.value)}
                className="h-8 text-sm"
                placeholder="Nhập nơi làm việc..."
                disabled={readOnly}
            />
        </div>

        {/* 8. Đối tượng */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">8. Đối tượng</label>
            <Select 
                value={patient.subjectType || ""} 
                onValueChange={(val) => handleChange("subjectType", val)}
                disabled={readOnly}
            >
                <SelectTrigger className="h-8 text-sm w-full md:w-64">
                    <SelectValue placeholder="Chọn đối tượng..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="BHYT">1. BHYT</SelectItem>
                    <SelectItem value="Thu phí">2. Thu phí</SelectItem>
                    <SelectItem value="Miễn">3. Miễn</SelectItem>
                    <SelectItem value="Khác">4. Khác</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* 9. BHYT giá trị đến ngày */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">9. BHYT giá trị đến ngày</label>
            <Input
                type="date"
                max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                value={patient.insuranceExpiry || ""}
                onChange={(e) => handleChange("insuranceExpiry", e.target.value)}
                className="h-8 text-sm w-full md:w-64"
                disabled={readOnly}
            />
        </div>

        {/* 10. Họ tên, địa chỉ người nhà */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 items-center">
            <label className="text-sm text-gray-700 font-medium">10. Người nhà</label>
            <div className="space-y-3">
                <Textarea
                    value={patient.relativeInfo || ""}
                    onChange={(e) => handleChange("relativeInfo", e.target.value)}
                    placeholder="Họ tên, địa chỉ người nhà khi cần báo tin..."
                    className="text-sm min-h-[80px]"
                    disabled={readOnly}
                />
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500 shrink-0">Điện thoại:</Label>
                    <Input
                        value={patient.relativePhone || ""}
                        onChange={(e) => handleChange("relativePhone", e.target.value)}
                        className="h-8 text-sm w-full md:w-64"
                        placeholder="Số điện thoại liên hệ..."
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
