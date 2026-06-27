import { useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import { buildCuttingRows, exportRows, unique } from "../../utils/reportUtils";

function CuttingReport() {
  const { cuttingVouchers = [] } = useReportData(["cuttingVouchers"]);
  const [category, setCategory] = useState("");

  const allRows = useMemo(
    () => buildCuttingRows(cuttingVouchers),
    [cuttingVouchers]
  );

  const rows = allRows.filter(
    (row) => !category || row.Category === category
  );

  return (
    <ReportPage
      title="Cutting Report"
      rows={rows}
      onExport={() => exportRows(rows, "Cutting_Report")}
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

export default CuttingReport;