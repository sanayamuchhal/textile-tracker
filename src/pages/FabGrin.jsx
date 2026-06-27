import { Link } from "react-router-dom";

function FabGrin() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>FAB GRIN</h1>

      <br />

      <Link to="/fab/add">
        <button>Add FAB Entry</button>
      </Link>

      <br />
      <br />

      <Link to="/fab/return">
        <button>Fabric Return Input</button>
      </Link>

      <br />
      <br />

      <Link to="/fab/cutting-voucher">
        <button>Cutting Voucher</button>
      </Link>

      <br />
      <br />

      <Link to="/fab/view">
        <button>View FAB Entries</button>
      </Link>

      <br />
      <br />
      <Link to="/view-cutting-vouchers">
  <button>View Cutting Vouchers</button>
</Link>

<br />
<br />

      <Link to="/">
        <button>← Dashboard</button>
      </Link>
    </div>
  );
}

export default FabGrin;
