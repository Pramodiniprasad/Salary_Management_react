import { DataTable } from '../../components/DataTable.jsx';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { salariesApi, unwrapCollection } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';

export function SalaryHistoryPage() {
  const resource = useResource(async () => unwrapCollection(await salariesApi.list({ history: true }), 'salaries'), []);
  const columns = [
    { key: 'employee', label: 'Employee', value: (row) => row.employee_name ?? row.employee?.name ?? row.employee?.full_name },
    { key: 'employee_id', label: 'Employee ID', value: (row) => row.employee_id ?? row.employee?.employee_id },
    { key: 'period', label: 'Pay period', value: (row) => row.pay_period ?? row.period ?? row.month },
    { key: 'basic_salary', label: 'Basic salary' },
    { key: 'net_salary', label: 'Net salary' },
    { key: 'created_at', label: 'Created', value: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—' },
  ];
  return <>
    <PageHeader eyebrow="PAYROLL" title="Salary history" description="A searchable record of salary history across your organisation." />
    <ErrorMessage>{resource.error}</ErrorMessage>
    {resource.loading ? <LoadingState label="Loading salary history…" /> : <DataTable columns={columns} rows={resource.data || []} emptyMessage="No salary history found." />}
  </>;
}
