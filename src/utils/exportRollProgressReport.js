import * as XLSX from "xlsx";
import { db } from "../data/db";
import { sheetNoForRoll } from "./reportUtils";

export async function exportRollProgressReport() {
  // Load data
  const fabEntries = await db.fabEntries.toArray();
  const cuttingVouchers = await db.cuttingVouchers.toArray();
  const varEntries = await db.entries.toArray();

  // Create report
  const report = fabEntries.map((fab) => {
    const relatedEntries = varEntries.filter(
      (entry) => Number(entry.rollNo) === Number(fab.rollNo)
    );

    const pcsWorked = relatedEntries.reduce(
      (sum, entry) => sum + Number(entry.pcs || 0),
      0
    );

    return {
      "Roll No": fab.rollNo,
      "Category": fab.category,
      "Sheet No": sheetNoForRoll(cuttingVouchers, fab.rollNo),
      "PCS Cut": fab.pcsCut,
      "PCS Worked": pcsWorked,
      "Difference": Number(fab.pcsCut || 0) - pcsWorked,
    };
  });

  // Sort by Roll No
  report.sort((a, b) => Number(a["Roll No"]) - Number(b["Roll No"]));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(report);

  // Auto column widths
  worksheet["!cols"] = [
    { wch: 10 }, // Roll No
    { wch: 20 }, // Category
    { wch: 15 }, // Sheet No
    { wch: 12 }, // PCS Cut
    { wch: 14 }, // PCS Worked
    { wch: 12 }, // Difference
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Roll Progress"
  );

  // Export
  XLSX.writeFile(workbook, "Roll_Progress_Report.xlsx");
}
