import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import ImportExcelButton from "../components/ImportExcelButton";
import { exportRows, sheetNoForRoll } from "../utils/reportUtils";
import "./Reports.css";

function ViewFabEntries() {
  const [entries, setEntries] = useState([]);
  const [cuttingVouchers, setCuttingVouchers] = useState([]);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchGrin, setSearchGrin] = useState("");
const [editingRow, setEditingRow] = useState(null);
const [editingCell, setEditingCell] = useState(null);
const [editData, setEditData] = useState({});
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const [fabData, cuttingData] = await Promise.all([
      db.fabEntries.toArray(),
      db.cuttingVouchers.toArray(),
    ]);
    setEntries(fabData);
    setCuttingVouchers(cuttingData);
  };

  const deleteEntry = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this FAB Entry?"
    );

    if (!confirmDelete) return;

    await db.fabEntries.delete(id);

    loadEntries();
  };
  const startEditing = (entry) => {
  setEditingRow(entry.id);
  setEditingCell(null);

  const editableEntry = { ...entry };
  delete editableEntry.sheetNo;

  setEditData({
    ...editableEntry,
  });
};

const handleEditChange = (field, value) => {
  setEditData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const saveEdit = async () => {
  const updatedEntry = { ...editData };
  delete updatedEntry.sheetNo;

  await db.fabEntries.update(editingRow, updatedEntry);

  setEditingRow(null);
  setEditingCell(null);

  loadEntries();
};

const cancelEdit = () => {
  setEditingRow(null);
  setEditingCell(null);
};

const filteredEntries = useMemo(() => {
  return entries.filter(
    (entry) =>
      entry.rollNo
        ?.toString()
        .includes(searchRoll) &&
      entry.grinNo
        ?.toString()
        .includes(searchGrin)
  );
}, [entries, searchRoll, searchGrin]);

const exportData = useMemo(() => {
  return filteredEntries.map((entry) => ({
    Date: entry.date,
    Month: entry.month,
    GRIN: entry.grinNo,
    Party: entry.party,
    Invoice: entry.invoice,
    Category: entry.category,
    Quality: entry.quality,
    Meter: entry.meter,
    Rate: entry.rate,
    Value: Number(Number(entry.value || 0).toFixed(2)),
    "Return Meter": entry.returnMeter,
    "PCS Cut": entry.pcsCut,
    "Roll No": entry.rollNo,
    "Sheet No": sheetNoForRoll(cuttingVouchers, entry.rollNo),
  }));
}, [cuttingVouchers, filteredEntries]);

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Records</p>
          <h2 className="data-page-title">FAB Entries</h2>
        </div>
        <div className="report-action-group">
          <button
            className="report-export-button"
            onClick={() => exportRows(exportData, "FAB_Entries")}
          >
            Export to Excel
          </button>
          <ImportExcelButton />
        </div>
      </div>

      <div className="data-toolbar">
        <input
          className="data-search"
          type="text"
          placeholder="Search GRIN Number"
          value={searchGrin}
          onChange={(e) => setSearchGrin(e.target.value)}
        />
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
              <th>GRIN</th>
              <th>Party</th>
              <th>Invoice</th>
              <th>Category</th>
              <th>Quality</th>
              <th>Meter</th>
              <th>Rate</th>
              <th>Value</th>
              <th>Return Meter</th>
              <th>PCS Cut</th>
              <th>Roll No</th>
              <th>Sheet No</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className={editingRow === entry.id ? "data-row-editing" : ""}
                >
                  <td>{entry.date}</td>
                  <td>{entry.month}</td>
                  <td>{entry.grinNo}</td>
                  <td>{entry.party}</td>
                  <td>{entry.invoice}</td>
                  <td>{entry.category}</td>
                  <td>{entry.quality}</td>
                  <td>{entry.meter}</td>
                  <td>{entry.rate}</td>
                  <td>{parseFloat(entry.value.toFixed(2))}</td>
                  <td>{entry.returnMeter}</td>
                  <td
                    onClick={() => {
                      if (editingRow === entry.id) {
                        setEditingCell("pcsCut");
                      }
                    }}
                  >
                    {editingRow === entry.id &&
                    editingCell === "pcsCut" ? (
                      <input
                        type="number"
                        value={editData.pcsCut}
                        autoFocus
                        onChange={(e) =>
                          handleEditChange("pcsCut", Number(e.target.value))
                        }
                        onBlur={() => setEditingCell(null)}
                        className="data-inline-field"
                      />
                    ) : editingRow === entry.id ? (
                      editData.pcsCut
                    ) : (
                      entry.pcsCut
                    )}
                  </td>
                  <td>{entry.rollNo}</td>
                  <td>{sheetNoForRoll(cuttingVouchers, entry.rollNo) || "-"}</td>
                  <td>
                    {editingRow === entry.id ? (
                      <>
                        <button className="action-button primary" onClick={saveEdit}>
                          Save
                        </button>
                        <button className="action-button secondary" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="action-button secondary"
                        onClick={() => startEditing(entry)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
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

export default ViewFabEntries;
