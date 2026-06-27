import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PatientPageHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bệnh Nhân</h1>
      </div>

      <div className="flex gap-2">
          <Button 
              onClick={() => navigate('/patient/add')}
              className="bg-vlu-red hover:bg-red-700 flex items-center gap-2 h-9"
          >
              <Plus size={16} />
              <span>Thêm Mới</span>
          </Button>
      </div>
    </div>
  );
};
