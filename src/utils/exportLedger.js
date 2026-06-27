import * as XLSX from "xlsx";

export function exportLedger(
  entries,
  selectedName,
  fromDate,
  toDate
) {
  if (entries.length === 0) {
    alert("No Ledger Found!");
    return;
  }

  let runningBalance = 0;

  const data = entries.map((entry) => {
    runningBalance += Number(entry.debit || 0);
    runningBalance -= Number(entry.exp || 0);

    return {
      Date: entry.date,
      Voucher: entry.voucherNo,
      Remarks: entry.remarks,
      Debit: Number(entry.debit || 0),
      Exp: Number(entry.exp || 0),
      Balance: runningBalance,
    };
  });

  const totalDebit = data.reduce(
    (sum, row) => sum + row.Debit,
    0
  );

  const totalExp = data.reduce(
    (sum, row) => sum + row.Exp,
    0
  );

  data.push({});

  data.push({
    Date: "",
    Voucher: "",
    Remarks: "TOTAL",
    Debit: totalDebit,
    Exp: totalExp,
    Balance: totalDebit - totalExp,
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Ledger"
  );

  const fileName =
    selectedName === ""
      ? "Ledger.xlsx"
      : `${selectedName}_Ledger.xlsx`;

  XLSX.writeFile(wb, fileName);
}