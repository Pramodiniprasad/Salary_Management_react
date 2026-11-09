import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { employeesApi, getErrorMessage } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const fields = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'employee_id', label: 'Employee ID', required: true },
  { name: 'phone', label: 'Phone number', type: 'tel' },
  { name: 'department', label: 'Department' },
  { name: 'designation', label: 'Job title' },
  { name: 'joining_date', label: 'Joining date', type: 'date' },
];

export function EmployeeFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    employeesApi.get(id).then((employee) => { if (active) setInitialValues(employee?.employee ?? employee); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <LoadingState label="Loading employee…" />;
  return <>
    <PageHeader eyebrow="PEOPLE" title={id ? 'Edit employee' : 'Create employee'} description={id ? 'Update this employee’s information.' : 'Add an employee to your organisation.'} />
    <ErrorMessage>{error}</ErrorMessage>
    {!error && <ResourceForm title="Employee" initialValues={initialValues} fields={fields} cancelTo="/employees" submitLabel={id ? 'Save employee' : 'Create employee'} onSubmit={(values) => id ? employeesApi.update(id, { employee: values }) : employeesApi.create({ employee: { ...values, organisation_id: user.organisation_id ?? user.organization_id } })} />}
  </>;
}
