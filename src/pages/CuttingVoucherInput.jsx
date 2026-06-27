import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";

const today = new Date().toISOString().split("T")[0];

function CuttingVoucherInput() {
  const [rolls, setRolls] = useState([]);
  const [form, setForm] = useState({
    date: today,
    rollNo: "",
    grinNo: "",
    category: "",
    party: "",
    meter: "",
    meterCut: "",
    pcsCut: "",
    pattern: "",
    articleNo: "",
    sheetNo: "",
  });

  useEffect(() => {
    let isMounted = true;

    db.fabEntries.toArray().then((data) => {
      if (isMounted) setRolls(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rollNo") {
  const loadRoll = async () => {
    const roll = rolls.find((item) => String(item.rollNo) === value);

    const allVouchers = await db.cuttingVouchers.toArray();

    const nextArticleNo =
      allVouchers.length === 0
        ? 1
        : Math.max(
            ...allVouchers.map((e) => Number(e.articleNo || 0))
          ) + 1;

    setForm((prev) => ({
      ...prev,
      rollNo: value,
      grinNo: roll?.grinNo || "",
      category: roll?.category || "",
      party: roll?.party || "",
      meter: roll?.meter || "",
      sheetNo: roll?.sheetNo || "",
      articleNo: nextArticleNo,
    }));
  };

  loadRoll();
  return;
}

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveVoucher = async () => {
    if (!form.date || !form.rollNo || !form.meterCut || !form.pcsCut) {
      alert("Please fill date, roll number, meter cut and pcs cut.");
      return;
    }

    await db.cuttingVouchers.add({
  ...form,
  articleNo: Number(form.articleNo),
      month: getMonth(form.date),
      week: getWeek(form.date),
      meter: Number(form.meter) || 0,
      meterCut: Number(form.meterCut) || 0,
      pcsCut: Number(form.pcsCut) || 0,
    });

    const roll = rolls.find((item) => String(item.rollNo) === form.rollNo);

    if (roll) {
      await db.fabEntries.update(roll.id, {
        pcsCut: (Number(roll.pcsCut) || 0) + (Number(form.pcsCut) || 0),
        meterCut: (Number(roll.meterCut) || 0) + (Number(form.meterCut) || 0),
        pattern: form.pattern || roll.pattern || "",
      });
    }

    alert("Cutting voucher saved.");
    setForm({
      date: today,
      rollNo: "",
      grinNo: "",
      category: "",
      party: "",
      meter: "",
      meterCut: "",
      pcsCut: "",
      pattern: "",
      articleNo: "",
      sheetNo: "",
    });
    setRolls(await db.fabEntries.toArray());
  };

  return (
    <div style={{ padding: 20 }}>
      <Link to="/fab">
        <button>Back to FAB GRIN</button>
      </Link>

      <h1>Cutting Voucher</h1>

      <div style={{ maxWidth: 520 }}>
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />

        <label>Roll Number</label>
        <input list="cuttingRolls" name="rollNo" value={form.rollNo} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />
        <datalist id="cuttingRolls">
          {rolls.map((roll) => (
            <option key={roll.id} value={roll.rollNo} />
          ))}
        </datalist>

        <label>GRIN</label>
        <input name="grinNo" value={form.grinNo} readOnly style={{ width: "100%", marginBottom: 10 }} />

        <label>Category</label>
        <input name="category" value={form.category} readOnly style={{ width: "100%", marginBottom: 10 }} />

        <label>Party</label>
        <input name="party" value={form.party} readOnly style={{ width: "100%", marginBottom: 10 }} />

        <label>Meter</label>
        <input name="meter" value={form.meter} readOnly style={{ width: "100%", marginBottom: 10 }} />

        <label>Meter Cut</label>
        <input type="number" name="meterCut" value={form.meterCut} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />

        <label>PCS Cut</label>
        <input type="number" name="pcsCut" value={form.pcsCut} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />

        <label>Pattern</label>
        <input name="pattern" value={form.pattern} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />
        <label>Article No</label>
<input
  name="articleNo"
  value={form.articleNo}
  readOnly
  style={{ width: "100%", marginBottom: 10 }}
/>

        <label>Sheet Number</label>
        <input name="sheetNo" value={form.sheetNo} onChange={handleChange} style={{ width: "100%", marginBottom: 10 }} />

        <button onClick={saveVoucher}>Save Cutting Voucher</button>
      </div>
    </div>
  );
}

export default CuttingVoucherInput;
