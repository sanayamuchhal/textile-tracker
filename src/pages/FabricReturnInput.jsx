import { useEffect, useState } from "react";
import { db } from "../data/db";
import { getMonth } from "../utils/dateHelpers";
import "./entryForms.css";

const today = new Date().toISOString().split("T")[0];

function FabricReturnInput() {
  const [rolls, setRolls] = useState([]);
  const [form, setForm] = useState({
    voucherNo: "",
    date: today,
    party: "",
    vendorBillDetail: "",
    category: "",
    quality: "",
    meter: "",
    rate: "",
    debitNo: "",
    rollNo: "",
  });

  const getData = async () => {
    const fabEntries = await db.fabEntries.toArray();
    const returns = await db.fabricReturns.toArray();
    const nextVoucher =
      returns.length === 0
        ? 1
        : Math.max(...returns.map((item) => Number(item.voucherNo) || 0)) + 1;

    return { fabEntries, nextVoucher };
  };

  useEffect(() => {
    let isMounted = true;

    getData().then(({ fabEntries, nextVoucher }) => {
      if (!isMounted) return;

      setRolls(fabEntries);
      setForm((prev) => ({
        ...prev,
        voucherNo: String(nextVoucher),
      }));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rollNo") {
      const roll = rolls.find((item) => String(item.rollNo) === value);

      setForm((prev) => ({
        ...prev,
        rollNo: value,
        party: roll?.party || prev.party,
        category: roll?.category || prev.category,
        quality: roll?.quality || prev.quality,
        rate: roll?.rate || prev.rate,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const amount = (Number(form.meter) || 0) * (Number(form.rate) || 0);

  const saveReturn = async () => {
    if (!form.date || !form.party || !form.category || !form.meter) {
      alert("Please fill date, party, category and meter.");
      return;
    }

    await db.fabricReturns.add({
      ...form,
      month: getMonth(form.date),
      voucherNo: Number(form.voucherNo),
      meter: Number(form.meter) || 0,
      rate: Number(form.rate) || 0,
      amount,
    });

    if (form.rollNo) {
      const roll = rolls.find((item) => String(item.rollNo) === form.rollNo);

      if (roll) {
        await db.fabEntries.update(roll.id, {
          returnMeter:
            (Number(roll.returnMeter) || 0) + (Number(form.meter) || 0),
        });
      }
    }

    alert("Fabric return saved.");
    setForm({
      voucherNo: "",
      date: today,
      party: "",
      vendorBillDetail: "",
      category: "",
      quality: "",
      meter: "",
      rate: "",
      debitNo: "",
      rollNo: "",
    });
    const { fabEntries, nextVoucher } = await getData();
    setRolls(fabEntries);
    setForm((prev) => ({
      ...prev,
      voucherNo: String(nextVoucher),
    }));
  };

  return (
    <div className="entry-page">
      <div className="entry-container">
        <h1 className="entry-title">Fabric Return Input</h1>

        <div className="entry-field">
          <label className="entry-label">Voucher Number</label>
          <input className="entry-input" name="voucherNo" value={form.voucherNo} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Date</label>
          <input className="entry-input" type="date" name="date" value={form.date} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Roll Number</label>
          <input className="entry-input" list="returnRolls" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Select roll if return belongs to stock" />
          <datalist id="returnRolls">
            {rolls.map((roll) => (
              <option key={roll.id} value={roll.rollNo} />
            ))}
          </datalist>
        </div>

        <div className="entry-field">
          <label className="entry-label">Party</label>
          <input className="entry-input" name="party" value={form.party} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Vendor Bill Detail</label>
          <input className="entry-input" name="vendorBillDetail" value={form.vendorBillDetail} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Category</label>
          <input className="entry-input" name="category" value={form.category} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Quality</label>
          <input className="entry-input" name="quality" value={form.quality} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Meter</label>
          <input className="entry-input" type="number" name="meter" value={form.meter} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Rate</label>
          <input className="entry-input" type="number" name="rate" value={form.rate} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Debit Number</label>
          <input className="entry-input" name="debitNo" value={form.debitNo} onChange={handleChange} />
        </div>

        <h3 className="entry-summary">Amount: {amount}</h3>

        <button className="entry-button" onClick={saveReturn}>Save Fabric Return</button>
      </div>
    </div>
  );
}

export default FabricReturnInput;
