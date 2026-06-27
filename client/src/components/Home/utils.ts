import { RECORD_TYPES } from "@/constants/recordTypes";
import type { Record } from "@/types";

export const getTypeName = (typeId: string) => {
  const type = RECORD_TYPES.find((t) => t.id === typeId);
  return type ? type.name : typeId;
};

export const getStatusColor = (record: Record) => {
  if (record.dischargeDate) {
    return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
  }
  return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100";
};

export const getStatusLabel = (record: Record) => {
  return record.dischargeDate ? "Đã ra viện" : "Đang điều trị";
};
