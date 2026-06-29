import { useEffect, useState } from "react";
import { db } from "../data/db";
import "./Reports.css";

function ViewEntries() {
  const [entries, setEntries] = useState([]);
  const [searchRoll, setSearchRoll] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await db.entries.toArray();
    setEntries(data);
  };

  const deleteEntry = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );

    if (!confirmDelete) return;

    await db.entries.delete(id);

    loadEntries();
  };

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Records</p>
          <h2 className="data-page-title">Saved Entries</h2>
        </div>
      </div>

      <div className="data-toolbar">
        <input
          className="data-search"
          type="text"
          placeholder="Search Roll Number"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
        />
      </div>

      <div className="data-table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Month</th>
              <th>Week</th>
              <th>Worker</th>
              <th>Roll No</th>
              <th>Challan No</th>
              <th>Sheet No</th>
              <th>Job Type</th>
              <th>PCS</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {entries
              .filter((entry) =>
                entry.rollNo
                  ?.toString()
                  .toLowerCase()
                  .includes(searchRoll.toLowerCase())
              )
              .map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.month}</td>
                  <td>{entry.week}</td>
                  <td>{entry.workerName}</td>
                  <td>{entry.rollNo}</td>
                  <td>{entry.challanNo}</td>
                  <td>{entry.sheetNo}</td>
                  <td>{entry.jobType}</td>
                  <td>{entry.pcs}</td>
                  <td>{entry.rate}</td>
                  <td>{entry.amount}</td>

                  <td>
                    <button
                      className="action-button danger"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewEntries;