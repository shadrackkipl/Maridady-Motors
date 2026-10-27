import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiDollarSign,
  FiGrid,
  FiEdit2,
  FiEyeOff,
  FiImage,
  FiLogOut,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md";
import { asList, getImageUrl, staffApi } from "./Staffapi";
import { useStaff } from "./StaffRoute";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");
const formatPrice = (value) => `KES ${formatNumber(value)}`;
const carName = (car) => `${car.year} ${car.make} ${car.model_name}`;

const getInitials = (me) => {
  const source =
    [me.first_name, me.last_name].filter(Boolean).join(" ") || me.username || "?";
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "hidden", label: "Hidden" },
];

/* ---------- small presentational pieces (kept outside the page component) ---------- */

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`grid size-9 place-items-center rounded-lg ${tone}`}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
    </div>
    <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>
  </article>
);

const StatusButton = ({ available, disabled, label, onClick }) => (
  <button
    aria-label={label}
    aria-pressed={available}
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-60 ${
      available
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
        : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200"
    }`}
    disabled={disabled}
    onClick={onClick}
    title={available ? "Click to hide from the website" : "Click to show on the website"}
    type="button"
  >
    <span
      className={`size-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-slate-400"}`}
    />
    {available ? "Available" : "Hidden"}
  </button>
);

const Thumbnail = ({ src, className }) =>
  src ? (
    <img alt="" className={`${className} object-cover`} src={src} />
  ) : (
    <span
      className={`${className} grid place-items-center bg-slate-100 text-slate-400`}
    >
      <FiImage aria-hidden="true" className="size-4" />
    </span>
  );

