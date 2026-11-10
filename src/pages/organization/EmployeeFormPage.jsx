import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { employeesApi, getErrorMessage, usersApi } from '../../services/api.js';
import { toApiEmploymentStatus, toEmploymentStatusLabel } from '../../utils/employmentStatus.js';

const fields = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'employee_code', label: 'Employee code', required: true },
  { name: 'phone', label: 'Phone number', type: 'tel' },
  { name: 'department', label: 'Department' },
  { name: 'designation', label: 'Job title' },
  { name: 'date_of_joining', label: 'Joining date', type: 'date' },
  { name: 'employment_status', label: 'Employment status', type: 'select', required: true, options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] },
];

export function EmployeeFormPage() {
  const { id } = useParams();
  const [createdUser, setCreatedUser] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    employeesApi.get(id).then((employee) => {
      if (active) {
        const record = employee?.employee ?? employee;
        setInitialValues({ ...record, employment_status: toEmploymentStatusLabel(record.employment_status) });
      }
    })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <LoadingState label="Loading employee…" />;
  return <>
    <PageHeader eyebrow="PEOPLE" title={id ? 'Edit employee' : 'Create employee'} description={id ? 'Update this employee’s information.' : 'Add an employee to your organisation.'} />
    <ErrorMessage>{error}</ErrorMessage>
    {!id && <p className="help-note">The form creates an Employee user account first, then links the employee profile using the returned user ID. Your organisation is assigned by Rails.</p>}
    {!error && <ResourceForm
      title="Employee"
      initialValues={id ? initialValues : { employment_status: 'active' }}
      fields={id ? fields : [...fields,
        { name: 'password', label: 'Login password', type: 'password', required: true, autoComplete: 'new-password' },
        { name: 'password_confirmation', label: 'Confirm password', type: 'password', required: true, autoComplete: 'new-password' },
      ]}
      cancelTo="/employees"
      submitLabel={id ? 'Save employee' : 'Create employee'}
      onSubmit={(values) => {
        if (id) {
          return employeesApi.update(id, {
            employee: { ...values, employment_status: toApiEmploymentStatus(values.employment_status) },
          });
        }
        if (values.password !== values.password_confirmation) {
          throw new Error('Password and password confirmation must match.');
        }
        const { password, password_confirmation, ...employee } = values;
        const createProfile = async () => {
          let account = createdUser;
          if (!account) {
            const user = await usersApi.create({
              user: {
                name: `${employee.first_name} ${employee.last_name}`.trim(),
                email: employee.email,
                password,
                password_confirmation,
                role: 'employee',
              },
            });
            if (!user?.id) throw new Error('The user account was created, but the API did not return its ID.');
            account = { id: user.id, email: user.email ?? employee.email };
            setCreatedUser(account);
          }
          return employeesApi.create({
            employee: {
              user_id: account.id,
              employee_code: employee.employee_code,
              first_name: employee.first_name,
              last_name: employee.last_name,
              email: account.email,
              phone: employee.phone || null,
              designation: employee.designation,
              department: employee.department,
              date_of_joining: employee.date_of_joining,
              employment_status: toApiEmploymentStatus(employee.employment_status),
            },
          });
        };
        return createProfile();
      }}
    />}
  </>;
}
