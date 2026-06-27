import { useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import { buildWagesRows, exportRows, unique } from "../../utils/reportUtils";

function WagesReport() {
  const {
  entries = [],
  cashEntries = [],
} = useReportData(["entries", "cashEntries"]);
console.log("Entries", entries);
console.log("Cash Entries", cashEntries);
  const [worker, setWorker] = useState("");
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");

  const allRows = useMemo(
  () => buildWagesRows(entries, cashEntries),
  [entries, cashEntries]
);
  const rows = allRows.filter(
    (row) =>
      (!worker || row["Worker Name"] === worker) &&
      (!month || row.Month === month) &&
      (!week || row.Week === week)
  );

  return (
    <ReportPage
      title="Wages Report"
      rows={rows}
      onExport={() => exportRows(rows, "Wages_Report")}
      filters={
        <>
          <SelectFilter
            label="Worker"
            value={worker}
            options={unique(allRows.map((row) => row["Worker Name"]))}
            onChange={setWorker}
          />
          <SelectFilter
            label="Month"
            value={month}
            options={unique(allRows.map((row) => row.Month))}
            onChange={setMonth}
          />
          <SelectFilter
            label="Week"
            value={week}
            options={unique(allRows.map((row) => row.Week))}
            onChange={setWeek}
          />
        </>
      }
    />
  );
}

export default WagesReport;
