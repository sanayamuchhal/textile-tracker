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

  const [parties, setParties] = useState([]);
  const [savedRolls, setSavedRolls] = useState([]);

  useEffect(() => {
    loadNextNumbers();
  }, []);

  useEffect(() => {
    let active = true;

    const loadParties = async () => {
      const data = await db.parties.toArray();
      if (active) {
        setParties(data);
      }
    };

    loadParties();
    const interval = setInterval(loadParties, 2500);

    return () => {
      active = false;
      clearInterval(interval);
    };
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
  let nextRoll = 10872;

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
      <div className="entry-container fab-entry-sheet">
        <div className="fab-entry-header">
          <div className="fab-entry-title-row">
            <h1 className="entry-title fab-entry-title">FAB GRIN Entry</h1>
            <div className="fab-entry-status">ERP Data Sheet</div>
          </div>

          <div className="fab-entry-grid">
            <div className="fab-entry-field">
              <label className="entry-label">Date</label>
              <input className="entry-input" type="date" name="date" value={grinDetails.date} onChange={handleGrinChange} />
            </div>

            <div className="fab-entry-field">
              <label className="entry-label">GRIN No.</label>
              <input className="entry-input" name="grinNo" value={grinDetails.grinNo} readOnly />
            </div>

            <div className="fab-entry-field">
              <label className="entry-label">Party</label>
              <select
                className="entry-input"
                name="party"
                value={grinDetails.party}
                onChange={handleGrinChange}
                disabled={parties.length === 0}
              >
                {parties.length === 0 ? (
                  <option value="">No parties available</option>
                ) : (
                  <>
                    <option value="">-- Select Party --</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.name}>
                        {party.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="fab-entry-field">
              <label className="entry-label">Bill No.</label>
              <input className="entry-input" name="invoice" placeholder="Bill No." value={grinDetails.invoice} onChange={handleGrinChange} />
            </div>

            <div className="fab-entry-field">
              <label className="entry-label">Category</label>
              <input className="entry-input" name="category" placeholder="Category" value={grinDetails.category} onChange={handleGrinChange} />
            </div>
          </div>
        </div>

        <div className="fab-entry-table-wrap">
          <table className="fab-entry-table">
            <thead>
              <tr>
                <th>Quality</th>
                <th>MTR</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST (5%)</th>
                <th>Total Amount</th>
                <th>Roll No.</th>
              </tr>
            </thead>
            <tbody>
              {savedRolls.map((item, index) => (
                <tr key={`saved-${index}`}>
                  <td>{item.quality}</td>
                  <td>{item.meter}</td>
                  <td>{item.rate}</td>
                  <td>₹{item.value}</td>
                  <td>₹{Number((item.value * 0.05).toFixed(2))}</td>
                  <td>₹{Number((item.value + item.value * 0.05).toFixed(2))}</td>
                  <td>{item.rollNo}</td>
                </tr>
              ))}

              <tr className="fab-entry-active-row">
                <td>
                  <input className="entry-input spreadsheet-cell" name="quality" placeholder="Quality" value={roll.quality} onChange={handleRollChange} />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" name="meter" placeholder="Meter" value={roll.meter} onChange={handleRollChange} />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" name="rate" placeholder="Rate" value={roll.rate} onChange={handleRollChange} />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" value={value} readOnly />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" value={Number((value * 0.05).toFixed(2))} readOnly />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" value={Number((value + value * 0.05).toFixed(2))} readOnly />
                </td>
                <td>
                  <input className="entry-input spreadsheet-cell" name="rollNo" value={roll.rollNo} readOnly />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="fab-entry-actions">
          <button className="entry-button fab-entry-action-button" onClick={saveRoll}>Save Roll</button>
          <button className="entry-button fab-entry-action-button" onClick={finishGrin}>Save GRIN</button>
        </div>

        {savedRolls.length === 0 && <p className="entry-helper fab-entry-helper">No rolls added yet.</p>}
      </div>
    </div>
  );
}

export default FabEntry;
