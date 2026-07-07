import { useState, useEffect } from "react";
import { db } from "../data/db";
import { liveQuery } from "dexie";
import { getMonth, getWeek } from "../utils/dateHelpers";
import "./entryForms.css";
const today = new Date().toISOString().split("T")[0];

function AddEntry() {
  const [labours, setLabours] = useState([]);
  const [fabEntries, setFabEntries] = useState([]);
  const [cuttingVouchers, setCuttingVouchers] = useState([]);

 const [formData, setFormData] = useState({
  date: today,
  challanNo: "",
  workerName: "",
  sheetNo: "",
  rollNo: "",
  articleNo: "",
  pattern: "",
  jobType: "",
  pcs: "",
  rate: "",
  paymentMode: "Cash",
});

  const loadNextChallan = async () => {
    const entries = await db.entries.toArray();

    const nums = entries
      .map((e) => Number(e.challanNo))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    let next = 1;

    for (const n of nums) {
      if (n === next) next++;
      else if (n > next) break;
    }

    setFormData((prev) => ({
      ...prev,
      challanNo: String(next),
    }));
  };

  useEffect(() => {
  const fabSub = liveQuery(() => db.fabEntries.toArray()).subscribe({
    next: setFabEntries,
    error: console.error,
  });

  const voucherSub = liveQuery(() => db.cuttingVouchers.toArray()).subscribe({
    next: setCuttingVouchers,
    error: console.error,
  });

  loadNextChallan();

  return () => {
    fabSub.unsubscribe();
    voucherSub.unsubscribe();
  };
}, []);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.labours.orderBy("name").toArray()
    ).subscribe({
      next: (data) => setLabours(data),
      error: (error) => console.error(error),
    });

    return () => subscription.unsubscribe();
  }, []);

  const uniqueRolls = [
    ...new Set(fabEntries.map((entry) => String(entry.rollNo)).filter(Boolean)),
  ].sort((a, b) => Number(a) - Number(b));
  const selectedLabour = labours.find(
    (labour) => labour.name === formData.workerName
  );
  const assignedJobs = Array.isArray(selectedLabour?.jobs)
    ? selectedLabour.jobs
    : [];

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "workerName") {
    const labour = labours.find((item) => item.name === value);
    const labourJobs = Array.isArray(labour?.jobs) ? labour.jobs : [];

    setFormData((prev) => ({
      ...prev,
      workerName: value,
      jobType: labourJobs.includes(prev.jobType) ? prev.jobType : "",
    }));

    return;
  }

 if (name === "rollNo") {
  const matchingVoucher = cuttingVouchers
    .filter((voucher) => String(voucher.rollNo) === String(value))
    .sort((a, b) => Number(b.articleNo) - Number(a.articleNo))[0];
    console.log(cuttingVouchers);
console.log(value);
console.log(matchingVoucher);

  setFormData((prev) => ({
    ...prev,
    rollNo: value,
    articleNo: matchingVoucher?.articleNo || "",
    pattern: matchingVoucher?.pattern || "",
  }));

  return;
}

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const amount = (+formData.pcs || 0) * (+formData.rate || 0);

 const saveEntry = async () => {
  await db.entries.add({
    ...formData,
    month: getMonth(formData.date),
    week: getWeek(formData.date),

    challanNo: Number(formData.challanNo),
    articleNo: formData.articleNo || "",

    amount,
  });

  alert("Entry Saved Successfully!");

  setFormData({
    date: today,
    challanNo: "",
    workerName: "",
    sheetNo: "",
    rollNo: "",
    articleNo: "",
    pattern: "",
    jobType: "",
    pcs: "",
    rate: "",
    paymentMode: "Cash",
  });

  await loadNextChallan();
  setFabEntries(await db.fabEntries.toArray());
  setCuttingVouchers(await db.cuttingVouchers.toArray());
};

  return (
    <div className="entry-page">
      <div className="entry-container">
        <h1 className="entry-title">Textile Production Tracker</h1>

        <div className="entry-field">
          <label className="entry-label">Date</label>
          <input className="entry-input" type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>

        <div className="entry-field">
          <label className="entry-label">Challan No</label>
          <input className="entry-input" type="text" value={formData.challanNo} readOnly placeholder="Challan No" />
        </div>

        <div className="entry-field">
          <label className="entry-label">Worker</label>
          <select className="entry-select" name="workerName" value={formData.workerName} onChange={handleChange}>
            <option value="">Select Worker</option>
            {labours.map((labour) => (
              <option key={labour.id} value={labour.name}>
                {labour.name}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <label className="entry-label">Payment Mode</label>
          <select className="entry-select" name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
        </div>

        <div className="entry-field">
          <label className="entry-label">Sheet Number</label>
          <input className="entry-input" name="sheetNo" value={formData.sheetNo} onChange={handleChange} placeholder="Sheet Number" />
        </div>

        <div className="entry-field">
          <label className="entry-label">Roll Number</label>
          <select className="entry-select" name="rollNo" value={formData.rollNo} onChange={handleChange}>
            <option value="">Select Roll</option>
            {uniqueRolls.map((roll) => (
              <option key={roll} value={roll}>
                {roll}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <label className="entry-label">Article Number</label>
          <input
            className="entry-input"
            name="articleNo"
            value={formData.articleNo}
            readOnly
            placeholder="Article Number"
          />
        </div>

        <div className="entry-field">
          <label className="entry-label">Pattern</label>
          <input className="entry-input" value={formData.pattern} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Job Type</label>
          <select className="entry-select" name="jobType" value={formData.jobType} onChange={handleChange}>
            <option value="">
              {formData.workerName ? "Select Job" : "Select Worker First"}
            </option>
            {assignedJobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <label className="entry-label">PCS</label>
          <input className="entry-input" type="text" inputMode="numeric" name="pcs" value={formData.pcs} onChange={handleChange} placeholder="PCS" />
        </div>

        <div className="entry-field">
          <label className="entry-label">Rate</label>
          <input className="entry-input" type="text" inputMode="numeric" name="rate" value={formData.rate} onChange={handleChange} placeholder="Rate" />
        </div>

        <p className="entry-summary">Amount: ₹{amount}</p>

        <button className="entry-button" onClick={saveEntry}>Save Entry</button>
      </div>
    </div>
  );
}

export default AddEntry;
