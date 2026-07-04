import { useEffect, useState } from "react";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";
import { syncFabEntryReturnMeters } from "../utils/reportUtils";
import "./entryForms.css";

const today = new Date().toISOString().split("T")[0];

const createEmptyRow = () => ({
  rollNo: "",
  grinNo: "",
  quality: "",
  meterReceived: "",
  meterReturned: "",
  rate: "",
  amount: "",
  gst: "",
  total: "",
});

const roundValue = (value) => Math.round((Number(value) || 0) * 100) / 100;

const calculateRowValues = (row) => {
  const meterReturned = Number(row.meterReturned) || 0;
  const rate = Number(row.rate) || 0;
  const amount = roundValue(meterReturned * rate);
  const gst = roundValue(amount * 0.05);
  const total = roundValue(amount + gst);

  return {
    amount: row.meterReturned === "" ? "" : String(amount),
    gst: row.meterReturned === "" ? "" : String(gst),
    total: row.meterReturned === "" ? "" : String(total),
  };
};

function ReturnFabricEntry() {
  const [form, setForm] = useState({
    voucherNo: "",
    date: today,
    party: "",
    vendorBillDetail: "",
  });
  const [rows, setRows] = useState([createEmptyRow()]);
  const [availableRolls, setAvailableRolls] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fabEntries = await db.fabEntries.toArray();
    const returns = await db.fabricReturns.toArray();
    const nextVoucher =
      returns.length === 0
        ? 1
        : Math.max(...returns.map((item) => Number(item.voucherNo) || 0)) + 1;

    setAvailableRolls(fabEntries);
    setForm((prev) => ({
      ...prev,
      voucherNo: String(nextVoucher),
    }));
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    const currentRow = updatedRows[index];

    if (field === "rollNo") {
      const selectedRoll = availableRolls.find(
        (roll) => String(roll.rollNo) === String(value)
      );

      updatedRows[index] = {
        ...currentRow,
        rollNo: value,
        grinNo: selectedRoll?.grinNo || "",
        quality: selectedRoll?.quality || "",
        meterReceived: selectedRoll?.meter || "",
        rate: selectedRoll?.rate || "",
      };

      const rowValues = calculateRowValues(updatedRows[index]);
      updatedRows[index] = {
        ...updatedRows[index],
        ...rowValues,
      };

      setRows(updatedRows);
      setForm((prev) => ({
        ...prev,
        party: selectedRoll?.party || prev.party,
      }));
      return;
    }

    updatedRows[index][field] = value;

    const rowValues = calculateRowValues(updatedRows[index]);
    updatedRows[index] = {
      ...updatedRows[index],
      ...rowValues,
    };

    setRows(updatedRows);
  };

  const addRow = () => {
    const lastRow = rows[rows.length - 1];

    if (!lastRow?.rollNo || lastRow?.meterReturned === "") {
      alert("Please complete the current row before adding another one.");
      return;
    }

    setRows([...rows, createEmptyRow()]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) {
      setRows([createEmptyRow()]);
      return;
    }

    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const saveReturn = async () => {
    if (!form.date || !form.party || !form.vendorBillDetail) {
      alert("Please fill date, party, and vendor bill detail.");
      return;
    }

    const validRows = rows.filter(
      (row) => row.rollNo && row.meterReturned !== ""
    );

    if (validRows.length === 0) {
      alert("Please add at least one row with a selected roll and returned meter.");
      return;
    }

    try {
      const payload = validRows.map((row) => ({
        voucherNo: Number(form.voucherNo),
        date: form.date,
        month: getMonth(form.date),
        week: getWeek(form.date),
        party: form.party,
        vendorBillDetail: form.vendorBillDetail,
        rollNo: row.rollNo,
        grinNo: row.grinNo,
        quality: row.quality,
        meterReceived: Number(row.meterReceived) || 0,
        meterReturned: Number(row.meterReturned) || 0,
        rate: Number(row.rate) || 0,
        amount: Number(row.amount) || 0,
        gst: Number(row.gst) || 0,
        total: Number(row.total) || 0,
      }));

      await db.fabricReturns.bulkAdd(payload);
      await syncFabEntryReturnMeters();

      alert("Return Fabric Entry saved successfully.");

      setForm({
        voucherNo: "",
        date: today,
        party: "",
        vendorBillDetail: "",
      });
      setRows([createEmptyRow()]);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Error saving return fabric entry");
    }
  };

  return (
    <div className="entry-page">
      <div className="entry-container">
        <h1 className="entry-title">RETURN FABRIC ENTRY</h1>

        <div className="entry-card">
          <div className="fab-header-grid">
            <div className="entry-field">
              <label className="entry-label">Voucher No.</label>
              <input
                className="entry-input"
                name="voucherNo"
                value={form.voucherNo}
                readOnly
              />
            </div>

            <div className="entry-field">
              <label className="entry-label">Date</label>
              <input
                className="entry-input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleHeaderChange}
              />
            </div>

            <div className="entry-field">
              <label className="entry-label">Party</label>
              <input
                className="entry-input"
                name="party"
                value={form.party}
                readOnly
              />
            </div>

            <div className="entry-field">
              <label className="entry-label">Vendor Bill Detail</label>
              <input
                className="entry-input"
                name="vendorBillDetail"
                value={form.vendorBillDetail}
                onChange={handleHeaderChange}
              />
            </div>
          </div>
        </div>

        <div className="entry-card">
          <div className="fab-table-wrapper">
            <table className="fab-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>GRIN</th>
                  <th>Quality</th>
                  <th>MTR Received</th>
                  <th>MTR Returned</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>GST (5%)</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="table-input"
                        value={row.rollNo}
                        onChange={(e) => handleRowChange(index, "rollNo", e.target.value)}
                      >
                        <option value="">-- Select Roll No --</option>
                        {availableRolls.map((roll) => (
                          <option key={roll.id} value={roll.rollNo}>
                            {roll.rollNo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input className="table-input" value={row.grinNo} readOnly />
                    </td>
                    <td>
                      <input className="table-input" value={row.quality} readOnly />
                    </td>
                    <td>
                      <input className="table-input" value={row.meterReceived} readOnly />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        value={row.meterReturned}
                        onChange={(e) => handleRowChange(index, "meterReturned", e.target.value)}
                      />
                    </td>
                    <td>
                      <input className="table-input" value={row.rate} readOnly />
                    </td>
                    <td>
                      <input className="table-input" value={row.amount} readOnly />
                    </td>
                    <td>
                      <input className="table-input" value={row.gst} readOnly />
                    </td>
                    <td>
                      <input className="table-input" value={row.total} readOnly />
                    </td>
                    <td>
                      <button className="entry-button" type="button" onClick={() => removeRow(index)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fab-actions">
            <button className="entry-button" type="button" onClick={addRow}>
              + Add Row
            </button>
          </div>
        </div>

        <div className="fab-actions">
          <button className="entry-button" type="button" onClick={saveReturn}>
            Save Return
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReturnFabricEntry;
