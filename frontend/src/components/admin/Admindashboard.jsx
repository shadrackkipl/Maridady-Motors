import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiEyeOff,
  FiPackage,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { adminApi } from "../staff/Staffapi";
import { Banner, PageHeader, StatusPill, primaryButtonClass, secondaryButtonClass } from "./AdminUi";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");

const StatCard = ({ icon: Icon, label, value, detail, tone }) => (
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
    {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
  </article>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get("/stats/", { signal: controller.signal })
      .then(({ data }) => setStats(data))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        console.error("Error loading dashboard:", requestError);
        setError("Unable to load the dashboard. Please try again.");
      });

    return () => controller.abort();
  }, []);

  const typeMax = stats ? Math.max(1, ...stats.by_body_type.map((row) => row.count)) : 1;

  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Link className={primaryButtonClass} to="/staff/cars/new">
            <FiPlus aria-hidden="true" className="size-4" />
            Add vehicle
          </Link>
        }
        description="A quick look at your showroom, your team and what changed recently."
        title="Dashboard"
      />

      {error && <Banner>{error}</Banner>}

      {!stats && !error && (
        <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
          <span className="mr-3 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          Loading dashboard...
        </div>
      )}

      {stats && (
        <>
          <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard detail="All vehicles in the system" icon={FiPackage} label="Total vehicles" tone="bg-slate-100 text-slate-700" value={formatNumber(stats.cars.total)} />
            <StatCard detail="Visible to customers" icon={FiCheckCircle} label="Available online" tone="bg-emerald-50 text-emerald-700" value={formatNumber(stats.cars.available)} />
            <StatCard detail="Only staff can see these" icon={FiEyeOff} label="Hidden" tone="bg-amber-50 text-amber-700" value={formatNumber(stats.cars.hidden)} />
            <StatCard detail="Value of available vehicles" icon={FiDollarSign} label="Listed value" tone="bg-sky-50 text-sky-700" value={`KES ${formatNumber(stats.cars.listed_value)}`} />
            <StatCard detail={`${formatNumber(stats.staff.active)} active`} icon={FiUsers} label="Staff members" tone="bg-violet-50 text-violet-700" value={formatNumber(stats.staff.total)} />
            <StatCard detail={`${formatNumber(stats.sales_reps.active)} active`} icon={FiBriefcase} label="Sales team" tone="bg-rose-50 text-rose-700" value={formatNumber(stats.sales_reps.total)} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Vehicles by type</h2>
              {stats.by_body_type.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No vehicles yet.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {stats.by_body_type.map((row) => (
                    <li key={row.body_type}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{row.label}</span>
                        <span className="text-slate-500">{row.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{ width: `${(row.count / typeMax) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recently added</h2>
                <Link className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900" to="/staff/cars">
                  All vehicles
                  <FiArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
              {stats.recent_cars.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No vehicles yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {stats.recent_cars.map((car) => (
                    <li className="flex items-center justify-between gap-3 py-3" key={car.id}>
                      <div className="min-w-0">
                        <Link className="block truncate text-sm font-semibold text-slate-900 hover:underline" to={`/staff/cars/${car.id}/edit`}>
                          {car.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {car.stock_number} ·{" "}
                          {new Date(car.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <StatusPill active={car.is_available} activeLabel="Available" inactiveLabel="Hidden" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className={secondaryButtonClass} to="/staff/cars/new">Add a vehicle</Link>
              <Link className={secondaryButtonClass} to="/admin-panel/staff">Manage staff</Link>
              <Link className={secondaryButtonClass} to="/admin-panel/sales-reps">Manage sales team</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;