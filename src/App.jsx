import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";

import AddEntry from "./pages/AddEntry";
import ViewEntries from "./pages/ViewEntries";

import FabEntry from "./pages/FabEntry";
import FabricReturnInput from "./pages/FabricReturnInput";
import CuttingVoucherInput from "./pages/CuttingVoucherInput";
import ViewFabEntries from "./pages/ViewFabEntries";

import ViewCuttingVouchers from "./pages/ViewCuttingVouchers";

import AddCashEntry from "./pages/AddCashEntry";
import ViewCashEntries from "./pages/ViewCashEntries";

import BankWithdrawal from "./pages/BankWithdrawal";

import WeeklyReport from "./pages/WeeklyReport";
import RequiredReports from "./pages/RequiredReports";
import FabricStockReport from "./pages/reports/FabricStockReport";
import CuttingReport from "./pages/reports/CuttingReport";
import WagesReport from "./pages/reports/WagesReport";
import CashBookReport from "./pages/reports/CashBookReport";
import ProductCostSummary from "./pages/reports/ProductCostSummary";
import VarCostDetail from "./pages/reports/VarCostDetail";
import MastersLock from "./pages/MastersLock";
import PartyMaster from "./pages/PartyMaster";
import LabourMaster from "./pages/LabourMaster";
import PatternMaster from "./pages/PatternMaster";
import { ensurePatternMasterSeed } from "./data/seedPatternMaster";

function App() {
  console.log("APP LOADED");

  useEffect(() => {
    ensurePatternMasterSeed().catch(console.error);
  }, []);

  const withLayout = (page) => <MainLayout>{page}</MainLayout>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={withLayout(<Dashboard />)} />

        {/* VAR Challan */}
        <Route path="/var" element={withLayout(<AddEntry />)} />
        <Route path="/add" element={withLayout(<AddEntry />)} />
        <Route path="/view" element={withLayout(<ViewEntries />)} />

        {/* FAB GRIN */}
        <Route path="/fab" element={withLayout(<FabEntry />)} />
        <Route path="/fab/add" element={withLayout(<FabEntry />)} />
        <Route path="/fab/return" element={withLayout(<FabricReturnInput />)} />
        <Route path="/fab/cutting-voucher" element={withLayout(<CuttingVoucherInput />)} />
        <Route path="/fab/view" element={withLayout(<ViewFabEntries />)} />
       
        <Route path="/view-cutting-vouchers" element={withLayout(<ViewCuttingVouchers />)} />

        {/* Cash Book */}
        <Route path="/cash-book" element={withLayout(<AddCashEntry />)} />
        <Route path="/cash-entry" element={withLayout(<AddCashEntry />)} />
        <Route path="/view-cash-entries" element={withLayout(<ViewCashEntries />)} />
        <Route path="/bank-withdrawal" element={withLayout(<BankWithdrawal />)} />

        {/* Masters */}
        <Route path="/masters" element={withLayout(<MastersLock />)} />
        <Route path="/masters/party" element={withLayout(<PartyMaster />)} />
        <Route path="/masters/labour" element={withLayout(<LabourMaster />)} />
        <Route path="/masters/pattern" element={withLayout(<PatternMaster />)} />

        {/* Reports */}
        <Route path="/reports" element={withLayout(<CashBookReport />)} />
        <Route path="/weekly-report" element={withLayout(<WeeklyReport />)} />
        <Route path="/required-reports" element={withLayout(<RequiredReports />)} />
        <Route path="/reports/fabric-stock" element={withLayout(<FabricStockReport />)} />
        <Route path="/reports/cutting" element={withLayout(<CuttingReport />)} />
        <Route path="/reports/wages" element={withLayout(<WagesReport />)} />
        <Route path="/reports/cash-book" element={withLayout(<CashBookReport />)} />
        <Route path="/reports/product-cost-summary" element={withLayout(<ProductCostSummary />)} />
        <Route path="/reports/var-cost-detail" element={withLayout(<VarCostDetail />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
