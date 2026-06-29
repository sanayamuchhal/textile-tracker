import React from "react";

const modules = [
  { id: "dashboard", label: "Dashboard" },
  { id: "var", label: "Var Challan" },
  { id: "fab", label: "Fab Entry" },
  { id: "cash", label: "Cash Book" },
  { id: "reports", label: "Reports" },
  { id: "export", label: "Export" },
];

function TopNavbar({ activeModule, onModuleSelect }) {
  return (
    <header className="top-navbar">
      <div className="brand-block">
        <div className="brand-mark">T</div>
        <div>
          <div className="brand-title">Textile Tracker</div>
          <div className="brand-subtitle">ERP Workspace</div>
        </div>
      </div>

      <nav className="top-nav-links" aria-label="Primary navigation">
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            className={`nav-pill ${activeModule === module.id ? "active" : ""}`}
            onClick={() => onModuleSelect(module.id)}
          >
            {module.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default TopNavbar;
