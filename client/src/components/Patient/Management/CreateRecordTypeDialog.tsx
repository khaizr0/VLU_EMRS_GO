import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, Activity } from "lucide-react";

interface CreateRecordTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: "internal" | "surgery") => void;
}

export const CreateRecordTypeDialog = ({
  open,
  onOpenChange,
  onSelect,
}: CreateRecordTypeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn Loại Hồ Sơ Bệnh Án</DialogTitle>
          <DialogDescription>
            Vui lòng chọn loại hồ sơ bệnh án muốn tạo mới cho bệnh nhân này.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all"
            onClick={() => onSelect("internal")}
          >
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Stethoscope size={32} />
            </div>
            <span className="font-semibold text-lg">Hồ sơ Nội Khoa</span>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-4 hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
            onClick={() => onSelect("surgery")}
          >
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <Activity size={32} />
            </div>
            <span className="font-semibold text-lg">Hồ sơ Ngoại Khoa</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
