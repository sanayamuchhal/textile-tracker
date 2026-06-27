import { Link } from "react-router-dom";
import { db } from "../data/db";
import { exportRollProgressReport } from "../utils/exportRollProgressReport";
import { exportCashBook } from "../utils/exportCashBook";
import {
  exportToExcel,
  exportFabToExcel,
} from "../utils/exportExcel";

function Export() {
  const handleExportVar = async () => {
    const entries = await db.entries.toArray();

    if (entries.length === 0) {
      alert("No VAR Challan entries found!");
      return;
    }

    exportToExcel(entries);
  };

  const handleExportFab = async () => {
    const entries = await db.fabEntries.toArray();

    if (entries.length === 0) {
      alert("No FAB GRIN entries found!");
      return;
    }

    exportFabToExcel(entries);
  };

  const handleExportCash = async () => {
    const entries = await db.cashEntries.toArray();

    if (entries.length === 0) {
      alert("No Cash Book entries found!");
      return;
    }

    exportCashBook(entries);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Export</h1>

      <br />

      <button onClick={handleExportVar}>
        📄 Export VAR Challan
      </button>

      <br />
      <br />

      <button onClick={handleExportFab}>
        🧵 Export FAB GRIN
      </button>

      <br />
      <br />

      <button onClick={exportRollProgressReport}>
        📊 Export Roll Progress Report
      </button>

      <br />
      <br />

      <button onClick={handleExportCash}>
        💰 Export Cash Book
      </button>

      <br />
      <br />

      <Link to="/">
        <button>← Dashboard</button>
      </Link>
    </div>
  );
}

export default Export;