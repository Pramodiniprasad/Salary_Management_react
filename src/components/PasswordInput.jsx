import { useState } from 'react';

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        className="password-visibility"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 9 5 9 7a9.7 9.7 0 01-3.1 4.2M6.2 6.2C3.9 7.7 3 10.3 3 12c0 2 3.8 7 9 7a9 9 0 003.2-.6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12s3.2-7 9-7 9 7 9 7-3.2 7-9 7-9-7-9-7z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </span>
  );
}
