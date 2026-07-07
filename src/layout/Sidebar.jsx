import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const initialExpandedSections = {
  "VAR Challan": true,
  Fabric: true,
  Cashbook: true,
  "Cost Analysis": true,
};

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

  masters: [
    {
      heading: "MASTERS",
      children: [
        { label: "Party Master", path: "/masters/party" },
        { label: "Labour Master", path: "/masters/labour" },
      ],
    },
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
  const [expandedSections, setExpandedSections] = useState(initialExpandedSections);
  const items = moduleSections[activeModule] || [];

  const toggleSection = (heading) => {
    setExpandedSections((prev) => ({
      ...prev,
      [heading]: !prev[heading],
    }));
  };

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
        {items.map((sectionOrItem) => {
          if (sectionOrItem.heading) {
            const isExpanded = expandedSections[sectionOrItem.heading] !== false;

            return (
              <div key={sectionOrItem.heading} className="report-group">
                <button
                  type="button"
                  className="report-heading"
                  onClick={() => toggleSection(sectionOrItem.heading)}
                  aria-expanded={isExpanded}
                >
                  <span>{sectionOrItem.heading}</span>
                  <span>{isExpanded ? "▼" : "▶"}</span>
                </button>
                <div className={`report-items ${isExpanded ? "open" : "closed"}`}>
                  {sectionOrItem.children.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          const isActive = location.pathname === sectionOrItem.path;
          return (
            <Link
              key={sectionOrItem.path}
              to={sectionOrItem.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              {sectionOrItem.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
