import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home, About, CarListing, Importation, Financing } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/car-listing" element={<CarListing />} />
        <Route path="/financing" element={<Financing />} />
      
        <Route path="/importation" element={<Importation />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
