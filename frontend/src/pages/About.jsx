import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import ImgCard from '../components/About/ImgCard';
import AboutMaridadyMotors from '../components/About/AboutMaridadyMotors';
import OurPartners from '../components/shared/OurPartners'
import Footer from '../components/Footer/footer'
import WhoAreWe from '../components/About/WhoAreWe';

const About = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />
      <main>
        <ImgCard />
        <AboutMaridadyMotors />
        <WhoAreWe />
        <OurPartners />
      </main>
      <Footer />
    </div>
  )
}

export default About