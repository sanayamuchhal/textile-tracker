import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import { ensurePatternMasterSeed } from "../data/seedPatternMaster";
import { exportRows } from "../utils/reportUtils";
import "./Reports.css";

const initialForm = {
  category: "",
  job: "",
};

function normalizeValue(value) {
  return String(value || "").trim();
}

function normalizeKey(value) {
  return normalizeValue(value).toLowerCase();
}

function PatternMaster() {
  const [patternRows, setPatternRows] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobName, setEditingJobName] = useState("");
  const [error, setError] = useState("");

  const loadPatternMaster = async () => {
    await ensurePatternMasterSeed();
    const rows = await db.patternMaster.toArray();
    setPatternRows(rows);
  };

  useEffect(() => {
    let isMounted = true;

    ensurePatternMasterSeed()
      .then(() => db.patternMaster.toArray())
      .then((rows) => {
        if (!isMounted) return;

        setPatternRows(rows);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedPatterns = useMemo(() => {
    return patternRows.reduce((groups, row) => {
      const key = row.category;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(row);
      return groups;
    }, {});
  }, [patternRows]);

  const categories = useMemo(
    () => Object.keys(groupedPatterns).sort((a, b) => a.localeCompare(b)),
    [groupedPatterns]
  );
  const exportData = useMemo(() => {
    return categories.flatMap((category) =>
      groupedPatterns[category].map((row) => ({
        Category: row.category,
        Job: row.job,
      }))
    );
  }, [categories, groupedPatterns]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const category = normalizeValue(formData.category);
    const job = normalizeValue(formData.job);
    const savedCategory =
      categories.find(
        (existingCategory) =>
          normalizeKey(existingCategory) === normalizeKey(category)
      ) || category;

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!job) {
      setError("Job name is required.");
      return;
    }

    const duplicate = patternRows.some(
      (row) =>
        normalizeKey(row.category) === normalizeKey(savedCategory) &&
        normalizeKey(row.job) === normalizeKey(job)
    );

    if (duplicate) {
      setError("This job already exists in this category.");
      return;
    }

    await db.patternMaster.add({ category: savedCategory, job });
    setFormData({ category: savedCategory, job: "" });
    setError("");
    loadPatternMaster();
  };

  const startCategoryEdit = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category);
    setEditingJobId(null);
    setError("");
  };

  const saveCategoryEdit = async () => {
    const newCategory = normalizeValue(editingCategoryName);

    if (!newCategory) {
      setError("Category is required.");
      return;
    }

    const duplicateCategory = categories.some(
      (category) =>
        category !== editingCategory &&
        normalizeKey(category) === normalizeKey(newCategory)
    );

    if (duplicateCategory) {
      setError("A category with this name already exists.");
      return;
    }

    const categoryRows = patternRows.filter(
      (row) => row.category === editingCategory
    );

    await db.transaction("rw", db.patternMaster, async () => {
      await Promise.all(
        categoryRows.map((row) =>
          db.patternMaster.update(row.id, { category: newCategory })
        )
      );
    });

    setEditingCategory("");
    setEditingCategoryName("");
    setFormData((prev) => ({
      ...prev,
      category: prev.category === editingCategory ? newCategory : prev.category,
    }));
    setError("");
    loadPatternMaster();
  };

  const deleteCategory = async (category) => {
    const confirmDelete = window.confirm(
      `Delete ${category} and all jobs under it?`
    );

    if (!confirmDelete) return;

    await db.patternMaster.where("category").equals(category).delete();

    if (formData.category === category) {
      setFormData(initialForm);
    }

    setError("");
    loadPatternMaster();
  };

  const startJobEdit = (row) => {
    setEditingJobId(row.id);
    setEditingJobName(row.job);
    setEditingCategory("");
    setError("");
  };

  const saveJobEdit = async (row) => {
    const job = normalizeValue(editingJobName);

    if (!job) {
      setError("Job name is required.");
      return;
    }

    const duplicate = patternRows.some(
      (item) =>
        item.id !== row.id &&
        normalizeKey(item.category) === normalizeKey(row.category) &&
        normalizeKey(item.job) === normalizeKey(job)
    );

    if (duplicate) {
      setError("This job already exists in this category.");
      return;
    }

    await db.patternMaster.update(row.id, { job });
    setEditingJobId(null);
    setEditingJobName("");
    setError("");
    loadPatternMaster();
  };

  const deleteJob = async (row) => {
    const confirmDelete = window.confirm(`Delete job ${row.job}?`);

    if (!confirmDelete) return;

    await db.patternMaster.delete(row.id);
    setError("");
    loadPatternMaster();
  };

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Masters</p>
          <h2 className="data-page-title">Pattern Master</h2>
        </div>
        <button
          className="report-export-button"
          onClick={() => exportRows(exportData, "Pattern_Master")}
        >
          Export to Excel
        </button>
      </div>

      <div className="data-page-grid">
        <div className="master-form-card">
          <div className="card-header">
            <h3>Add Category Job</h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="master-field">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="entry-input"
                list="pattern-categories"
                placeholder="Enter or select category"
              />
              <datalist id="pattern-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="master-field">
              <label htmlFor="job">Job *</label>
              <input
                id="job"
                name="job"
                value={formData.job}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter job name"
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
                onClick={() => {
                  setFormData(initialForm);
                  setError("");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="master-table-card">
          <div className="card-header">
            <h3>Saved Patterns</h3>
          </div>

          <div className="data-table-shell">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Jobs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="report-empty">
                      No patterns found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category}>
                      <td>
                        {editingCategory === category ? (
                          <input
                            className="data-inline-field"
                            value={editingCategoryName}
                            onChange={(event) =>
                              setEditingCategoryName(event.target.value)
                            }
                          />
                        ) : (
                          category
                        )}
                      </td>
                      <td>
                        <div className="pattern-job-list">
                          {groupedPatterns[category].map((row) => (
                            <span className="pattern-job-chip" key={row.id}>
                              {editingJobId === row.id ? (
                                <input
                                  className="pattern-job-input"
                                  value={editingJobName}
                                  onChange={(event) =>
                                    setEditingJobName(event.target.value)
                                  }
                                />
                              ) : (
                                row.job
                              )}
                              {editingJobId === row.id ? (
                                <>
                                  <button
                                    type="button"
                                    className="pattern-chip-button"
                                    onClick={() => saveJobEdit(row)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="pattern-chip-button"
                                    onClick={() => setEditingJobId(null)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="pattern-chip-button"
                                    onClick={() => startJobEdit(row)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="pattern-chip-button danger"
                                    onClick={() => deleteJob(row)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {editingCategory === category ? (
                          <>
                            <button
                              className="action-button primary"
                              type="button"
                              onClick={saveCategoryEdit}
                            >
                              Save
                            </button>
                            <button
                              className="action-button secondary"
                              type="button"
                              onClick={() => setEditingCategory("")}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-button secondary"
                              type="button"
                              onClick={() => startCategoryEdit(category)}
                            >
                              Edit Category
                            </button>
                            <button
                              className="action-button danger"
                              type="button"
                              onClick={() => deleteCategory(category)}
                            >
                              Delete Category
                            </button>
                          </>
                        )}
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

export default PatternMaster;
