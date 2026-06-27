import { useEffect, useState } from "react";
import { db } from "../data/db";
import { Link } from "react-router-dom";

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
    <div style={{ padding: "20px" }}>
      <Link to="/">
        <button>← Dashboard</button>
      </Link>

      <br />
      <br />

      <h2>Saved Entries</h2>

      <br />

      <input
        type="text"
        placeholder="Search Roll Number"
        value={searchRoll}
        onChange={(e) => setSearchRoll(e.target.value)}
      />

      <br />
      <br />

      <table border="1" cellPadding="10">
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
                    onClick={() => deleteEntry(entry.id)}
                    style={{
                      background: "red",
                      color: "white",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewEntries;