import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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

const Suv = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${API_URL}/api/cars/`, {
        params: { body_type: "suv" },
        signal: controller.signal,
      })
      .then((response) => {
        setCars(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return;
        console.error("Error fetching cars:", requestError);
        setError("Unable to load vehicles. Please try again later.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <p className="vehicle-listing-message">
        Loading Maridady Motors inventory...
      </p>
    );
  }

  if (error) {
    return (
      <p className="vehicle-listing-message" role="alert">
        {error}
      </p>
    );
  }

  return (
    <main className="vehicle-listing">
      <h1 className="vehicle-listing-title">SUVs</h1>
      {cars.length === 0 ? (
        <p className="vehicle-listing-empty">
          No SUVs are currently available.
        </p>
      ) : (
        <div className="vehicle-grid">
          {cars.map((car) => {
            const imageUrl = car.image ? getImageUrl(car.image) : null;

            return (
              <article className="vehicle-card group" key={car.id}>
                <div className="vehicle-card-image">
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
                    <Link
                      className="vehicle-details-button"
                      to={`/cars/${car.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Suv;