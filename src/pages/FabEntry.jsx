import { useState, useEffect } from "react";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";
import "./entryForms.css";

const today = new Date().toISOString().split("T")[0];

function FabEntry() {
  const [grinDetails, setGrinDetails] = useState({
    date: today,
    grinNo: "",
    party: "",
    invoice: "",
    category: "",
  });

  const [roll, setRoll] = useState({
  rollNo: "",
  quality: "",
  meter: "",
  rate: "",
  category: "",
});


  const [savedRolls, setSavedRolls] = useState([]);
  useEffect(() => {
  loadNextNumbers();
}, []);

const loadNextNumbers = async () => {
  const entries = await db.fabEntries.toArray();

  // Next GRIN Number
  let nextGrin = 1;

  if (entries.length > 0) {
    nextGrin =
      Math.max(...entries.map((e) => Number(e.grinNo))) + 1;
  }

  // Next Roll Number
  let nextRoll = 1;

  if (entries.length > 0) {
    nextRoll =
      Math.max(...entries.map((e) => Number(e.rollNo))) + 1;
  }

  setGrinDetails((prev) => ({
    ...prev,
    grinNo: String(nextGrin),
  }));

  setRoll((prev) => ({
    ...prev,
    rollNo: String(nextRoll),
  }));
};

  const handleGrinChange = (e) => {
    setGrinDetails({
      ...grinDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleRollChange = (e) => {
    setRoll({
      ...roll,
      [e.target.name]: e.target.value,
    });
  };

  const value = Math.round(
  ((Number(roll.meter) || 0) *
    (Number(roll.rate) || 0)) * 100
) / 100;

  const saveRoll = async () => {
    if (
      !grinDetails.grinNo ||
      !roll.rollNo ||
      !roll.quality
    ) {
      alert("Please fill required fields.");
      return;
    }

    const entry = {
  date: grinDetails.date,
  month: getMonth(grinDetails.date),
  week: getWeek(grinDetails.date),

  grinNo: Number(grinDetails.grinNo),

  party: grinDetails.party,
  invoice: grinDetails.invoice,
  sheetNo: grinDetails.sheetNo,
  category: grinDetails.category,

  rollNo: roll.rollNo,
  quality: roll.quality,

  meter: Number(roll.meter),
  rate: Number(roll.rate),
  value,
};
    setSavedRolls((prev) => [...prev, entry]);

    setRoll((prev) => ({
  rollNo: String(Number(prev.rollNo) + 1),
  quality: "",
  meter: "",
  rate: "",
}));
  };
const finishGrin = async () => {
  if (savedRolls.length === 0) {
    alert("No rolls added!");
    return;
  }

  try {
    await db.fabEntries.bulkAdd(savedRolls);

    alert("GRIN Saved Successfully!");

    setSavedRolls([]);

    loadNextNumbers();

  } catch (err) {
    console.error(err);
    alert("Error saving GRIN");
  }
};

  return (
    <div className="entry-page">
      <div className="entry-container">
        <h1 className="entry-title">FAB Entry</h1>

        <h3 className="entry-label">GRIN Details</h3>

        <div className="entry-field">
          <label className="entry-label">Date</label>
          <input className="entry-input" type="date" name="date" value={grinDetails.date} onChange={handleGrinChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">GRIN No</label>
          <input className="entry-input" name="grinNo" value={grinDetails.grinNo} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Party</label>
          <input className="entry-input" name="party" placeholder="Party" value={grinDetails.party} onChange={handleGrinChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Invoice</label>
          <input className="entry-input" name="invoice" placeholder="Invoice" value={grinDetails.invoice} onChange={handleGrinChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Sheet Number</label>
          <input className="entry-input" name="sheetNo" placeholder="Sheet Number" value={grinDetails.sheetNo} onChange={handleGrinChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Category</label>
          <input className="entry-input" name="category" placeholder="Category" value={grinDetails.category} onChange={handleGrinChange} />
        </div>

        <h3 className="entry-label">Current Roll</h3>

        <div className="entry-field">
          <label className="entry-label">Roll No</label>
          <input className="entry-input" name="rollNo" value={roll.rollNo} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Quality</label>
          <input className="entry-input" name="quality" placeholder="Quality" value={roll.quality} onChange={handleRollChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Meter</label>
          <input className="entry-input" name="meter" placeholder="Meter" value={roll.meter} onChange={handleRollChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Rate</label>
          <input className="entry-input" name="rate" placeholder="Rate" value={roll.rate} onChange={handleRollChange} />
        </div>

        <p className="entry-summary">Value : ₹ {value}</p>

        <button className="entry-button" onClick={saveRoll}>Save Roll</button>
        <div className="entry-field" />
        <button className="entry-button" onClick={finishGrin}>Finish GRIN</button>

        <div className="entry-field" />

        <h2 className="entry-title">Added Rolls</h2>

        {savedRolls.length === 0 && <p className="entry-helper">No rolls added.</p>}

        {savedRolls.map((item, index) => (
          <div key={index} style={{ border: "1px solid #cbd5e1", borderRadius: 4, padding: 10, marginBottom: 8, background: "#ffffff" }}>
            <p className="entry-helper"><strong>Roll No:</strong> {item.rollNo}</p>
            <p className="entry-helper"><strong>Quality:</strong> {item.quality}</p>
            <p className="entry-helper"><strong>Meter:</strong> {item.meter}</p>
            <p className="entry-helper"><strong>Rate:</strong> {item.rate}</p>
            <p className="entry-helper"><strong>Value:</strong> ₹{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FabEntry;