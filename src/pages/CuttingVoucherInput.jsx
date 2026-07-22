import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";
import { sheetNoForRoll } from "../utils/reportUtils";
import "./entryForms.css";

const today = new Date().toISOString().split("T")[0];

function CuttingVoucherInput() {
  const [rolls, setRolls] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
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
  const uniquePatterns = useMemo(() => {
  return [...new Set(patterns.map((item) => item.category))].sort();
}, [patterns]);

  useEffect(() => {
let isMounted = true;

const loadData = async () => {
const fabData = await db.fabEntries.toArray();
const patternData = await db.patternMaster.toArray();

if (!isMounted) return;

setRolls(fabData);
setPatterns(patternData);
};

loadData();

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
      sheetNo: sheetNoForRoll(allVouchers, value),
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
    if (isSaving) return;

    if (!form.date || !form.rollNo || !form.meterCut || !form.pcsCut) {
      alert("Please fill date, roll number, meter cut and pcs cut.");
      return;
    }
    
    setIsSaving(true);
    try {

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="entry-page">
      <div className="entry-container">
        <h1 className="entry-title">Cutting Voucher</h1>

        <div className="entry-field">
          <label className="entry-label">Date</label>
          <input className="entry-input" type="date" name="date" value={form.date} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Roll Number</label>
          <input className="entry-input" list="cuttingRolls" name="rollNo" value={form.rollNo} onChange={handleChange} />
          <datalist id="cuttingRolls">
            {rolls.map((roll) => (
              <option key={roll.id} value={roll.rollNo} />
            ))}
          </datalist>
        </div>

        <div className="entry-field">
          <label className="entry-label">GRIN</label>
          <input className="entry-input" name="grinNo" value={form.grinNo} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Category</label>
          <input className="entry-input" name="category" value={form.category} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Party</label>
          <input className="entry-input" name="party" value={form.party} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Meter</label>
          <input className="entry-input" name="meter" value={form.meter} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Meter Cut</label>
          <input className="entry-input" type="number" name="meterCut" value={form.meterCut} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">PCS Cut</label>
          <input className="entry-input" type="number" name="pcsCut" value={form.pcsCut} onChange={handleChange} />
        </div>

        <div className="entry-field">
<label className="entry-label">Pattern</label>

<input
className="entry-input"
list="patterns"
name="pattern"
value={form.pattern}
onChange={handleChange}
placeholder="Enter or select pattern"
/>

<datalist id="patterns">
{uniquePatterns.map((pattern) => (
<option
key={pattern}
value={pattern}
/>
))}
</datalist>

</div>

        <div className="entry-field">
          <label className="entry-label">Article No</label>
          <input className="entry-input" name="articleNo" value={form.articleNo} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Sheet Number</label>
          <input className="entry-input" name="sheetNo" value={form.sheetNo} onChange={handleChange} />
        </div>

        <button className="entry-button" onClick={saveVoucher} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Cutting Voucher"}
        </button>
      </div>
    </div>
  );
}

export default CuttingVoucherInput;
