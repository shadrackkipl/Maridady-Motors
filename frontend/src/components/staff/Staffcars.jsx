import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { asList, getImageUrl, staffApi } from "./Staffapi";
import { useStaff } from "./StaffRoute";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");

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
    <main className="min-h-screen bg-[#f5f5f0] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Vehicles</h1>
          <p className="text-sm text-gray-500">
            Signed in as {me.first_name || me.username}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {me.can.add && (
            <Link
              className="flex flex-1 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black sm:flex-none"
              to="/staff/cars/new"
            >
              Add car
            </Link>
          )}
          <button
            className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:flex-none"
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <input
        aria-label="Search vehicles"
        className="mt-5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700 sm:max-w-sm sm:py-2.5 sm:text-sm"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by make, model, year or stock no."
        value={search}
      />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-500">Loading vehicles...</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          {cars.length === 0 ? "No vehicles yet." : "No vehicles match your search."}
        </p>
      ) : (
        <>
        <div className="mt-5 grid gap-3 lg:hidden">
          {filtered.map((car) => {
            const imageUrl = car.image ? getImageUrl(car.image) : null;
            const busy = busyId === car.id;

            return (
              <article
                className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                key={car.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {imageUrl ? (
                    <img
                      alt=""
                      className="h-16 w-20 shrink-0 rounded-lg object-cover"
                      src={imageUrl}
                    />
                  ) : (
                    <span className="grid h-16 w-20 shrink-0 place-items-center rounded-lg bg-gray-100 text-[11px] text-gray-500">
                      No image
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold leading-snug text-gray-900">
                      {car.make} {car.model_name} {car.year}
                    </h2>
                    <p className="mt-1 break-all text-xs text-gray-500">
                      Stock no. {car.stock_number || "—"}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Type</dt>
                    <dd className="mt-0.5 break-words font-medium text-gray-800">
                      {car.body_type_display || "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Price (KES)</dt>
                    <dd className="mt-0.5 break-words font-medium text-gray-900">
                      {formatNumber(car.price)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="mb-1 text-xs text-gray-500">Availability</dt>
                    <dd>
                      <button
                        aria-pressed={car.is_available}
                        className={`min-h-10 rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                          car.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        disabled={busy || !me.can.change}
                        onClick={() => toggleAvailable(car)}
                        type="button"
                      >
                        {car.is_available ? "Available" : "Hidden"}
                      </button>
                    </dd>
                  </div>
                </dl>

                {(me.can.change || me.can.delete) && (
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    {me.can.change && (
                      <Link
                        className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        to={`/staff/cars/${car.id}/edit`}
                      >
                        Edit
                      </Link>
                    )}
                    {me.can.delete && (
                      <button
                        className="min-h-11 flex-1 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => deleteCar(car)}
                        type="button"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-5 hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Stock no.</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price (KES)</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((car) => {
                const imageUrl = car.image ? getImageUrl(car.image) : null;
                const busy = busyId === car.id;

                return (
                  <tr className="border-b border-gray-100 last:border-b-0" key={car.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            alt=""
                            className="h-12 w-20 rounded-md object-cover"
                            src={imageUrl}
                          />
                        ) : (
                          <span className="grid h-12 w-20 place-items-center rounded-md bg-gray-100 text-[11px] text-gray-500">
                            No image
                          </span>
                        )}
                        <span className="font-semibold text-gray-900">
                          {car.make} {car.model_name} {car.year} 
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{car.stock_number}</td>
                    <td className="px-4 py-3 text-gray-600">{car.body_type_display}</td>
                    <td className="px-4 py-3 text-gray-900">{formatNumber(car.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        aria-pressed={car.is_available}
                        className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                          car.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        disabled={busy || !me.can.change}
                        onClick={() => toggleAvailable(car)}
                        type="button"
                      >
                        {car.is_available ? "Available" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {me.can.change && (
                          <Link
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            to={`/staff/cars/${car.id}/edit`}
                          >
                            Edit
                          </Link>
                        )}
                        {me.can.delete && (
                          <button
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            disabled={busy}
                            onClick={() => deleteCar(car)}
                            type="button"
                          >
                            Delete
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
        </>
      )}
      </div>
    </main>
  );
};

export default StaffCars;