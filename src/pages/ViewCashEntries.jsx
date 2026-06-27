import { useEffect, useState } from "react";
import { db } from "../data/db";
import { Link } from "react-router-dom";
import { getMonth, getWeek } from "../utils/dateHelpers";

function ViewCashEntries() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [passwordRow, setPasswordRow] = useState(null);
  const [password, setPassword] = useState("");

  const EDIT_PASSWORD = "1234";

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await db.cashEntries
      .orderBy("voucherNo")
      .toArray();

    let runningBalance = 0;

    const updated = data.map((entry) => {
      if (entry.type === "credit") {
        runningBalance += Number(entry.amount || 0);
      } else {
        runningBalance -= Number(entry.amount || 0);
      }

      return {
        ...entry,
        balance: runningBalance,
      };
    });

    setEntries(updated);
  };

  const handleChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        if (field === "date") {
          return {
            ...entry,
            date: value,
            month: getMonth(value),
            week: getWeek(value),
          };
        }

        return {
          ...entry,
          [field]: value,
        };
      })
    );
  };

  const handleSave = async (entry) => {
    const updateData = {
      date: entry.date,
      month: getMonth(entry.date),
      week: getWeek(entry.date),
      amount: Number(entry.amount) || 0,
    };

    if (entry.type === "debit") {
      updateData.category = entry.category;
      updateData.name = entry.name;
      updateData.narration = entry.narration;
    } else {
      updateData.bankName = entry.bankName;
      updateData.chequeNo = entry.chequeNo;
    }

    await db.cashEntries.update(entry.id, updateData);

    setEditingId(null);
    loadEntries();
  };

  const filteredEntries = entries.filter((entry) => {
    const searchText = search.toLowerCase();

    return (
      entry.voucherNo.toString().includes(search) ||
      (entry.category || "")
        .toLowerCase()
        .includes(searchText) ||
      (entry.bankName || "")
        .toLowerCase()
        .includes(searchText) ||
      (entry.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (entry.narration || "")
        .toLowerCase()
        .includes(searchText) ||
      (entry.chequeNo || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/">⬅ Back</Link>

      <h2>Cash Register</h2>

      <input
        type="text"
        placeholder="Search Voucher, Category, Bank, Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "350px",
          padding: "8px",
          marginBottom: "20px",
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
            <th>Week</th>
            <th>Month</th>
            <th>Category</th>
            <th>Name</th>
            <th>DBT</th>
            <th>CRT</th>
            <th>Narration</th>
            <th>Balance</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
                  {filteredEntries.map((entry) => (
            <>
              <tr key={entry.id}>
                <td>
                  {editingId === entry.id ? (
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) =>
                        handleChange(entry.id, "date", e.target.value)
                      }
                    />
                  ) : (
                    entry.date
                  )}
                </td>

                <td>{entry.week}</td>

                <td>{entry.month}</td>

                <td>
                  {editingId === entry.id ? (
                    entry.type === "debit" ? (
                      <input
                        value={entry.category || ""}
                        onChange={(e) =>
                          handleChange(entry.id, "category", e.target.value)
                        }
                      />
                    ) : (
                      <input
                        value={entry.bankName || ""}
                        onChange={(e) =>
                          handleChange(entry.id, "bankName", e.target.value)
                        }
                      />
                    )
                  ) : entry.type === "debit" ? (
                    entry.category
                  ) : (
                    entry.bankName
                  )}
                </td>

                <td>
                  {entry.type === "debit" ? (
                    editingId === entry.id ? (
                      <input
                        value={entry.name || ""}
                        onChange={(e) =>
                          handleChange(entry.id, "name", e.target.value)
                        }
                      />
                    ) : (
                      entry.name
                    )
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  {entry.type === "debit" ? (
                    editingId === entry.id ? (
                      <input
                        type="number"
                        value={entry.amount}
                        onChange={(e) =>
                          handleChange(entry.id, "amount", e.target.value)
                        }
                      />
                    ) : (
                      entry.amount
                    )
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  {entry.type === "credit" ? (
                    editingId === entry.id ? (
                      <input
                        type="number"
                        value={entry.amount}
                        onChange={(e) =>
                          handleChange(entry.id, "amount", e.target.value)
                        }
                      />
                    ) : (
                      entry.amount
                    )
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  {editingId === entry.id ? (
                    entry.type === "debit" ? (
                      <input
                        value={entry.narration || ""}
                        onChange={(e) =>
                          handleChange(entry.id, "narration", e.target.value)
                        }
                      />
                    ) : (
                      <input
                        value={entry.chequeNo || ""}
                        onChange={(e) =>
                          handleChange(entry.id, "chequeNo", e.target.value)
                        }
                      />
                    )
                  ) :entry.type === "debit" ? (
  entry.narration
) : (
  `Cheque No: ${entry.chequeNo || ""}`
)}
                </td>

                <td>{entry.balance}</td>

                <td>
                  {editingId === entry.id ? (
                    <button onClick={() => handleSave(entry)}>
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPasswordRow(entry.id);
                        setPassword("");
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td>
  <button
    onClick={async () => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
        await db.cashEntries.delete(entry.id);
        loadEntries();
      }
    }}
  >
    Delete
  </button>
</td>
              </tr>

              {passwordRow === entry.id && (
                <tr>
                  <td colSpan="11">
                    <input
                      type="password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      onClick={() => {
                        if (password === EDIT_PASSWORD) {
                          setEditingId(entry.id);
                          setPasswordRow(null);
                          setPassword("");
                        } else {
                          alert("Incorrect Password");
                        }
                      }}
                    >
                      Unlock
                    </button>

                    <button
                      onClick={() => {
                        setPasswordRow(null);
                        setPassword("");
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )}
            </>
          ))}
                    {filteredEntries.length === 0 && (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No Cash Entries Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ViewCashEntries;