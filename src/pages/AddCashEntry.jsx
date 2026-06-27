import { useState, useEffect } from "react";
import { db } from "../data/db";
import { Link } from "react-router-dom";
import { getMonth, getWeek } from "../utils/dateHelpers";

function AddCashEntry() {
  const [categories, setCategories] = useState([]);
  const [voucherNo, setVoucherNo] = useState("");

 const [form, setForm] = useState({
  date: "",
  month: "",
  week: "",
  category: "",
  paymentMode: "",
  name: "",
  amount: "",
  narration: "",
  balance: 0,
});

  useEffect(() => {
    loadCategories();
    generateVoucherNo();
  }, []);

  const loadCategories = async () => {
    const data = await db.cashCategories.toArray();
    setCategories(data);
  };

  const generateVoucherNo = async () => {
    const entries = await db.cashEntries.toArray();

    const next =
      entries.length === 0
        ? 1
        : Math.max(...entries.map((e) => Number(e.voucherNo))) + 1;

    setVoucherNo(next);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      setForm({
        ...form,
        date: value,
        month: getMonth(value),
        week: getWeek(value),
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (
      !form.date ||
      !form.category ||
      !form.name ||
      !form.amount
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Save category automatically
    const exists = await db.cashCategories
      .where("name")
      .equals(form.category)
      .first();

    if (!exists) {
      await db.cashCategories.add({
        name: form.category,
      });
    }

    await db.cashEntries.add({
  voucherNo,
  date: form.date,
  month: form.month,
  week: form.week,
  type: "debit",
  category: form.category,
  paymentMode: form.paymentMode,
  name: form.name,
  amount: Number(form.amount) || 0,
  narration: form.narration,
  balance: 0,
});
    alert("Expense Entry Saved!");

    setForm({
  date: "",
  month: "",
  week: "",
  category: "",
  paymentMode: "",
  name: "",
  amount: "",
  narration: "",
  balance: 0,
});

    loadCategories();
    generateVoucherNo();
  };

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/">⬅ Back</Link>

      <h2>Add Expense Entry</h2>

      <div style={{ maxWidth: "450px" }}>
                <label>Voucher No.</label>
        <input
          type="text"
          value={voucherNo}
          disabled
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Month</label>
        <input
          type="text"
          value={form.month}
          disabled
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Week</label>
        <input
          type="text"
          value={form.week}
          disabled
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Category</label>
        <input
          list="cashCategories"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Enter or Select Category"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <datalist id="cashCategories">
          {categories.map((category) => (
            <option key={category.id} value={category.name} />
          ))}
        </datalist>

        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter Name"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label>Payment Mode</label>
<select
  name="paymentMode"
  value={form.paymentMode}
  onChange={handleChange}
  style={{ width: "100%", marginBottom: "10px" }}
>
  <option value="">Select Payment Mode</option>
  <option value="Cash">Cash</option>
  <option value="Bank">Bank</option>
</select>

        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Enter Amount"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Narration</label>
        <textarea
          name="narration"
          value={form.narration}
          onChange={handleChange}
          rows="3"
          placeholder="Enter Narration"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button onClick={handleSave}>
          Save Expense
        </button>
              </div>
    </div>
  );
}

export default AddCashEntry;
      
