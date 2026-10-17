import { useEffect, useState } from "react";
import axios from "axios";
import VehicleCard from "./VehicleCard";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/**
 * Lists available vehicles of one body type.
 * bodyType must match a value in the Car model: suv, sedan, hatchback,
 * station_wagon, pickup, van, minivan, commercial or other.
 */
const VehicleListing = ({ bodyType, title, emptyMessage }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    axios
      .get(`${API_URL}/api/cars/`, {
        params: { body_type: bodyType },
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
  }, [bodyType]);

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
      <h1 className="vehicle-listing-title">{title}</h1>
      {cars.length === 0 ? (
        <p className="vehicle-listing-empty">
          {emptyMessage || "No vehicles are currently available."}
        </p>
      ) : (
        <div className="vehicle-grid">
          {cars.map((car) => (
            <VehicleCard car={car} key={car.id} />
          ))}
        </div>
      )}
    </main>
  );
};

export default VehicleListing;