import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";

function ViewCuttingVouchers() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const loadEntries = async () => {
    const data = await db.cuttingVouchers.toArray();

    data.sort((a, b) => {
      if (Number(a.rollNo) !== Number(b.rollNo)) {
        return Number(a.rollNo) - Number(b.rollNo);
      }

      return Number(a.articleNo) - Number(b.articleNo);
    });

    setEntries(data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const text = search.toLowerCase();

      return (
        String(entry.rollNo).toLowerCase().includes(text) ||
        String(entry.pattern || "").toLowerCase().includes(text) ||
        String(entry.articleNo).toLowerCase().includes(text)
      );
    });
  }, [entries, search]);

  const startEdit = (entry) => {
    setEditingId(entry.id);

    setEditData({
      ...entry,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };
    const saveEdit = async () => {
    await db.cuttingVouchers.update(editingId, {
      date: editData.date,
      month: editData.month,
      week: editData.week,

      rollNo: editData.rollNo,
      grinNo: editData.grinNo,

      category: editData.category,
      party: editData.party,

      articleNo: Number(editData.articleNo),
      pattern: editData.pattern,

      sheetNo: editData.sheetNo,

      meter: Number(editData.meter) || 0,
      meterCut: Number(editData.meterCut) || 0,
      pcsCut: Number(editData.pcsCut) || 0,
    });

    alert("Cutting Voucher Updated!");

    setEditingId(null);
    setEditData({});

    loadEntries();
  };

  const deleteEntry = async (id) => {
    const ok = window.confirm(
      "Delete this Cutting Voucher?"
    );

    if (!ok) return;

    await db.cuttingVouchers.delete(id);

    loadEntries();
  };
    return (
    <div style={{ padding: 20 }}>
      <Link to="/fab">
        <button>← FAB GRIN</button>
      </Link>

      <h1>View Cutting Vouchers</h1>

      <input
        type="text"
        placeholder="Search Roll No / Pattern / Article No"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: 300,
          marginBottom: 20,
          padding: 8,
        }}
      />

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Roll</th>
            <th>Article</th>
            <th>Pattern</th>
            <th>Sheet</th>
            <th>Category</th>
            <th>Party</th>
            <th>Meter Cut</th>
            <th>PCS Cut</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry.id}>
              {editingId === entry.id ? (
                <>
                  <td>
                    <input
                      name="date"
                      value={editData.date}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="rollNo"
                      value={editData.rollNo}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="articleNo"
                      value={editData.articleNo}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="pattern"
                      value={editData.pattern}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="sheetNo"
                      value={editData.sheetNo}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="category"
                      value={editData.category}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="party"
                      value={editData.party}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="meterCut"
                      value={editData.meterCut}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <input
                      name="pcsCut"
                      value={editData.pcsCut}
                      onChange={handleChange}
                    />
                  </td>

                  <td>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>

                  <td></td>
                </>
              ) : (
                <>
                  <td>{entry.date}</td>
                  <td>{entry.rollNo}</td>
                  <td>{entry.articleNo}</td>
                  <td>{entry.pattern}</td>
                  <td>{entry.sheetNo}</td>
                  <td>{entry.category}</td>
                  <td>{entry.party}</td>
                  <td>{entry.meterCut}</td>
                  <td>{entry.pcsCut}</td>

                  <td>
                    <button onClick={() => startEdit(entry)}>
                      Edit
                    </button>
                  </td>

                  <td>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewCuttingVouchers;