import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canManageEmployees, canManageHr, canManageSalaries, ROLE_LABELS } from '../utils/roles.js';
import { ErrorMessage } from './Feedback.jsx';
import { useState } from 'react';

function NavItem({ to, children, end = false }) {
  return <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{children}</NavLink>;
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');
  const isEmployee = user.role === 'employee';

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(error.response?.data?.message || error.message || 'Unable to sign out.');
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Salary<span className="brand-light">Flow</span></span></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          <NavItem to="/" end>Overview</NavItem>
          {canManageEmployees(user.role) && <NavItem to="/employees">Employees</NavItem>}
          {canManageHr(user.role) && <NavItem to="/hr">HR team</NavItem>}
          {(canManageSalaries(user.role) || isEmployee) && <NavItem to={isEmployee ? '/my-salary' : '/salaries'}>{isEmployee ? 'My salary' : 'Salary management'}</NavItem>}
          {user.role === 'hr' && <NavItem to="/salary-history">Salary history</NavItem>}
          {isEmployee && <NavItem to="/my-profile">My profile</NavItem>}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-avatar">{String(user.name ?? user.full_name ?? user.email ?? 'U').trim().charAt(0).toUpperCase()}</div>
          <div className="user-meta"><strong>{user.name ?? user.full_name ?? user.email}</strong><span>{ROLE_LABELS[user.role] || user.role}</span></div>
          <button className="logout-button" onClick={handleLogout} aria-label="Sign out" title="Sign out">↗</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar"><span className="topbar-label">Salary management</span><span className="user-email">{user.email}</span></header>
        <div className="content-wrap">
          <ErrorMessage>{logoutError}</ErrorMessage>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
