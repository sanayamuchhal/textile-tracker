import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {
  const location = useLocation();
  const [activeModule, setActiveModule] = useState("dashboard");

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setActiveModule("dashboard");
    } else if (path.startsWith("/add") || path === "/var" || path === "/view") {
      setActiveModule("var");
    } else if (
      path.startsWith("/fab") ||
      path === "/fab-grin-pivot-report" ||
      path === "/view-cutting-vouchers"
    ) {
      setActiveModule("fab");
    } else if (
      path === "/cash-book" ||
      path === "/cash-entry" ||
      path === "/view-cash-entries" ||
      path === "/bank-withdrawal"
    ) {
      setActiveModule("cash");
    } else if (path.startsWith("/reports") || path === "/weekly-report" || path === "/required-reports") {
      setActiveModule("reports");
    } else if (path === "/export") {
      setActiveModule("export");
    }
  }, [location.pathname]);

  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
  };

  const contentClassName = useMemo(() => `main-content-shell ${activeModule}`, [activeModule]);

  return (
    <div className="erp-shell">
      <TopNavbar activeModule={activeModule} onModuleSelect={handleModuleSelect} />
      <div className="erp-body">
        <Sidebar activeModule={activeModule} />
        <main className={contentClassName}>
          <div className="content-scroll-area">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
