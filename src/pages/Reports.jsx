import { Link } from "react-router-dom";
import "./Reports.css";

const reports = [
  {
    title: "Fabric Stock Report",
    description: "GRIN roll stock by category.",
    path: "/reports/fabric-stock",
  },
  {
    title: "Cutting Report",
    description: "Cutting meter, PCS and average.",
    path: "/reports/cutting",
  },
  {
    title: "Wages Report",
    description: "Worker balances, jobs and payments.",
    path: "/reports/wages",
  },
  {
    title: "Cash Book Report",
    description: "Cashbook by category and head.",
    path: "/reports/cash-book",
  },
  {
    title: "Product Cost Summary",
    description: "Fabric and VAR cost per piece.",
    path: "/reports/product-cost-summary",
  },
  {
    title: "VAR Cost Detail",
    description: "Roll-wise job type cost breakup.",
    path: "/reports/var-cost-detail",
  },
];

function Reports() {
  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="reports-title">Reports</h1>

        <Link to="/">
          <button>Back to Dashboard</button>
        </Link>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <Link className="report-card" key={report.path} to={report.path}>
            <h2>{report.title}</h2>
            <p>{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Reports;
