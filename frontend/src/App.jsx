import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home, About, CarListing, Importation, Financing, Driving } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/car-listing" element={<CarListing />} />
        <Route path="/financing-plans" element={<Financing />} />
        <Route path="/driving-school" element={<Driving />} />      
        <Route path="/direct-importation" element={<Importation />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
