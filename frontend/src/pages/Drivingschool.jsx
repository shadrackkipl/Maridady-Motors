import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Hero from '../components/Driving/Hero'
import Fees from '../components/Driving/Fees'
import Packages from '../components/Driving/Packages'
import Branches from '../components/Driving/Branches'
import OurPartners from '../components/shared/OurPartners'
import Footer from '../components/Footer/footer'

const Drivingschool = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#22262b]">
      <Navbar />
      <div className="font-sans leading-relaxed text-[#22262b]">
        <Hero />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-2 sm:px-6 lg:px-8">          
          <Fees />
          <Packages />
          <Branches />
        </main>
        <OurPartners />
        <Footer />
      </div>
    </div>
  )
}

export default Drivingschool