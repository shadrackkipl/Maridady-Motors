import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import SearchCard from "../components/home/SearchCard";
import SlideCard from "../components/home/SlideCard";
import FeaturedVehicles from "../components/home/FeaturedVehicles";
import OurPartners from "../components/home/OurPartners";
import Suv from "../components/home/Suv"
import Footer from "../components/Footer/footer";


const Home = () => {
  const [appliedFilters, setAppliedFilters] = useState({});
  const hasActiveFilters = Object.values(appliedFilters).some(
    (models) => models.length > 0,
  );

  return (
    <div className="min-h-screen bg-[#f3f0e6]">
      <Navbar />
      <div>
        <SlideCard />
      </div>

      <main className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-stretch lg:gap-8 lg:px-8">
        <SearchCard
          onApply={setAppliedFilters}
          onClear={() => setAppliedFilters({})}
        />
        <div className="w-full min-w-full">
          <FeaturedVehicles />
        </div>

        

        <div className="w-full min-w-0 lg:col-span-2">
          <Suv />
        </div>

        
      </main>

      <div>
          <OurPartners />
        </div>

        <div>
          <Footer />
        </div>
    </div>
  );
};

export default Home;
