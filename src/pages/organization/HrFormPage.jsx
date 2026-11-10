import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { usersApi } from '../../services/api.js';

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true, autoComplete: 'new-password' },
  { name: 'password_confirmation', label: 'Confirm password', type: 'password', required: true, autoComplete: 'new-password' },
];

export function HrFormPage() {
  return <>
    <PageHeader eyebrow="ORGANISATION" title="Create HR user" description="Create an HR account for your organisation." />
    <ResourceForm
      title="HR user"
      initialValues={{}}
      fields={fields}
      cancelTo="/hr"
      submitLabel="Create HR user"
      onSubmit={(values) => {
        if (values.password !== values.password_confirmation) {
          throw new Error('Password and password confirmation must match.');
        }
        return usersApi.create({
          user: {
            name: values.name,
            email: values.email,
            password: values.password,
            password_confirmation: values.password_confirmation,
            role: 'hr',
          },
        });
      }}
    />
  </>;
}
