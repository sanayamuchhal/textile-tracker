import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportWeeklyReport = (workers, selectedWeek) => {
  const excelData = [];

  let grandPCS = 0;
  let grandAmount = 0;

  Object.entries(workers).forEach(([workerName, worker]) => {

    excelData.push({
      Worker: workerName,
      Job: "",
      PCS: "",
      Rate: "",
      Amount: ""
    });

    Object.entries(worker.jobs).forEach(([jobName, job]) => {

      excelData.push({
        Worker: "",
        Job: jobName,
        PCS: job.pcs,
        Rate: job.rate,
        Amount: job.amount
      });

    });

    excelData.push({
      Worker: "TOTAL",
      Job: "",
      PCS: worker.totalPCS,
      Rate: "",
      Amount: worker.totalAmount
    });

    excelData.push({
      Worker: "",
      Job: "",
      PCS: "",
      Rate: "",
      Amount: ""
    });

    grandPCS += worker.totalPCS;
    grandAmount += worker.totalAmount;

  });

  excelData.push({
    Worker: "GRAND TOTAL",
    Job: "",
    PCS: grandPCS,
    Rate: "",
    Amount: grandAmount
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    selectedWeek
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const fileData = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    }
  );

  saveAs(
    fileData,
    `Weekly_Report_${selectedWeek}.xlsx`
  );
};