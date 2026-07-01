import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const moduleSections = {
  dashboard: [{ label: "Home", path: "/" }],

  var: [
    { label: "Add Entry", path: "/add" },
  ],

  fab: [
    { label: "Add Fabric Entry", path: "/fab/add" },
   
    { label: "Cutting Voucher", path: "/fab/cutting-voucher" },
    { label: "Fabric Return", path: "/fab/return" },
    
  ],

  cash: [
    { label: "Add Expense Entry", path: "/cash-entry" },
   
    { label: "Bank Withdrawal", path: "/bank-withdrawal" },
  ],

  reports: [
    {
      heading: "VAR Challan",
      children: [
        { label: "View Entries", path: "/view" },
      ],
    },
    {
      heading: "Fabric",
      children: [
        { label: "View Fabric Entries", path: "/fab/view" },
        { label: "View Cutting Voucher", path: "/view-cutting-vouchers" },
        { label: "Fabric Stock Report", path: "/reports/fabric-stock" },
        { label: "Cutting Report", path: "/reports/cutting" },
        { label: "Product Cost Summary", path: "/reports/product-cost-summary" },
      ],
    },
    {
      heading: "Cashbook",
      children: [
        { label: "View Cash Entries", path: "/view-cash-entries" },
        { label: "Cash Book Report", path: "/reports/cash-book" },
        { label: "Wages Report", path: "/reports/wages" },
      ],
    },
    {
      heading: "Cost Analysis",
      children: [
        { label: "Variable Cost Detail", path: "/reports/var-cost-detail" },
      ],
    },
  ],

  export: [{ label: "Export Page", path: "/export" }],
};

function Sidebar({ activeModule }) {
  const location = useLocation();
  const items = moduleSections[activeModule] || [];

  const [openSection, setOpenSection] = useState("VAR Challan");

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-header">
        <h3>
          {activeModule === "dashboard"
            ? "Dashboard"
            : activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
        </h3>
        <p>Quick access</p>
      </div>

      <nav className="sidebar-links">
        {activeModule !== "reports" ? (
          items.map((item) => {
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
          })
        ) : (
          items.map((section) => (
            <div key={section.heading} className="report-group">
              <button
                className="report-heading"
                onClick={() =>
                  setOpenSection(
                    openSection === section.heading ? "" : section.heading
                  )
                }
              >
                <span>{section.heading}</span>
                <span>
                  {openSection === section.heading ? "▼" : "▶"}
                </span>
              </button>

              {openSection === section.heading && (
                <div className="report-items">
                  {section.children.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                    >
                      • {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;