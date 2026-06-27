import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Record } from "@/types";

interface DiagnosisSectionProps {
  formData: Record;
  setFormData: React.Dispatch<React.SetStateAction<Record | null>>;
  readOnly?: boolean;
}

export const DiagnosisSection = ({ formData, setFormData, readOnly = false }: DiagnosisSectionProps) => {
  const diagnosisInfo = formData.diagnosisInfo;

  const handleChange = (path: string[], value: string | boolean | "indeterminate") => {
    if (readOnly) return;
    setFormData((prev) => {
      if (!prev) return null;
      
      // Deep clone to avoid mutation
      const newDiagnosisInfo = JSON.parse(JSON.stringify(prev.diagnosisInfo));
      
      let current = newDiagnosisInfo;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;

      return {
        ...prev,
        diagnosisInfo: newDiagnosisInfo,
      };
    });
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        {/* 20. Nơi chuyển đến */}
        <div className="space-y-2">
          <Label className="font-semibold text-gray-700">20. Nơi chuyển đến</Label>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
             <Input 
                placeholder="Tên chẩn đoán"
                value={diagnosisInfo.transferDiagnosis.name}
                onChange={(e) => handleChange(['transferDiagnosis', 'name'], e.target.value)}
                disabled={readOnly}
             />
             <Input 
                placeholder="Mã ICD10"
                className="font-mono text-center"
                value={diagnosisInfo.transferDiagnosis.code}
                onChange={(e) => handleChange(['transferDiagnosis', 'code'], e.target.value)}
                disabled={readOnly}
             />
          </div>
        </div>

        {/* 21. KKB, Cấp cứu */}
        <div className="space-y-2">
          <Label className="font-semibold text-gray-700">21. KKB, Cấp cứu</Label>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
             <Input 
                placeholder="Tên chẩn đoán"
                value={diagnosisInfo.kkbDiagnosis.name}
                onChange={(e) => handleChange(['kkbDiagnosis', 'name'], e.target.value)}
                disabled={readOnly}
             />
             <Input 
                placeholder="Mã ICD10"
                className="font-mono text-center"
                value={diagnosisInfo.kkbDiagnosis.code}
                onChange={(e) => handleChange(['kkbDiagnosis', 'code'], e.target.value)}
                disabled={readOnly}
             />
          </div>
        </div>

        {/* 22. Khi vào khoa điều trị */}
        <div className="space-y-2">
          <Label className="font-semibold text-gray-700">22. Khi vào khoa điều trị</Label>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
             <Input 
                placeholder="Tên chẩn đoán"
                value={diagnosisInfo.deptDiagnosis.name}
                onChange={(e) => handleChange(['deptDiagnosis', 'name'], e.target.value)}
                disabled={readOnly}
             />
             <Input 
                placeholder="Mã ICD10"
                className="font-mono text-center"
                value={diagnosisInfo.deptDiagnosis.code}
                onChange={(e) => handleChange(['deptDiagnosis', 'code'], e.target.value)}
                disabled={readOnly}
             />
          </div>
          <div className="flex gap-6 mt-2">
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isProcedure" 
                  checked={diagnosisInfo.deptDiagnosis.isProcedure}
                  onCheckedChange={(checked) => handleChange(['deptDiagnosis', 'isProcedure'], checked)}
                  disabled={readOnly}
                />
                <label htmlFor="isProcedure" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Thủ thuật
                </label>
             </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isSurgery" 
                  checked={diagnosisInfo.deptDiagnosis.isSurgery}
                  onCheckedChange={(checked) => handleChange(['deptDiagnosis', 'isSurgery'], checked)}
                  disabled={readOnly}
                />
                <label htmlFor="isSurgery" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Phẫu thuật
                </label>
             </div>
          </div>
        </div>

        {/* 23. Ra viện */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
           <Label className="font-semibold text-gray-700">23. Ra viện</Label>
           
           <div className="pl-4 space-y-4 border-l-2 border-gray-100">
              {/* Bệnh chính */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">a. Bệnh chính</Label>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
                   <Input 
                      value={diagnosisInfo.dischargeDiagnosis.mainDisease.name}
                      onChange={(e) => handleChange(['dischargeDiagnosis', 'mainDisease', 'name'], e.target.value)}
                      disabled={readOnly}
                   />
                   <Input 
                      className="font-mono text-center"
                      value={diagnosisInfo.dischargeDiagnosis.mainDisease.code}
                      onChange={(e) => handleChange(['dischargeDiagnosis', 'mainDisease', 'code'], e.target.value)}
                      disabled={readOnly}
                   />
                </div>
              </div>

              {/* Bệnh kèm theo */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">b. Bệnh kèm theo</Label>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
                   <Input 
                      value={diagnosisInfo.dischargeDiagnosis.comorbidities.name}
                      onChange={(e) => handleChange(['dischargeDiagnosis', 'comorbidities', 'name'], e.target.value)}
                      disabled={readOnly}
                   />
                   <Input 
                      className="font-mono text-center"
                      value={diagnosisInfo.dischargeDiagnosis.comorbidities.code}
                      onChange={(e) => handleChange(['dischargeDiagnosis', 'comorbidities', 'code'], e.target.value)}
                      disabled={readOnly}
                   />
                </div>
              </div>
              
              <div className="flex gap-6 mt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isAccident" 
                      checked={diagnosisInfo.dischargeDiagnosis.isAccident}
                      onCheckedChange={(checked) => handleChange(['dischargeDiagnosis', 'isAccident'], checked)}
                      disabled={readOnly}
                    />
                    <label htmlFor="isAccident" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tai biến
                    </label>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isComplication" 
                      checked={diagnosisInfo.dischargeDiagnosis.isComplication}
                      onCheckedChange={(checked) => handleChange(['dischargeDiagnosis', 'isComplication'], checked)}
                      disabled={readOnly}
                    />
                    <label htmlFor="isComplication" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Biến chứng
                    </label>
                 </div>
              </div>
           </div>
        </div>

      </CardContent>
    </Card>
  );
};
