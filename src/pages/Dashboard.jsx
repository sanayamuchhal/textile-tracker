import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
     
      <h1>Textile Tracker</h1>

      <h3>Dashboard</h3>

      <Link to="/var">
        <button>VAR Challan</button>
      </Link>

      <br />
      <br />

      <Link to="/fab">
        <button>FAB GRIN</button>
      </Link>

      <br />
      <br />

      <Link to="/cash-book">
        <button>Cash Book</button>
      </Link>

      <br />
      <br />

      <Link to="/reports">
        <button>Reports</button>
      </Link>

      <br />
      <br />

      <Link to="/export">
        <button>Export</button>
      </Link>
    </div>
  );
}

export default Dashboard;