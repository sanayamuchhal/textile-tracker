import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";

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
    <div style={{ padding: 20 }}>

      <Link to="/fab">
        <button>← FAB GRIN</button>
      </Link>

      <h1>FAB Entry</h1>

      <hr />

      <h3>GRIN Details</h3>

      <input
        type="date"
        name="date"
        value={grinDetails.date}
        onChange={handleGrinChange}
      />

      <br /><br />

      <input
  name="grinNo"
  value={grinDetails.grinNo}
  readOnly
/>
      <br /><br />

      <input
        name="party"
        placeholder="Party"
        value={grinDetails.party}
        onChange={handleGrinChange}
      />

      <br /><br />

      <input
        name="invoice"
        placeholder="Invoice"
        value={grinDetails.invoice}
        onChange={handleGrinChange}
      />

      <br /><br />
      <input
  name="sheetNo"
  placeholder="Sheet Number"
  value={grinDetails.sheetNo}
  onChange={handleGrinChange}
/>

<br /><br />

      <input
        name="category"
        placeholder="Category"
        value={grinDetails.category}
        onChange={handleGrinChange}
      />

      <hr />

      <h3>Current Roll</h3>

      <input
  name="rollNo"
  value={roll.rollNo}
  readOnly
/>

      <br /><br />

      <input
        name="quality"
        placeholder="Quality"
        value={roll.quality}
        onChange={handleRollChange}
      />

      <br /><br />

      <input
        name="meter"
        placeholder="Meter"
        value={roll.meter}
        onChange={handleRollChange}
      />

      <br /><br />

      <input
        name="rate"
        placeholder="Rate"
        value={roll.rate}
        onChange={handleRollChange}
      />

      <br /><br />

      

      <h3>Value : ₹ {value}</h3>

    

      <button onClick={saveRoll}>
        Save Roll
      </button>
      <br /><br />

<button onClick={finishGrin}>
  Finish GRIN
</button>

      <hr />

      <h2>Added Rolls</h2>

      {savedRolls.length === 0 && (
        <p>No rolls added.</p>
      )}

      {savedRolls.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <strong>Roll :</strong> {item.rollNo}

          <br />

          <strong>Quality :</strong> {item.quality}

          <br />

          <strong>Meter :</strong> {item.meter}

          <br />

          <strong>Rate :</strong> {item.rate}

          <br />

          <strong>Value :</strong> ₹ {item.value}
        </div>
      ))}

    </div>
  );
}

export default FabEntry;