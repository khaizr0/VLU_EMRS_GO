import { Label } from "@/components/ui/label";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const InfoRow = ({ label, value, className = "" }: InfoRowProps) => (
  <div className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-4 py-2 border-b border-gray-100 last:border-0 ${className}`}>
    <Label className="text-gray-700 font-medium self-center">{label}</Label>
    <div className="font-medium text-gray-900 break-words">{value || "---"}</div>
  </div>
);
