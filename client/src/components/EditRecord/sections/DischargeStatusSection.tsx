import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Record } from "@/types";

interface DischargeStatusSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const DischargeStatusSection = ({ formData, setFormData, readOnly = false }: DischargeStatusSectionProps) => {
  const dischargeStatusInfo = formData.dischargeStatusInfo;

  const handleChange = (path: string[], value: string | boolean | "indeterminate") => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      
      const newDischargeStatusInfo = JSON.parse(JSON.stringify(prev.dischargeStatusInfo));

      let current = newDischargeStatusInfo;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return {
        ...prev,
        dischargeStatusInfo: newDischargeStatusInfo,
      };
    });
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>24. Kết quả điều trị</Label>
                <Select 
                  value={dischargeStatusInfo.treatmentResult} 
                  onValueChange={(val) => handleChange(['treatmentResult'], val)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khoi">Khỏi</SelectItem>
                    <SelectItem value="DoGiam">Đỡ, giảm</SelectItem>
                    <SelectItem value="KhongThayDoi">Không thay đổi</SelectItem>
                    <SelectItem value="NangHon">Nặng hơn</SelectItem>
                    <SelectItem value="TuVong">Tử vong</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>25. Giải phẫu bệnh (Khi có sinh thiết)</Label>
                <Select 
                  value={dischargeStatusInfo.pathology} 
                  onValueChange={(val) => handleChange(['pathology'], val)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kết quả GPB" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lành tính">Lành tính</SelectItem>
                    <SelectItem value="Nghi ngờ">Nghi ngờ</SelectItem>
                    <SelectItem value="Ác tính">Ác tính</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
             <Label className="font-semibold text-gray-700 block">26. Tình hình tử vong</Label>
             
             <div className="space-y-4">
                <div className="space-y-3">
                    <Input 
                        value={dischargeStatusInfo.deathStatus.description} 
                        onChange={(e) => handleChange(['deathStatus', 'description'], e.target.value)}
                        disabled={readOnly}
                        className="w-full"
                        placeholder="Nhập thông tin chi tiết..."
                    />
                    
                    <Select 
                      value={dischargeStatusInfo.deathStatus.cause} 
                      onValueChange={(val) => handleChange(['deathStatus', 'cause'], val)}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-full md:w-[400px]">
                        <SelectValue placeholder="Chọn nguyên nhân" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Do bệnh">Do bệnh</SelectItem>
                        <SelectItem value="Do tai biến điều trị">Do tai biến điều trị</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <RadioGroup 
                        value={dischargeStatusInfo.deathStatus.time} 
                        onValueChange={(val) => handleChange(['deathStatus', 'time'], val)}
                        className="flex gap-6"
                        disabled={readOnly}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Trong 24 giờ vào viện" id="t-24h" />
                            <Label htmlFor="t-24h" className="font-normal cursor-pointer">Trong 24 giờ vào viện</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Sau 24 giờ vào viện" id="s-24h" />
                            <Label htmlFor="s-24h" className="font-normal cursor-pointer">Sau 24 giờ vào viện</Label>
                        </div>
                    </RadioGroup>
                </div>
             </div>

             <div className="space-y-2 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">27. Nguyên nhân chính tử vong</Label>
                <div className="grid grid-cols-[1fr_150px] gap-4">
                    <Input 
                        placeholder="Nhập nguyên nhân chính..."
                        value={dischargeStatusInfo.mainCauseOfDeath.name}
                        onChange={(e) => handleChange(['mainCauseOfDeath', 'name'], e.target.value)}
                        disabled={readOnly}
                    />
                    <Input 
                        placeholder="Mã ICD10"
                        className="font-mono text-center"
                        value={dischargeStatusInfo.mainCauseOfDeath.code}
                        onChange={(e) => handleChange(['mainCauseOfDeath', 'code'], e.target.value)}
                        disabled={readOnly}
                    />
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="isAutopsy" className="font-semibold text-gray-700 cursor-pointer">
                        28. Khám nghiệm tử thi:
                    </Label>
                    <Checkbox 
                        id="isAutopsy" 
                        checked={dischargeStatusInfo.isAutopsy}
                        onCheckedChange={(checked) => handleChange(['isAutopsy'], checked)}
                        disabled={readOnly}
                    />
                </div>
             </div>

             <div className="space-y-2 pt-4 border-t border-gray-100">
                <Label className="font-semibold text-gray-700 block">29. Chẩn đoán giải phẫu tử thi</Label>
                <div className="grid grid-cols-[1fr_150px] gap-4">
                    <Input 
                        placeholder="Tên chẩn đoán..."
                        value={dischargeStatusInfo.autopsyDiagnosis.name}
                        onChange={(e) => handleChange(['autopsyDiagnosis', 'name'], e.target.value)}
                        disabled={readOnly}
                    />
                    <Input 
                        placeholder="Mã ICD10"
                        className="font-mono text-center"
                        value={dischargeStatusInfo.autopsyDiagnosis.code}
                        onChange={(e) => handleChange(['autopsyDiagnosis', 'code'], e.target.value)}
                        disabled={readOnly}
                    />
                </div>
             </div>
        </div>
      </CardContent>
    </Card>
  );
};
