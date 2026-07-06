import { useEffect, useMemo, useState } from "react";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import { buildCuttingRows, exportRows, unique } from "../../utils/reportUtils";

function CuttingReport() {
  const { cuttingVouchers = [] } = useReportData(["cuttingVouchers"]);
  const [category, setCategory] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [pattern, setPattern] = useState("");

  const allRows = useMemo(
    () => buildCuttingRows(cuttingVouchers),
    [cuttingVouchers]
  );

  const rows = useMemo(() => {
    return allRows.filter((row) => {
      const matchesCategory = !category || String(row.Category) === category;
      const matchesRollNumber =
        !rollNumber || String(row["Roll Number"]) === rollNumber;
      const matchesPattern = !pattern || String(row.Pattern) === pattern;

      return matchesCategory && matchesRollNumber && matchesPattern;
    });
  }, [allRows, category, rollNumber, pattern]);

  const categoryOptions = useMemo(() => {
    const filtered = allRows.filter((row) => {
      const matchesRollNumber =
        !rollNumber || String(row["Roll Number"]) === rollNumber;
      const matchesPattern = !pattern || String(row.Pattern) === pattern;
      return matchesRollNumber && matchesPattern;
    });

    return unique(filtered.map((row) => row.Category));
  }, [allRows, rollNumber, pattern]);

  const rollNumberOptions = useMemo(() => {
    const filtered = allRows.filter((row) => {
      const matchesCategory = !category || String(row.Category) === category;
      const matchesPattern = !pattern || String(row.Pattern) === pattern;
      return matchesCategory && matchesPattern;
    });

    return unique(filtered.map((row) => row["Roll Number"]));
  }, [allRows, category, pattern]);

  const patternOptions = useMemo(() => {
    const filtered = allRows.filter((row) => {
      const matchesCategory = !category || String(row.Category) === category;
      const matchesRollNumber =
        !rollNumber || String(row["Roll Number"]) === rollNumber;
      return matchesCategory && matchesRollNumber;
    });

    return unique(filtered.map((row) => row.Pattern));
  }, [allRows, category, rollNumber]);

  useEffect(() => {
    if (category && !categoryOptions.includes(category)) {
      setCategory("");
    }
  }, [category, categoryOptions]);

  useEffect(() => {
    if (rollNumber && !rollNumberOptions.includes(rollNumber)) {
      setRollNumber("");
    }
  }, [rollNumber, rollNumberOptions]);

  useEffect(() => {
    if (pattern && !patternOptions.includes(pattern)) {
      setPattern("");
    }
  }, [pattern, patternOptions]);

  return (
    <ReportPage
      title="Cutting Report"
      rows={rows}
      onExport={() => exportRows(rows, "Cutting_Report")}
      filters={
        <>
          <SelectFilter
            label="Category"
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />
          <SelectFilter
            label="Roll Number"
            value={rollNumber}
            options={rollNumberOptions}
            onChange={setRollNumber}
          />
          <SelectFilter
            label="Pattern"
            value={pattern}
            options={patternOptions}
            onChange={setPattern}
          />
        </>
      }
    />
  );
}

export default CuttingReport;