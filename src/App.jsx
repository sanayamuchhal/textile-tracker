import { BrowserRouter, Routes, Route } from "react-router-dom";


import Dashboard from "./pages/Dashboard";

import VarChallan from "./pages/VarChallan";
import AddEntry from "./pages/AddEntry";
import ViewEntries from "./pages/ViewEntries";

import FabGrin from "./pages/FabGrin";
import FabEntry from "./pages/FabEntry";
import FabricReturnInput from "./pages/FabricReturnInput";
import CuttingVoucherInput from "./pages/CuttingVoucherInput";
import ViewFabEntries from "./pages/ViewFabEntries";
import FabGrinPivotReport from "./pages/FabGrinPivotReport";
import ViewCuttingVouchers from "./pages/ViewCuttingVouchers";

import CashBook from "./pages/CashBook";
import AddCashEntry from "./pages/AddCashEntry";
import ViewCashEntries from "./pages/ViewCashEntries";

import BankWithdrawal from "./pages/BankWithdrawal";

import WeeklyReport from "./pages/WeeklyReport";
import Reports from "./pages/Reports";
import RequiredReports from "./pages/RequiredReports";
import FabricStockReport from "./pages/reports/FabricStockReport";
import CuttingReport from "./pages/reports/CuttingReport";
import WagesReport from "./pages/reports/WagesReport";
import CashBookReport from "./pages/reports/CashBookReport";
import ProductCostSummary from "./pages/reports/ProductCostSummary";
import VarCostDetail from "./pages/reports/VarCostDetail";
import Export from "./pages/Export";

function App() {
   console.log("APP LOADED");
  return (
    <BrowserRouter>
      <Routes>

          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* VAR Challan */}
<Route path="/var" element={<VarChallan />} />
<Route path="/add" element={<AddEntry />} />
<Route path="/view" element={<ViewEntries />} />
          {/* FAB GRIN */}
          <Route path="/fab" element={<FabGrin />} />
          <Route path="/fab/add" element={<FabEntry />} />
          <Route path="/fab/return" element={<FabricReturnInput />} />
          <Route path="/fab/cutting-voucher" element={<CuttingVoucherInput />} />
          <Route path="/fab/view" element={<ViewFabEntries />} />
          <Route
            path="/fab-grin-pivot-report"
            element={<FabGrinPivotReport />}
          />
          <Route
  path="/view-cutting-vouchers"
  element={<ViewCuttingVouchers />}
/>

          {/* Cash Book */}
          <Route path="/cash-book" element={<CashBook />} />
          <Route path="/cash-entry" element={<AddCashEntry />} />
          <Route
            path="/view-cash-entries"
            element={<ViewCashEntries />}
          />
        
          <Route path="/bank-withdrawal" element={<BankWithdrawal />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/weekly-report" element={<WeeklyReport />} />
          <Route path="/required-reports" element={<RequiredReports />} />
          <Route path="/reports/fabric-stock" element={<FabricStockReport />} />
          <Route path="/reports/cutting" element={<CuttingReport />} />
          <Route path="/reports/wages" element={<WagesReport />} />
          <Route path="/reports/cash-book" element={<CashBookReport />} />
          <Route path="/reports/product-cost-summary" element={<ProductCostSummary />} />
          <Route path="/reports/var-cost-detail" element={<VarCostDetail />} />

          {/* Export */}
          <Route path="/export" element={<Export />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
