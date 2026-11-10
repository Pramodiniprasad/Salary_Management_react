export function toEmploymentStatusLabel(status) {
  return status === 'on_leave' ? 'inactive' : status;
}

export function toApiEmploymentStatus(status) {
  return status === 'inactive' ? 'on_leave' : status;
}

export function formatEmploymentStatus(status) {
  const label = toEmploymentStatusLabel(status);
  if (!label) return '—';
  return label.charAt(0).toUpperCase() + label.slice(1).replaceAll('_', ' ');
}
