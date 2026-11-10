export function getOrganizationName(user, fallback = 'Organisation') {
  return user?.organization_name
    || user?.organisation_name
    || user?.organization?.name
    || user?.organisation?.name
    || fallback;
}
