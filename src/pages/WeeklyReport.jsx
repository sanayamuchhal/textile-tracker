import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";
import { getMonth, getWeek } from "../utils/dateHelpers";
import { exportWeeklyReport } from "../utils/exportWeeklyReport";

function WeeklyReport() {
  const [entries, setEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      loadPayments();
    }
  }, [selectedWeek]);

  // -----------------------------
  // Load Production Entries
  // -----------------------------
  const loadData = async () => {
    const data = await db.entries.toArray();

    setEntries(data);

    const uniqueWeeks = [...new Set(data.map((e) => e.week))];

    if (uniqueWeeks.length > 0) {
      setSelectedWeek(uniqueWeeks[uniqueWeeks.length - 1]);
    }
  };

  // -----------------------------
  // Load Saved Worker Payments
  // -----------------------------
  const loadPayments = async () => {
    const data = await db.workerPayments.toArray();

    setPayments(data);
  };

  // -----------------------------
  // Week List
  // -----------------------------
  const weeks = [...new Set(entries.map((e) => e.week))];

  // -----------------------------
  // Entries of Selected Week
  // -----------------------------
  const weeklyEntries = entries.filter(
    (entry) => entry.week === selectedWeek
  );

  // -----------------------------
  // Build Worker Report
  // -----------------------------
  const workers = {};

  weeklyEntries.forEach((entry) => {
    if (!workers[entry.workerName]) {

      // Current Week Payment
      const currentPayment =
        payments.find(
          (p) =>
            p.workerName === entry.workerName &&
            p.week === selectedWeek
        ) || {};

      // Previous Payments
      const previousPayments = payments
        .filter(
          (p) =>
            p.workerName === entry.workerName &&
            p.week !== selectedWeek
        )
        .sort((a, b) => a.id - b.id);

      const previousBalance =
        previousPayments.length > 0
          ? Number(
              previousPayments[
                previousPayments.length - 1
              ].balance || 0
            )
          : 0;

      workers[entry.workerName] = {
        jobs: {},

        totalPCS: 0,

        currentEarnings: 0,

        previousBalance,

        totalPayable: 0,

        paid: Number(currentPayment.paid || 0),

        balance: 0,

        paymentMode:
          currentPayment.paymentMode || "Cash",
      };
    }

    if (!workers[entry.workerName].jobs[entry.jobType]) {
      workers[entry.workerName].jobs[entry.jobType] = {
        pcs: 0,
        rate: Number(entry.rate),
        amount: 0,
      };
    }

    workers[entry.workerName].jobs[entry.jobType].pcs += Number(entry.pcs);

    workers[entry.workerName].jobs[entry.jobType].amount += Number(
      entry.amount
    );

    workers[entry.workerName].totalPCS += Number(entry.pcs);

    workers[entry.workerName].currentEarnings += Number(entry.amount);
  });

  // -----------------------------
  // Calculate Totals
  // -----------------------------
  Object.values(workers).forEach((worker) => {
    worker.totalPayable =
      worker.previousBalance +
      worker.currentEarnings;

    worker.balance =
      worker.totalPayable -
      Number(worker.paid || 0);
  });

  const grandPCS = weeklyEntries.reduce(
    (sum, e) => sum + Number(e.pcs),
    0
  );

  const grandAmount = weeklyEntries.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const handlePaymentChange = (worker, field, value) => {
  setPayments((prev) => {
    const existing = prev.find(
      (p) =>
        p.workerName === worker &&
        p.week === selectedWeek
    );

    if (existing) {
      return prev.map((p) =>
        p.workerName === worker &&
        p.week === selectedWeek
          ? {
              ...p,
              [field]:
                field === "paid"
                  ? Number(value)
                  : value,
            }
          : p
      );
    }

    return [
      ...prev,
      {
        workerName: worker,
        week: selectedWeek,
        paid:
          field === "paid"
            ? Number(value)
            : 0,
        paymentMode:
          field === "paymentMode"
            ? value
            : "Cash",
      },
    ];
  });
};

