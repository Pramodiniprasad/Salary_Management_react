import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useResource } from '../../hooks/useResource.js';
import { employeesApi, getErrorMessage, salariesApi, salarySlipsApi, unwrapCollection } from '../../services/api.js';

function formatMonth(month, year) {
  if (!month || !year) return '—';
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function employeeName(record, employeeNames, salaryEmployeeIds = {}) {
  const directName = record.employee_name
    ?? record.employee?.name
    ?? record.employee?.full_name;
  const nestedName = [record.employee?.first_name, record.employee?.last_name].filter(Boolean).join(' ');
  const employeeId = record.employee_id
    ?? salaryEmployeeIds[String(record.salary_id)];
  return directName
    || nestedName
    || employeeNames[String(employeeId)]
    || (employeeId ? `Employee ${employeeId}` : '—');
}

export function SalaryManagementPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isEmployee = user.role === 'employee';
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const today = new Date();
  const [salaryId, setSalaryId] = useState('');
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  const resource = useResource(async () => {
    const [salaryData, slipData, employeeData] = await Promise.all([
      salariesApi.list(),
      salarySlipsApi.list(),
      isEmployee ? Promise.resolve([]) : employeesApi.list(),
    ]);
    const employees = unwrapCollection(employeeData, 'employees');
    return {
      salaries: unwrapCollection(salaryData, 'salaries'),
      slips: unwrapCollection(slipData, 'salary_slips'),
      employeeNames: Object.fromEntries(employees.map((employee) => {
        const name = employee.name
          || employee.full_name
          || [employee.first_name, employee.last_name].filter(Boolean).join(' ')
          || employee.email;
        return [String(employee.id), name];
      })),
    };
  }, [isEmployee]);
  const salaries = resource.data?.salaries ?? [];
  const slips = resource.data?.slips ?? [];
  const employeeNames = resource.data?.employeeNames ?? {};
  const salaryEmployeeIds = Object.fromEntries(salaries.map((salary) => [String(salary.id), salary.employee_id]));
  const filteredSlips = slips.filter((slip) => {
    if (paymentFilter === 'all') return true;
    const isPaid = String(slip.payment_status || '').toLowerCase() === 'paid';
    return paymentFilter === 'paid' ? isPaid : !isPaid;
  });
  const salaryColumns = [
    ...(isEmployee ? [] : [{ key: 'employee', label: 'Employee', value: (row) => employeeName(row, employeeNames, salaryEmployeeIds) }]),
    { key: 'basic_salary', label: 'Basic salary' },
    { key: 'hra', label: 'HRA' },
    { key: 'allowances', label: 'Allowances' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'gross_salary', label: 'Gross salary' },
    { key: 'net_salary', label: 'Net salary' },
    { key: 'effective_from', label: 'Effective from' },
    { key: 'effective_to', label: 'Effective to' },
    ...(!isEmployee ? [{
      key: 'actions',
      label: '',
      render: (row) => <div className="row-actions">
        <Link className="text-button" to={`/salaries/${row.id}/edit`}>Edit</Link>
        <button className="text-button danger-text" onClick={() => deleteSalary(row)}>Delete</button>
      </div>,
    }] : []),
  ];
  const slipColumns = [
    ...(isEmployee ? [] : [{ key: 'employee', label: 'Employee', value: (row) => employeeName(row, employeeNames, salaryEmployeeIds) }]),
    { key: 'period', label: 'Pay period', value: (row) => formatMonth(row.month, row.year) },
    { key: 'basic_salary', label: 'Basic salary' },
    { key: 'total_earnings', label: 'Total earnings' },
    { key: 'total_deductions', label: 'Total deductions' },
    { key: 'net_salary', label: 'Net salary' },
    { key: 'payment_status', label: 'Payment status', render: (row) => <span className="status-pill">{row.payment_status || 'Pending'}</span> },
    ...(!isEmployee ? [{
      key: 'payment_action',
      label: '',
      render: (row) => row.payment_status !== 'paid'
        ? <button className="text-button" onClick={() => updateSlipPayment(row)}>Mark paid</button>
        : <span className="muted">Paid</span>,
    }] : []),
    { key: 'actions', label: '', render: (row) => <Link className="text-button" to={`/salary-slips/${row.id}`}>View slip</Link> },
  ];

  async function deleteSalary(salary) {
    const name = employeeName(salary, employeeNames, salaryEmployeeIds);
    if (!window.confirm(`Delete the salary record for ${name}? Salary records referenced by slips cannot be deleted.`)) return;
    setError('');
    try {
      await salariesApi.remove(salary.id);
      setNotice(`Salary record for ${name} deleted.`);
      await resource.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function updateSlipPayment(slip) {
    setError('');
    try {
      await salarySlipsApi.update(slip.id, {
        salary_slip: { payment_status: 'paid', payment_date: new Date().toISOString().slice(0, 10) },
      });
      setNotice(`Salary slip for ${formatMonth(slip.month, slip.year)} marked paid.`);
      await resource.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function createSlip(event) {
    event.preventDefault();
    setError('');
    const salary = salaries.find((record) => String(record.id) === salaryId);
    if (!salary) {
      setError('Select a salary record before creating a slip.');
      return;
    }
    try {
      await salarySlipsApi.create({
        salary_slip: {
          salary_id: salary.id,
          month: Number(month),
          year: Number(year),
        },
      });
      setNotice(`Salary slip created for ${formatMonth(month, year)}.`);
      setShowGenerateForm(false);
      setSalaryId('');
      await resource.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return <>
    <PageHeader
      eyebrow={isEmployee ? 'PAY' : 'PAYROLL'}
      title={isEmployee ? 'My salary' : 'Salary management'}
      description={isEmployee ? 'Review your salary records and payslips.' : 'Manage salary records and create employee payslips.'}
      action={!isEmployee && <div className="header-actions">
        <Link className="button secondary" to="/salaries/new">+ Add salary</Link>
        <button className="button primary" onClick={() => setShowGenerateForm((visible) => !visible)}>Create salary slip</button>
      </div>}
    />
    <SuccessMessage>{notice}</SuccessMessage>
    <ErrorMessage>{resource.error || error}</ErrorMessage>
    {showGenerateForm && !isEmployee && <form className="form-card slip-create-form" onSubmit={createSlip}>
      <div className="form-grid">
        <label className="field wide"><span>Employee salary record</span>
          <select required value={salaryId} onChange={(event) => setSalaryId(event.target.value)}>
            <option value="">Select an employee salary</option>
            {salaries.map((salary) => <option key={salary.id} value={salary.id}>
              {employeeName(salary, employeeNames, salaryEmployeeIds)} · {salary.basic_salary} · {salary.effective_from}
            </option>)}
          </select>
        </label>
        <label className="field"><span>Month</span><select value={month} onChange={(event) => setMonth(event.target.value)}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(today.getFullYear(), index).toLocaleDateString(undefined, { month: 'long' })}</option>)}</select></label>
        <label className="field"><span>Year</span><input type="number" min="2000" max="2100" required value={year} onChange={(event) => setYear(event.target.value)} /></label>
      </div>
      <div className="form-actions"><button type="button" className="button secondary" onClick={() => setShowGenerateForm(false)}>Cancel</button><button type="submit" className="button primary">Create slip</button></div>
    </form>}
    {resource.loading ? <LoadingState label="Loading salary records…" /> : <>
      <div className="section-heading"><div><h2>{isEmployee ? 'My salary details' : 'Salary records'}</h2><p>{isEmployee ? 'Salary amounts and effective dates.' : 'Organisation salary details and effective dates.'}</p></div></div>
      <DataTable columns={salaryColumns} rows={salaries} emptyMessage="No salary records found." />
      <div className="section-heading salary-section-heading"><div><h2>{isEmployee ? 'My salary slips' : 'Salary slips'}</h2><p>Payment statements by month.</p></div></div>
      <DataTable
        columns={slipColumns}
        rows={filteredSlips}
        emptyMessage={paymentFilter === 'all' ? 'No salary slips found.' : `No ${paymentFilter === 'paid' ? 'paid' : 'unpaid'} salary slips found.`}
        toolbarContent={<label className="status-filter"><span>Payment status</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}><option value="all">All slips</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select></label>}
      />
    </>}
  </>;
}
