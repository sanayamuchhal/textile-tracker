import { useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import {
  buildProductCostRows,
  exportRows,
  unique,
} from "../../utils/reportUtils";

function ProductCostSummary() {
  const {
  fabEntries = [],
  cuttingVouchers = [],
  entries = [],
} = useReportData([
  "fabEntries",
  "cuttingVouchers",
  "entries",
]);
  const [rollNumber, setRollNumber] = useState("");
  const [category, setCategory] = useState("");
  const [pattern, setPattern] = useState("");

  const allRows = useMemo(
  () => buildProductCostRows(
    fabEntries,
    cuttingVouchers,
    entries
  ),
  [fabEntries, cuttingVouchers, entries]
);
  const rows = allRows.filter(
    (row) =>
      (!rollNumber || String(row["Roll Number"]) === rollNumber) &&
      (!category || row.Category === category) &&
      (!pattern || row.Pattern === pattern)
  );

  return (
    <ReportPage
      title="Product Cost Summary"
      rows={rows}
      onExport={() => exportRows(rows, "Product_Cost_Summary")}
      filters={
        <>
          <SelectFilter
            label="Roll Number"
            value={rollNumber}
            options={unique(allRows.map((row) => row["Roll Number"]))}
            onChange={setRollNumber}
          />
          <SelectFilter
            label="Category"
            value={category}
            options={unique(allRows.map((row) => row.Category))}
            onChange={setCategory}
          />
          <SelectFilter
            label="Pattern"
            value={pattern}
            options={unique(allRows.map((row) => row.Pattern))}
            onChange={setPattern}
          />
        </>
      }
    />
  );
}

export default ProductCostSummary;
