import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PatientInfoSection } from "./sections/PatientInfoSection";
import { api } from "@/services/api";
import { toast } from "sonner";

interface PatientFormData {
  name: string;
  dateOfBirth: string;
  age: number;
  gender: number;
  ethnicityId: number;
  healthInsuranceNumber: string;
}

export const EditPatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    dateOfBirth: '',
    age: 0,
    gender: 1,
    ethnicityId: 56,
    healthInsuranceNumber: ''
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      try {
        const patient = await api.patients.getById(parseInt(id));
        setFormData({
          name: patient.name,
          dateOfBirth: patient.dateOfBirth.split('T')[0],
          age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
          gender: patient.gender as number,
          ethnicityId: patient.ethnicityId,
          healthInsuranceNumber: patient.healthInsuranceNumber
        });
      } catch (error) {
        console.error('Failed to fetch patient:', error);
        toast.error('Không thể tải thông tin bệnh nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'dateOfBirth' && typeof value === 'string') {
        const birthYear = new Date(value).getFullYear();
        const currentYear = new Date().getFullYear();
        if (!isNaN(birthYear)) {
           newState.age = currentYear - birthYear;
        }
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Validate date of birth
    if (formData.dateOfBirth) {
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const todayStr = localNow.toISOString().split("T")[0];
        const dobDateOnly = formData.dateOfBirth.split("T")[0];
        if (dobDateOnly > todayStr) {
            toast.error("Ngày sinh không được vượt quá ngày hiện tại.");
            return;
        }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date().toISOString(),
        gender: formData.gender,
        ethnicityId: formData.ethnicityId,
        healthInsuranceNumber: formData.healthInsuranceNumber
      };

      await api.patients.update(parseInt(id), payload);
      toast.success(`Đã cập nhật thông tin bệnh nhân "${formData.name}" thành công!`);
      navigate('/patients');
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật bệnh nhân');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/patients')}
          className="mb-4 hover:bg-gray-50 hover:text-red-700 hover:border-red-700"
          disabled={submitting}
        >
          <ArrowLeft size={18} className="mr-2" /> Hủy bỏ
        </Button>

        <Card>
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Chỉnh Sửa Thông Tin Bệnh Nhân</CardTitle>
            <CardDescription>Mã BN: {id}</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">I. HÀNH CHÍNH</h3>
                <PatientInfoSection formData={formData} handleChange={handleChange} />
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-red-700 hover:bg-red-800 font-bold px-8 py-6 text-base text-white"
                >
                  <Save size={20} className="mr-2" /> 
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};
