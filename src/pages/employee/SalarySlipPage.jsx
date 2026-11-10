import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { employeesApi, getErrorMessage, salariesApi, salarySlipsApi, unwrapCollection } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getOrganizationName } from '../../utils/organization.js';

function getEmployeeName(employee) {
  return employee?.name
    || employee?.full_name
    || [employee?.first_name, employee?.last_name].filter(Boolean).join(' ')
    || employee?.email;
}

export function SalarySlipPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const organizationName = getOrganizationName(slip, getOrganizationName(user));
  useEffect(() => {
    let active = true;
    async function loadSlip() {
      try {
        const [slipResult, salaryData] = await Promise.all([
          salarySlipsApi.get(id),
          salariesApi.list(),
        ]);
        const slipRecord = slipResult?.salary_slip ?? slipResult;
        const salaries = unwrapCollection(salaryData, 'salaries');
        const linkedSalary = salaries.find((salary) => String(salary.id) === String(slipRecord.salary_id));
        const employeeId = slipRecord.employee_id ?? linkedSalary?.employee_id;
        let employeeName = getEmployeeName(slipRecord.employee);
        if (!employeeName && user.role === 'employee') {
          employeeName = getEmployeeName(user);
        } else if (!employeeName && user.role !== 'employee') {
          const employeeData = await employeesApi.list();
          const employee = unwrapCollection(employeeData, 'employees')
            .find((record) => String(record.id) === String(employeeId));
          employeeName = getEmployeeName(employee);
        }
        if (active) setSlip({ ...slipRecord, employee_name: slipRecord.employee_name || employeeName });
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSlip();
    return () => { active = false; };
  }, [id, user]);
  if (loading) return <LoadingState label="Loading payslip…" />;
  const lines = [
    ['Employee', slip?.employee_name ?? slip?.employee?.name ?? (user.role === 'employee' ? user.name : undefined)],
    ['Employee code', slip?.employee_code ?? slip?.employee?.employee_code],
    ['Pay period', slip?.month && slip?.year ? new Date(Number(slip.year), Number(slip.month) - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'],
    ['Basic salary', slip?.basic_salary],
    ['Total earnings', slip?.total_earnings],
    ['Total deductions', slip?.total_deductions],
    ['Net salary', slip?.net_salary],
    ['Payment status', slip?.payment_status],
    ['Payment date', slip?.payment_date],
  ];
  return <>
    <PageHeader eyebrow="PAYSLIP" title="Salary slip" description="Your salary statement for the selected pay period." action={<button className="button primary" onClick={() => window.print()}>Print / Save as PDF</button>} />
    <ErrorMessage>{error}</ErrorMessage>
    {slip && <section className="detail-card payslip"><div className="slip-organization-name">{organizationName}</div><div className="payslip-heading"><div><span className="eyebrow">SALARY STATEMENT</span><h2>{slip.month && slip.year ? new Date(Number(slip.year), Number(slip.month) - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Pay period'}</h2></div><span className="status-pill">{slip.payment_status || 'Pending'}</span></div><div className="detail-grid">{lines.map(([label, value]) => <div className={`detail-item ${label === 'Net salary' ? 'highlight' : ''}`} key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div><div className="payslip-footer"><Link to={user.role === 'employee' ? '/my-salary' : '/salaries'}>← Back to salary details</Link></div></section>}
  </>;
}
