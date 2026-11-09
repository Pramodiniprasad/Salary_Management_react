import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../../components/Feedback.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { getErrorMessage, salarySlipsApi } from '../../services/api.js';

export function SalarySlipPage() {
  const { id } = useParams();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    salarySlipsApi.get(id).then((result) => { if (active) setSlip(result?.salary_slip ?? result); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  async function download() {
    try {
      const response = await salarySlipsApi.download(id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salary-slip-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  if (loading) return <LoadingState label="Loading payslip…" />;
  const lines = [['Employee', slip?.employee_name ?? slip?.employee?.name], ['Employee ID', slip?.employee_id], ['Pay period', slip?.pay_period ?? slip?.period], ['Basic salary', slip?.basic_salary], ['Allowances', slip?.allowances], ['Deductions', slip?.deductions], ['Net salary', slip?.net_salary]];
  return <>
    <PageHeader eyebrow="PAYSLIP" title="Salary slip" description="Your salary statement for the selected pay period." action={<button className="button primary" onClick={download}>Download PDF</button>} />
    <ErrorMessage>{error}</ErrorMessage>
    {slip && <section className="detail-card payslip"><div className="payslip-heading"><div><span className="eyebrow">SALARY STATEMENT</span><h2>{slip.pay_period ?? slip.period ?? 'Pay period'}</h2></div><span className="status-pill">{slip.status || 'Processed'}</span></div><div className="detail-grid">{lines.map(([label, value]) => <div className={`detail-item ${label === 'Net salary' ? 'highlight' : ''}`} key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div><div className="payslip-footer"><Link to="/salaries">← Back to salary details</Link></div></section>}
  </>;
}
