import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { PatientTable } from "./PatientTable";
import { PatientPageHeader } from "./PatientPageHeader";
import { PatientFilter } from "./PatientFilter";
import type { Patient } from "@/types";

const ITEMS_PER_PAGE = 10;

export const PatientManagementView = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [inputValue, setInputValue] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");

  // Applied State
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    fromDay: "",
    toDay: ""
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {
        pageSize: ITEMS_PER_PAGE,
        pageNumber: currentPage
      };
      
      if (appliedFilters.searchTerm.trim()) filters.searchPhrase = appliedFilters.searchTerm.trim();
      if (appliedFilters.fromDay) filters.fromDay = appliedFilters.fromDay;
      if (appliedFilters.toDay) filters.toDay = appliedFilters.toDay;

      const [patientsData, ethnicitiesData] = await Promise.all([
        api.patients.getAll(filters),
        api.ethnicities.getAll()
      ]);

      // Map ethnicityId to ethnicity object
      const patientsWithEthnicity = (patientsData.items || []).map(patient => ({
        ...patient,
        ethnicity: ethnicitiesData.find((e: any) => e.id === patient.ethnicityId)
      }));

      setPatients(patientsWithEthnicity);
      setTotalPages(patientsData.totalPages || 1);
      setTotalCount(patientsData.totalItemsCount || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilter = () => {
    setAppliedFilters(prev => ({
      ...prev,
      fromDay,
      toDay
    }));
    setCurrentPage(1);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <PatientPageHeader />
      
      <PatientFilter
        inputValue={inputValue}
        setInputValue={setInputValue}
        fromDay={fromDay}
        onFromDayChange={setFromDay}
        toDay={toDay}
        onToDayChange={setToDay}
        onFilter={handleApplyFilter}
      />

      <PatientTable 
        patients={patients} 
        onPatientDeleted={fetchData} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
};