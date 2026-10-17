import React from "react";
import SearchCard from "../components/home/SearchCard";
import SlideCard from "../components/home/SlideCard";
import FeaturedVehicles from "../components/home/FeaturedVehicles";
import Suv from "../components/home/Suv";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div>
        <SlideCard />
      </div>

      <main className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-stretch lg:gap-8 lg:px-8">
      
        <SearchCard
          applyPath="/car-listing"
          className="lg:h-full"
          showEmptyMakes
        />

        <div className="w-full min-w-full">
          <FeaturedVehicles />
        </div>

        <div className="w-full min-w-0 lg:col-span-2">
          <Suv />
        </div>
      </main>
    </div>
  );
};

export default Home;