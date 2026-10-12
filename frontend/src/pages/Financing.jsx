import React from "react";
import Navbar from "../components/Navbar/Navbar";
import OurPartners from "../components/shared/OurPartners";
import Footer from "../components/Footer/footer";
import FinancingHero from "../components/Financing/FinancingHero";
import EstimatorSection from "../components/Financing/EstimatorSection";
import PlansSection from "../components/Financing/PlansSection";
import DocumentsSection from "../components/Financing/DocumentsSection";
import BeforeYouSign from "../components/Financing/BeforeYouSign";
import ContactSection from "../components/Financing/ContactSection";

const Financing = () => {
  return (
    <div className="bg-white text-[#2b2822]">
      <Navbar />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap');`}</style>

      <FinancingHero />

      <main>
        <EstimatorSection />
        <PlansSection />
        <DocumentsSection />
        <BeforeYouSign />
        <ContactSection />
      </main>
      <OurPartners />

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Financing;