export const ROLE_LABELS = {
  organization_admin: 'Organisation Admin',
  hr: 'HR',
  employee: 'Employee',
};

export const ROLE_HOME = {
  organization_admin: '/',
  hr: '/',
  employee: '/',
};

export function canManageEmployees(role) {
  return role === 'organization_admin' || role === 'hr';
}

export function canManageHr(role) {
  return role === 'organization_admin';
}

export function canManageSalaries(role) {
  return role === 'hr';
}
