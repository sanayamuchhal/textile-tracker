import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { sheetNoForRoll } from "./reportUtils";

// ---------------- VAR CHALLAN ----------------

export const exportToExcel = (data) => {

  const formattedData = data.map((entry) => ({
    Date: entry.date,
    Month: entry.month,
    Week: entry.week,
    Challan: entry.challanNo,
    "Roll No": entry.rollNo,
    Name: entry.workerName,
    Job: entry.jobType,
    PCS: entry.pcs,
    Rate: entry.rate,
    Amount: entry.amount,
    Sheet: entry.sheetNo,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "VAR Challan"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(fileData, "VAR_Challan.xlsx");
};


// ---------------- FAB GRIN ----------------

export const exportFabToExcel = (data, cuttingVouchers = []) => {

  const formattedData = data.map((entry) => ({
    Date: entry.date,
    Month: entry.month,
    Week: entry.week,
    "GRIN No": entry.grinNo,
    "Sheet No": sheetNoForRoll(cuttingVouchers, entry.rollNo),
    "Roll No": entry.rollNo,
    Party: entry.party,
    Invoice: entry.invoice,
    Category: entry.category,
    Quality: entry.quality,
    Meter: entry.meter,
    Rate: entry.rate,
    Value: entry.value,
    "Return Meter": entry.returnMeter,
    "PCS Cut": entry.pcsCut,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "FAB GRIN"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(fileData, "FAB_GRIN.xlsx");
};
