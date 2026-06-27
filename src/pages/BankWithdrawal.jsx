import { useState, useEffect } from "react";
import { db } from "../data/db";
import { Link } from "react-router-dom";
import { getMonth, getWeek } from "../utils/dateHelpers";

function BankWithdrawal() {
  const [banks, setBanks] = useState([]);
  const [voucherNo, setVoucherNo] = useState("");

  const [form, setForm] = useState({
    date: "",
    month: "",
    week: "",
    bankName: "",
    amount: "",
    chequeNo: "",
    balance: 0,
  });

  useEffect(() => {
    loadBanks();
    generateVoucherNo();
  }, []);

  const loadBanks = async () => {
    const data = await db.cashBanks.toArray();
    setBanks(data);
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
      !form.bankName ||
      !form.amount
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Save bank automatically
    const exists = await db.cashBanks
      .where("name")
      .equals(form.bankName)
      .first();

    if (!exists) {
      await db.cashBanks.add({
        name: form.bankName,
      });
    }

    await db.cashEntries.add({
      voucherNo,
      date: form.date,
      month: form.month,
      week: form.week,
      type: "credit",
      bankName: form.bankName,
      amount: Number(form.amount) || 0,
      chequeNo: form.chequeNo,
      balance: 0,
    });

    alert("Bank Withdrawal Saved!");

    setForm({
      date: "",
      month: "",
      week: "",
      bankName: "",
      amount: "",
      chequeNo: "",
      balance: 0,
    });

    loadBanks();
    generateVoucherNo();
  };

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/">⬅ Back</Link>

      <h2>Bank Withdrawal (CRT)</h2>

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

        <label>Bank Name</label>
        <input
          list="cashBanks"
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          placeholder="Enter or Select Bank"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <datalist id="cashBanks">
          {banks.map((bank) => (
            <option key={bank.id} value={bank.name} />
          ))}
        </datalist>

        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Enter Amount"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Cheque No.</label>
        <input
          type="text"
          name="chequeNo"
          value={form.chequeNo}
          onChange={handleChange}
          placeholder="Enter Cheque Number"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button onClick={handleSave}>
          Save Bank Withdrawal
        </button>
      </div>
    </div>
  );
}

export default BankWithdrawal;