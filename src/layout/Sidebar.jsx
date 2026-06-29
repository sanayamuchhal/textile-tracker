import React from "react";
import { Link, useLocation } from "react-router-dom";

const moduleSections = {
  dashboard: [
    { label: "Home", path: "/" },
  ],
  var: [
    { label: "Add Entry", path: "/add" },
    { label: "View Entries", path: "/view" },
  ],
  fab: [
    { label: "Add Fabric Entry", path: "/fab/add" },
    { label: "View Fabric Entries", path: "/fab/view" },
    { label: "Cutting Voucher", path: "/fab/cutting-voucher" },
    { label: "Fabric Return", path: "/fab/return" },
    { label: "View Cutting Voucher", path: "/view-cutting-vouchers" },
  ],
  cash: [
    { label: "Add Expense Entry", path: "/cash-entry" },
    { label: "View Cash Entries", path: "/view-cash-entries" },
    { label: "Bank Withdrawal", path: "/bank-withdrawal" },
  ],
  reports: [
    { label: "Cash Book Report", path: "/reports/cash-book" },
    { label: "Cutting Report", path: "/reports/cutting" },
    { label: "Fabric Stock Report", path: "/reports/fabric-stock" },
    { label: "Product Cost Summary", path: "/reports/product-cost-summary" },
    { label: "Variable Cost Detail", path: "/reports/var-cost-detail" },
    { label: "Wages Report", path: "/reports/wages" },
  ],
  export: [
    { label: "Export Page", path: "/export" },
  ],
};

function Sidebar({ activeModule }) {
  const location = useLocation();
  const items = moduleSections[activeModule] || [];

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-header">
        <h3>{activeModule === "dashboard" ? "Dashboard" : activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}</h3>
        <p>Quick access</p>
      </div>

      <nav className="sidebar-links" aria-label="Section navigation">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
