import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canManageEmployees, canManageSalaries, ROLE_LABELS } from '../utils/roles.js';
import { getOrganizationName } from '../utils/organization.js';
import { useState } from 'react';

function NavItem({ to, children, end = false }) {
  return <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{children}</NavLink>;
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isEmployee = user.role === 'employee';
  const organizationName = getOrganizationName(user);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true, state: { notice: 'You have been signed out.' } });
    } catch (error) {
      navigate('/login', {
        replace: true,
        state: { warning: error.response?.data?.message || error.message || 'Your local session ended, but the server could not confirm sign out.' },
      });
    } finally {
      setIsLoggingOut(false);
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
          {(canManageSalaries(user.role) || isEmployee) && <NavItem to={isEmployee ? '/my-salary' : '/salaries'}>{isEmployee ? 'My salary' : 'Salary management'}</NavItem>}
          <NavItem to="/my-profile">My profile</NavItem>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-avatar">{String(user.name ?? user.full_name ?? user.email ?? 'U').trim().charAt(0).toUpperCase()}</div>
          <div className="user-meta"><strong>{user.name ?? user.full_name ?? user.email}</strong><span>{ROLE_LABELS[user.role] || user.role}</span></div>
          <button className="button secondary sidebar-logout" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <span className="topbar-label">{organizationName}</span>
          <div className="topbar-actions">
            <Link className="profile-link" to="/my-profile">{user.name ?? user.full_name ?? user.email}</Link>
            <button className="button secondary topbar-logout" onClick={handleLogout} disabled={isLoggingOut}>
              <span aria-hidden="true">↪</span>{isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </header>
        <div className="content-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
