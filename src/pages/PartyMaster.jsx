import { useEffect, useMemo, useState } from "react";
import { db } from "../data/db";
import ImportExcelButton from "../components/ImportExcelButton";
import { exportRows } from "../utils/reportUtils";
import "./Reports.css";

const initialForm = {
  id: null,
  name: "",
  address: "",
  contactPerson: "",
  mobile: "",
  gst: "",
};

function PartyMaster() {
  const [formData, setFormData] = useState(initialForm);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    const data = await db.parties.toArray();
    setParties(data);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setFormData(initialForm);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("Party Name is required.");
      return;
    }

    const duplicate = await db.parties
      .where("name")
      .equalsIgnoreCase(trimmedName)
      .first();

    if (duplicate && duplicate.id !== formData.id) {
      setError("Party Name already exists.");
      return;
    }

    const payload = {
      name: trimmedName,
      address: formData.address.trim(),
      contactPerson: formData.contactPerson.trim(),
      mobile: formData.mobile.trim(),
      gst: formData.gst.trim(),
    };

    if (formData.id) {
      await db.parties.update(formData.id, payload);
    } else {
      await db.parties.add(payload);
    }

    clearForm();
    loadParties();
  };

  const handleEdit = (party) => {
    setError("");
    setFormData({
      id: party.id,
      name: party.name,
      address: party.address || "",
      contactPerson: party.contactPerson || "",
      mobile: party.mobile || "",
      gst: party.gst || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this party?"
    );
    if (!confirmDelete) return;

    await db.parties.delete(id);
    if (formData.id === id) {
      clearForm();
    }
    loadParties();
  };

  const formTitle = formData.id ? "Edit Party" : "Add Party";
  const exportData = useMemo(() => {
    return parties.map((party) => ({
      "Party Name": party.name,
      Address: party.address,
      "Contact Person": party.contactPerson,
      Mobile: party.mobile,
      GST: party.gst,
    }));
  }, [parties]);

  return (
    <div className="data-page">
      <div className="data-page-header">
        <div>
          <p className="report-kicker">Masters</p>
          <h2 className="data-page-title">Party Master</h2>
        </div>
        <div className="report-action-group">
          <button
            className="report-export-button"
            onClick={() => exportRows(exportData, "Party_Master")}
          >
            Export to Excel
          </button>
          <ImportExcelButton />
        </div>
      </div>

      <div className="data-page-grid">
        <div className="master-form-card">
          <div className="card-header">
            <h3>{formTitle}</h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="master-field">
              <label htmlFor="name">Party Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter party name"
              />
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
              <label htmlFor="contactPerson">Contact Person</label>
              <input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter contact person"
              />
            </div>

            <div className="master-field">
              <label htmlFor="mobile">Mobile Number (Optional)</label>
              <input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter mobile number"
              />
            </div>

            <div className="master-field">
              <label htmlFor="gst">GST Number</label>
              <input
                id="gst"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                className="entry-input"
                placeholder="Enter GST number"
              />
            </div>

            {error && <div className="data-help-text" style={{ color: "#b91c1c" }}>{error}</div>}

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
            <h3>Saved Parties</h3>
          </div>

          <div className="data-table-shell">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Party Name</th>
                  <th>Address</th>
                  <th>Contact Person</th>
                  <th>Mobile</th>
                  <th>GST</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="report-empty">
                      No parties found.
                    </td>
                  </tr>
                ) : (
                  parties.map((party) => (
                    <tr key={party.id}>
                      <td>{party.name}</td>
                      <td>{party.address}</td>
                      <td>{party.contactPerson}</td>
                      <td>{party.mobile}</td>
                      <td>{party.gst}</td>
                      <td>
                        <button
                          className="action-button secondary"
                          type="button"
                          onClick={() => handleEdit(party)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-button danger"
                          type="button"
                          onClick={() => handleDelete(party.id)}
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

export default PartyMaster;
