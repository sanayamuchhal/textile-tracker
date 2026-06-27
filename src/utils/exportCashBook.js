import * as XLSX from "xlsx";

export function exportCashBook(entries) {
  if (!entries.length) {
    alert("No Cash Entries Found!");
    return;
  }

  // Sort by voucher number
  const sorted = [...entries].sort(
    (a, b) => Number(a.voucherNo) - Number(b.voucherNo)
  );

  let runningBalance = 0;

  const data = sorted.map((entry) => {
    runningBalance += Number(entry.debit || 0);
    runningBalance -= Number(entry.exp || 0);

    return {
      "Voucher No": entry.voucherNo,
      Date: entry.date,
      Month: entry.month,
      Name: entry.name,
      Debit: Number(entry.debit || 0),
      Exp: Number(entry.exp || 0),
      Remarks: entry.remarks,
      Balance: runningBalance,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 12 }, // Voucher
    { wch: 15 }, // Date
    { wch: 12 }, // Month
    { wch: 30 }, // Name
    { wch: 12 }, // Debit
    { wch: 12 }, // Exp
    { wch: 40 }, // Remarks
    { wch: 15 }, // Balance
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Book");

  XLSX.writeFile(workbook, "CashBook.xlsx");
}