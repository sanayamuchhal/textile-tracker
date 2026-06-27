import { useEffect, useState } from "react";
import { db } from "../data/db";
import { Link } from "react-router-dom";

function ViewFabEntries() {
  const [entries, setEntries] = useState([]);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchGrin, setSearchGrin] = useState("");
const [editingRow, setEditingRow] = useState(null);
const [editingCell, setEditingCell] = useState(null);
const [editData, setEditData] = useState({});
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await db.fabEntries.toArray();
    setEntries(data);
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

  setEditData({
    ...entry,
  });
};

const handleEditChange = (field, value) => {
  setEditData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const saveEdit = async () => {
  await db.fabEntries.update(editingRow, editData);

  setEditingRow(null);
  setEditingCell(null);

  loadEntries();
};

const cancelEdit = () => {
  setEditingRow(null);
  setEditingCell(null);
};

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/fab">
        <button>← FAB GRIN</button>
      </Link>

      <br />
      <br />

      <h2>FAB Entries</h2>

      <br />

      <input
        type="text"
        placeholder="Search GRIN Number"
        value={searchGrin}
        onChange={(e) => setSearchGrin(e.target.value)}
      />

      <br />
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
            <th>GRIN</th>
            <th>Roll</th>
            <th>Sheet No</th>
            <th>Party</th>
            <th>Invoice</th>
            <th>Category</th>
            <th>Quality</th>
            <th>Meter</th>
            <th>Rate</th>
            <th>Value</th>
            <th>Return Meter</th>
            <th>PCS Cut</th>
            <th>Delete</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {entries
            .filter(
              (entry) =>
                entry.rollNo
                  ?.toString()
                  .includes(searchRoll) &&
                entry.grinNo
                  ?.toString()
                  .includes(searchGrin)
            )
            .map((entry) => (
              <tr
  key={entry.id}
  style={{
    backgroundColor:
      editingRow === entry.id ? "#fff8dc" : "white",
  }}
>
                <td>{entry.date}</td>
                <td>{entry.month}</td>
                <td>{entry.grinNo}</td>
                <td>{entry.rollNo}</td>
                <td>{entry.sheetNo}</td>
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
      style={{ width: "60px" }}
    />
  ) : editingRow === entry.id ? (
    editData.pcsCut
  ) : (
    entry.pcsCut
  )}
</td>
                <td>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                  >
                    Delete
                  </button>
                </td>
                <td>
  {editingRow === entry.id ? (
    <>
      <button onClick={saveEdit}>
        Save
      </button>

      <button onClick={cancelEdit}>
        Cancel
      </button>
    </>
  ) : (
    <button
      onClick={() => startEditing(entry)}
    >
      Edit
    </button>
  )}
</td>


              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewFabEntries;