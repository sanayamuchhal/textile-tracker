import { Link } from "react-router-dom";

function VarChallan() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>VAR Challan</h1>

      <br />

      <Link to="/add">
        <button>Add Entry</button>
      </Link>

      <br />
      <br />

      <Link to="/view">
        <button>View Entries</button>
      </Link>

      <br />
      <br />

      <Link to="/">
        <button>← Dashboard</button>
      </Link>
    </div>
  );
}

export default VarChallan;