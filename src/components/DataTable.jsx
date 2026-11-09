import { useMemo, useState } from 'react';
import { EmptyState } from './Feedback.jsx';

export function DataTable({ columns, rows, rowKey = 'id', searchable = true, pageSize = 8, emptyMessage }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? rows.filter((row) => columns.some((column) =>
      String(column.value ? column.value(row) : row[column.key] ?? '').toLowerCase().includes(needle))) : rows;
  }, [columns, query, rows]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <section className="table-card">
      {searchable && (
        <div className="table-toolbar">
          <label className="search-field">
            <span className="sr-only">Search records</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search records…" />
          </label>
          <span className="muted">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={row[rowKey] ?? index}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (column.value ? column.value(row) : row[column.key]) ?? '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <EmptyState>{emptyMessage || 'No matching records found.'}</EmptyState>}
      </div>
      {filtered.length > pageSize && (
        <div className="pagination">
          <span className="muted">Page {currentPage} of {pages}</span>
          <div>
            <button className="button secondary small" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <button className="button secondary small" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
}
