import { Link } from "react-router-dom";
import { getImageUrl } from "./homeVehicleUtils";

const numberFormat = new Intl.NumberFormat("en-KE");

const formatKES = (n) =>
  Number.isFinite(n) && n > 0 ? `KES ${numberFormat.format(n)}` : "Price on request";

const formatKm = (n) =>
  Number.isFinite(n) ? `${numberFormat.format(n)} km` : null;

const formatCc = (n) =>
  Number.isFinite(n) && n > 0 ? `${numberFormat.format(n)} cc` : null;

const Spec = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd
      className="truncate text-sm font-medium text-slate-900"
      title={value || undefined}
    >
      {value || "N/A"}
    </dd>
  </div>
);

/** Vehicle card used in the home page sections. `car` is an API car. */
const HomeVehicleCard = ({ car, priority = false }) => {
  const title =
    [ car.make, car.model_name, car.year].filter(Boolean).join(" ") || "Vehicle";
  const imageUrl = car.image ? getImageUrl(car.image) : null;

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            decoding="async"
            height={600}
            loading={priority ? "eager" : "lazy"}
            src={imageUrl}
            width={800}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No photo
          </div>
        )}
        {car.condition && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm backdrop-blur-sm">
            {car.condition}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h3>
        {car.stock_number && (
          <p className="mt-0.5 text-xs text-slate-500">
            Stock no. {car.stock_number}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-slate-100 py-4">
          <Spec label="Mileage" value={formatKm(car.mileage)} />
          <Spec label="Engine" value={formatCc(car.engine_capacity)} />
          <Spec label="Drivetrain" value={car.drivetrain} />
          <Spec label="Fuel type" value={car.fuel_type} />
        </dl>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-slate-500">Price</p>
            <p className="text-lg font-bold text-slate-900 sm:text-xl">
              {formatKES(Number(car.price))}
            </p>
          </div>
          {/* The ::after layer stretches the link over the whole card */}
          <Link
            aria-label={`View details for ${title}`}
            className="shrink-0 rounded-lg bg-[#2d2d2d] px-4 py-2.5 text-sm font-semibold text-white transition-colors after:absolute after:inset-0 hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
            to={`/cars/${car.id}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export const HomeVehicleCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
  >
    <div className="aspect-[16/10] bg-slate-200" />
    <div className="space-y-3 p-5 sm:p-6">
      <div className="h-5 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="h-16 rounded bg-slate-100" />
      <div className="h-9 rounded bg-slate-200" />
    </div>
  </div>
);

export default HomeVehicleCard;