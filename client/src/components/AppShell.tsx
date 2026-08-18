import {
  BarChart3,
  Bell,
  CircleDollarSign,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  Settings,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { initials } from "../lib/format";
import { Logo } from "./Logo";
import { TransactionModal } from "./TransactionModal";

const navigation = [
  ["Overview", "/", LayoutDashboard],
  ["Transactions", "/transactions", ReceiptText],
  ["Budgets", "/budgets", Target],
  ["Categories", "/categories", FolderKanban],
  ["Reports", "/reports", BarChart3],
  ["Settings", "/settings", Settings],
] as const;

export function AppShell() {
  const { user, logout } = useAuth();
  const { categories, saveTransaction } = useFinance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();
  const current = navigation.find(([, path]) => path === location.pathname)?.[0] || "Overview";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top"><Logo /><button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {navigation.slice(0, 5).map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === "/"} onClick={() => setMenuOpen(false)}><Icon size={19} /><span>{label}</span>{label === "Budgets" && <small>8</small>}</NavLink>)}
          <span className="nav-label secondary-label">Account</span>
          {navigation.slice(5).map(([label, path, Icon]) => <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-card"><span><CircleDollarSign size={18} /></span><strong>Monthly reset</strong><p>A fresh budget starts in {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", { day: "numeric", month: "short" })}.</p><NavLink to="/budgets">Review limits</NavLink></div>
        <div className="sidebar-user"><span className="avatar">{initials(user?.name || "F")}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div><button onClick={logout} aria-label="Log out"><LogOut size={18} /></button></div>
      </aside>
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar"><div><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu /></button><span className="topbar-section">{current}</span></div><div className="topbar-actions"><span className="date-chip">{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}</span><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><button className="button primary compact" onClick={() => setModalOpen(true)}><Plus size={18} />Add transaction</button></div></header>
        <div className="page-content"><Outlet /></div>
      </main>
      <TransactionModal open={modalOpen} categories={categories} onClose={() => setModalOpen(false)} onSave={saveTransaction} />
    </div>
  );
}

