import { useEffect, useMemo, useState } from "react";
import { db } from "../../data/db";
import { ReportPage, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import { buildCuttingRows, exportRows, unique } from "../../utils/reportUtils";

function CuttingReport() {
  const { cuttingVouchers = [], reload } =
  useReportData(["cuttingVouchers"]);
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
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Cutting Voucher?"
    );

    if (!confirmDelete) return;

    try {
      await db.transaction("rw", db.cuttingVouchers, db.fabEntries, async () => {
        const voucher = await db.cuttingVouchers.get(id);
        if (voucher && voucher.rollNo) {
          const fabEntry = await db.fabEntries.where("rollNo").equals(voucher.rollNo).first();
          if (fabEntry) {
            const newPcsCut = Math.max(0, (Number(fabEntry.pcsCut) || 0) - (Number(voucher.pcsCut) || 0));
            const newMeterCut = Math.max(0, (Number(fabEntry.meterCut) || 0) - (Number(voucher.meterCut) || 0));
            await db.fabEntries.update(fabEntry.id, {
              pcsCut: newPcsCut,
              meterCut: newMeterCut,
            });
          }
        }
        await db.cuttingVouchers.delete(id);
      });
      await reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete Cutting Voucher.");
    }
  };

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
  >
    {/* Custom table goes here */}
    <div className="report-table-wrapper">
  <table className="report-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Month</th>
        <th>GRIN No</th>
        <th>Sheet No</th>
        <th>Roll Number</th>
        <th>Article No</th>
        <th>Pattern</th>
        <th>Party</th>
        <th>Category</th>
        <th>Meter</th>
        <th>PCS Cut</th>
        <th>Average</th>
        <th>Delete</th>
      </tr>
    </thead>

    <tbody>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>{row.Date}</td>
          <td>{row.Month}</td>
          <td>{row["GRIN No"]}</td>
          <td>{row["Sheet No"]}</td>
          <td>{row["Roll Number"]}</td>
          <td>{row["Article No"]}</td>
          <td>{row.Pattern}</td>
          <td>{row.Party}</td>
          <td>{row.Category}</td>
          <td>{row.Meter}</td>
          <td>{row["PCS Cut"]}</td>
          <td>{row.Average}</td>
          <td>
            <button
              className="delete-btn"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}

      {rows.length === 0 && (
        <tr>
          <td colSpan={13} className="report-empty">
            No records found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  </ReportPage>
);
}

export default CuttingReport;