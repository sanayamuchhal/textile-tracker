import { useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import {
  buildFabricStockRows,
  exportRows,
  unique,
} from "../../utils/reportUtils";

function FabricStockReport() {
  const { fabEntries = [], cuttingVouchers = [] } =
  useReportData(["fabEntries", "cuttingVouchers"]);
  const [category, setCategory] = useState("");

  const allRows = useMemo(
  () => buildFabricStockRows(fabEntries, cuttingVouchers),
  [fabEntries, cuttingVouchers]
);
  const rows = allRows.filter(
    (row) => !category || row.Category === category
  );

  return (
    <ReportPage
      title="Fabric Stock Report"
      rows={rows}
      onExport={() => exportRows(rows, "Fabric_Stock_Report")}
      filters={
        <SelectFilter
          label="Category"
          value={category}
          options={unique(allRows.map((row) => row.Category))}
          onChange={setCategory}
        />
      }
    />
  );
}

export default FabricStockReport;
