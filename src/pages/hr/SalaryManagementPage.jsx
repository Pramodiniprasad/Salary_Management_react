import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { salariesApi, salarySlipsApi, unwrapCollection } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { getErrorMessage } from '../../services/api.js';
import { useState } from 'react';

export function SalaryManagementPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isEmployee = user.role === 'employee';
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7));
  const resource = useResource(async () => unwrapCollection(await salariesApi.list(), 'salaries'), []);
  const columns = isEmployee ? [
    { key: 'period', label: 'Pay period', value: (row) => row.pay_period ?? row.period ?? row.month },
    { key: 'gross_salary', label: 'Gross salary', value: (row) => row.gross_salary ?? row.amount },
    { key: 'net_salary', label: 'Net salary' },
    { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status || 'Processed'}</span> },
    { key: 'slip', label: '', render: (row) => <Link className="text-button" to={`/salary-slips/${row.salary_slip_id ?? row.id}`}>View payslip</Link> },
  ] : [
    { key: 'employee', label: 'Employee', value: (row) => row.employee_name ?? row.employee?.name ?? row.employee?.full_name },
    { key: 'period', label: 'Pay period', value: (row) => row.pay_period ?? row.period ?? row.month },
    { key: 'gross_salary', label: 'Gross salary', value: (row) => row.gross_salary ?? row.amount },
    { key: 'net_salary', label: 'Net salary' },
    { key: 'status', label: 'Status', render: (row) => <span className="status-pill">{row.status || 'Draft'}</span> },
    { key: 'actions', label: '', render: (row) => <Link className="text-button" to={`/salaries/${row.id}/edit`}>Edit</Link> },
  ];
  async function generateSlips(event) {
    event.preventDefault();
    setError('');
    try {
      await salarySlipsApi.create({ salary_slip: { pay_period: payPeriod } });
      setNotice(`Payslips generated for ${payPeriod}.`);
      setShowGenerateForm(false);
      await resource.refresh();
    }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  return <>
    <PageHeader eyebrow={isEmployee ? 'PAY' : 'PAYROLL'} title={isEmployee ? 'My salary' : 'Salary management'} description={isEmployee ? 'Review your salary records and payslips.' : 'Manage employee salary records and payroll periods.'} action={!isEmployee && <div className="header-actions"><Link className="button secondary" to="/salary-history">Salary history</Link><Link className="button secondary" to="/salaries/new">+ Add salary</Link><button className="button primary" onClick={() => setShowGenerateForm((visible) => !visible)}>Generate slips</button></div>} />
    <SuccessMessage>{notice}</SuccessMessage><ErrorMessage>{resource.error || error}</ErrorMessage>
    {showGenerateForm && !isEmployee && <form className="generate-panel" onSubmit={generateSlips}><label className="field"><span>Pay period</span><input type="month" required value={payPeriod} onChange={(event) => setPayPeriod(event.target.value)} /></label><div className="header-actions"><button type="button" className="button secondary" onClick={() => setShowGenerateForm(false)}>Cancel</button><button type="submit" className="button primary">Generate for period</button></div></form>}
    {resource.loading ? <LoadingState label="Loading salary records…" /> : <DataTable columns={columns} rows={resource.data || []} emptyMessage="No salary records found." />}
    {!isEmployee && <p className="help-note">Payslip generation is submitted to the Rails API. Available records update after the request completes.</p>}
  </>;
}
