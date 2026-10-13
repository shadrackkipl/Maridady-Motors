import React, { useMemo, useState } from "react";
import { SuvVehicles } from "../../constants/suv";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);

const formatNumber = (n) => new Intl.NumberFormat("en-KE").format(n);

const SORTS = {
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  "mileage-asc": { label: "Lowest mileage", fn: (a, b) => a.mileage - b.mileage },
  "year-desc": { label: "Newest first", fn: (a, b) => b.year - a.year },
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const Suv = () => {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("price-asc");

  const brands = useMemo(
    () => ["All", ...new Set(SuvVehicles.map((v) => v.brand))],
    []
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SuvVehicles.filter((v) => brand === "All" || v.brand === brand)
      .filter(
        (v) =>
          !q ||
          `${v.brand} ${v.model} ${v.year} ${v.code}`.toLowerCase().includes(q)
      )
      .sort(SORTS[sort].fn);
  }, [query, brand, sort]);

  const reset = () => {
    setQuery("");
    setBrand("All");
    setSort("price-asc");
  };

  return (
    <section className="mx-auto max-w-6xl bg-slate-50 px-5 pb-16 pt-10 text-slate-900">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          SUVs
        </h1>
        <p className="text-slate-500">
          {visible.length} of {SuvVehicles.length} vehicles
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by model, year or code"
          aria-label="Search SUVs"
          className={`h-11 rounded-md border border-slate-300 bg-white px-3.5 ${focusRing}`}
        />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by brand">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={b === brand}
              onClick={() => setBrand(b)}
              className={`h-11 rounded-md border px-4 ${focusRing} ${
                b === brand
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white hover:bg-slate-100"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort vehicles"
          className={`h-11 rounded-md border border-slate-300 bg-white px-3 ${focusRing}`}
        >
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-12 text-center text-slate-500">
          <p className="mb-4">No SUVs match your search.</p>
          <button
            type="button"
            onClick={reset}
            className={`h-11 rounded-md border border-slate-300 bg-white px-4 hover:bg-slate-100 ${focusRing}`}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v) => {
            const inStock = v.stock === "In Stock";
            return (
              <li
                key={v.id}
                className="overflow-hidden rounded-md border border-slate-200 bg-white"
              >
                <div className="relative aspect-[4/3] bg-slate-200">
                  <img
                    src={v.image}
                    alt={`${v.year} ${v.brand} ${v.model}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-semibold text-white ${
                      inStock ? "bg-emerald-700" : "bg-red-700"
                    }`}
                  >
                    {v.stock}
                  </span>
                </div>

                <div className="px-4 pb-5 pt-4">
                  <h2 className="text-lg font-bold">
                    {v.year} {v.brand} {v.model}
                  </h2>
                  <p className="mb-4 mt-1 text-2xl font-extrabold tabular-nums text-blue-700">
                    {formatPrice(v.price)}
                  </p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-4">
                    {[
                      ["Mileage", `${formatNumber(v.mileage)} km`],
                      ["Engine", `${formatNumber(v.engineCc)} cc`],
                      ["Drive", v.drivetrain],
                      ["Code", v.code],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className="mt-0.5 font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default Suv;