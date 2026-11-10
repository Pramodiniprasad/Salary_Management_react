import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { EmployeeListPage } from './pages/organization/EmployeeListPage.jsx';
import { EmployeeFormPage } from './pages/organization/EmployeeFormPage.jsx';
import { HrManagementPage } from './pages/organization/HrManagementPage.jsx';
import { HrFormPage } from './pages/organization/HrFormPage.jsx';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage.jsx';
import { EditMyProfilePage } from './pages/employee/EditMyProfilePage.jsx';
import { SalaryManagementPage } from './pages/hr/SalaryManagementPage.jsx';
import { SalaryFormPage } from './pages/hr/SalaryFormPage.jsx';
import { SalarySlipPage } from './pages/employee/SalarySlipPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RoleRoute roles={['organization_admin', 'hr']} />}>
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/new" element={<EmployeeFormPage />} />
            <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
            <Route path="employees/:id" element={<EmployeeProfilePage />} />
          </Route>
          <Route element={<RoleRoute roles={['organization_admin', 'hr', 'employee']} />}>
            <Route path="my-profile" element={<EmployeeProfilePage />} />
            <Route path="my-profile/edit" element={<EditMyProfilePage />} />
          </Route>
          <Route element={<RoleRoute roles={['employee']} />}>
            <Route path="my-salary" element={<SalaryManagementPage />} />
          </Route>
          <Route element={<RoleRoute roles={['organization_admin', 'hr', 'employee']} />}>
            <Route path="salary-slips/:id" element={<SalarySlipPage />} />
          </Route>
          <Route element={<RoleRoute roles={['organization_admin', 'hr']} />}>
            <Route path="hr" element={<HrManagementPage />} />
          </Route>
          <Route element={<RoleRoute roles={['organization_admin']} />}>
            <Route path="hr/new" element={<HrFormPage />} />
          </Route>
          <Route element={<RoleRoute roles={['organization_admin', 'hr']} />}>
            <Route path="salaries" element={<SalaryManagementPage />} />
            <Route path="salaries/new" element={<SalaryFormPage />} />
            <Route path="salaries/:id/edit" element={<SalaryFormPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
