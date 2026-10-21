import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Home, About, CarListing, Importation, Financing, Driving, CarDetail } from "./pages";
import Staff from "./pages/Staff";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/footer";
import OurPartners from "./components/shared/OurPartners";

const AppLayout = () => {
  const { pathname } = useLocation();

  const isStaffArea = pathname.startsWith("/staff");

  return (
    <>
      {!isStaffArea && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/car-listing" element={<CarListing />} />
        <Route path="/financing-plans" element={<Financing />} />
        <Route path="/driving-school" element={<Driving />} />
        <Route path="/direct-importation" element={<Importation />} />
        <Route path="/cars/:id" element={<CarDetail />} />

        
        <Route path="/staff/*" element={<Staff />} />
      </Routes>

      {!isStaffArea && (
        <>
          <OurPartners />
          <Footer />
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;