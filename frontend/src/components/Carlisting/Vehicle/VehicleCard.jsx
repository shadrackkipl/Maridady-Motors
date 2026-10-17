import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");

const getImageUrl = (path) => {
  try {
    return new URL(path, `${API_URL}/`).toString();
  } catch {
    return null;
  }
};

const VehicleCard = ({ car }) => {
  const imageUrl = car.image ? getImageUrl(car.image) : null;

  return (
    <article className="vehicle-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="vehicle-card-image relative aspect-[16/10] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${car.year} ${car.make} ${car.model_name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="vehicle-card-no-image">No Image</div>
        )}
        <span className="vehicle-status">In Stock</span>
      </div>

      <div className="vehicle-card-content">
        <h2 className="vehicle-name">
          {car.year} {car.make} {car.model_name}
        </h2>
        <p className="vehicle-stock">
          Stock no. {car.stock_number || "Not assigned"}
        </p>

        <div className="vehicle-specifications">
          <div>
            <span>Mileage</span>
            <strong>{formatNumber(car.mileage)} km</strong>
          </div>
          <div>
            <span>Engine</span>
            <strong>
              {car.engine_capacity
                ? `${formatNumber(car.engine_capacity)} cc`
                : "—"}
            </strong>
          </div>
          <div>
            <span>Drivetrain</span>
            <strong>{car.drivetrain || "—"}</strong>
          </div>
          <div>
            <span>Make</span>
            <strong>{car.make}</strong>
          </div>
        </div>

        <div className="vehicle-card-footer">
          <div>
            <span className="vehicle-price-label">Price</span>
            <strong className="vehicle-price">
              KES {formatNumber(car.price)}
            </strong>
          </div>
          {/* The ::after layer stretches the link over the whole card */}
          <Link
            className="vehicle-details-button after:absolute after:inset-0"
            to={`/cars/${car.id}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;