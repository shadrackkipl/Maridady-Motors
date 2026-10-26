import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import HomeVehicleCard, { HomeVehicleCardSkeleton } from "./HomeVehicleCard";
import { API_URL, DAILY_COUNT, pickDaily, todayLabel } from "./homeVehicleUtils";

const FeaturedVehicles = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${API_URL}/api/cars/`, {
        params: { featured: 1 },
        signal: controller.signal,
      })
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        setCars(pickDaily(list, DAILY_COUNT));
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return;
        console.error("Error loading featured vehicles:", requestError);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Nothing to show: hide the section instead of leaving an empty box
  if (!loading && !error && cars.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-vehicles-heading"
      className="relative z-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-50 p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
          <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2
                className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                id="featured-vehicles-heading"
              >
                Featured vehicles
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Hand-picked from our current stock and refreshed every day.
              </p>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <span className="size-1.5 rounded-full bg-pink-500" />
              Today&apos;s picks · {todayLabel()}
            </p>
          </header>

          {error ? (
            <p className="mt-8 text-center text-sm text-slate-500" role="alert">
              Featured vehicles are unavailable right now. Please try again later.
            </p>
          ) : (
            <div
              aria-busy={loading}
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {loading
                ? Array.from({ length: DAILY_COUNT }, (_, index) => (
                    <HomeVehicleCardSkeleton key={index} />
                  ))
                : cars.map((car, index) => (
                    <HomeVehicleCard car={car} key={car.id} priority={index < 3} />
                  ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
              to="/car-listing"
            >
              Browse all vehicles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;