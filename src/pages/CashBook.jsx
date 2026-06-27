import { Link } from "react-router-dom";

function CashBook() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Cash Book</h2>

      <br />

      <Link to="/cash-entry">
        <button style={{ marginRight: "10px" }}>
          Expense Entry (DBT)
        </button>
      </Link>

      <Link to="/bank-withdrawal">
        <button>
          Bank Withdrawal (CRT)
        </button>
      </Link>

      <br />
      <br />

      <Link to="/view-cash-entries">
        <button>View Cash Entries</button>
      </Link>

      <br />
      <br />

      <Link to="/">
        <button>← Dashboard</button>
      </Link>
    </div>
  );
}

export default CashBook;