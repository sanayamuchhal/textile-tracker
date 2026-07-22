import { useMemo } from "react";
import { db } from "../../data/db";
import { ReportPage } from "./ReportComponents";
import { useReportData } from "./useReportData";

function VerifyPcsCut() {
  const { fabEntries = [], cuttingVouchers = [], reload } = useReportData([
    "fabEntries",
    "cuttingVouchers",
  ]);

  const mismatches = useMemo(() => {
    const voucherSums = {};
    cuttingVouchers.forEach((v) => {
      if (!voucherSums[v.rollNo]) voucherSums[v.rollNo] = 0;
      voucherSums[v.rollNo] += Number(v.pcsCut) || 0;
    });

    const results = [];
    fabEntries.forEach((entry) => {
      const stored = Number(entry.pcsCut) || 0;
      const actual = voucherSums[entry.rollNo] || 0;
      if (stored !== actual) {
        results.push({
          id: entry.id,
          rollNo: entry.rollNo,
          stored,
          actual,
          difference: actual - stored,
        });
      }
    });
    return results;
  }, [fabEntries, cuttingVouchers]);

  const handleRepairSelected = async (mismatch) => {
    const confirmMsg = `ROLL NO : ${mismatch.rollNo}\n\nStored PCS CUT : ${mismatch.stored}\nActual PCS CUT : ${mismatch.actual}\n\nThe stored value will be changed\nfrom ${mismatch.stored} to ${mismatch.actual}.\n\nProceed?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await db.fabEntries.update(mismatch.id, { pcsCut: mismatch.actual });
      alert("Repaired successfully.");
      await reload();
    } catch (err) {
      console.error(err);
      alert("Failed to repair.");
    }
  };

  const handleRepairAll = async () => {
    const rolls = mismatches.map((m) => m.rollNo).join("\n");
    const confirmMsg = `${mismatches.length} mismatches were found.\n\nThe following roll numbers will be updated:\n\n${rolls}\n\nOnly fabEntries.pcsCut will be updated.\ncuttingVouchers will NOT be modified.\n\nProceed?`;
    if (!window.confirm(confirmMsg)) return;

    let successCount = 0;
    let failedCount = 0;
    const failedRolls = [];

    for (const mismatch of mismatches) {
      try {
        await db.fabEntries.update(mismatch.id, { pcsCut: mismatch.actual });
        successCount++;
      } catch (err) {
        console.error(`Failed to repair roll ${mismatch.rollNo}:`, err);
        failedCount++;
        failedRolls.push(mismatch.rollNo);
      }
    }

    let summary = `Repair Complete\n\nTotal mismatches found: ${mismatches.length}\n\nSuccessfully repaired: ${successCount}\n\nFailed repairs: ${failedCount}`;
    if (failedCount > 0) {
      summary += `\n\nFailed Roll Numbers:\n${failedRolls.map((r) => `- ${r}`).join("\n")}`;
    }

    alert(summary);
    await reload();
  };

  return (
    <ReportPage
      title="Verify PCS Cut Utility"
      filters={
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>
            Total records checked: {fabEntries.length}
          </span>
          <span style={{ fontWeight: "bold" }}>
            Total mismatches: {mismatches.length}
          </span>
          {mismatches.length > 0 && (
            <button
              onClick={handleRepairAll}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Repair All
            </button>
          )}
        </div>
      }
    >
      <div className="report-table-wrapper">
        {mismatches.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>NO MISMATCHES FOUND</h2>
            <p>Total records checked: {fabEntries.length}</p>
            <p>Total mismatches = 0</p>
          </div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Stored PCS Cut</th>
                <th>Actual PCS Cut</th>
                <th>Difference</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mismatches.map((m) => (
                <tr key={m.id}>
                  <td>{m.rollNo}</td>
                  <td>{m.stored}</td>
                  <td>{m.actual}</td>
                  <td>
                    {m.difference > 0 ? `+${m.difference}` : m.difference}
                  </td>
                  <td style={{ color: "red", fontWeight: "bold" }}>
                    MISMATCH FOUND
                  </td>
                  <td>
                    <button
                      onClick={() => handleRepairSelected(m)}
                      style={{
                        padding: "6px 12px",
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Repair Selected
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ReportPage>
  );
}

export default VerifyPcsCut;
