import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { employeesApi, getErrorMessage, salariesApi, unwrapCollection } from '../../services/api.js';

const salaryFields = [
  { name: 'employee_id', label: 'Employee', type: 'select', required: true, options: [] },
  { name: 'basic_salary', label: 'Basic salary', type: 'number', min: '0', step: '0.01', required: true },
  { name: 'hra', label: 'HRA', type: 'number', min: '0', step: '0.01' },
  { name: 'allowances', label: 'Allowances', type: 'number', min: '0', step: '0.01' },
  { name: 'deductions', label: 'Deductions', type: 'number', min: '0', step: '0.01' },
  { name: 'effective_from', label: 'Effective from', type: 'date', required: true },
  { name: 'effective_to', label: 'Effective to', type: 'date' },
];

export function SalaryFormPage() {
  const { id } = useParams();
  const [fields, setFields] = useState(salaryFields);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      employeesApi.list(),
      id ? salariesApi.get(id) : Promise.resolve({}),
    ]).then(([employeeData, salaryData]) => {
      if (!active) return;
      const employees = unwrapCollection(employeeData, 'employees');
      setFields(salaryFields.map((field) => field.name === 'employee_id' ? {
        ...field, options: employees.map((employee) => ({ value: employee.id, label: `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.name || employee.email })),
      } : field));
      setInitialValues(id ? (salaryData?.salary ?? salaryData) : {});
    }).catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <LoadingState label="Loading salary form…" />;
  return <>
    <PageHeader eyebrow="PAYROLL" title={id ? 'Edit salary' : 'Create salary'} description="Enter the salary details for an employee and pay period." />
    <ErrorMessage>{error}</ErrorMessage>
    {!error && <ResourceForm title="Salary" initialValues={initialValues} fields={fields} cancelTo="/salaries" submitLabel={id ? 'Save salary' : 'Create salary'}     onSubmit={(values) => {
      const salary = {
        employee_id: Number(values.employee_id),
        basic_salary: values.basic_salary,
        hra: values.hra === '' ? 0 : values.hra,
        allowances: values.allowances === '' ? 0 : values.allowances,
        deductions: values.deductions === '' ? 0 : values.deductions,
        effective_from: values.effective_from,
        effective_to: values.effective_to || null,
      };
      if (id) {
        const { employee_id, ...updates } = salary;
        return salariesApi.update(id, { salary: updates });
      }
      return salariesApi.create({ salary });
    }} />}
  </>;
}
