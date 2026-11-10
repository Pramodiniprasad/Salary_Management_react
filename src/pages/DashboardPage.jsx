import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CARD_CONTENT = {
  organization_admin: [
    { title: 'Manage employees', description: 'View your organisation’s employee directory and update employee records.', to: '/employees', icon: '01' },
    { title: 'Salary management', description: 'Manage employee salary records and review payroll history.', to: '/salaries', icon: '02' },
  ],
  hr: [
    { title: 'Employee directory', description: 'Create and update employee records for your organisation.', to: '/employees', icon: '01' },
    { title: 'Salary management', description: 'Manage salary records and prepare employee payslips.', to: '/salaries', icon: '02' },
  ],
  employee: [
    { title: 'My profile', description: 'View your employee profile and personal information.', to: '/my-profile', icon: '01' },
    { title: 'My salary', description: 'Review your salary information and available payslips.', to: '/my-salary', icon: '02' },
  ],
};

export function DashboardPage() {
  const { user } = useAuth();
  const role = user.role;
  const name = user.name ?? user.full_name ?? user.email?.split('@')[0];
  const cards = CARD_CONTENT[role] || [];
  return (
    <>
      <PageHeader eyebrow="OVERVIEW" title={`Good to see you, ${name}`} description="Here’s your workspace. Choose an area to get started." />
      <div className="welcome-strip"><div className="welcome-icon">✦</div><div><strong>{role === 'employee' ? 'Your employee workspace' : role === 'hr' ? 'Your HR workspace' : 'Your organisation workspace'}</strong><p>Your access is tailored to your role. For account or access changes, contact your organisation administrator.</p></div></div>
      <div className="section-heading"><div><h2>Quick access</h2><p>Go directly to the tools you use most.</p></div></div>
      <div className="quick-grid">
        {cards.map((card) => <Link className="quick-card" to={card.to} key={card.title}><span className="quick-icon">{card.icon}</span><div><h3>{card.title}</h3><p>{card.description}</p></div><span className="quick-arrow">↗</span></Link>)}
      </div>
      <div className="dashboard-footnote">Information shown here is retrieved from your organisation’s Rails service. Access is enforced by the server on every request.</div>
    </>
  );
}
