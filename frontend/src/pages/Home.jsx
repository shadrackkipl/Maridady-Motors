import React from "react";
import Navbar from "../components/Navbar/Navbar";
import SearchCard from "../components/home/SearchCard";

const Home = () => {
  return (
    <div class="bg-gradient-to-b from-[#EFE3CD] via-[#E8D9BA] to-[#F1E5D1]">
      <Navbar />
      <SearchCard />
    </div>
  );
};

export default Home;
