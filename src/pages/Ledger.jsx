import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";
import { exportLedger } from "../utils/exportLedger";

function Ledger() {
  const [names, setNames] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);

  const [selectedName, setSelectedName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    const entries = await db.cashEntries.toArray();

    const uniqueNames = [
      ...new Set(
        entries
          .map((e) => (e.name || "").trim())
          .filter((n) => n !== "")
      ),
    ];

    setNames(uniqueNames.sort());
  };

  const showLedger = async () => {
    let entries = await db.cashEntries
      .orderBy("voucherNo")
      .toArray();

    if (selectedName.trim() !== "") {
      entries = entries.filter(
        (e) =>
          (e.name || "").trim().toLowerCase() ===
          selectedName.trim().toLowerCase()
      );
    }

    if (fromDate) {
      entries = entries.filter((e) => e.date >= fromDate);
    }

    if (toDate) {
      entries = entries.filter((e) => e.date <= toDate);
    }

    entries.sort(
      (a, b) => Number(a.voucherNo) - Number(b.voucherNo)
    );

    let balance = 0;

    const result = entries.map((entry) => {
      balance += Number(entry.debit || 0);
      balance -= Number(entry.exp || 0);

      return {
        ...entry,
        balance,
      };
    });

    setLedgerEntries(result);
  };

  const handleExport = () => {
    exportLedger(
      ledgerEntries,
      selectedName,
      fromDate,
      toDate
    );
  };

  const totalDebit = ledgerEntries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const totalExp = ledgerEntries.reduce(
    (sum, e) => sum + Number(e.exp || 0),
    0
  );

  const closingBalance = totalDebit - totalExp;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ledger</h1>

      <label>Name</label>
      <br />

      <select
        value={selectedName}
        onChange={(e) => setSelectedName(e.target.value)}
      >
        <option value="">All Names</option>

        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <label>From Date</label>
      <br />

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <br />
      <br />

      <label>To Date</label>
      <br />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <br />
      <br />

      <button onClick={showLedger}>
        Show Ledger
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={handleExport}
      >
        Export Ledger
      </button>

      <br />
      <br />

      {ledgerEntries.length > 0 && (
        <>
          <h2>
            Ledger : {selectedName || "All Names"}
          </h2>

          <table
            border="1"
            cellPadding="8"
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher</th>
                <th>Remarks</th>
                <th>Debit</th>
                <th>Exp</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.voucherNo}</td>
                  <td>{entry.remarks}</td>
                  <td>{entry.debit}</td>
                  <td>{entry.exp}</td>
                  <td>{entry.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <br />

          <table border="1" cellPadding="8">
            <tbody>
              <tr>
                <td>Total Debit</td>
                <td>{totalDebit}</td>
              </tr>

              <tr>
                <td>Total Exp</td>
                <td>{totalExp}</td>
              </tr>

              <tr>
                <td>
                  <strong>Closing Balance</strong>
                </td>
                <td>
                  <strong>{closingBalance}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {ledgerEntries.length === 0 && (
        <p>No ledger entries found.</p>
      )}

      <br />

      <Link to="/">
        <button>← Dashboard</button>
      </Link>
    </div>
  );
}

export default Ledger;