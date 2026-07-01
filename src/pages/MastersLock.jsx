import React, { useState } from "react";

function MastersLock({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === "1234") {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect Password");
    }
  };

  return (
    <div className="masters-lock-screen">
      <div className="master-card">
        <div className="master-card-header">
          <h2>🔒 Masters</h2>
          <p className="master-card-subtitle">Restricted Access</p>
        </div>

        <form className="master-lock-form" onSubmit={handleSubmit}>
          <label className="master-label" htmlFor="master-password">
            Password
          </label>
          <input
            id="master-password"
            className="master-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {error && <div className="master-error">{error}</div>}

          <div className="master-actions">
            <button className="action-button primary" type="submit">
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MastersLock;
