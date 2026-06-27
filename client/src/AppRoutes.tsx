import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/layout";
import RecordsPage from "./pages/RecordsPage";
import { RecordDetailView } from "./components/RecordDetail/RecordDetailView";
import { EditRecordView } from "./components/EditRecord/EditRecordView";
import { CreateRecordView } from "./components/EditRecord/CreateRecordView";
import { PatientManagementView } from "./components/Patient/Management/PatientManagementView";
import { EditPatientForm } from "./components/Patient/Edit/EditPatientForm";
import { AddPatientForm } from "./components/Patient/Add/AddPatientForm";
import { AccountManagementView } from "./components/Account/AccountManagementView";
import { DepartmentManagementView } from "./components/Department/DepartmentManagementView";
import LoginPage from "./pages/LoginPage";
import { ClinicalRecordPage } from "./pages/ClinicalRecordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";

function AppRoutes() {
  const { isAdmin, isTeacher } = useAuth();

  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute component={Layout} />}>
          <Route path="/" element={isAdmin || isTeacher ? <DashboardPage /> : <Navigate to="/records" replace />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/record/:id" element={<RecordDetailView />} />
          <Route path="/record/edit/:id" element={<EditRecordView />} />
          <Route path="/record/create/:patientId" element={<CreateRecordView />} />
          <Route path="/record/edit/:recordId/xray/:id" element={<ClinicalRecordPage type="xray" />} />
          <Route path="/record/edit/:recordId/hematology/:id" element={<ClinicalRecordPage type="hematology" />} />
          <Route path="/patients" element={<PatientManagementView />} />
          <Route path="/patient/add" element={<AddPatientForm />} />
          <Route path="/patient/edit/:id" element={<EditPatientForm />} />
          <Route path="/account" element={isAdmin ? <AccountManagementView /> : <Navigate to="/" replace />} />
          <Route path="/departments" element={isAdmin || isTeacher ? <DepartmentManagementView /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  );
}

export default AppRoutes;
