export const ROLE_LABELS = {
  organization_admin: 'Organisation Admin',
  hr: 'HR',
  employee: 'Employee',
};

export function canManageEmployees(role) {
  return role === 'organization_admin' || role === 'hr';
}

export function canManageSalaries(role) {
  return role === 'organization_admin' || role === 'hr';
}
