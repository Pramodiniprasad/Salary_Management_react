import { Link, useLocation } from 'react-router-dom';
import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useResource } from '../../hooks/useResource.js';
import { unwrapCollection, usersApi } from '../../services/api.js';

export function HrManagementPage() {
  const { user } = useAuth();
  const location = useLocation();
  const resource = useResource(async () => unwrapCollection(await usersApi.list(), 'users'), []);
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (record) => <span className="status-pill">{record.role === 'organization_admin' ? 'Organisation Admin' : record.role === 'hr' ? 'HR' : 'Employee'}</span> },
    { key: 'status', label: 'Status', render: (record) => record.status || '—' },
  ];
  return <>
    <PageHeader
      eyebrow="ORGANISATION"
      title="Team users"
      description="View organisation accounts and create users permitted by your role."
      action={user.role === 'organization_admin'
        ? <Link className="button primary" to="/hr/new">+ Create HR user</Link>
        : <Link className="button primary" to="/employees/new">+ Create employee</Link>}
    />
    <SuccessMessage>{location.state?.notice}</SuccessMessage>
    <ErrorMessage>{resource.error}</ErrorMessage>
    {resource.loading
      ? <LoadingState label="Loading organisation users…" />
      : <DataTable columns={columns} rows={resource.data || []} emptyMessage="No organisation users found." />}
    <p className="help-note">
      {user.role === 'organization_admin'
        ? 'Organisation Admins can create HR accounts here and Employee accounts from the employee form.'
        : 'HR users can create Employee accounts from the employee form.'}
    </p>
  </>;
}
