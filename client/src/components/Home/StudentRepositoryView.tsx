import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Record } from "@/types";
import { RecordFilter } from "./RecordFilter";
import { RecordTable } from "./RecordTable";
import { DeleteRecordDialog } from "./DeleteRecordDialog";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 20;

export const StudentRepositoryView = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // UI State
  const [inputValue, setInputValue] = useState(searchParams.get("patientId") || "");
  const [filterType, setFilterType] = useState("all");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  
  // Applied State
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: searchParams.get("patientId") || "",
    filterType: "all",
    fromDay: "",
    toDay: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Auto-apply search with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(prev => ({
        ...prev,
        searchTerm: inputValue
      }));
      setCurrentPage(1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleApplyFilter = () => {
    setAppliedFilters(prev => ({
      ...prev,
      filterType,
      fromDay,
      toDay
    }));
    setCurrentPage(1);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = { 
        pageSize: ITEMS_PER_PAGE,
        pageNumber: currentPage
      };
      
      if (appliedFilters.searchTerm.trim()) filters.searchPhrase = appliedFilters.searchTerm.trim();
      
      if (appliedFilters.filterType && appliedFilters.filterType !== "all") {
        if (appliedFilters.filterType === "internal") filters.recordType = 1;
        else if (appliedFilters.filterType === "surgery") filters.recordType = 2;
      }
      
      if (appliedFilters.fromDay) filters.fromDay = appliedFilters.fromDay;
      if (appliedFilters.toDay) filters.toDay = appliedFilters.toDay;

      const data = await api.medicalRecords.getAll(filters);
      
      // Map API DTO to UI Record interface
      const mappedRecords: Record[] = (data.items || []).map((item: any) => {
        const dobDate = item.patient?.dateOfBirth ? new Date(item.patient.dateOfBirth) : null;
        const age = dobDate && !isNaN(dobDate.getTime()) ? new Date().getFullYear() - dobDate.getFullYear() : 0;
        const genderText = item.patient?.gender === 1 ? "Nam" : item.patient?.gender === 2 ? "Nữ" : "Khác";
        const typeText = item.recordType === 1 ? "internal" : "surgery";

        return {
          id: item.storageCode || item.id.toString(),
          numericId: item.id,
          storageCode: item.storageCode,
          patientId: item.patientId?.toString() || "",
          patientName: item.patient?.name || "",
          cccd: "", 
          insuranceNumber: item.patient?.healthInsuranceNumber || "",
          dob: item.patient?.dateOfBirth || "",
          age: age,
          gender: genderText,
          admissionDate: item.admissionTime || "",
          dischargeDate: item.dischargeTime || "", 
          department: typeText === "internal" ? "Nội Khoa" : "Ngoại Khoa",
          type: typeText,

          documents: [],
          managementData: {} as any,
          medicalRecordContent: {} as any,
          diagnosisInfo: {} as any,
          dischargeStatusInfo: {} as any
        };
      });
      
      setRecords(mappedRecords);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.totalItemsCount || 0);
    } catch (error) {
      console.error("Failed to fetch medical records:", error);
      toast.error("Không thể tải danh sách hồ sơ bệnh án");
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedFilters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);

  const handleDeleteRecord = async () => {
    if (recordToDelete && recordToDelete.numericId) {
      try {
        await api.medicalRecords.delete(recordToDelete.numericId);
        toast.success("Đã xóa hồ sơ bệnh án thành công");
        fetchRecords(); // Refresh the list
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi xóa hồ sơ bệnh án");
      } finally {
        setRecordToDelete(null);
      }
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  if (loading && records.length === 0) {
    return (
      <div className="w-full p-4 md:p-6 flex items-center justify-center h-64">
        <div className="text-gray-500 font-medium">Đang tải danh sách hồ sơ...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Bệnh án <span className="text-sm font-normal text-gray-500">({totalRecords} hồ sơ)</span></h1>
      </div>

      <RecordFilter
        inputValue={inputValue}
        setInputValue={setInputValue}
        filterType={filterType}
        setFilterType={setFilterType}
        fromDay={fromDay}
        onFromDayChange={setFromDay}
        toDay={toDay}
        onToDayChange={setToDay}
        onFilter={handleApplyFilter}
      />

      <RecordTable
        records={records}
        startIndex={startIndex}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        user={currentUser}
        onEdit={() => {}} // No-op, navigation handled in Row
        onDelete={setRecordToDelete}
      />

      <DeleteRecordDialog
        record={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDeleteRecord}
      />
    </div>
  );
};