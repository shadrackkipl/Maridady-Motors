import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import VehicleCard from "./Vehicle/VehicleCard";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const EMPTY_FILTERS = { make: "", bodyType: "", minPrice: "", maxPrice: "" };

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700";


const CarSearch = ({ onActiveChange }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${API_URL}/api/cars/`, { signal: controller.signal })
      .then((response) => {
        setCars(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return;
        console.error("Error loading cars for search:", requestError);
        setError("Search is unavailable right now.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Dropdown options come from the cars actually in stock
  const makes = useMemo(
    () => [...new Set(cars.map((car) => car.make).filter(Boolean))].sort(),
    [cars]
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

  const isActive = Object.values(filters).some(Boolean);

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  const results = useMemo(() => {
    if (!isActive) return [];

    const min = filters.minPrice === "" ? null : Number(filters.minPrice);
    const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    return cars.filter((car) => {
      const price = Number(car.price);
      if (filters.make && car.make !== filters.make) return false;
      if (filters.bodyType && car.body_type !== filters.bodyType) return false;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
  }, [cars, filters, isActive]);

  const update = (field) => (event) =>
    setFilters((current) => ({ ...current, [field]: event.target.value }));

  const priceRangeInvalid =
    filters.minPrice !== "" &&
    filters.maxPrice !== "" &&
    Number(filters.minPrice) > Number(filters.maxPrice);

  return (
    <section aria-label="Search vehicles" className="mx-auto max-w-7xl px-4 pt-6">
      <form
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <label className="grid gap-1 text-xs font-semibold text-gray-600">
            Make
            <select
              className={fieldClass}
              disabled={loading}
              onChange={update("make")}
              value={filters.make}
            >
              <option value="">All makes</option>
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-gray-600">
            Car type
            <select
              className={fieldClass}
              disabled={loading}
              onChange={update("bodyType")}
              value={filters.bodyType}
            >
              <option value="">All types</option>
              {bodyTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-gray-600">
            Min price (KES)
            <input
              className={fieldClass}
              inputMode="numeric"
              min="0"
              onChange={update("minPrice")}
              placeholder="e.g. 1,000,000"
              type="number"
              value={filters.minPrice}
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-gray-600">
            Max price (KES)
            <input
              className={fieldClass}
              inputMode="numeric"
              min="0"
              onChange={update("maxPrice")}
              placeholder="e.g. 3,000,000"
              type="number"
              value={filters.maxPrice}
            />
          </label>

          <div className="flex items-end">
            <button
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 lg:w-auto"
              disabled={!isActive}
              onClick={() => setFilters(EMPTY_FILTERS)}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        {priceRangeInvalid && (
          <p className="mt-3 text-xs text-red-600" role="alert">
            The minimum price is higher than the maximum price.
          </p>
        )}
        {error && (
          <p className="mt-3 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>

      {isActive && (
        <div className="vehicle-listing">
          <h2 className="vehicle-listing-title">Search results</h2>
          <p aria-live="polite" className="mb-4 text-sm text-gray-600">
            {results.length === 1
              ? "1 vehicle found"
              : `${results.length} vehicles found`}
          </p>

          {results.length === 0 ? (
            <p className="vehicle-listing-empty">
              No vehicles match your search. Try changing or resetting the
              filters.
            </p>
          ) : (
            <div className="vehicle-grid">
              {results.map((car) => (
                <VehicleCard car={car} key={car.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CarSearch;