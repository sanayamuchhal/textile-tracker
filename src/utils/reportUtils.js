import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const number = (value) => Number(value) || 0;

export function unique(values) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

export function exportRows(rows, fileName) {
  if (!rows.length) {
    alert("No rows to export.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
}

export function buildFabricStockRows(fabEntries) {
  return fabEntries.map((entry) => ({
    "GRIN No": entry.grinNo,
    "Roll Number": entry.rollNo,
    Category: entry.category,
    Party: entry.party,
    Quality: entry.quality,
    Meter: Number(
      (
        number(entry.meter) -
        number(entry.returnMeter) -
        number(entry.meterCut)
      ).toFixed(2)
    ),
  }));
}

export function buildCuttingRows(cuttingVouchers) {
  return cuttingVouchers.map((entry) => {
    const meter = number(entry.meterCut);

    return {
      Date: entry.date,
      Month: entry.month,
      Week: entry.week,

      "GRIN No": entry.grinNo,
      "Roll Number": entry.rollNo,

      Category: entry.category,
      Party: entry.party,

      "Article No": entry.articleNo,
      Pattern: entry.pattern,
      "Sheet No": entry.sheetNo,

      Meter: meter,
      "PCS Cut": number(entry.pcsCut),

      Average:
        number(entry.pcsCut) > 0
          ? (meter / number(entry.pcsCut)).toFixed(2)
          : 0,
    };
  });
}

function weekOrder(week) {
  const match = String(week || "").match(/^([A-Za-z]+)(\d+)Week(\d+)$/);

  if (!match) return String(week || "");

  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  return `${match[3]}-${months[match[1]] || "00"}-${match[2].padStart(2, "0")}`;
}

function cashPaymentAmount(entry) {
  return number(entry.amount) || number(entry.exp) || number(entry.paid);
}

function workerFromCashEntry(entry) {
 

  if (String(entry.category || "").toLowerCase() === "wages") {
    return entry.name || entry.remarks || "";
  }

  if (String(entry.name || "").toLowerCase() === "wages") {
    return entry.remarks || entry.workerName || "";
  }

  return "";
}

export function buildWagesRows(entries, cashEntries) {
  
  const grouped = new Map();

  const ensureRow = ({ workerName, month, week }) => {
    const key = `${workerName}|${month}|${week}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        month,
        week,
        workerName,
        jobAmount: 0,
        amountPaid: 0,
        paymentModes: new Set(),
        paymentDetails: [],
      });
    }

    return grouped.get(key);
  };

  entries.forEach((entry) => {
    if (!entry.workerName || !entry.week) return;

    const row = ensureRow({
      workerName: entry.workerName,
      month: entry.month,
      week: entry.week,
    });

    row.jobAmount += number(entry.amount);
  });

  cashEntries.forEach((entry) => {
    const workerName = workerFromCashEntry(entry);

    if (!workerName || !entry.week) return;

    const row = ensureRow({
      workerName,
      month: entry.month,
      week: entry.week,
    });
    const detail =
  entry.paymentMode === "Bank"
    ? entry.chequeNo || entry.narration || ""
    : "";

    row.amountPaid += cashPaymentAmount(entry);
   if (entry.paymentMode) {
  row.paymentModes.add(entry.paymentMode);
}

if (entry.paymentMode === "Bank" && detail) {
  row.paymentDetails.push(String(detail));
}
  });

  

  const byWorker = {};

  grouped.forEach((row) => {
    if (!byWorker[row.workerName]) byWorker[row.workerName] = [];
    byWorker[row.workerName].push(row);
  });

  return Object.values(byWorker)
    .flatMap((rows) => {
      let openingBalance = 0;

      return rows
        .sort((a, b) => weekOrder(a.week).localeCompare(weekOrder(b.week)))
        .map((row) => {
          const closingBalance =
            openingBalance + row.jobAmount - row.amountPaid;
          const output = {
            Month: row.month,
            Week: row.week,
            "Worker Name": row.workerName,
            "Opening Balance": openingBalance,
            "Job Amount": row.jobAmount,
            "Payment Mode": [...row.paymentModes].join(", "),
            "Payment Details": unique(row.paymentDetails).join(", "),
            "Amount Paid": row.amountPaid,
            "Closing Balance": closingBalance,
          };

          openingBalance = closingBalance;
          return output;
        });
    })
    .sort((a, b) => {
      const workerCompare = a["Worker Name"].localeCompare(b["Worker Name"]);
      if (workerCompare) return workerCompare;
      return weekOrder(a.Week).localeCompare(weekOrder(b.Week));
    });
}

export function buildCashBookRows(cashEntries) {
  return cashEntries.map((entry) => ({
    Date: entry.date,
    Month: entry.month,
    Category: entry.type === "credit" ? "Bank Withdrawal" : entry.category,
    Head: entry.type === "credit" ? entry.bankName : entry.name,
    Amount: cashPaymentAmount(entry),
    Narration:
      entry.type === "credit"
        ? `Cheque No: ${entry.chequeNo || ""}`
        : entry.narration || entry.remarks || "",
  }));
}

export function rollCutSummary(cutting, entries) {
  const articleJobs = entries.filter(
    (entry) =>
      String(entry.rollNo) === String(cutting.rollNo) &&
      String(entry.articleNo) === String(cutting.articleNo)
  );

  const varAmount = articleJobs.reduce(
    (sum, entry) => sum + number(entry.amount),
    0
  );

  return {
    meterCut: number(cutting.meterCut),
    pcsCut: number(cutting.pcsCut),
    varAmount,
    rollJobs: articleJobs,
  };
}

export function buildProductCostRows(
  fabEntries,
  cuttingVouchers,
  entries
) {
  return cuttingVouchers.map((cutting) => {
    const fab = fabEntries.find(
      (f) => String(f.rollNo) === String(cutting.rollNo)
    );

    if (!fab) return null;

    const { meterCut, pcsCut, varAmount } = rollCutSummary(
      cutting,
      entries
    );

    return {
      "Roll Number": cutting.rollNo,
      "Article No": cutting.articleNo,

      Category: cutting.category,
      Pattern: cutting.pattern,
      Party: cutting.party,

      "Fabric Rate": number(fab.rate),

      "Meter Cut": meterCut,

      "PCS Cut": pcsCut,

      "VAR Amount": varAmount,

      "VAR Cost Per Piece":
        pcsCut > 0
          ? Number((varAmount / pcsCut).toFixed(2))
          : 0,

      "Fabric Cost Per Piece":
        pcsCut > 0
          ? Number(
              ((number(fab.rate) * meterCut) / pcsCut).toFixed(2)
            )
          : 0,
    };
  }).filter(Boolean);
}
export function buildVarCostDetail(cuttingVoucher, entries) {
  if (!cuttingVoucher) {
    return {
      detail: null,
      rows: [],
      totalAmount: 0,
      costPerPiece: 0,
    };
  }

  const { pcsCut, rollJobs } = rollCutSummary(
    cuttingVoucher,
    entries
  );

  const grouped = {};

  rollJobs.forEach((entry) => {
    if (!grouped[entry.jobType]) {
      grouped[entry.jobType] = {
        "Job Type": entry.jobType,
        PCS: 0,
        Amount: 0,
      };
    }

    grouped[entry.jobType].PCS += number(entry.pcs);
    grouped[entry.jobType].Amount += number(entry.amount);
  });

  const rows = Object.values(grouped);

  const totalAmount = rows.reduce(
    (sum, row) => sum + number(row.Amount),
    0
  );

  return {
    detail: {
      Category: cuttingVoucher.category,
      "Article No": cuttingVoucher.articleNo,
      Pattern: cuttingVoucher.pattern,
      "Cutting PCS": pcsCut,
    },

    rows,

    totalAmount,

    costPerPiece:
      pcsCut > 0
        ? Number((totalAmount / pcsCut).toFixed(2))
        : 0,
  };
}