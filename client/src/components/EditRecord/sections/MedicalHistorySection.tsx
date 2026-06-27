import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Record, RelatedCharacteristic } from "@/types";

interface MedicalHistorySectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const MedicalHistorySection = ({ formData, setFormData, readOnly = false }: MedicalHistorySectionProps) => {
  const content = formData.medicalRecordContent;

  const handleChange = (field: string, value: string | boolean | "indeterminate" | number | null | undefined) => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        medicalRecordContent: {
          ...prev.medicalRecordContent,
          [field]: value,
        },
      };
    });
  };

  const handleRelatedChange = (key: string, field: 'isChecked' | 'time', value: string | boolean | "indeterminate" | number | null | undefined) => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      const related = { ...prev.medicalRecordContent.relatedCharacteristics };
      related[key] = { ...related[key], [field]: value } as RelatedCharacteristic;
      
      return {
        ...prev,
        medicalRecordContent: {
          ...prev.medicalRecordContent,
          relatedCharacteristics: related,
        },
      };
    });
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        {/* I. Lý do vào viện */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
             <div className="flex-1 space-y-2">
                <Label className="font-bold text-gray-800 uppercase">I. Lý do vào viện:</Label>
                <Textarea 
                    value={content.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    className="min-h-[60px]"
                    disabled={readOnly}
                />
             </div>
             <div className="flex items-center gap-2 whitespace-nowrap mb-2">
                <span className="text-sm">Vào ngày thứ</span>
                <Input 
                    value={content.dayOfIllness}
                    onChange={(e) => handleChange("dayOfIllness", e.target.value)}
                    className="w-16 h-8 text-center"
                    disabled={readOnly}
                />
                <span className="text-sm">của bệnh</span>
             </div>
          </div>
        </div>
        
        {/* II. Hỏi bệnh */}
        <div className="space-y-6">
            <Label className="font-bold text-gray-800 uppercase block">II. Hỏi bệnh:</Label>
            
            {/* 1. Quá trình bệnh lý */}
            <div className="space-y-2 pl-4">
                <Label className="font-semibold">1. Quá trình bệnh lý: <span className="font-normal italic text-gray-600">(khởi phát, diễn biến, chẩn đoán, điều trị của tuyến dưới v.v...)</span></Label>
                <Textarea 
                    value={content.pathologicalProcess}
                    onChange={(e) => handleChange("pathologicalProcess", e.target.value)}
                    className="min-h-[120px]"
                    disabled={readOnly}
                />
            </div>

            {/* 2. Tiền sử bệnh */}
            <div className="space-y-4 pl-4">
                <Label className="font-semibold block">2. Tiền sử bệnh:</Label>
                
                {/* Bản thân */}
                <div className="pl-4 space-y-2">
                    <Label className="font-semibold text-sm">+ Bản thân: <span className="font-normal italic text-gray-600">(phát triển thể lực từ nhỏ đến lớn, những bệnh đã mắc, phương pháp ĐTr, tiêm phòng, ăn uống, sinh hoạt vv...)</span></Label>
                    <Textarea 
                        value={content.personalHistory}
                        onChange={(e) => handleChange("personalHistory", e.target.value)}
                        className="min-h-[100px]"
                        disabled={readOnly}
                    />
                </div>

                {/* Đặc điểm liên quan bệnh */}
                <div className="pl-4 space-y-2">
                    <Label className="font-semibold text-sm block mb-2">Đặc điểm liên quan bệnh:</Label>
                    
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-2 py-2 border-r border-gray-200 w-10 text-center">TT</th>
                                    <th className="px-2 py-2 border-r border-gray-200 text-left">Ký hiệu</th>
                                    <th className="px-2 py-2 border-r border-gray-200 w-32 text-center">Thời gian (tính theo tháng)</th>
                                    <th className="px-2 py-2 border-r border-gray-200 w-10 text-center">TT</th>
                                    <th className="px-2 py-2 border-r border-gray-200 text-left">Ký hiệu</th>
                                    <th className="px-2 py-2 w-32 text-center">Thời gian (tính theo tháng)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">01</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-allergy" 
                                                checked={content.relatedCharacteristics.allergy.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('allergy', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-allergy" className="cursor-pointer">- Dị ứng</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <Input 
                                            className="h-7" 
                                            value={content.relatedCharacteristics.allergy.time}
                                            onChange={(e) => handleRelatedChange('allergy', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">04</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-tobacco"
                                                checked={content.relatedCharacteristics.tobacco.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('tobacco', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-tobacco" className="cursor-pointer">- Thuốc lá</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input 
                                            className="h-7"
                                            value={content.relatedCharacteristics.tobacco.time}
                                            onChange={(e) => handleRelatedChange('tobacco', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">02</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-drugs"
                                                checked={content.relatedCharacteristics.drugs.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('drugs', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-drugs" className="cursor-pointer">- Ma túy</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <Input 
                                            className="h-7"
                                            value={content.relatedCharacteristics.drugs.time}
                                            onChange={(e) => handleRelatedChange('drugs', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">05</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-pipe"
                                                checked={content.relatedCharacteristics.pipeTobacco.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('pipeTobacco', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-pipe" className="cursor-pointer">- Thuốc lào</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input 
                                            className="h-7"
                                            value={content.relatedCharacteristics.pipeTobacco.time}
                                            onChange={(e) => handleRelatedChange('pipeTobacco', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">03</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-alcohol"
                                                checked={content.relatedCharacteristics.alcohol.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('alcohol', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-alcohol" className="cursor-pointer">- Rượu bia</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <Input 
                                            className="h-7"
                                            value={content.relatedCharacteristics.alcohol.time}
                                            onChange={(e) => handleRelatedChange('alcohol', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center border-r border-gray-200">06</td>
                                    <td className="px-2 py-2 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="chk-other"
                                                checked={content.relatedCharacteristics.other.isChecked}
                                                onCheckedChange={(c) => handleRelatedChange('other', 'isChecked', c)}
                                                disabled={readOnly}
                                            />
                                            <label htmlFor="chk-other" className="cursor-pointer">- Khác</label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input 
                                            className="h-7"
                                            value={content.relatedCharacteristics.other.time}
                                            onChange={(e) => handleRelatedChange('other', 'time', e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Gia đình */}
                <div className="pl-4 space-y-2">
                    <Label className="font-semibold text-sm">+ Gia đình: <span className="font-normal italic text-gray-600">(Những người trong gia đình: bệnh đã mắc, đời sống, tinh thần, vật chất v.v...)</span></Label>
                    <Textarea 
                        value={content.familyHistory}
                        onChange={(e) => handleChange("familyHistory", e.target.value)}
                        className="min-h-[100px]"
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
