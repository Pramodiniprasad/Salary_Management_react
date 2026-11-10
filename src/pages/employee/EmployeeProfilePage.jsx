import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { employeesApi, getErrorMessage } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatEmploymentStatus } from '../../utils/employmentStatus.js';

const PROFILE_FIELDS = [['Employee code', 'employee_code'], ['Email address', 'email'], ['Phone', 'phone'], ['Department', 'department'], ['Job title', 'designation'], ['Joining date', 'date_of_joining'], ['Status', 'employment_status']];

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
    if (isSelf) {
      setEmployee(user);
      setLoading(false);
      return () => { active = false; };
    }
    if (!employeeId) { setLoading(false); return undefined; }
    employeesApi.get(employeeId).then((result) => { if (active) setEmployee(result?.employee ?? result); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [employeeId, isSelf, user]);
  if (loading) return <LoadingState label="Loading profile…" />;
  return <>
    <PageHeader
      eyebrow={isSelf ? 'MY ACCOUNT' : 'EMPLOYEE PROFILE'}
      title={isSelf ? 'My profile' : employee?.name ?? employee?.full_name ?? 'Employee profile'}
      description={isSelf ? 'Your signed-in account details.' : 'Employee details and organisation information.'}
      action={isSelf && <Link className="button primary" to="/my-profile/edit">Edit profile</Link>}
    />
    <ErrorMessage>{error}</ErrorMessage>
    {employee && <section className="detail-card"><div className="profile-summary"><div className="profile-avatar">{String(employee.name ?? employee.full_name ?? 'U').charAt(0).toUpperCase()}</div><div><h2>{employee.name ?? employee.full_name ?? `${employee.first_name ?? ''} ${employee.last_name ?? ''}`}</h2><p>{employee.role === 'organization_admin' ? 'Organisation Admin' : employee.role === 'hr' ? 'HR' : employee.role === 'employee' ? 'Employee' : employee.role}</p></div></div><div className="detail-grid">{(isSelf ? [['Name', 'name'], ['Email address', 'email'], ['Role', 'role'], ['Status', 'status'], ['Organisation ID', 'organization_id']] : PROFILE_FIELDS).map(([label, key]) => <div className="detail-item" key={key}><span>{label}</span><strong>{key === 'employment_status' ? formatEmploymentStatus(employee[key]) : employee[key] || '—'}</strong></div>)}</div></section>}
  </>;
}
