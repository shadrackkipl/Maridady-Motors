import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home, About, CarListing, Importation, Financing, Driving } from "./pages";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/footer";
import OurPartners from "./components/shared/OurPartners";

const App = () => {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/car-listing" element={<CarListing />} />
        <Route path="/financing-plans" element={<Financing />} />
        <Route path="/driving-school" element={<Driving />} />      
        <Route path="/direct-importation" element={<Importation />} />
      </Routes>
      
      <OurPartners />
      <Footer />
    </BrowserRouter>
  );
};

export default App;