const ConfirmDialog = ({ car, busy, onCancel, onConfirm }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4"
      onClick={busy ? undefined : onCancel}
      role="presentation"
    >
      <div
        aria-labelledby="delete-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
            <FiTrash2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900" id="delete-title">
              Delete this vehicle?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              <strong className="font-semibold text-slate-700">{carName(car)}</strong>{" "}
              will be removed from your inventory and the website. This cannot be
              undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {busy ? "Deleting..." : "Delete vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- page ---------- */

const StaffCars = () => {
  const { me, logout } = useStaff();
  const location = useLocation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    staffApi
      .get("/cars/", { signal: controller.signal })
      .then(({ data }) => setCars(asList(data)))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        console.error("Error loading cars:", requestError);
        setError("Unable to load vehicles. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const availableCars = cars.filter((car) => car.is_available);
  const hiddenCount = cars.length - availableCars.length;
  const listedValue = availableCars.reduce(
    (total, car) => total + Number(car.price || 0),
    0
  );

  const bodyTypes = useMemo(() => {
    const types = new Map();
    cars.forEach((car) => {
      if (car.body_type) {
        types.set(car.body_type, car.body_type_display || car.body_type);
      }
    });
    return [...types.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [cars]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cars.filter((car) => {
      if (statusFilter === "available" && !car.is_available) return false;
      if (statusFilter === "hidden" && car.is_available) return false;
      if (typeFilter && car.body_type !== typeFilter) return false;
      if (!query) return true;

      return [car.make, car.model_name, car.stock_number, String(car.year)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [cars, search, statusFilter, typeFilter]);

  const hasFilters = search !== "" || statusFilter !== "all" || typeFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("");
  };

  const tabCount = (id) =>
    id === "all" ? cars.length : id === "available" ? availableCars.length : hiddenCount;

  const toggleAvailable = async (car) => {
    setBusyId(car.id);
    setError("");
    setNotice("");

    try {
      const data = new FormData();
      data.append("is_available", String(!car.is_available));
      const response = await staffApi.patch(`/cars/${car.id}/`, data);
      setCars((current) =>
        current.map((item) => (item.id === car.id ? response.data : item))
      );
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? "You do not have permission to edit cars."
          : "Could not update availability."
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const car = deleteTarget;
    if (!car) return;

    setBusyId(car.id);
    setError("");
    setNotice("");

    try {
      await staffApi.delete(`/cars/${car.id}/`);
      setCars((current) => current.filter((item) => item.id !== car.id));
      setNotice(`${carName(car)} was deleted.`);
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? "You do not have permission to delete cars."
          : "Could not delete this vehicle."
      );
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const statusLabel = (car) =>
    `${car.is_available ? "Hide" : "Show"} ${carName(car)} ${
      car.is_available ? "from" : "on"
    } the website`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="bg-[#1f1f1f] text-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-white/10">
              <MdDirectionsCar aria-hidden="true" className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Maridady Motors</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                Staff portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-white/15 text-xs font-semibold">
                {getInitials(me)}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium">
                  {[me.first_name, me.last_name].filter(Boolean).join(" ") || me.username}
                </p>
                <p className="text-[11px] text-white/55">
                  {me.is_superuser ? "Administrator" : "Staff member"}
                </p>
              </div>
            </div>
            {me.is_superuser && (
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                to="/admin-panel"
              >
                <FiGrid aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Admin panel</span>
              </Link>
            )}
            <button
              aria-label="Sign out"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={logout}
              type="button"
            >
              <FiLogOut aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Vehicle inventory
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Add, update and manage the vehicles shown on the website.
            </p>
          </div>
          {me.can.add && (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1f1f1f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/15"
              to="/staff/cars/new"
            >
              <FiPlus aria-hidden="true" className="size-4" />
              Add vehicle
            </Link>
          )}
        </div>

        {/* Summary */}
        <section
          aria-label="Inventory summary"
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard icon={FiPackage} label="Total vehicles" tone="bg-slate-100 text-slate-700" value={formatNumber(cars.length)} />
          <StatCard icon={FiCheckCircle} label="Available online" tone="bg-emerald-50 text-emerald-700" value={formatNumber(availableCars.length)} />
          <StatCard icon={FiEyeOff} label="Hidden" tone="bg-amber-50 text-amber-700" value={formatNumber(hiddenCount)} />
          <StatCard icon={FiDollarSign} label="Listed value" tone="bg-sky-50 text-sky-700" value={formatPrice(listedValue)} />
        </section>

        {/* Messages */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1">{error}</p>
            <button aria-label="Dismiss" onClick={() => setError("")} type="button">
              <FiX aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
        {notice && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
            <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button aria-label="Dismiss" onClick={() => setNotice("")} type="button">
              <FiX aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}

        {/* Inventory */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div
                aria-label="Filter by status"
                className="inline-flex w-full rounded-lg bg-slate-100 p-1 lg:w-auto"
                role="tablist"
              >
                {STATUS_TABS.map((tab) => (
                  <button
                    aria-selected={statusFilter === tab.id}
                    className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition lg:flex-none ${
                      statusFilter === tab.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    role="tab"
                    type="button"
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs text-slate-400">{tabCount(tab.id)}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block sm:w-72">
                  <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    aria-label="Search vehicles"
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search make, model, year or stock no."
                    value={search}
                  />
                  {search && (
                    <button
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      onClick={() => setSearch("")}
                      type="button"
                    >
                      <FiX aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </label>

                <select
                  aria-label="Filter by car type"
                  className="min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                  onChange={(event) => setTypeFilter(event.target.value)}
                  value={typeFilter}
                >
                  <option value="">All car types</option>
                  {bodyTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div aria-live="polite" className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <span className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
              Loading your inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <MdDirectionsCar aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">
                {cars.length === 0 ? "Your inventory is empty" : "No vehicles found"}
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {cars.length === 0
                  ? "Add your first vehicle to start managing the showroom inventory."
                  : "Nothing matches your filters. Try a different search or clear them."}
              </p>
              {cars.length === 0 && me.can.add && (
                <Link
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1f1f1f] px-4 text-sm font-semibold text-white hover:bg-black"
                  to="/staff/cars/new"
                >
                  <FiPlus aria-hidden="true" className="size-4" />
                  Add your first vehicle
                </Link>
              )}
              {cars.length > 0 && hasFilters && (
                <button
                  className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={clearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile / tablet cards */}
              <ul className="divide-y divide-slate-100 lg:hidden">
                {filtered.map((car) => {
                  const imageUrl = car.image ? getImageUrl(car.image) : null;
                  const busy = busyId === car.id;

                  return (
                    <li className="p-4 sm:p-5" key={car.id}>
                      <div className="flex min-w-0 gap-3">
                        <Thumbnail className="size-20 shrink-0 rounded-xl" src={imageUrl} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="break-words font-semibold leading-snug">
                                {carName(car)}
                              </h3>
                              <p className="mt-0.5 break-all text-xs text-slate-500">
                                Stock no. {car.stock_number || "—"} · {car.body_type_display || "—"}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1.5 font-semibold">{formatPrice(car.price)}</p>
                          <div className="mt-2">
                            <StatusButton
                              available={car.is_available}
                              disabled={busy || !me.can.change}
                              label={statusLabel(car)}
                              onClick={() => toggleAvailable(car)}
                            />
                          </div>
                        </div>
                      </div>
                      {(me.can.change || me.can.delete) && (
                        <div className="mt-4 flex gap-2">
                          {me.can.change && (
                            <Link
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              to={`/staff/cars/${car.id}/edit`}
                            >
                              <FiEdit2 aria-hidden="true" className="size-4" />
                              Edit
                            </Link>
                          )}
                          {me.can.delete && (
                            <button
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              disabled={busy}
                              onClick={() => setDeleteTarget(car)}
                              type="button"
                            >
                              <FiTrash2 aria-hidden="true" className="size-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <tr>
                      <th className="px-6 py-3" scope="col">Vehicle</th>
                      <th className="px-4 py-3" scope="col">Stock no.</th>
                      <th className="px-4 py-3" scope="col">Type</th>
                      <th className="px-4 py-3" scope="col">Price</th>
                      <th className="px-4 py-3" scope="col">Status</th>
                      <th className="px-6 py-3 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((car) => {
                      const imageUrl = car.image ? getImageUrl(car.image) : null;
                      const busy = busyId === car.id;

                      return (
                        <tr className="transition hover:bg-slate-50" key={car.id}>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Thumbnail className="size-12 shrink-0 rounded-lg" src={imageUrl} />
                              <div>
                                <p className="font-semibold text-slate-900">{carName(car)}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {car.condition || "—"}
                                  {car.location ? ` · ${car.location}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">{car.stock_number || "—"}</td>
                          <td className="px-4 py-3.5 text-slate-600">{car.body_type_display || "—"}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{formatPrice(car.price)}</td>
                          <td className="px-4 py-3.5">
                            <StatusButton
                              available={car.is_available}
                              disabled={busy || !me.can.change}
                              label={statusLabel(car)}
                              onClick={() => toggleAvailable(car)}
                            />
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex justify-end gap-2">
                              {me.can.change && (
                                <Link
                                  aria-label={`Edit ${carName(car)}`}
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                  title="Edit"
                                  to={`/staff/cars/${car.id}/edit`}
                                >
                                  <FiEdit2 aria-hidden="true" className="size-4" />
                                </Link>
                              )}
                              {me.can.delete && (
                                <button
                                  aria-label={`Delete ${carName(car)}`}
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                  disabled={busy}
                                  onClick={() => setDeleteTarget(car)}
                                  title="Delete"
                                  type="button"
                                >
                                  <FiTrash2 aria-hidden="true" className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">
                <span>
                  Showing {filtered.length} of {cars.length}{" "}
                  {cars.length === 1 ? "vehicle" : "vehicles"}
                </span>
                {hasFilters && (
                  <button
                    className="font-semibold text-slate-700 hover:underline"
                    onClick={clearFilters}
                    type="button"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          Maridady Motors staff workspace
        </footer>
      </main>

      {deleteTarget && (
        <ConfirmDialog
          busy={busyId === deleteTarget.id}
          car={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default StaffCars;