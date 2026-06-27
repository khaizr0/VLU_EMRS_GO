import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordHeaderProps {
  patientName: string;
  recordId: string;
  onDownload: () => void;
  isDownloading: boolean;
}

export const RecordHeader = ({
  patientName,
  recordId,
  onDownload,
  isDownloading,
}: RecordHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 mb-6 px-6 py-3 shadow-sm">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {patientName}
            </h1>
            <p className="text-xs text-gray-500 font-mono">ID: {recordId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">In hồ sơ</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-vlu-red hover:bg-red-700 text-white"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">
              {isDownloading ? "Đang tạo PDF..." : "Tải PDF"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
