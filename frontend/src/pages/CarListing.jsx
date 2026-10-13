// src/pages/CarListing.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const CarListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for your Django backend
  const API_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    axios.get(`${API_URL}/api/cars/`)
      .then(response => {
        setCars(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading Maridady Motors inventory...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Our Available Cars</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {cars.map(car => (
          <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Car Image */}
            {car.image ? (
              <img 
                src={`${API_URL}${car.image}`} 
                alt={`${car.make} ${car.model_name}`} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No Image
              </div>
            )}

            {/* Car Details */}
            <div style={{ padding: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{car.year} {car.make} {car.model_name}</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50', margin: '5px 0' }}>
                ${car.price.toLocaleString()}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>
                {car.mileage.toLocaleString()} KM | {car.transmission} | {car.fuel_type}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '10px' }}>
                {car.description.substring(0, 80)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarListing;