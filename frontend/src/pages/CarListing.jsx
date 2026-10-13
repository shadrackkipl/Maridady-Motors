import React from 'react'
import Navbar from "../components/Navbar/Navbar";
import OurPartners from "../components/shared/OurPartners";
import Footer from "../components/Footer/footer";
import Suv from '../components/Carlisting/Suv';

const CarListing = () => {
  return (
    <div>
      <Navbar />

      <div>
        <Suv />
      </div>
    </div>
    
  )
}

export default CarListing