import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../services/api.js';
import { ErrorMessage } from './Feedback.jsx';
import { PasswordInput } from './PasswordInput.jsx';

export function ResourceForm({ title, initialValues, fields, onSubmit, cancelTo, submitLabel = 'Save changes' }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => setValues(initialValues), [initialValues]);
  function update(field, value) { setValues((current) => ({ ...current, [field.name]: value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(values);
      navigate(cancelTo, { replace: true, state: { notice: `${title} saved successfully.` } });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="form-grid">
        {fields.map((field) => (
          <label className={`field ${field.wide ? 'wide' : ''}`} key={field.name}>
            <span>{field.label}{field.required && <i> *</i>}</span>
            {field.type === 'select' ? (
              <select required={field.required} value={values[field.name] ?? ''} onChange={(event) => update(field, event.target.value)}>
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea rows="4" required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ''} onChange={(event) => update(field, event.target.value)} />
            ) : (
              field.type === 'password'
                ? <PasswordInput required={field.required} placeholder={field.placeholder} autoComplete={field.autoComplete} value={values[field.name] ?? ''} onChange={(event) => update(field, event.target.value)} />
                : <input type={field.type || 'text'} required={field.required} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} autoComplete={field.autoComplete} value={values[field.name] ?? ''} onChange={(event) => update(field, event.target.value)} />
            )}
          </label>
        ))}
      </div>
      <div className="form-actions"><button type="button" className="button secondary" onClick={() => navigate(cancelTo)}>Cancel</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button></div>
    </form>
  );
}
