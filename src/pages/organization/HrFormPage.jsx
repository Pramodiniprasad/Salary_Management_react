import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { hrApi } from '../../services/api.js';

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'password', label: 'Temporary password', type: 'password', required: true, autoComplete: 'new-password' },
];

export function HrFormPage() {
  return <>
    <PageHeader eyebrow="ORGANISATION" title="Create HR user" description="Create an account for a member of your HR team." />
    <ResourceForm title="HR user" initialValues={{}} fields={fields} cancelTo="/hr" submitLabel="Create HR user" onSubmit={(values) => hrApi.create({ hr_user: values })} />
  </>;
}
