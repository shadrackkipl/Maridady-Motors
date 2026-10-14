// src/pages/AdminAddCar.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
const MAX_YEAR = new Date().getFullYear() + 1;

const INITIAL_FORM = {
  make: "",
  model_name: "",
  year: "",
  stock_number: "",
  price: "",
  mileage: "",
  engine_capacity: "",
  drivetrain: "4WD",
  is_available: true,
};

// Reusable styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  color: "#555",
  fontSize: "14px",
};
const cardStyle = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "24px",
  border: "1px solid #eee",
};
const cardTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#34495e",
  borderBottom: "1px solid #f0f0f0",
  paddingBottom: "10px",
};
// Collapses to one column on narrow screens
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
};

const AdminAddCar = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const messageRef = useRef(null);

  // Revoke the preview URL when it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Bring the banner into view (the form is long)
  useEffect(() => {
    if (message.text && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [message]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (message.type !== "success") return;
    const timer = setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage({ text: "Please select a vehicle image.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("image", image);

    try {
      // Do NOT set Content-Type manually: the browser adds the multipart boundary
      await axios.post(`${API_URL}/api/cars/add/`, data);

      setMessage({ text: "Vehicle added successfully!", type: "success" });

      // Reset everything, including the file input itself
      setFormData(INITIAL_FORM);
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error);

      const status = error.response?.status;
      const errData = error.response?.data;
      let detail = "";

      if (status === 401 || status === 403) {
        detail = "You are not authorized. Please log in again.";
      } else if (errData && typeof errData === "object") {
        // DRF returns { field: ["error", ...], ... }
        detail = Object.entries(errData)
          .map(([key, val]) => `${key}: ${[].concat(val).join(", ")}`)
          .join(" | ");
      } else if (!error.response) {
        detail = "Cannot reach the server.";
      }

      setMessage({
        text: `Error adding vehicle. ${detail}`.trim(),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1
        style={{
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
          color: "#2c3e50",
        }}
      >
        Add New Vehicle
      </h1>

      {message.text && (
        <div
          ref={messageRef}
          role="alert"
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${
              message.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Info */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Basic Information</h3>
          <div style={gridStyle}>
            <div>
              <label htmlFor="make" style={labelStyle}>
                Make (e.g., Toyota)
              </label>
              <input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Toyota"
              />
            </div>
            <div>
              <label htmlFor="model_name" style={labelStyle}>
                Model (e.g., Camry)
              </label>
              <input
                id="model_name"
                name="model_name"
                value={formData.model_name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Camry"
              />
            </div>
            <div>
              <label htmlFor="year" style={labelStyle}>
                Year
              </label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1950"
                max={MAX_YEAR}
                style={inputStyle}
                placeholder="2023"
              />
            </div>
            <div>
              <label htmlFor="stock_number" style={labelStyle}>
                Stock no.
              </label>
              <input
                id="stock_number"
                name="stock_number"
                value={formData.stock_number}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="E118-013"
              />
            </div>
            <div>
              <label htmlFor="price" style={labelStyle}>
                Price (KES)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="any"
                style={inputStyle}
                placeholder="25000"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vehicle specifications */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Vehicle Specifications</h3>
          <div style={gridStyle}>
            <div>
              <label htmlFor="mileage" style={labelStyle}>
                Mileage (KM)
              </label>
              <input
                id="mileage"
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min="0"
                style={inputStyle}
                placeholder="15000"
              />
            </div>
            <div>
              <label htmlFor="engine_capacity" style={labelStyle}>
                Engine (cc)
              </label>
              <input
                id="engine_capacity"
                type="number"
                name="engine_capacity"
                value={formData.engine_capacity}
                onChange={handleChange}
                required
                min="1"
                style={inputStyle}
                placeholder="2700"
              />
            </div>
            <div>
              <label htmlFor="drivetrain" style={labelStyle}>
                Drivetrain
              </label>
              <select
                id="drivetrain"
                name="drivetrain"
                value={formData.drivetrain}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="2WD">2WD</option>
                <option value="4WD">4WD</option>
                <option value="AWD">AWD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Media & Status */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Image & Availability</h3>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="image" style={labelStyle}>
              Vehicle Image
            </label>
            <input
              id="image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              style={{
                padding: "8px",
                border: "1px dashed #ccc",
                borderRadius: "6px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            {imagePreview && (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                  }}
                >
                  Image Preview:
                </p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              Publish this vehicle to the frontend immediately
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: loading ? "#95a5a6" : "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "background 0.3s",
          }}
        >
          {loading ? "Adding Vehicle..." : "Add Vehicle to Inventory"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddCar;
