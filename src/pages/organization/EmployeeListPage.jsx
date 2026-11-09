import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { employeesApi, getErrorMessage, unwrapCollection } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function EmployeeListPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'organization_admin';
  const navigate = useNavigate();
  const location = useLocation();
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const resource = useResource(async () => unwrapCollection(await employeesApi.list(), 'employees'), []);
  async function removeEmployee(employee) {
    if (!window.confirm(`Delete ${employee.name ?? employee.full_name ?? 'this employee'}? This cannot be undone.`)) return;
    setActionError('');
    try {
      await employeesApi.remove(employee.id);
      setNotice('Employee deleted successfully.');
      await resource.refresh();
    } catch (error) { setActionError(getErrorMessage(error)); }
  }
  const columns = [
    { key: 'name', label: 'Employee', value: (row) => row.name ?? row.full_name },
    { key: 'email', label: 'Email' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status || 'Active'}</span> },
    { key: 'actions', label: '', render: (row) => <div className="row-actions"><button className="text-button" onClick={() => navigate(`/employees/${row.id}`)}>View</button><button className="text-button" onClick={() => navigate(`/employees/${row.id}/edit`)}>Edit</button>{isAdmin && <button className="text-button danger-text" onClick={() => removeEmployee(row)}>Delete</button>}</div> },
  ];
  return <>
    <PageHeader eyebrow="PEOPLE" title="Employees" description="Manage employee records and profile information." action={<Link className="button primary" to="/employees/new">+ Add employee</Link>} />
    <SuccessMessage>{notice}</SuccessMessage><ErrorMessage>{resource.error || actionError}</ErrorMessage>
    {resource.loading ? <LoadingState label="Loading employees…" /> : <DataTable columns={columns} rows={resource.data || []} emptyMessage="No employees yet. Add your first employee to get started." />}
  </>;
}
