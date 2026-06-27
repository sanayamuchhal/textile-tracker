import { Link } from "react-router-dom";

export function ReportPage({ title, filters, rows, onExport, children }) {
  return (
    <div style={{ padding: 20 }}>
      <Link to="/reports">
        <button>Back to Reports</button>
      </Link>

      <h1>{title}</h1>

      {filters && (
        <div style={{ marginBottom: 16 }}>
          {filters}
        </div>
      )}

      {children}

      <button onClick={onExport} style={{ marginBottom: 12 }}>
        Export to Excel
      </button>

      <ReportTable rows={rows} />
    </div>
  );
}

export function SelectFilter({ label, value, options, onChange }) {
  return (
    <label style={{ display: "inline-block", marginRight: 12, marginBottom: 10 }}>
      {label}
      <br />
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

export function ReportTable({ rows }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", minWidth: "100%" }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
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
              <td colSpan={Math.max(columns.length, 1)}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
