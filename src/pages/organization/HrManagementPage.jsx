import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { getErrorMessage, hrApi, unwrapCollection } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';

export function HrManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resource = useResource(async () => unwrapCollection(await hrApi.list(), 'hr_users'), []);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  async function remove(record) {
    if (!window.confirm(`Remove HR user ${record.name ?? record.email}? This cannot be undone.`)) return;
    setError('');
    try { await hrApi.remove(record.id); setNotice('HR user removed successfully.'); await resource.refresh(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  const columns = [
    { key: 'name', label: 'Name', value: (row) => row.name ?? row.full_name },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Added', value: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status || 'Active'}</span> },
    { key: 'actions', label: '', render: (row) => <div className="row-actions"><button className="text-button" onClick={() => remove(row)}>Remove</button></div> },
  ];
  return <>
    <PageHeader eyebrow="ORGANISATION" title="HR team" description="Manage HR accounts with access to employee and payroll tools." action={<Link className="button primary" to="/hr/new">+ Create HR user</Link>} />
    <SuccessMessage>{notice}</SuccessMessage><ErrorMessage>{resource.error || error}</ErrorMessage>
    {resource.loading ? <LoadingState label="Loading HR users…" /> : <DataTable columns={columns} rows={resource.data || []} emptyMessage="No HR users found." />}
  </>;
}
