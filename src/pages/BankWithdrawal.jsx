import { useState, useEffect } from "react";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";
import "./entryForms.css";

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
    <div className="entry-page">
      <div className="entry-container">
        <h2 className="entry-title">Bank Withdrawal (CRT)</h2>

        <div className="entry-field">
          <label className="entry-label">Voucher No.</label>
          <input className="entry-input" type="text" value={voucherNo} disabled />
        </div>

        <div className="entry-field">
          <label className="entry-label">Date</label>
          <input className="entry-input" type="date" name="date" value={form.date} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Month</label>
          <input className="entry-input" type="text" value={form.month} disabled />
        </div>

        <div className="entry-field">
          <label className="entry-label">Week</label>
          <input className="entry-input" type="text" value={form.week} disabled />
        </div>

        <div className="entry-field">
          <label className="entry-label">Bank Name</label>
          <input className="entry-input" list="cashBanks" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Enter or Select Bank" />
          <datalist id="cashBanks">
            {banks.map((bank) => (
              <option key={bank.id} value={bank.name} />
            ))}
          </datalist>
        </div>

        <div className="entry-field">
          <label className="entry-label">Amount</label>
          <input className="entry-input" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter Amount" />
        </div>

        <div className="entry-field">
          <label className="entry-label">Cheque No.</label>
          <input className="entry-input" type="text" name="chequeNo" value={form.chequeNo} onChange={handleChange} placeholder="Enter Cheque Number" />
        </div>

        <button className="entry-button" onClick={handleSave}>Save Bank Withdrawal</button>
      </div>
    </div>
  );
}

export default BankWithdrawal;