import SuzukiSwift2019 from "../assets/Featured/Suzukiswift.jpg";
import SuzukiSX42020 from "../assets/Featured/SuzukiSX4.jpg";
import HondaFit2019 from "../assets/Featured/HondaFit2019.jpg";
import MazdaCX52019 from "../assets/Featured/MazdaCX52019.jpg";
import HondaWGN2018 from "../assets/Featured/Hondawgn2018.jpg";
import ToyotaNoah2019 from "../assets/Featured/ToyotaNoah2019.jpg";

// Prices are in KES, mileage in km, engineCc in cubic centimetres.
// Format these in the UI, not here.
// TODO: confirm `fuel` and `drivetrain` for each vehicle against the
// import documents before publishing. Fuel values are best guesses.
export const featuredVehicles = [
  {
    id: 1,
    code: "E118-032",
    image: SuzukiSwift2019,
    brand: "Suzuki",
    model: "Swift",
    year: 2019,
    price: 1837500,
    mileage: 26000,
    engineCc: 1200,
    fuel: "Petrol",
    drivetrain: "4WD",
  },
  {
    id: 2,
    code: "E118-031",
    image: SuzukiSX42020,
    brand: "Suzuki",
    model: "SX4",
    year: 2020,
    price: 2730000,
    mileage: 85000,
    engineCc: 1600,
    fuel: "Petrol",
    drivetrain: "4WD",
  },
  {
    id: 3,
    code: "E118-030",
    image: HondaFit2019,
    brand: "Honda",
    model: "Fit",
    year: 2019,
    price: 1732500,
    mileage: 90000,
    engineCc: 1500,
    fuel: "Petrol",
    drivetrain: "4WD",
  },
  {
    id: 4,
    code: "E118-029",
    image: MazdaCX52019,
    brand: "Mazda",
    model: "CX-5",
    year: 2019,
    price: 3675000,
    mileage: 32000,
    engineCc: 2200,
    fuel: "Diesel",
    drivetrain: "4WD",
  },
  {
    id: 5,
    code: "E118-028",
    image: HondaWGN2018,
    brand: "Honda",
    model: "Step WGN",
    year: 2018,
    price: 2520000,
    mileage: 86000,
    engineCc: 2000,
    fuel: "Petrol",
    drivetrain: "4WD",
  },
  {
    id: 6,
    code: "E118-027",
    image: ToyotaNoah2019,
    brand: "Toyota",
    model: "Noah",
    year: 2019,
    price: 2835000,
    mileage: 85000,
    engineCc: 2000,
    fuel: "Petrol",
    drivetrain: "4WD",
  },
];