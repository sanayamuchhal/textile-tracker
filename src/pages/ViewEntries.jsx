import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import ImportExcelButton from "../components/ImportExcelButton";
import { exportRows } from "../utils/reportUtils";
import "./Reports.css";

function ViewEntries() {
  const [entries, setEntries] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedRollNumber, setSelectedRollNumber] = useState("");

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

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesWeek = !selectedWeek || String(entry.week) === selectedWeek;
      const matchesWorker =
        !selectedWorker || String(entry.workerName) === selectedWorker;
      const matchesRollNumber =
        !selectedRollNumber || String(entry.rollNo) === selectedRollNumber;

      return matchesWeek && matchesWorker && matchesRollNumber;
    });
  }, [entries, selectedWeek, selectedWorker, selectedRollNumber]);

  const weekOptions = useMemo(() => {
    return [...new Set(entries.map((entry) => entry.week).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })
    );
  }, [entries]);

  const workerOptions = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesWeek = !selectedWeek || String(entry.week) === selectedWeek;
      const matchesRollNumber =
        !selectedRollNumber || String(entry.rollNo) === selectedRollNumber;
      return matchesWeek && matchesRollNumber;
    });

    return [...new Set(filtered.map((entry) => entry.workerName).filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })
    );
  }, [entries, selectedWeek, selectedRollNumber]);

  const rollNumberOptions = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesWeek = !selectedWeek || String(entry.week) === selectedWeek;
      const matchesWorker =
        !selectedWorker || String(entry.workerName) === selectedWorker;
      return matchesWeek && matchesWorker;
    });

    return [...new Set(filtered.map((entry) => entry.rollNo).filter(Boolean))].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [entries, selectedWeek, selectedWorker]);

  const exportData = useMemo(() => {
    return filteredEntries.map((entry) => ({
      "Challan No": entry.challanNo,
      Date: entry.date,
      Month: entry.month,
      Week: entry.week,
      "Roll No": entry.rollNo,
      "Article No": entry.articleNo,
      "Sheet No": entry.sheetNo,
      Worker: entry.workerName,
      "Job Type": entry.jobType,
      PCS: entry.pcs,
      Rate: entry.rate,
      Amount: entry.amount,
    }));
  }, [filteredEntries]);

  useEffect(() => {
    if (selectedWeek && !weekOptions.includes(selectedWeek)) {
      setSelectedWeek("");
    }
  }, [selectedWeek, weekOptions]);

  useEffect(() => {
    if (selectedWorker && !workerOptions.includes(selectedWorker)) {
      setSelectedWorker("");
    }
  }, [selectedWorker, workerOptions]);

  useEffect(() => {
    if (selectedRollNumber && !rollNumberOptions.includes(selectedRollNumber)) {
      setSelectedRollNumber("");
    }
  }, [selectedRollNumber, rollNumberOptions]);

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Records</p>
          <h2 className="data-page-title">Saved Entries</h2>
        </div>
        <div className="report-action-group">
          <button
            className="report-export-button"
            onClick={() => exportRows(exportData, "VAR_Challan_Entries")}
          >
            Export to Excel
          </button>
          <ImportExcelButton />
        </div>
      </div>

      <div className="data-toolbar">
        <label className="report-filter-field">
          <span>Week</span>
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
            <option value="">All</option>
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </label>

        <label className="report-filter-field">
          <span>Worker</span>
          <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
            <option value="">All</option>
            {workerOptions.map((worker) => (
              <option key={worker} value={worker}>
                {worker}
              </option>
            ))}
          </select>
        </label>

        <label className="report-filter-field">
          <span>Roll Number</span>
          <select value={selectedRollNumber} onChange={(e) => setSelectedRollNumber(e.target.value)}>
            <option value="">All</option>
            {rollNumberOptions.map((rollNumber) => (
              <option key={rollNumber} value={rollNumber}>
                {rollNumber}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="data-table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan No</th>
              <th>Date</th>
              <th>Month</th>
              <th>Week</th>
              <th>Roll No</th>
              <th>Article No</th>
              <th>Sheet No</th>
              <th>Worker</th>
              <th>Job Type</th>
              <th>PCS</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.challanNo}</td>
                  <td>{entry.date}</td>
                  <td>{entry.month}</td>
                  <td>{entry.week}</td>
                  <td>{entry.rollNo}</td>
                  <td>{entry.articleNo}</td>
                  <td>{entry.sheetNo}</td>
                  <td>{entry.workerName}</td>
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
