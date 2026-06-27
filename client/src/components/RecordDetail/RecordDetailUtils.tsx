import React from "react";

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-base font-bold mb-3 bg-gray-100 p-2 uppercase border-l-4 border-gray-800 text-gray-800 print:bg-gray-100 print:border-gray-800">
    {children}
  </div>
);

export const InfoRow: React.FC<{
  label: string;
  value?: string | number;
  className?: string;
}> = ({ label, value, className = "" }) => (
  <div className={`flex mb-2 text-sm ${className}`}>
    <span className="font-bold w-48 flex-shrink-0 text-gray-800">{label}:</span>
    <span className="flex-1 text-gray-700">{value || "---"}</span>
  </div>
);

export const CHARACTERISTICS_LIST = [
  { key: "allergy", label: "Dị ứng" },
  { key: "drugs", label: "Ma túy" },
  { key: "alcohol", label: "Rượu bia" },
  { key: "tobacco", label: "Thuốc lá" },
  { key: "pipeTobacco", label: "Thuốc lào" },
  { key: "other", label: "Khác" },
];

export const ORGAN_FIELDS = [
  { key: "circulatory", label: "+ Tuần hoàn" },
  { key: "respiratory", label: "+ Hô hấp" },
  { key: "digestive", label: "+ Tiêu hóa" },
  { key: "kidneyUrology", label: "+ Thận - Tiết niệu - Sinh dục" },
  { key: "neurological", label: "+ Thần kinh" },
  { key: "musculoskeletal", label: "+ Cơ - Xương - Khớp" },
  { key: "ent", label: "+ Tai - Mũi - Họng" },
  { key: "maxillofacial", label: "+ Răng - Hàm - Mặt" },
  { key: "eye", label: "+ Mắt" },
  { key: "endocrineAndOthers", label: "+ Nội tiết, dinh dưỡng và các bệnh lý khác" },
];
