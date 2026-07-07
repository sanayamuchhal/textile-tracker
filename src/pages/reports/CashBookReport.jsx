import { useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import { buildCashBookRows, exportRows, unique } from "../../utils/reportUtils";

function CashBookReport() {
  const { cashEntries = [] } = useReportData(["cashEntries"]);
  const [category, setCategory] = useState("");
  const [head, setHead] = useState("");

  const allRows = useMemo(
    () => buildCashBookRows(cashEntries),
    [cashEntries]
  );
  const rows = allRows.filter(
    (row) =>
      (!category || row.Category === category) &&
      (!head || row.Head === head)
  );

  return (
    <ReportPage
      title="Cash Book Report"
      rows={rows}
      columnLabels={{ Category: "Head", Head: "Name" }}
      onExport={() => exportRows(rows, "Cash_Book_Report")}
      filters={
        <>
          <SelectFilter
            label="Head"
            value={category}
            options={unique(allRows.map((row) => row.Category))}
            onChange={setCategory}
          />
          <SelectFilter
            label="Name"
            value={head}
            options={unique(allRows.map((row) => row.Head))}
            onChange={setHead}
          />
        </>
      }
    />
  );
}

export default CashBookReport;
