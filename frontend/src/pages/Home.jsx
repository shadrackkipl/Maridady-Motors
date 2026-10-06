import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import SearchCard from "../components/home/SearchCard";
import SlideCard from "../components/home/SlideCard";
import FeaturedVehicles from "../components/home/FeaturedVehicles";

const Home = () => {
  const [appliedFilters, setAppliedFilters] = useState({});
  const hasActiveFilters = Object.values(appliedFilters).some(
    (models) => models.length > 0,
  );

  return (
    <div className="min-h-screen bg-[#f3f0e6]">
      <Navbar />
      <section className="w-290 ml-100 mt-10 lg:flex-1">
        <SlideCard />
      </section>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-6 px-4 ml-4 -mt-130 pb-10 lg:flex-row lg:items-start lg:gap-8">
        <SearchCard
          onApply={setAppliedFilters}
          onClear={() => setAppliedFilters({})}
        />
      </main>
      <div className="ml-92 -mt-40">
        <FeaturedVehicles />
      </div>
    </div>
  );
};

export default Home;
