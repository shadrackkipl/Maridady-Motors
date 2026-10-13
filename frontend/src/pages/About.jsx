import React from 'react'
import ImgCard from '../components/About/ImgCard';
import AboutMaridadyMotors from '../components/About/AboutMaridadyMotors';
import WhoAreWe from '../components/About/WhoAreWe';

const About = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">    
      <main>
        <ImgCard />
        <AboutMaridadyMotors />
        <WhoAreWe />        
      </main>    
    </div>
  )
}

export default About