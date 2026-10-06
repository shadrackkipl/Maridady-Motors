import SuzukiSwift2019 from "../assets/Featured/Suzukiswift.jpg";
import SuzukiSX42020 from "../assets/Featured/SuzukiSX4.jpg";
import MazdaCX52019 from "../assets/Featured/MazdaCX52019.jpg";
import HondaFit2019 from "../assets/Featured/HondaFit2019.jpg";
import HondaWGN2018 from "../assets/Featured/Hondawgn2018.jpg";
import ToyotaNoah2019 from "../assets/Featured/ToyotaNoah2019.jpg";
import NissanXtrail2019 from "../assets/Featured/NissanXtrail2019.jpg";
import ToyotaAqua2019 from "../assets/Featured/ToyotaAqua2019.jpg";

export const featuredVehicles = [
  {
    id: 1,
    code: "E118-032",
    image: SuzukiSwift2019,
    drivetrain: "4WD",
    brand: "Suzuki",
    model: "Swift",
    year: 2019,
    price: 1837500,
    
    mileage: 26000, // Corrected assuming 26,000 km
    engine: "1,200 CC",
  },
  {
    id: 2,
    code: "E118-031",
    image: SuzukiSX42020,
    drivetrain: "4WD",
    brand: "Suzuki",
    model: "SX4",
    year: 2020,
    price: 2730000,
    
    mileage: 85000,
    engine: "1,600 CC",
  },
  {
    id: 3,
    code: "E118-030",
    image: HondaFit2019,
    drivetrain: "4WD",
    brand: "Honda",
    model: "Fit",
    year: 2019,
    price: 1732500,
    
    mileage: 90000,
    engine: "1,500 CC",
  },
  {
    id: 4,
    code: "E118-029",
    image: MazdaCX52019,
    drivetrain: "4WD",
    brand: "Mazda",
    model: "CX-5",
    year: 2019,
    price: 3675000,   
    mileage: 32000,
    engine: "2,200 CC",
  },
  {
    id: 5,
    code: "E118-028",
    image: HondaWGN2018,
    drivetrain: "4WD",
    brand: "Honda",
    model: "Step WGN",
    year: 2018,
    price: 2520000,   
    mileage: 86000,
    engine: "2,000 CC",
  },
  {
    id: 6,
    code: "E118-027",
    image: ToyotaNoah2019,
    drivetrain: "4WD",
    brand: "Toyota",
    model: "Noah",
    year: 2019,
    price: 2835000, 
    mileage: 85000,
    engine: "2,000 CC",
  },
  {
    id: 7,
    code: "E118-026",
    image: NissanXtrail2019,
    drivetrain: "4WD",
    brand: "Nissan",
    model: "X-Trail",
    year: 2019,
    price: 2940000,
   
    mileage: 85000,
    engine: "2,000 CC", // Updated from N/A
  },
  {
    id: 8,
    code: "E118-025",
    image: ToyotaAqua2019,
    drivetrain: "4WD",
    brand: "Toyota",
    model: "Aqua",
    year: 2019,
    price: 1470000,
   
    mileage: 78000,
    engine: "1,500 CC",
  },
];
