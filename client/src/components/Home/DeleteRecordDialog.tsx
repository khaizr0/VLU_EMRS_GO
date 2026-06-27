import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Record } from "@/types";

interface DeleteRecordDialogProps {
  record: Record | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteRecordDialog = ({
  record,
  onClose,
  onConfirm,
}: DeleteRecordDialogProps) => {
  return (
    <AlertDialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Bạn có chắc chắn muốn xóa hồ sơ của bệnh nhân{" "}
            <span className="font-bold text-gray-900">
              {record?.patientName}
            </span>{" "}
            (ID: {record?.id})? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center gap-3 sm:justify-center">
          <AlertDialogCancel onClick={onClose}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
