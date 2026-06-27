import { db } from "../data/db";
import { getMonth, getWeek } from "./dateHelpers";

export async function saveCashEntry({
  date,
  name,
  debit = 0,
  exp = 0,
  remarks = "",
  balance = 0,
  payMode = "Cash",
  source = "",
  referenceId = null,
}) {
  // Generate Voucher Number
  const entries = await db.cashEntries.toArray();

  const voucherNo =
    entries.length === 0
      ? 1
      : Math.max(...entries.map((e) => Number(e.voucherNo))) + 1;

  // Save Name Automatically
  if (name.trim() !== "") {
  const exists = await db.cashCategories
      .where("name")
      .equals(name)
      .first();

    if (!exists) {
      await db.cashNames.add({ name });
    }
  }

  return db.cashEntries.add({
    voucherNo,
    date,
    month: getMonth(date),
    week: getWeek(date),

    name,
    debit: Number(debit),
    exp: Number(exp),

    remarks,
    balance,

    payMode,

    source,
    referenceId,
  });
}