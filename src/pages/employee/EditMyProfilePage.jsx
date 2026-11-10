import { useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ResourceForm } from '../../components/ResourceForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const fields = [
  { name: 'name', label: 'Full name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'current_password', label: 'Current password', type: 'password', autoComplete: 'current-password', wide: true },
  { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password' },
  { name: 'password_confirmation', label: 'Confirm new password', type: 'password', autoComplete: 'new-password' },
];

export function EditMyProfilePage() {
  const { user, updateProfile } = useAuth();
  const initialValues = useMemo(() => ({ name: user.name ?? '', email: user.email ?? '' }), [user.name, user.email]);

  async function saveProfile(values) {
    const { current_password, password, password_confirmation, ...profile } = values;
    const changingPassword = Boolean(current_password || password || password_confirmation);
    if (changingPassword) {
      if (!current_password || !password || !password_confirmation) {
        throw new Error('Enter your current password, new password, and password confirmation to change your password.');
      }
      if (password !== password_confirmation) {
        throw new Error('New password and password confirmation do not match.');
      }
      await updateProfile({ ...profile, current_password, password, password_confirmation });
      return;
    }
    await updateProfile(profile);
  }

  return <>
    <PageHeader eyebrow="MY ACCOUNT" title="Edit profile" description="Update your account name, email, or password." />
    <p className="help-note">Leave the password fields blank to keep your current password. Changing your password requires your current password.</p>
    <ResourceForm
      title="Profile"
      initialValues={initialValues}
      fields={fields}
      cancelTo="/my-profile"
      submitLabel="Save profile"
      onSubmit={saveProfile}
    />
  </>;
}
