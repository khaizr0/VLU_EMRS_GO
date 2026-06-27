import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import type { Record, Transfer } from "@/types";

interface PatientManagementSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const PatientManagementSection = ({ formData, setFormData, readOnly = false }: PatientManagementSectionProps) => {
  const managementData = formData.managementData;

  const handleChange = <K extends keyof typeof managementData>(field: K, value: (typeof managementData)[K]) => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        managementData: {
          ...prev.managementData,
          [field]: value,
        },
      };
    });
  };

  const handleTransferChange = <K extends keyof Transfer>(index: number, field: K, value: Transfer[K]) => {
    if (readOnly) return;
    const newTransfers = [...managementData.transfers];
    newTransfers[index] = { ...newTransfers[index], [field]: value };
    handleChange("transfers", newTransfers);
  };

  const addTransfer = () => {
    if (readOnly) return;
    // transfers[0] là "Vào khoa" (Admission), transfers[1+] là "Chuyển khoa" (DepartmentTransfer)
    const nextIndex = managementData.transfers.length;
    const newTransfer: Transfer = {
      department: "",
      date: "",
      days: 0,
      time: "",
      transferType: nextIndex === 0 ? 1 : 2,
    };
    handleChange("transfers", [...managementData.transfers, newTransfer]);
  };

  const removeTransfer = (index: number) => {
    if (readOnly) return;
    const newTransfers = managementData.transfers.filter((_, i) => i !== index);
    handleChange("transfers", newTransfers);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const val = e.target.value; // Format: YYYY-MM-DDTHH:MM
    if (val) {
      const [date, time] = val.split('T');
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          admissionDate: date,
          managementData: {
            ...prev.managementData,
            admissionTime: time,
          },
        };
      });
    } else {
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          admissionDate: "",
          managementData: {
            ...prev.managementData,
            admissionTime: "",
          },
        };
      });
    }
  };

  const handleDischargeDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const val = e.target.value;
    if (val) {
      const [date, time] = val.split('T');
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          dischargeDate: date,
          managementData: {
            ...prev.managementData,
            dischargeTime: time,
          },
        };
      });
    } else {
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          dischargeDate: "",
          managementData: {
            ...prev.managementData,
            dischargeTime: "",
          },
        };
      });
    }
  };

  // Combine date and time for input values
  const dateTimeValue = formData.admissionDate && managementData.admissionTime 
    ? `${formData.admissionDate}T${managementData.admissionTime}` 
    : "";

  const dischargeDateTimeValue = formData.dischargeDate && managementData.dischargeTime 
    ? `${formData.dischargeDate}T${managementData.dischargeTime}` 
    : "";

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>12. Vào viện lúc</Label>
            <Input
              type="datetime-local"
              max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              value={dateTimeValue}
              onChange={handleDateTimeChange}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>13. Trực tiếp vào</Label>
            <Select 
              value={managementData.admissionType || ""} 
              onValueChange={(val) => handleChange("admissionType", val)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nơi vào..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cấp cứu">Cấp cứu</SelectItem>
                <SelectItem value="KKB">KKB</SelectItem>
                <SelectItem value="Khoa điều trị">Khoa điều trị</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>14. Nơi giới thiệu</Label>
            <Select 
              value={managementData.referralSource || ""} 
              onValueChange={(val) => handleChange("referralSource", val)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nơi giới thiệu..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cơ quan y tế">Cơ quan y tế</SelectItem>
                <SelectItem value="Tự đến">Tự đến</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>- Vào viện lần thứ</Label>
            <Input
              type="number"
              value={managementData.admissionCount || 1}
              onChange={(e) => handleChange("admissionCount", e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-4">
             <div className="space-y-2">
                <Label className="text-base font-semibold">15. Vào khoa</Label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">Khoa</Label>
                      <Input
                        value={managementData.transfers[0]?.department || ""}
                        onChange={(e) => handleTransferChange(0, "department", e.target.value)}
                        placeholder="Tên khoa"
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                       <Label className="text-xs">Ngày đến</Label>
                       <Input
                        type="date"
                        value={managementData.transfers[0]?.date || ""}
                        onChange={(e) => handleTransferChange(0, "date", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                       <Label className="text-xs">Giờ</Label>
                       <Input
                        type="time"
                        max={managementData.transfers[0]?.date === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                        value={managementData.transfers[0]?.time || ""}
                        onChange={(e) => handleTransferChange(0, "time", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                       <Label className="text-xs">Số ngày</Label>
                       <Input
                        type="number"
                        value={managementData.transfers[0]?.days || 0}
                        onChange={(e) => handleTransferChange(0, "days", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                     <div className="md:col-span-1"></div>
                  </div>
             </div>

          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">16. Chuyển khoa</Label>
            {!readOnly && (
                <Button type="button" variant="outline" size="sm" onClick={addTransfer} className="h-8">
                <Plus size={14} className="mr-1" /> Thêm khoa
                </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {managementData.transfers.slice(1).map((transfer, index) => {
               // Adjust index to match original array (index + 1 because we sliced 0)
               const realIndex = index + 1;
               return (
                  <div key={realIndex} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">Khoa</Label>
                      <Input
                        value={transfer.department}
                        onChange={(e) => handleTransferChange(realIndex, "department", e.target.value)}
                        placeholder="Tên khoa"
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                       <Label className="text-xs">Ngày đến</Label>
                       <Input
                        type="date"
                        max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                        value={transfer.date}
                        onChange={(e) => handleTransferChange(realIndex, "date", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                       <Label className="text-xs">Giờ</Label>
                       <Input
                        type="time"
                        max={transfer.date === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                        value={transfer.time || ""}
                        onChange={(e) => handleTransferChange(realIndex, "time", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                       <Label className="text-xs">Số ngày</Label>
                       <Input
                        type="number"
                        value={transfer.days}
                        onChange={(e) => handleTransferChange(realIndex, "days", e.target.value)}
                        className="h-9 bg-white"
                        disabled={readOnly}
                      />
                    </div>
                     <div className="md:col-span-1 flex justify-center pb-1">
                      {!readOnly && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeTransfer(realIndex)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 size={16} />
                          </Button>
                      )}
                    </div>
                  </div>
               );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
             <div className="space-y-2">
                <Label>17. Chuyển viện</Label>
                <Select
                  value={managementData.hospitalTransfer?.type || ""}
                  onValueChange={(val) => handleChange("hospitalTransfer", { ...managementData.hospitalTransfer, type: val })}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tuyến..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tuyến trên">Tuyến trên</SelectItem>
                    <SelectItem value="Tuyến dưới">Tuyến dưới</SelectItem>
                    <SelectItem value="CK">CK</SelectItem>
                  </SelectContent>
                </Select>
             </div>
              <div className="space-y-2">
                <Label>- Chuyển đến</Label>
                 <Input
                  value={managementData.hospitalTransfer?.destination || ""}
                   onChange={(e) => handleChange("hospitalTransfer", { ...managementData.hospitalTransfer, destination: e.target.value })}
                   disabled={readOnly}
                   placeholder="Tên cơ sở y tế..."
                />
             </div>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-3">
                <Label>18. Ra viện</Label>
                <Input
                  type="datetime-local"
                  max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split(".")[0].slice(0, 16)}
                  value={dischargeDateTimeValue}
                  onChange={handleDischargeDateTimeChange}
                  disabled={readOnly}
                  className="h-9"
                />
                <RadioGroup 
                    value={managementData.dischargeType || ""} 
                    onValueChange={(val) => handleChange("dischargeType", val)}
                    className="flex flex-wrap gap-4 mt-2"
                    disabled={readOnly}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ra viện" id="rv-1" />
                        <Label htmlFor="rv-1" className="font-normal cursor-pointer">Ra viện</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Xin về" id="rv-2" />
                        <Label htmlFor="rv-2" className="font-normal cursor-pointer">Xin về</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Bỏ về" id="rv-3" />
                        <Label htmlFor="rv-3" className="font-normal cursor-pointer">Bỏ về</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Đưa về" id="rv-4" />
                        <Label htmlFor="rv-4" className="font-normal cursor-pointer">Đưa về</Label>
                    </div>
                </RadioGroup>
             </div>
              <div className="space-y-2">
                <Label>19. Tổng số ngày điều trị</Label>
                 <Input
                  type="number"
                  value={managementData.totalDays || 0}
                   onChange={(e) => handleChange("totalDays", e.target.value)}
                   disabled={readOnly}
                />
             </div>
        </div>

      </CardContent>
    </Card>
  );
};