const savePayment = async (worker) => {

  const workerData = workers[worker];

  const payment =
    payments.find(
      (p) =>
        p.workerName === worker &&
        p.week === selectedWeek
    ) || {};

  const paid =
    Number(payment.paid || 0);

  const paymentMode =
    payment.paymentMode || "Cash";

  const earnedAmount =
    workerData.currentEarnings;

  const previousBalance =
    workerData.previousBalance;

  const totalPayable =
    workerData.totalPayable;

  const balance =
    totalPayable - paid;

  // -----------------------------
  // SAVE WORKER PAYMENT
  // -----------------------------

  const existingPayment =
    await db.workerPayments
      .where("[workerName+week]")
      .equals([worker, selectedWeek])
      .first();

  let workerPaymentId;

  if (existingPayment) {

    workerPaymentId =
      existingPayment.id;

    await db.workerPayments.update(
      existingPayment.id,
      {
        earnedAmount,

        previousBalance,

        totalPayable,

        paid,

        balance,

        paymentMode,
      }
    );

  } else {

    workerPaymentId =
      await db.workerPayments.add({

        workerName: worker,

        week: selectedWeek,

        earnedAmount,

        previousBalance,

        totalPayable,

        paid,

        balance,

        paymentMode,

      });

  }

  // -----------------------------
  // CASHBOOK ENTRY
  // -----------------------------

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const existingCash =
    await db.cashEntries
      .where("referenceId")
      .equals(workerPaymentId)
      .first();

  if (existingCash) {

    await db.cashEntries.update(
      existingCash.id,
      {

        date: today,

        month: getMonth(today),

        week: getWeek(today),

        name: "Wages",

        payMode: paymentMode,

        debit: 0,

        exp: paid,

        remarks: worker,

        balance,

        source: "WorkerWeeklyReport",

        referenceId:
          workerPaymentId,

      }
    );

  } else {

    const cashEntries =
      await db.cashEntries.toArray();

    const voucherNo =
      cashEntries.length === 0
        ? 1
        : Math.max(
            ...cashEntries.map(
              (e) =>
                Number(e.voucherNo)
            )
          ) + 1;

    await db.cashEntries.add({

      voucherNo,

      date: today,

      month: getMonth(today),

      week: getWeek(today),

      name: "Wages",

      payMode: paymentMode,

      debit: 0,

      exp: paid,

      remarks: worker,

      balance,

      source:
        "WorkerWeeklyReport",

      referenceId:
        workerPaymentId,

    });

  }

  await loadPayments();

  alert("Payment Saved");
};
  const handleExport = () => {
    exportWeeklyReport(workers, selectedWeek);
  };
    return (
    <div style={{ padding: 20 }}>
      <Link to="/">
        <button>← Dashboard</button>
      </Link>

      <h1>Weekly Production Report</h1>

      <button onClick={handleExport}>
        Export Weekly Report
      </button>

      <br />
      <br />

      <label>Select Week</label>

      <br />

      <select
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      >
        {weeks.map((week) => (
          <option key={week} value={week}>
            {week}
          </option>
        ))}
      </select>

      <hr />

      <h2>{selectedWeek}</h2>

      {Object.entries(workers).map(([worker, data]) => {
        const payment =
  payments.find(
    (p) =>
      p.workerName === worker &&
      p.week === selectedWeek
  ) || {
    paid: data.paid,
    paymentMode: data.paymentMode,
  };

const previousBalance =
  data.previousBalance;

const currentEarnings =
  data.currentEarnings;

const totalPayable =
  data.totalPayable;

const balance =
  totalPayable - Number(payment.paid || 0);

        return (
          <div
            key={worker}
            style={{
              border: "2px solid black",
              marginBottom: 30,
              padding: 15,
            }}
          >
            <h2>{worker}</h2>

            <table
              border="1"
              cellPadding="8"
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th>Job</th>
                  <th>PCS</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(data.jobs).map(
                  ([job, jobData]) => (
                    <tr key={job}>
                      <td>{job}</td>
                      <td>{jobData.pcs}</td>
                      <td>{jobData.rate}</td>
                      <td>₹{jobData.amount}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <br />

            <strong>Total PCS :</strong> {data.totalPCS}

<br />

<strong>Current Earnings :</strong> ₹{currentEarnings}

<br />

<strong>Previous Balance :</strong> ₹{previousBalance}

<br />

<strong>Total Payable :</strong> ₹{totalPayable}

<hr />

            <label>
              <strong>Payment Mode</strong>
            </label>

            <br />

            <select
              value={payment.paymentMode}
              onChange={(e) =>
                handlePaymentChange(
                  worker,
                  "paymentMode",
                  e.target.value
                )
              }
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
            </select>

            <br />
            <br />

            <label>
              <strong>Paid Amount</strong>
            </label>

            <br />

            <input
              type="number"
              value={payment.paid}
              onChange={(e) =>
                handlePaymentChange(
                  worker,
                  "paid",
                  e.target.value
                )
              }
            />

            <br />
            <br />

            <div
  style={{
    background: "#f5f5f5",
    padding: "10px",
    borderRadius: "6px",
    marginTop: "10px",
  }}
>
  <strong>Paid :</strong> ₹{payment.paid}

  <br />

  <strong>Balance Carry Forward :</strong> ₹{balance}
</div>

            <br />
            <br />

            <button
              onClick={() =>
                savePayment(worker)
              }
            >
              Save Payment
            </button>
          </div>
        );
      })}

      <hr />

      <h2>Grand Total</h2>

      <p>
        <strong>Total Workers:</strong>{" "}
        {Object.keys(workers).length}
      </p>

      <p>
        <strong>Total PCS:</strong> {grandPCS}
      </p>

      <p>
        <strong>Total Amount:</strong> ₹{grandAmount}
      </p>
    </div>
  );
}

export default WeeklyReport;
