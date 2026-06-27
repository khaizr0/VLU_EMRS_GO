import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Record } from "@/types";

interface TreatmentSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const TreatmentSection = ({ formData, setFormData, readOnly = false }: TreatmentSectionProps) => {
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

  const handleNestedChange = (parent: string, field: string, value: string | boolean | "indeterminate" | number | null | undefined) => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      const parentObj = prev.medicalRecordContent[parent as keyof typeof prev.medicalRecordContent] || {};
      
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
      <CardContent className="p-6 space-y-8">
        {/* IV. Chẩn đoán khi vào khoa điều trị */}
        <div className="space-y-4">
            <Label className="font-bold text-gray-800 uppercase">IV. Chẩn đoán khi vào khoa điều trị:</Label>
            
            <div className="pl-4 space-y-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-sm">+ Bệnh chính:</Label>
                    <Textarea 
                        value={content.admissionDiagnosis?.mainDisease || ""}
                        onChange={(e) => handleNestedChange("admissionDiagnosis", "mainDisease", e.target.value)}
                        className="min-h-[60px]"
                        disabled={readOnly}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-sm">+ Bệnh kèm theo (nếu có):</Label>
                    <Textarea 
                        value={content.admissionDiagnosis?.comorbidities || ""}
                        onChange={(e) => handleNestedChange("admissionDiagnosis", "comorbidities", e.target.value)}
                        className="min-h-[60px]"
                        disabled={readOnly}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-sm">+ Phân biệt:</Label>
                    <Textarea 
                        value={content.admissionDiagnosis?.differential || ""}
                        onChange={(e) => handleNestedChange("admissionDiagnosis", "differential", e.target.value)}
                        className="min-h-[60px]"
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>

        {/* V. Tiên lượng */}
        <div className="space-y-2 border-t border-gray-100 pt-6">
            <Label className="font-bold text-gray-800 uppercase">V. Tiên lượng:</Label>
            <Textarea 
              value={content.prognosis}
              onChange={(e) => handleChange("prognosis", e.target.value)}
              className="min-h-[80px]"
              disabled={readOnly}
            />
        </div>

        {/* VI. Hướng điều trị */}
        <div className="space-y-2 border-t border-gray-100 pt-6">
            <Label className="font-bold text-gray-800 uppercase">VI. Hướng điều trị:</Label>
            <Textarea 
              value={content.treatmentPlan}
              onChange={(e) => handleChange("treatmentPlan", e.target.value)}
              className="min-h-[100px]"
              disabled={readOnly}
            />
        </div>
      </CardContent>
    </Card>
  );
};
