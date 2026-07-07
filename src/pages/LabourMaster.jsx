import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import { exportRows } from "../utils/reportUtils";
import "./Reports.css";

const initialForm = {
  id: null,
  name: "",
  jobs: [],
  address: "",
  aadhaarNo: "",
  mobileNo: "",
};

function normalizeJobs(jobs) {
  const seen = new Set();

  return (Array.isArray(jobs) ? jobs : [])
    .map((job) => String(job || "").trim())
    .filter(Boolean)
    .filter((job) => {
      const key = job.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

function LabourMaster() {
  const [formData, setFormData] = useState(initialForm);
  const [labours, setLabours] = useState([]);
  const [jobInput, setJobInput] = useState("");
  const [error, setError] = useState("");

  const getMasterData = async () => {
    const labourData = await db.labours.orderBy("name").toArray();

    return { labourData };
  };

  const loadMasterData = async () => {
    const { labourData } = await getMasterData();
    setLabours(labourData);
  };

  useEffect(() => {
    let isMounted = true;

    getMasterData().then(({ labourData }) => {
      if (!isMounted) return;

      setLabours(labourData);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "name") {
      const matchingLabour = labours.find(
        (labour) => labour.name.toLowerCase() === value.trim().toLowerCase()
      );

      if (matchingLabour) {
        setFormData({
          id: matchingLabour.id,
          name: matchingLabour.name,
          jobs: normalizeJobs(matchingLabour.jobs),
          address: matchingLabour.address || "",
          aadhaarNo: matchingLabour.aadhaarNo || "",
          mobileNo: matchingLabour.mobileNo || "",
        });
        setError("");
        return;
      }

      setFormData((prev) => ({
        ...initialForm,
        name: value,
        jobs: prev.id ? [] : prev.jobs,
      }));
      setError("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addJob = () => {
    const job = jobInput.trim();

    if (!job) {
      setError("Enter a job name before adding.");
      return;
    }

    const duplicate = formData.jobs.some(
      (item) => item.toLowerCase() === job.toLowerCase()
    );

    if (duplicate) {
      setError("This job is already added for this labour.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      jobs: [...prev.jobs, job],
    }));
    setJobInput("");
    setError("");
  };

  const removeJob = (jobToRemove) => {
    setFormData((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((job) => job !== jobToRemove),
    }));
  };

  const clearForm = () => {
    setFormData(initialForm);
    setJobInput("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError("Labour Name is required.");
      return;
    }

    const existingLabour = await db.labours
      .where("name")
      .equalsIgnoreCase(trimmedName)
      .first();

    const payload = {
      name: existingLabour?.name || trimmedName,
      jobs: normalizeJobs(formData.jobs),
      address: formData.address.trim(),
      aadhaarNo: formData.aadhaarNo.trim(),
      mobileNo: formData.mobileNo.trim(),
    };

    if (existingLabour) {
      await db.labours.update(existingLabour.id, payload);
    } else if (formData.id) {
      await db.labours.update(formData.id, {
        ...payload,
        name: trimmedName,
      });
    } else {
      await db.labours.add(payload);
    }

    clearForm();
    loadMasterData();
  };

  const handleEdit = (labour) => {
    setError("");
    setFormData({
      id: labour.id,
      name: labour.name,
      jobs: normalizeJobs(labour.jobs),
      address: labour.address || "",
      aadhaarNo: labour.aadhaarNo || "",
      mobileNo: labour.mobileNo || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this labour?"
    );

    if (!confirmDelete) return;

    await db.labours.delete(id);

    if (formData.id === id) {
      clearForm();
    }

    loadMasterData();
  };

  const formTitle = formData.id ? "Edit Labour" : "Add Labour";
  const exportData = useMemo(() => {
    return labours.map((labour) => ({
      "Labour Name": labour.name,
      Jobs: Array.isArray(labour.jobs) ? labour.jobs.join(", ") : "",
      Address: labour.address,
      "Aadhaar Number": labour.aadhaarNo,
      "Mobile Number": labour.mobileNo,
    }));
  }, [labours]);

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Masters</p>
          <h2 className="data-page-title">Labour Master</h2>
        </div>
        <button
          className="report-export-button"
          onClick={() => exportRows(exportData, "Labour_Master")}
        >
          Export to Excel
        </button>
      </div>

      <div className="data-page-grid">
        <div className="master-form-card">
          <div className="card-header">
            <h3>{formTitle}</h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="master-field">
              <label htmlFor="name">Labour Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter labour name"
              />
            </div>

            <div className="master-field">
              <label htmlFor="jobs">Jobs</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="jobs"
                  value={jobInput}
                  onChange={(event) => setJobInput(event.target.value)}
                  className="entry-input"
                  placeholder="Enter job name"
                />
                <button
                  className="action-button secondary"
                  type="button"
                  onClick={addJob}
                >
                  Add Job
                </button>
              </div>
              <div className="data-help-text">
                Add each job manually for this labour.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {formData.jobs.map((job) => (
                  <span
                    key={job}
                    style={{
                      alignItems: "center",
                      border: "1px solid #d9d9d9",
                      borderRadius: "999px",
                      display: "inline-flex",
                      gap: "6px",
                      padding: "6px 10px",
                    }}
                  >
                    {job}
                    <button
                      type="button"
                      onClick={() => removeJob(job)}
                      style={{
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="master-field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="entry-textarea"
                placeholder="Enter address"
              />
            </div>

            <div className="master-field">
              <label htmlFor="aadhaarNo">Aadhaar Number</label>
              <input
                id="aadhaarNo"
                name="aadhaarNo"
                value={formData.aadhaarNo}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter Aadhaar number"
              />
            </div>

            <div className="master-field">
              <label htmlFor="mobileNo">Mobile Number</label>
              <input
                id="mobileNo"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter mobile number"
              />
            </div>

            {error && (
              <div className="data-help-text" style={{ color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <div className="data-toolbar">
              <button className="action-button primary" type="submit">
                Save
              </button>
              <button
                className="action-button secondary"
                type="button"
                onClick={clearForm}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="master-table-card">
          <div className="card-header">
            <h3>Saved Labours</h3>
          </div>

          <div className="data-table-shell">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Labour Name</th>
                  <th>Jobs</th>
                  <th>Address</th>
                  <th>Aadhaar Number</th>
                  <th>Mobile Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labours.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="report-empty">
                      No labours found.
                    </td>
                  </tr>
                ) : (
                  labours.map((labour) => (
                    <tr key={labour.id}>
                      <td>{labour.name}</td>
                      <td>{Array.isArray(labour.jobs) ? labour.jobs.join(", ") : ""}</td>
                      <td>{labour.address}</td>
                      <td>{labour.aadhaarNo}</td>
                      <td>{labour.mobileNo}</td>
                      <td>
                        <button
                          className="action-button secondary"
                          type="button"
                          onClick={() => handleEdit(labour)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-button danger"
                          type="button"
                          onClick={() => handleDelete(labour.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabourMaster;
