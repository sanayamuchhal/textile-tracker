import React from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  { id: "dashboard", label: "Dashboard" },
  { id: "masters", label: "Masters" },
  { id: "var", label: "Var Challan" },
  { id: "fab", label: "FAB Entry" },
  { id: "cash", label: "Cashbook" },
  { id: "reports", label: "Reports" },
];

function TopNavbar({ activeModule, onModuleSelect }) {
  const navigate = useNavigate();

  const handleClick = (module) => {
    onModuleSelect(module.id);
    let targetPath = "/";

    switch (module.id) {
      case "dashboard":
        targetPath = "/";
        break;
      case "masters":
        targetPath = "/masters";
        break;
      case "var":
        targetPath = "/var";
        break;
      case "fab":
        targetPath = "/fab";
        break;
      case "cash":
        targetPath = "/cash-book";
        break;
      case "reports":
        targetPath = "/reports";
        break;
      default:
        targetPath = "/";
    }

    navigate(targetPath);
  };
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
            onClick={() => handleClick(module)}
          >
            {module.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default TopNavbar;
