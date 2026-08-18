import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { LoadingState } from "./components/Ui";
import { useAuth } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";
import { AuthPage } from "./pages/AuthPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage").then((module) => ({ default: module.TransactionsPage })));
const BudgetsPage = lazy(() => import("./pages/BudgetsPage").then((module) => ({ default: module.BudgetsPage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));

function PageBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

function ProtectedWorkspace() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <FinanceProvider><AppShell /></FinanceProvider>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<ProtectedWorkspace />}>
        <Route path="/" element={<PageBoundary><DashboardPage /></PageBoundary>} />
        <Route path="/transactions" element={<PageBoundary><TransactionsPage /></PageBoundary>} />
        <Route path="/budgets" element={<PageBoundary><BudgetsPage /></PageBoundary>} />
        <Route path="/categories" element={<PageBoundary><CategoriesPage /></PageBoundary>} />
        <Route path="/reports" element={<PageBoundary><ReportsPage /></PageBoundary>} />
        <Route path="/settings" element={<PageBoundary><SettingsPage /></PageBoundary>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
