import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import OurPartners from '../components/shared/OurPartners'
import Footer from '../components/Footer/footer'
import Hero from '../components/importation/Hero'
import Process from '../components/importation/Process'
import WhyDirect from '../components/importation/WhyDirect'
import Faqs from '../components/importation/Faqs'
import Enquiry from '../components/importation/Enquiry'

function Importation() {
  return (
    <div className="min-h-screen bg-[#f3f0e6] text-slate-800">
      <Navbar />
      <Hero />
      <Process />
      <WhyDirect />
      <Faqs />
      <Enquiry />
      <OurPartners />
      <Footer />
    </div>
  )
}

export default Importation