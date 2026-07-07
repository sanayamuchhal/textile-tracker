import * as XLSX from "xlsx";
import { db } from "../data/db";
import { getMonth, getWeek } from "./dateHelpers";

const DATE_FIELDS = new Set(["date"]);
const NUMBER_FIELDS = new Set([
  "amount",
  "articleNo",
  "average",
  "balance",
  "debit",
  "exp",
  "meter",
  "meterCut",
  "paid",
  "pcs",
  "pcsCut",
  "rate",
  "returnMeter",
  "value",
  "voucherNo",
]);

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function number(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "string" && value.trim() === "-") return 0;
  return Number(value) || 0;
}

function normalizeDate(value) {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(
        parsed.d
      ).padStart(2, "0")}`;
    }
  }

  return text(value);
}

function coerceField(field, value) {
  if (DATE_FIELDS.has(field)) return normalizeDate(value);
  if (NUMBER_FIELDS.has(field)) return number(value);
  return text(value);
}

function isBlankRow(row) {
  return Object.values(row).every((value) => text(value) === "");
}

function rowValue(row, columns, header) {
  return row[columns[normalizeHeader(header)]];
}

function buildColumns(headers) {
  return headers.reduce((columns, header) => {
    columns[normalizeHeader(header)] = header;
    return columns;
  }, {});
}

function hasAll(columns, headers) {
  return headers.every((header) => columns[normalizeHeader(header)]);
}

function hasAny(columns, headers) {
  return headers.some((header) => columns[normalizeHeader(header)]);
}

function rowSignature(fields, record) {
  return fields.map((field) => normalizeHeader(record[field])).join("|");
}

async function insertWithDuplicateCheck(table, records, duplicateFields) {
  const summary = {
    totalRows: records.length,
    imported: 0,
    duplicates: 0,
    failed: 0,
  };

  const existing = await table.toArray();
  const seen = new Set(existing.map((record) => rowSignature(duplicateFields, record)));

  for (const record of records) {
    const signature = rowSignature(duplicateFields, record);

    if (seen.has(signature)) {
      summary.duplicates += 1;
      continue;
    }

    try {
      await table.add(record);
      seen.add(signature);
      summary.imported += 1;
    } catch (error) {
      console.error("Excel import row failed", error, record);
      summary.failed += 1;
    }
  }

  return summary;
}

function mapByHeaders(columns, row, mappings) {
  return mappings.reduce((record, mapping) => {
    const source = mapping.headers.find((header) => columns[normalizeHeader(header)]);
    const value = source ? rowValue(row, columns, source) : mapping.defaultValue;
    record[mapping.field] = coerceField(mapping.field, value);
    return record;
  }, {});
}

function withDateParts(record) {
  if (record.date) {
    record.month ||= getMonth(record.date);
    record.week ||= getWeek(record.date);
  }

  return record;
}

async function nextVoucherNo() {
  const entries = await db.cashEntries.toArray();
  if (!entries.length) return 1;
  return Math.max(...entries.map((entry) => number(entry.voucherNo))) + 1;
}

const importers = [
  {
    name: "VAR Challan",
    table: db.entries,
    required: ["Date", "Roll No", "PCS", "Rate", "Amount"],
    matches(columns) {
      return (
        hasAll(columns, this.required) &&
        (hasAny(columns, ["Challan", "Challan No"]) ||
          hasAny(columns, ["Name", "Worker"])) &&
        hasAny(columns, ["Job", "Job Type"])
      );
    },
    map(columns, row) {
      return mapByHeaders(columns, row, [
        { field: "date", headers: ["Date"] },
        { field: "month", headers: ["Month"] },
        { field: "week", headers: ["Week"] },
        { field: "challanNo", headers: ["Challan", "Challan No"] },
        { field: "rollNo", headers: ["Roll No"] },
        { field: "articleNo", headers: ["Article No"] },
        { field: "sheetNo", headers: ["Sheet", "Sheet No"] },
        { field: "workerName", headers: ["Name", "Worker", "Worker Name"] },
        { field: "jobType", headers: ["Job", "Job Type"] },
        { field: "pcs", headers: ["PCS"] },
        { field: "rate", headers: ["Rate"] },
        { field: "amount", headers: ["Amount"] },
      ]);
    },
    duplicateFields: [
      "date",
      "challanNo",
      "rollNo",
      "articleNo",
      "workerName",
      "jobType",
      "pcs",
      "rate",
      "amount",
    ],
  },
  {
    name: "Fabric GRIN",
    table: db.fabEntries,
    required: ["Date", "Roll No", "Party", "Invoice", "Category", "Quality", "Meter", "Rate"],
    matches(columns) {
      return hasAll(columns, this.required) && hasAny(columns, ["GRIN", "GRIN No"]);
    },
    map(columns, row) {
      const record = mapByHeaders(columns, row, [
        { field: "date", headers: ["Date"] },
        { field: "month", headers: ["Month"] },
        { field: "week", headers: ["Week"] },
        { field: "grinNo", headers: ["GRIN", "GRIN No"] },
        { field: "rollNo", headers: ["Roll No"] },
        { field: "party", headers: ["Party"] },
        { field: "invoice", headers: ["Invoice"] },
        { field: "category", headers: ["Category"] },
        { field: "quality", headers: ["Quality"] },
        { field: "meter", headers: ["Meter"] },
        { field: "rate", headers: ["Rate"] },
        { field: "value", headers: ["Value"] },
        { field: "returnMeter", headers: ["Return Meter"] },
        { field: "pcsCut", headers: ["PCS Cut"] },
      ]);

      if (!record.value) record.value = Number((record.meter * record.rate).toFixed(2));
      return record;
    },
    duplicateFields: ["date", "grinNo", "rollNo", "party", "invoice", "meter", "rate"],
  },
  {
    name: "Cutting Vouchers",
    table: db.cuttingVouchers,
    required: ["Date", "Pattern", "Category", "Party", "PCS Cut"],
    matches(columns) {
      return (
        hasAll(columns, this.required) &&
        hasAny(columns, ["Roll", "Roll Number"]) &&
        hasAny(columns, ["Article", "Article No"]) &&
        hasAny(columns, ["Sheet", "Sheet No"])
      );
    },
    map(columns, row) {
      return mapByHeaders(columns, row, [
        { field: "date", headers: ["Date"] },
        { field: "month", headers: ["Month"] },
        { field: "week", headers: ["Week"] },
        { field: "grinNo", headers: ["GRIN No", "GRIN"] },
        { field: "rollNo", headers: ["Roll", "Roll Number"] },
        { field: "articleNo", headers: ["Article", "Article No"] },
        { field: "pattern", headers: ["Pattern"] },
        { field: "sheetNo", headers: ["Sheet", "Sheet No"] },
        { field: "category", headers: ["Category"] },
        { field: "party", headers: ["Party"] },
        { field: "meterCut", headers: ["Meter Cut", "Meter"] },
        { field: "pcsCut", headers: ["PCS Cut"] },
      ]);
    },
    duplicateFields: ["date", "rollNo", "articleNo", "pattern", "sheetNo", "pcsCut"],
  },
  {
    name: "Cash Register",
    table: db.cashEntries,
    required: ["Date"],
    matches(columns) {
      return (
        (hasAll(columns, ["Date", "Week", "Month", "Category", "Name", "DBT", "CRT"]) ||
          hasAll(columns, ["Voucher No", "Date", "Month", "Name", "Debit", "Exp"]) ||
          hasAll(columns, ["Date", "Month", "Category", "Head", "Amount"])) &&
        !hasAny(columns, ["Opening Balance", "Closing Balance"])
      );
    },
    async map(columns, row, context) {
      const voucherNo =
        number(rowValue(row, columns, "Voucher No")) || context.nextVoucherNo++;
      const dbt = rowValue(row, columns, "DBT");
      const crt = rowValue(row, columns, "CRT");
      const debit = rowValue(row, columns, "Debit");
      const exp = rowValue(row, columns, "Exp");
      const category = text(rowValue(row, columns, "Category"));
      const head = text(rowValue(row, columns, "Head"));
      const amount = number(rowValue(row, columns, "Amount"));
      const isCredit =
        number(crt) > 0 ||
        number(debit) > 0 ||
        normalizeHeader(category) === "bank withdrawal";
      const record = {
        voucherNo,
        date: normalizeDate(rowValue(row, columns, "Date")),
        month: text(rowValue(row, columns, "Month")),
        week: text(rowValue(row, columns, "Week")),
        type: isCredit ? "credit" : "debit",
        category: isCredit ? "" : category,
        name: isCredit ? "" : text(rowValue(row, columns, "Name") || head),
        bankName: isCredit ? category || head || text(rowValue(row, columns, "Name")) : "",
        amount: isCredit
          ? number(crt) || number(debit) || amount
          : number(dbt) || number(exp) || amount,
        narration: isCredit ? "" : text(rowValue(row, columns, "Narration") || rowValue(row, columns, "Remarks")),
        chequeNo: "",
        balance: number(rowValue(row, columns, "Balance")),
      };

      const chequeMatch = text(rowValue(row, columns, "Narration")).match(/cheque no:\s*(.*)$/i);
      if (chequeMatch) record.chequeNo = chequeMatch[1].trim();
      return withDateParts(record);
    },
    duplicateFields: ["date", "type", "category", "name", "bankName", "amount", "narration", "chequeNo"],
    async beforeMap() {
      return { nextVoucherNo: await nextVoucherNo() };
    },
  },
  {
    name: "Party Master",
    table: db.parties,
    required: ["Party Name"],
    matches(columns) {
      return hasAll(columns, ["Party Name", "Address", "Contact Person", "Mobile", "GST"]);
    },
    map(columns, row) {
      return mapByHeaders(columns, row, [
        { field: "name", headers: ["Party Name"] },
        { field: "address", headers: ["Address"] },
        { field: "contactPerson", headers: ["Contact Person"] },
        { field: "mobile", headers: ["Mobile"] },
        { field: "gst", headers: ["GST"] },
      ]);
    },
    duplicateFields: ["name"],
  },
  {
    name: "Labour Master",
    table: db.labours,
    required: ["Labour Name"],
    matches(columns) {
      return hasAll(columns, ["Labour Name", "Jobs", "Address", "Aadhaar Number", "Mobile Number"]);
    },
    map(columns, row) {
      const record = mapByHeaders(columns, row, [
        { field: "name", headers: ["Labour Name"] },
        { field: "address", headers: ["Address"] },
        { field: "aadhaarNo", headers: ["Aadhaar Number"] },
        { field: "mobileNo", headers: ["Mobile Number"] },
      ]);
      record.jobs = text(rowValue(row, columns, "Jobs"))
        .split(",")
        .map((job) => job.trim())
        .filter(Boolean);
      return record;
    },
    duplicateFields: ["name"],
  },
  {
    name: "Pattern Master",
    table: db.patternMaster,
    required: ["Category", "Job"],
    matches(columns) {
      return hasAll(columns, ["Category", "Job"]);
    },
    map(columns, row) {
      return mapByHeaders(columns, row, [
        { field: "category", headers: ["Category"] },
        { field: "job", headers: ["Job"] },
      ]);
    },
    duplicateFields: ["category", "job"],
  },
];

function findImporter(headers) {
  const columns = buildColumns(headers);
  return {
    columns,
    importer: importers.find((candidate) => candidate.matches(columns)),
  };
}

function validateRequired(importer, columns) {
  const missing = importer.required.filter(
    (header) => !columns[normalizeHeader(header)]
  );

  if (missing.length) {
    throw new Error(`Required columns are missing: ${missing.join(", ")}`);
  }
}

export async function importExcelFile(file) {
  if (!file) return null;

  let workbook;

  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch (error) {
    console.error(error);
    throw new Error("The workbook cannot be parsed. Please select a valid Excel file.", {
      cause: error,
    });
  }

  if (!workbook?.SheetNames?.length) {
    throw new Error("The selected file is not a valid Excel workbook.");
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: true,
  });

  if (!rows.length) {
    throw new Error("The selected workbook does not contain any data rows.");
  }

  const headers = Object.keys(rows[0]);
  const { columns, importer } = findImporter(headers);

  if (!importer) {
    throw new Error("This file does not match any supported ERP export format.");
  }

  validateRequired(importer, columns);

  const context = importer.beforeMap ? await importer.beforeMap() : {};
  const records = [];
  let failed = 0;

  for (const row of rows) {
    if (isBlankRow(row)) continue;

    try {
      const mapped = await importer.map(columns, row, context);
      delete mapped.id;
      records.push(withDateParts(mapped));
    } catch (error) {
      console.error("Excel import mapping failed", error, row);
      failed += 1;
    }
  }

  const summary = await db.transaction("rw", importer.table, async () => {
    const result = await insertWithDuplicateCheck(
      importer.table,
      records,
      importer.duplicateFields
    );
    result.failed += failed;
    return result;
  });

  return {
    moduleName: importer.name,
    ...summary,
  };
}

export function formatImportSummary(summary) {
  return [
    `${summary.moduleName} import completed.`,
    "",
    `Total rows processed: ${summary.totalRows}`,
    `Successfully imported: ${summary.imported}`,
    `Skipped as duplicates: ${summary.duplicates}`,
    `Failed rows: ${summary.failed}`,
  ].join("\n");
}
