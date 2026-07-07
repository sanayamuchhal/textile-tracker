import { useRef, useState } from "react";
import { formatImportSummary, importExcelFile } from "../utils/importExcel";

function ImportExcelButton({ onImported }) {
  const inputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsImporting(true);

    try {
      const summary = await importExcelFile(file);

      if (summary) {
        alert(formatImportSummary(summary));
        if (onImported) {
          await onImported(summary);
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      alert(error.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <button
        className="report-export-button report-import-button"
        type="button"
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
      >
        {isImporting ? "Importing..." : "Import from Excel"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,.xlsb"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
}

export default ImportExcelButton;
