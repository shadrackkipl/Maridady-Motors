import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  FiBriefcase,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md";
import { useStaff } from "../staff/StaffRoute";

const NAV = [
  { to: "/admin-panel", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/staff/cars", label: "Vehicles", icon: MdDirectionsCar },
  { to: "/admin-panel/staff", label: "Staff members", icon: FiUsers },
  { to: "/admin-panel/sales-reps", label: "Sales team", icon: FiBriefcase },
];

const getInitials = (me) =>
  ([me.first_name, me.last_name].filter(Boolean).join(" ") || me.username || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AdminLayout = () => {
  const { me, logout } = useStaff();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    [me.first_name, me.last_name].filter(Boolean).join(" ") || me.username;

  const sidebar = (
    <div className="flex h-full flex-col bg-[#1f1f1f] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="grid size-9 place-items-center rounded-lg bg-white/10">
          <MdDirectionsCar aria-hidden="true" className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Maridady Motors</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Admin panel
          </p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`
            }
            end={end}
            key={to}
            onClick={() => setMenuOpen(false)}
            to={to}
          >
            <Icon aria-hidden="true" className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold">
            {getInitials(me)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="text-[11px] text-white/55">Administrator</p>
          </div>
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={logout}
          type="button"
        >
          <FiLogOut aria-hidden="true" className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">
            Signed in as <span className="font-semibold text-slate-800">{displayName}</span>
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            to="/"
          >
            View website
            <FiExternalLink aria-hidden="true" className="size-4" />
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;