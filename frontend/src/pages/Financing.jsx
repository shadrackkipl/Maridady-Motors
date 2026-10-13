import React from "react";
import Navbar from "../components/Navbar/Navbar";

import FinancingHero from "../components/Financing/FinancingHero";
import EstimatorSection from "../components/Financing/EstimatorSection";
import PlansSection from "../components/Financing/PlansSection";
import DocumentsSection from "../components/Financing/DocumentsSection";
import BeforeYouSign from "../components/Financing/BeforeYouSign";
import ContactSection from "../components/Financing/ContactSection";

const Financing = () => {
  return (
    <div className="bg-white text-[#2b2822]">
    

      <FinancingHero />

      <main>
        <EstimatorSection />
        <PlansSection />
        <DocumentsSection />
        <BeforeYouSign />
        <ContactSection />
      </main>
      
    </div>
  );
};

export default Financing;