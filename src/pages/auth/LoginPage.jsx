import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { ROLE_LABELS } from '../../utils/roles.js';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (loading) return <div className="login-loading">Loading your workspace…</div>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-aside">
        <div className="brand brand-on-dark"><span className="brand-mark">S</span><span>Salary<span className="brand-light">Flow</span></span></div>
        <div className="login-message"><div className="eyebrow">PAYROLL, MADE CLEAR</div><h1>Your people.<br />Your payroll.<br /><span>One place.</span></h1><p>A simpler way to manage teams, salaries and payslips.</p></div>
        <div className="login-aside-footer">A secure workspace for your organisation</div>
      </div>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Sign in to your account</h2>
          <p>Use your organisation account to continue.</p>
          {error && <div className="notice error" role="alert">{error}</div>}
          <label className="field"><span>Email address</span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organisation.com" /></label>
          <label className="field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          <button className="button primary login-submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">→</span></button>
          <div className="login-help">Access is provided by your organisation administrator.</div>
        </form>
        <div className="login-role-note">{Object.values(ROLE_LABELS).join(' · ')}</div>
      </section>
    </main>
  );
}
