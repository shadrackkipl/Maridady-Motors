import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Banknote,
  CarFront,
  CircleCheck,
  EyeOff,
  Image as ImageIcon,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { asList, getImageUrl, staffApi } from "./Staffapi";
import { useStaff } from "./StaffRoute";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");
const formatPrice = (value) => `KES ${formatNumber(value)}`;

const StaffCars = () => {
  const { me, logout } = useStaff();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return cars;
    return cars.filter((car) =>
      [car.make, car.model_name, car.stock_number, String(car.year)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [cars, search]);

  const availableCount = cars.filter((car) => car.is_available).length;
  const hiddenCount = cars.length - availableCount;
  const inventoryValue = cars.reduce((total, car) => total + Number(car.price || 0), 0);

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

  const deleteCar = async (car) => {
    const name = `${car.year} ${car.make} ${car.model_name}`;
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    setBusyId(car.id);
    setError("");
    setNotice("");

    try {
      await staffApi.delete(`/cars/${car.id}/`);
      setCars((current) => current.filter((item) => item.id !== car.id));
      setNotice(`${name} was deleted.`);
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? "You do not have permission to delete cars."
          : "Could not delete this vehicle."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f6f4] px-4 py-6 text-slate-900 sm:px-7 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span className="grid size-8 place-items-center rounded-lg bg-[#292929] text-white">
                <CarFront aria-hidden="true" className="size-[18px]" />
              </span>
              Maridady Motors <span className="text-slate-300">/</span> Staff portal
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Vehicle inventory</h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {me.first_name || me.username}. Here&apos;s what&apos;s happening in your showroom.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            {me.can.add && (
              <Link
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#292929] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/15 sm:flex-none"
                to="/staff/cars/new"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add vehicle
              </Link>
            )}
            <button
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-900/10 sm:flex-none"
              onClick={logout}
              type="button"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        </header>

        <section aria-label="Inventory overview" className="grid gap-3 py-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total vehicles", value: formatNumber(cars.length), icon: Package, tone: "bg-slate-100 text-slate-700" },
            { label: "Available", value: formatNumber(availableCount), icon: CircleCheck, tone: "bg-emerald-50 text-emerald-700" },
            { label: "Hidden", value: formatNumber(hiddenCount), icon: EyeOff, tone: "bg-amber-50 text-amber-700" },
            { label: "Listed value", value: formatPrice(inventoryValue), icon: Banknote, tone: "bg-rose-50 text-rose-700" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]" key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
                </div>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Your vehicles</h2>
              <p className="mt-1 text-sm text-slate-500">
                {search ? `${filtered.length} matching ${filtered.length === 1 ? "vehicle" : "vehicles"}` : `${cars.length} ${cars.length === 1 ? "vehicle" : "vehicles"} in your inventory`}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search vehicles"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search make, model, year or stock no."
                value={search}
              />
            </label>
          </div>

          {error && (
            <p className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="mx-5 mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 sm:mx-6" role="status">
              {notice}
            </p>
          )}

          {loading ? (
            <div aria-live="polite" className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <span className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
              Loading your inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <CarFront aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">
                {cars.length === 0 ? "Your inventory is empty" : "No vehicles found"}
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {cars.length === 0
                  ? "Add a vehicle to start managing your showroom inventory."
                  : "Try another search term or check the spelling and try again."}
              </p>
              {cars.length === 0 && me.can.add && (
                <Link
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#292929] px-4 text-sm font-semibold text-white transition hover:bg-black"
                  to="/staff/cars/new"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Add your first vehicle
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 lg:hidden">
                {filtered.map((car) => {
                  const imageUrl = car.image ? getImageUrl(car.image) : null;
                  const busy = busyId === car.id;

                  return (
                    <article className="p-4 sm:p-5" key={car.id}>
                      <div className="flex min-w-0 gap-3">
                        {imageUrl ? (
                          <img alt="" className="size-[76px] shrink-0 rounded-xl object-cover" src={imageUrl} />
                        ) : (
                          <span className="grid size-[76px] shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                            <ImageIcon aria-hidden="true" className="size-5" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="break-words font-semibold leading-snug text-slate-900">
                                {car.make} {car.model_name} {car.year}
                              </h3>
                              <p className="mt-1 break-all text-xs text-slate-500">
                                Stock no. {car.stock_number || "—"}
                              </p>
                            </div>
                            <span className="font-semibold text-slate-900">{formatPrice(car.price)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">{car.body_type_display || "Type not specified"}</span>
                            <span className="size-1 rounded-full bg-slate-300" />
                            <button
                              aria-label={`Mark ${car.make} ${car.model_name} ${car.year} ${car.is_available ? "hidden" : "available"}`}
                              aria-pressed={car.is_available}
                              className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                car.is_available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}
                              disabled={busy || !me.can.change}
                              onClick={() => toggleAvailable(car)}
                              type="button"
                            >
                              <span className={`size-1.5 rounded-full ${car.is_available ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {car.is_available ? "Available" : "Hidden"}
                            </button>
                          </div>
                        </div>
                      </div>
                      {(me.can.change || me.can.delete) && (
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                          {me.can.change && (
                            <Link
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              to={`/staff/cars/${car.id}/edit`}
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                              Edit
                            </Link>
                          )}
                          {me.can.delete && (
                            <button
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              disabled={busy}
                              onClick={() => deleteCar(car)}
                              type="button"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Vehicle</th>
                      <th className="px-4 py-3.5">Stock number</th>
                      <th className="px-4 py-3.5">Type</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((car) => {
                      const imageUrl = car.image ? getImageUrl(car.image) : null;
                      const busy = busyId === car.id;

                      return (
                        <tr className="transition hover:bg-slate-50/70" key={car.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {imageUrl ? (
                                <img alt="" className="size-12 rounded-lg object-cover" src={imageUrl} />
                              ) : (
                                <span className="grid size-12 place-items-center rounded-lg bg-slate-100 text-slate-400">
                                  <ImageIcon aria-hidden="true" className="size-[18px]" />
                                </span>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">{car.make} {car.model_name} {car.year}</p>
                                <p className="mt-0.5 text-xs text-slate-500">Vehicle #{car.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{car.stock_number || "—"}</td>
                          <td className="px-4 py-4 text-slate-600">{car.body_type_display || "—"}</td>
                          <td className="px-4 py-4 font-semibold text-slate-900">{formatPrice(car.price)}</td>
                          <td className="px-4 py-4">
                            <button
                              aria-label={`Mark ${car.make} ${car.model_name} ${car.year} ${car.is_available ? "hidden" : "available"}`}
                              aria-pressed={car.is_available}
                              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                car.is_available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}
                              disabled={busy || !me.can.change}
                              onClick={() => toggleAvailable(car)}
                              type="button"
                            >
                              <span className={`size-1.5 rounded-full ${car.is_available ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {car.is_available ? "Available" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {me.can.change && (
                                <Link
                                  aria-label={`Edit ${car.make} ${car.model_name} ${car.year}`}
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                  to={`/staff/cars/${car.id}/edit`}
                                >
                                  <Pencil aria-hidden="true" className="size-4" />
                                </Link>
                              )}
                              {me.can.delete && (
                                <button
                                  aria-label={`Delete ${car.make} ${car.model_name} ${car.year}`}
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                  disabled={busy}
                                  onClick={() => deleteCar(car)}
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" className="size-4" />
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
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 sm:px-6">
                <span>Showing {filtered.length} of {cars.length} vehicles</span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  Inventory management <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </span>
              </div>
            </>
          )}
        </section>
        <footer className="py-5 text-center text-xs text-slate-400">
          Maridady Motors staff workspace
        </footer>
      </div>
    </main>
  );
};

export default StaffCars;