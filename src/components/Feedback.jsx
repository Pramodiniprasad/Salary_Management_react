export function LoadingState({ label = 'Loading…' }) {
  return <div className="feedback loading"><span className="spinner" aria-hidden="true" />{label}</div>;
}

export function ErrorMessage({ children }) {
  return children ? <div className="notice error" role="alert">{children}</div> : null;
}

export function SuccessMessage({ children }) {
  return children ? <div className="notice success" role="status">{children}</div> : null;
}

export function EmptyState({ children = 'No records found.' }) {
  return <div className="empty-state">{children}</div>;
}
