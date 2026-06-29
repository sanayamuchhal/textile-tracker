import { useMemo, useState } from "react";
import { ReportPage, ReportTable, SelectFilter } from "./ReportComponents";
import { useReportData } from "./useReportData";
import {
  buildVarCostDetail,
  exportRows,
  unique,
} from "../../utils/reportUtils";

function VarCostDetail() {
  const { cuttingVouchers = [], entries = [] } = useReportData([
  "cuttingVouchers",
  "entries",
]);
const [rollNumber, setRollNumber] = useState("");

  const [articleNo, setArticleNo] = useState("");

  const selectedRoll = cuttingVouchers.find(
  (entry) =>
    String(entry.rollNo) === rollNumber &&
    String(entry.articleNo) === articleNo
);
  
  const detail = useMemo(
    () => buildVarCostDetail(selectedRoll, entries),
    [selectedRoll, entries]
  );
  const exportData = detail.detail
    ? [
        detail.detail,
        ...detail.rows,
        { "Job Type": "Total Amount", Amount: detail.totalAmount },
        { "Job Type": "Cost Per Piece", Amount: detail.costPerPiece },
      ]
    : [];
    const articleOptions = unique(
  cuttingVouchers
    .filter((entry) => String(entry.rollNo) === rollNumber)
    .map((entry) => entry.articleNo)
);

  return (
    <ReportPage
      title="VAR Cost Detail"
      rows={detail.rows}
      onExport={() => exportRows(exportData, "VAR_Cost_Detail")}
      filters={
        <>
          <SelectFilter
            label="Roll Number"
            value={rollNumber}
            options={unique(cuttingVouchers.map((entry) => entry.rollNo))}
            onChange={(value) => {
              setRollNumber(value);
              setArticleNo("");
            }}
          />

          <SelectFilter
            label="Article No"
            value={articleNo}
            options={articleOptions}
            onChange={setArticleNo}
          />
        </>
      }
    >
      {detail.detail && (
        <div className="report-section">
          <ReportTable rows={[detail.detail]} />
          <p style={{ marginTop: 12 }}>
            <strong>Total Amount:</strong> {detail.totalAmount}
          </p>
          <p>
            <strong>Cost Per Piece:</strong> {detail.costPerPiece}
          </p>
        </div>
      )}
    </ReportPage>
  );
}

export default VarCostDetail;
