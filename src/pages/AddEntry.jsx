import { useState, useEffect } from "react";
import { db } from "../data/db";
import { seedWorkers } from "../data/seedWorkers";
import { seedJobs } from "../data/seedJobs";
import { getMonth, getWeek } from "../utils/dateHelpers";
import "./entryForms.css";
const today = new Date().toISOString().split("T")[0];

function AddEntry() {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cuttingVouchers, setCuttingVouchers] = useState([]);
  const [newWorker, setNewWorker] = useState("");
  const [newJob, setNewJob] = useState("");
  const [showWorkerInput, setShowWorkerInput] = useState(false);
  const [showJobInput, setShowJobInput] = useState(false);

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
    (async () => {
      await seedWorkers();
      await seedJobs();

      setWorkers(await db.workers.toArray());
setJobs(await db.jobs.toArray());

const vouchers = await db.cuttingVouchers.toArray();
setCuttingVouchers(vouchers);

await loadNextChallan();
    })();
  }, []);
  const uniqueRolls = [
  ...new Set(cuttingVouchers.map(v => String(v.rollNo)))
];
const availableArticles = cuttingVouchers.filter(
  (v) => String(v.rollNo) === String(formData.rollNo)
);
const handleChange = (e) => {
  const { name, value } = e.target;

  // Roll Number changed
  if (name === "rollNo") {
    const articles = cuttingVouchers.filter(
      (v) => String(v.rollNo) === String(value)
    );

    if (articles.length > 0) {
      const first = articles[0];

      setFormData((prev) => ({
  ...prev,
  rollNo: value,
  articleNo: String(first.articleNo),
  pattern: first.pattern || "",
}));
    } else {
      setFormData((prev) => ({
        ...prev,
        rollNo: value,
        articleNo: "",
        pattern: "",
        sheetNo: "",
      }));
    }

    return;
  }

  // Article Number changed
  if (name === "articleNo") {
    const article = cuttingVouchers.find(
      (v) =>
        String(v.rollNo) === String(formData.rollNo) &&
        String(v.articleNo) === String(value)
    );

    setFormData((prev) => ({
  ...prev,
  articleNo: value,
  pattern: article?.pattern || "",
}));
    return;
  }

  // Everything else
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
const addWorker = async () => {
  const name = newWorker.trim();

  if (!name) {
    return alert("Enter worker name");
  }

  if (
    workers.some(
      (w) => w.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    return alert("Worker already exists");
  }

  await db.workers.add({ name });

  setWorkers(await db.workers.toArray());

  setFormData((prev) => ({
    ...prev,
    workerName: name,
  }));

  setNewWorker("");
  setShowWorkerInput(false);
};
  const addJob = async () => {
    const name = newJob.trim();

    if (!name) return alert("Enter job name");

    if (
      jobs.some(
        (j) => j.name.toLowerCase() === name.toLowerCase()
      )
    )
      return alert("Job already exists");

    await db.jobs.add({ name });

    setJobs(await db.jobs.toArray());

    setFormData((p) => ({
      ...p,
      jobType: name,
    }));

    setNewJob("");
    setShowJobInput(false);
  };

  const amount = (+formData.pcs || 0) * (+formData.rate || 0);

 const saveEntry = async () => {
  await db.entries.add({
    ...formData,
    month: getMonth(formData.date),
    week: getWeek(formData.date),

    challanNo: Number(formData.challanNo),
    articleNo: Number(formData.articleNo),

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
            {workers.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <button className="entry-button" onClick={() => setShowWorkerInput(!showWorkerInput)}>
            + Add Worker
          </button>
        </div>

        {showWorkerInput && (
          <>
            <div className="entry-field">
              <input className="entry-input" value={newWorker} onChange={(e) => setNewWorker(e.target.value)} placeholder="Worker Name" />
            </div>
            <div className="entry-field">
              <button className="entry-button" onClick={addWorker}>Save Worker</button>
            </div>
          </>
        )}

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
          <select className="entry-select" name="articleNo" value={formData.articleNo} onChange={handleChange}>
            <option value="">Select Article</option>
            {availableArticles.map((article) => (
              <option key={`${article.rollNo}-${article.articleNo}`} value={article.articleNo}>
                {article.articleNo}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <label className="entry-label">Pattern</label>
          <input className="entry-input" value={formData.pattern} readOnly />
        </div>

        <div className="entry-field">
          <label className="entry-label">Job Type</label>
          <select className="entry-select" name="jobType" value={formData.jobType} onChange={handleChange}>
            <option value="">Select Job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.name}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        <div className="entry-field">
          <button className="entry-button" onClick={() => setShowJobInput(!showJobInput)}>
            + Add Job
          </button>
        </div>

        {showJobInput && (
          <>
            <div className="entry-field">
              <input className="entry-input" value={newJob} onChange={(e) => setNewJob(e.target.value)} placeholder="Job Name" />
            </div>
            <div className="entry-field">
              <button className="entry-button" onClick={addJob}>Save Job</button>
            </div>
          </>
        )}

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