import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Record } from "@/types";

interface ExaminationSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const ExaminationSection = ({ formData, setFormData, readOnly = false }: ExaminationSectionProps) => {
  const content = formData.medicalRecordContent;

  const handleChange = <K extends keyof typeof content>(field: K, value: (typeof content)[K]) => {
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

  const handleNestedChange = <P extends 'vitalSigns' | 'organs', K extends keyof (typeof content)[P]>(
    parent: P, 
    field: K, 
    value: string
  ) => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      const parentObj = prev.medicalRecordContent[parent];
      
      return {
        ...prev,
        medicalRecordContent: {
          ...prev.medicalRecordContent,
          [parent]: {
              ...parentObj,
              [field]: value
          }
        },
      };
    });
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
            <Label>Toàn thân: <span className="font-normal italic">(ý thức, da niêm mạc, hệ thống hạch, tuyến giáp, vị trí, kích thước, số lượng, di động v.v...)</span></Label>
            <Textarea 
              value={content.overallExamination}
              onChange={(e) => handleChange("overallExamination", e.target.value)}
              className="min-h-[80px]"
              disabled={readOnly}
            />
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-md">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium text-gray-700">Mạch (lần/phút)</th>
                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium text-gray-700">Nhiệt độ (độ C)</th>
                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium text-gray-700">Huyết áp (mmHg)</th>
                        <th className="px-3 py-2 text-center border-r border-gray-200 font-medium text-gray-700">Nhịp thở (lần/phút)</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">Cân nặng (kg)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td className="p-2 border-r border-gray-200">
                            <Input 
                                className="border-gray-200 text-center"
                                value={content.vitalSigns?.pulse || ""}
                                onChange={(e) => handleNestedChange("vitalSigns", "pulse", e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                        <td className="p-2 border-r border-gray-200">
                            <Input 
                                className="border-gray-200 text-center"
                                value={content.vitalSigns?.temperature || ""}
                                onChange={(e) => handleNestedChange("vitalSigns", "temperature", e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                        <td className="p-2 border-r border-gray-200">
                            <Input 
                                className="border-gray-200 text-center"
                                value={content.vitalSigns?.bloodPressure || ""}
                                onChange={(e) => handleNestedChange("vitalSigns", "bloodPressure", e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                        <td className="p-2 border-r border-gray-200">
                            <Input 
                                className="border-gray-200 text-center"
                                value={content.vitalSigns?.respiratoryRate || ""}
                                onChange={(e) => handleNestedChange("vitalSigns", "respiratoryRate", e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                        <td className="p-2">
                            <Input 
                                className="border-gray-200 text-center"
                                value={content.vitalSigns?.weight || ""}
                                onChange={(e) => handleNestedChange("vitalSigns", "weight", e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div className="space-y-4">
            <Label>Các cơ quan</Label>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Tuần hoàn:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.circulatory || ""}
                        onChange={(e) => handleNestedChange("organs", "circulatory", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Hô hấp:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.respiratory || ""}
                        onChange={(e) => handleNestedChange("organs", "respiratory", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Tiêu hoá:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.digestive || ""}
                        onChange={(e) => handleNestedChange("organs", "digestive", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Thận - Tiết niệu - Sinh dục:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.kidneyUrology || ""}
                        onChange={(e) => handleNestedChange("organs", "kidneyUrology", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Thần Kinh:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.neurological || ""}
                        onChange={(e) => handleNestedChange("organs", "neurological", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Cơ - Xương - Khớp:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.musculoskeletal || ""}
                        onChange={(e) => handleNestedChange("organs", "musculoskeletal", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Tai - Mũi - Họng:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.ent || ""}
                        onChange={(e) => handleNestedChange("organs", "ent", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Răng - Hàm - Mặt:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.maxillofacial || ""}
                        onChange={(e) => handleNestedChange("organs", "maxillofacial", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Mắt:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.eye || ""}
                        onChange={(e) => handleNestedChange("organs", "eye", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">+ Nội tiết, dinh dưỡng và các bệnh lý khác:</Label>
                      <Textarea 
                        className="min-h-[80px]"
                        value={content.organs?.endocrineAndOthers || ""}
                        onChange={(e) => handleNestedChange("organs", "endocrineAndOthers", e.target.value)}
                        disabled={readOnly}
                      />
                </div>
            </div>
        </div>
        
          <div className="space-y-2">
            <Label>3. Các xét nghiệm cận lâm sàng đã làm</Label>
            <Textarea 
              value={content.clinicalTests}
              onChange={(e) => handleChange("clinicalTests", e.target.value)}
              className="min-h-[80px]"
              disabled={readOnly}
            />
        </div>
          <div className="space-y-2">
            <Label>4. Tóm tắt bệnh án</Label>
            <Textarea 
              value={content.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className="min-h-[100px]"
              disabled={readOnly}
            />
        </div>
      </CardContent>
    </Card>
  );
};
