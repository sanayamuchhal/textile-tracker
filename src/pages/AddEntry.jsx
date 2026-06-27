import { useState, useEffect } from "react";
import { db } from "../data/db";
import { seedWorkers } from "../data/seedWorkers";
import { seedJobs } from "../data/seedJobs";
import { getMonth, getWeek } from "../utils/dateHelpers";
import { Link } from "react-router-dom";
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
    <div style={{ padding: 20 }}>

    <Link to="/">
      <button>← Dashboard</button>
    </Link>

    <br />
    <br />
      

      <h1>Textile Production Tracker</h1>

      <br />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="text"
        value={formData.challanNo}
        readOnly
        placeholder="Challan No"
      />

      <br />
      <br />

      <select
        name="workerName"
        value={formData.workerName}
        onChange={handleChange}
      >
        <option value="">Select Worker</option>

        {workers.map((w) => (
          <option key={w.id} value={w.name}>
            {w.name}
          </option>
        ))}
      </select>

      <button onClick={() => setShowWorkerInput(!showWorkerInput)}>
        + Add Worker
      </button>

      {showWorkerInput && (
        <>
          <br />
          <br />

          <input
            value={newWorker}
            onChange={(e) => setNewWorker(e.target.value)}
            placeholder="Worker Name"
          />

          <button onClick={addWorker}>Save Worker</button>
        </>
      )}

      <br />
      <br />

      <label>Payment Mode</label>

      <br />

      <select
        name="paymentMode"
        value={formData.paymentMode}
        onChange={handleChange}
      >
        <option value="Cash">Cash</option>
        <option value="Bank">Bank</option>
      </select>

      <br />
      <br />
<label>Sheet Number</label>

<br />

<input
  name="sheetNo"
  value={formData.sheetNo}
  onChange={handleChange}
  placeholder="Sheet Number"
/>

<br />
<br />
      <label>Roll Number</label>

<br />

<select
  name="rollNo"
  value={formData.rollNo}
  onChange={handleChange}
>
  <option value="">Select Roll</option>

  {uniqueRolls.map((roll) => (
    <option key={roll} value={roll}>
      {roll}
    </option>
  ))}
</select>

<br />
<br />
<label>Article Number</label>

<br />

<select
  name="articleNo"
  value={formData.articleNo}
  onChange={handleChange}
>
  <option value="">Select Article</option>

  {availableArticles.map((article) => (
    <option
      key={`${article.rollNo}-${article.articleNo}`}
      value={article.articleNo}
    >
      {article.articleNo}
    </option>
  ))}
</select>

<br />
<br />
<label>Pattern</label>

<br />

<input
  value={formData.pattern}
  readOnly
/>

<br />
<br />

      <select
        name="jobType"
        value={formData.jobType}
        onChange={handleChange}
      >
        <option value="">Select Job</option>

        {jobs.map((j) => (
          <option key={j.id} value={j.name}>
            {j.name}
          </option>
        ))}
      </select>

      <button onClick={() => setShowJobInput(!showJobInput)}>
        + Add Job
      </button>

      {showJobInput && (
        <>
          <br />
          <br />

          <input
            value={newJob}
            onChange={(e) => setNewJob(e.target.value)}
            placeholder="Job Name"
          />

          <button onClick={addJob}>Save Job</button>
        </>
      )}

      <br />
      <br />

      <input
        type="text"
        inputMode="numeric"
        name="pcs"
        value={formData.pcs}
        onChange={handleChange}
        placeholder="PCS"
      />

      <br />
      <br />

      <input
        type="text"
        inputMode="numeric"
        name="rate"
        value={formData.rate}
        onChange={handleChange}
        placeholder="Rate"
      />

      <br />
      <br />

      <h3>Amount: ₹{amount}</h3>

      <br />

      <button onClick={saveEntry}>Save Entry</button>
    </div>
  );
}

export default AddEntry;