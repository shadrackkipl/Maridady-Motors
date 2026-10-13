import React from 'react'
import Hero from '../components/importation/Hero'
import Process from '../components/importation/Process'
import WhyDirect from '../components/importation/WhyDirect'
import Faqs from '../components/importation/Faqs'
import Enquiry from '../components/importation/Enquiry'

function Importation() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-slate-800">
   
      <Hero />
      <Process />
      <WhyDirect />
      <Faqs />
      <Enquiry />
  
    </div>
  )
}

export default Importation