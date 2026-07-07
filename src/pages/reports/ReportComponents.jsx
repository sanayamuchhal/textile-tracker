import "../Reports.css";

export function ReportPage({ title, filters, rows, onExport, children, columnLabels }) {
  return (
    <div className="report-shell">
      <div className="report-toolbar">
        <div>
          <p className="report-kicker">Reports</p>
          <h1 className="report-title">{title}</h1>
        </div>
        <button className="report-export-button" onClick={onExport}>
          Export to Excel
        </button>
      </div>

      {filters && <div className="report-filter-bar">{filters}</div>}

      <div className="report-section">
  {children ? children : <ReportTable rows={rows} columnLabels={columnLabels} />}
</div>
    </div>
  );
}

export function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="report-filter-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ReportTable({ rows, columnLabels = {} }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{columnLabels[column] || column}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{row[column]}</td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td className="report-empty" colSpan={Math.max(columns.length, 1)}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
