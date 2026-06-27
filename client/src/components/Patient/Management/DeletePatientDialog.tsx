import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";
import type { Patient } from "@/types";

interface DeletePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onConfirm: () => void;
}

export const DeletePatientDialog = ({
  open,
  onOpenChange,
  patient,
  onConfirm,
}: DeletePatientDialogProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.patients.delete(patient.id);
      toast.success(`Đã xóa bệnh nhân "${patient.name}" thành công!`);
      onOpenChange(false);
      onConfirm();
    } catch (error: any) {
      console.error("Failed to delete patient:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa bệnh nhân");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Xác nhận xóa bệnh nhân</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-4 text-base">
            Bạn có chắc chắn muốn xóa bệnh nhân{" "}
            <span className="font-semibold text-gray-900">"{patient.name}"</span> (Mã BN: {patient.id})?
            <br />
            <br />
            <span className="text-red-600 font-medium">
              Hành động này không thể hoàn tác!
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? "Đang xóa..." : "Xóa bệnh nhân"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
