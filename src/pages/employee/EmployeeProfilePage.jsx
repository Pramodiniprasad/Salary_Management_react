import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { employeesApi, getErrorMessage } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canManageEmployees } from '../../utils/roles.js';

const PROFILE_FIELDS = [['Employee ID', 'employee_id'], ['Email address', 'email'], ['Phone', 'phone'], ['Department', 'department'], ['Job title', 'designation'], ['Joining date', 'joining_date'], ['Status', 'status']];

export function EmployeeProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isSelf = id === undefined;
  const employeeId = isSelf ? 'me' : id;
  const [employee, setEmployee] = useState(isSelf ? user : null);
  const [loading, setLoading] = useState(!isSelf);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (isSelf && !employeeId) { setLoading(false); return undefined; }
    if (!employeeId) { setLoading(false); return undefined; }
    employeesApi.get(employeeId).then((result) => { if (active) setEmployee(result?.employee ?? result); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [employeeId, isSelf]);
  if (loading) return <LoadingState label="Loading profile…" />;
  return <>
    <PageHeader eyebrow="EMPLOYEE PROFILE" title={employee?.name ?? employee?.full_name ?? 'Employee profile'} description="Employee details and organisation information." action={canManageEmployees(user.role) && <Link className="button secondary" to={`/employees/${employeeId}/edit`}>Edit profile</Link>} />
    <ErrorMessage>{error}</ErrorMessage>
    {employee && <section className="detail-card"><div className="profile-summary"><div className="profile-avatar">{String(employee.name ?? employee.full_name ?? 'E').charAt(0).toUpperCase()}</div><div><h2>{employee.name ?? employee.full_name ?? `${employee.first_name ?? ''} ${employee.last_name ?? ''}`}</h2><p>{employee.designation || employee.job_title || 'Employee'}{employee.department ? ` · ${employee.department}` : ''}</p></div></div><div className="detail-grid">{PROFILE_FIELDS.map(([label, key]) => <div className="detail-item" key={key}><span>{label}</span><strong>{employee[key] || '—'}</strong></div>)}</div></section>}
  </>;
}
