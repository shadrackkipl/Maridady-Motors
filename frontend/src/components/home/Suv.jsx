import React from "react";
import { SuvVehicles } from "../../constants/suv";
import SuvBanner from "../../assets/WEBSITE_BANNER.png";

const numberFormat = new Intl.NumberFormat("en-KE");

const formatKES = (n) =>
  Number.isFinite(n) ? `KES ${numberFormat.format(n)}` : "Price on request";

const formatKm = (n) =>
  Number.isFinite(n) ? `${numberFormat.format(n)} km` : null;

const formatCc = (n) =>
  Number.isFinite(n) ? `${numberFormat.format(n)} cc` : null;

const Spec = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd
      title={value || undefined}
      className="truncate text-sm font-medium text-slate-900"
    >
      {value || "N/A"}
    </dd>
  </div>
);

const VehicleCard = ({ vehicle, priority = false }) => {
  const { image, brand, model, year, price, stock, mileage, engineCc, drivetrain, code } =
    vehicle;

  const title = [year, brand, model].filter(Boolean).join(" ") || "Vehicle";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
            width={800}
            height={600}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No photo
          </div>
        )}
        {stock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm backdrop-blur-sm">
            {stock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h3>
        {code && (
          <p className="mt-0.5 text-xs text-slate-500">Stock no. {code}</p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-slate-100 py-4">
          <Spec label="Mileage" value={formatKm(mileage)} />
          <Spec label="Engine" value={formatCc(engineCc)} />
          <Spec label="Drivetrain" value={drivetrain} />
          <Spec label="Make" value={brand} />
        </dl>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-slate-500">Price</p>
            <p className="text-lg font-bold text-slate-900 sm:text-xl">
              {formatKES(price)}
            </p>
          </div>
          <a
            href={`/vehicles/${code}`}
            aria-label={`View details for ${title}`}
            className="shrink-0 rounded-lg bg-[#2d2d2d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
          >
            View details
          </a>
        </div>
      </div>
    </article>
  );
};

const SuvVehiclesList = () => {
  if (!SuvVehicles?.length) return null;

  return (
    <section aria-labelledby="suv-vehicles-heading" className="relative z-10 w-full min-w-0">
      <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
        <img
          src={SuvBanner}
          alt="Explore our SUV collection"
          className=" w-800  "
          decoding="async"
        />
      </div>

      <div className="w-full min-w-0">
        <div className="rounded-2xl bg-slate-50 p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
          <header>
            <h2
              id="suv-vehicles-heading"
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              SUVs
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Inspected, ready for handover, and priced in Kenya shillings.
            </p>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {SuvVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id ?? vehicle.code}
                vehicle={vehicle}
                priority={index < 3}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="/vehicles"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              Browse all vehicles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuvVehiclesList;