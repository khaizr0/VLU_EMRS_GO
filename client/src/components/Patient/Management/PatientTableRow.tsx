import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Patient } from "@/types";
import { formatDate } from "@/lib/utils";
import { CreateRecordTypeDialog } from "./CreateRecordTypeDialog";
import { DeletePatientDialog } from "./DeletePatientDialog";

interface PatientTableRowProps {
  patient: Patient;
  onDelete: () => void;
}

export const PatientTableRow = ({ patient, onDelete }: PatientTableRowProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateRecord = (type: "internal" | "surgery") => {
    setIsDialogOpen(false);
    navigate(`/record/create/${patient.id}?type=${type}`);
  };

  const getGenderText = (gender: number) => {
    switch(gender) {
      case 1: return 'Nam';
      case 2: return 'Nữ';
      case 3: return 'Khác';
      default: return '---';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  return (
    <TableRow className="hover:bg-gray-50 transition group">
      <TableCell className="font-mono text-xs text-gray-600 font-medium">
        {patient.id}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {patient.name.charAt(0)}
          </div>
          <div className="font-medium text-gray-900 group-hover:text-vlu-red transition">
            {patient.name}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{formatDate(patient.dateOfBirth)}</TableCell>
      <TableCell className="text-gray-600">
        {calculateAge(patient.dateOfBirth)} / {getGenderText(patient.gender as number)}
      </TableCell>
      <TableCell className="text-gray-600">{(patient.ethnicity as any)?.name || '---'}</TableCell>
      <TableCell className="text-gray-600 font-mono text-xs">{patient.healthInsuranceNumber}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/patient/edit/${patient.id}`)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 px-2"
          >
            <Edit size={14} className="mr-1" /> Sửa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="text-green-600 hover:text-green-800 hover:bg-green-50 h-8 px-2"
          >
             <FilePlus size={14} className="mr-1" /> Tạo HSBA
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2"
          >
            <Trash2 size={14} className="mr-1" /> Xóa
          </Button>
          
          <CreateRecordTypeDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            onSelect={handleCreateRecord}
          />
          
          <DeletePatientDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            patient={patient}
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
