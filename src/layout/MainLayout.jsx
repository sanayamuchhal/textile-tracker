import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import MastersLock from "../pages/MastersLock";

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [mastersUnlocked, setMastersUnlocked] = useState(false);

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setActiveModule("dashboard");
    } else if (path === "/masters" || path.startsWith("/masters")) {
      setActiveModule("masters");
    } else if (
      path === "/reports" ||
      path.startsWith("/reports") ||
      path === "/weekly-report" ||
      path === "/required-reports" ||
      path === "/view" ||
      path === "/fab/view" ||
      path === "/view-cutting-vouchers" ||
      path === "/view-cash-entries"
    ) {
      setActiveModule("reports");
    } else if (path.startsWith("/add") || path === "/var") {
      setActiveModule("var");
    } else if (
      (path.startsWith("/fab") && path !== "/fab/view") ||
      path === "/fab-grin-pivot-report"
    ) {
      setActiveModule("fab");
    } else if (
      path === "/cash-book" ||
      path === "/cash-entry" ||
      path === "/bank-withdrawal"
    ) {
      setActiveModule("cash");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (mastersUnlocked && location.pathname === "/masters") {
      navigate("/masters/party", { replace: true });
    }
  }, [mastersUnlocked, location.pathname, navigate]);

  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
  };

  const isMastersRoute = location.pathname.startsWith("/masters");
  const shouldShowMastersLock = isMastersRoute && !mastersUnlocked;
  const showSidebar = !isMastersRoute || mastersUnlocked;
  const contentClassName = useMemo(
    () => `main-content-shell ${activeModule} ${showSidebar ? "" : "no-sidebar"}`,
    [activeModule, showSidebar]
  );

  return (
    <div className="erp-shell">
      <TopNavbar activeModule={activeModule} onModuleSelect={handleModuleSelect} />
      <div className="erp-body">
        {showSidebar && <Sidebar activeModule={activeModule} />}
        <main className={contentClassName}>
          <div className="content-scroll-area">
            {shouldShowMastersLock ? (
              <MastersLock onUnlock={() => setMastersUnlocked(true)} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
