import { SiToyota, SiNissan, SiMazda, SiMitsubishi, SiSuzuki, SiSubaru, SiLexus, SiVolkswagen } from "react-icons/si";
import { TbBrandMercedes } from "react-icons/tb";




const makeOptions = [
  { name: "Toyota", count: "1,197 vehicles", icon: <SiToyota /> },
  { name: "Nissan", count: "146 vehicles", icon: <SiNissan /> },
  { name: "Mercedes-Benz", count: "137 vehicles", icon: <TbBrandMercedes /> },
  { name: "Mazda", count: "131 vehicles", icon: <SiMazda /> },
  { name: "Mitsubishi", count: "121 vehicles", icon: <SiMitsubishi /> },
  { name: "Suzuki", count: "117 vehicles", icon: <SiSuzuki /> },
  { name: "Subaru", count: "95 vehicles", icon: <SiSubaru /> },
  { name: "Lexus", count: "71 vehicles", icon: <SiLexus /> },
  { name: "Volkswagen", count: "41 vehicles", icon: <SiVolkswagen /> },
];

const listings = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
    label: "Shipped",
    brand: "Mercedes-Benz",
    model: "E-Class E200",
    price: "$115,910",
    badge: "8% OFF",
    year: "2021",
    drivetrain: "2WD",
    seats: "4 Seats",
    mileage: "1.5L",
    body: "Convertible",
    doors: "2",
    color: "Beige",
    trim: "Semi-automatic / antique napa leather",
    location: "Mombasa",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    label: "In Stock",
    brand: "Mercedes-Benz",
    model: "GLE-Class GLE 4...",
    price: "$116,343",
    badge: "8% OFF",
    year: "2020",
    drivetrain: "4WD",
    seats: "5 Seats",
    mileage: "2.9L",
    body: "SUV",
    doors: "5",
    color: "Black",
    trim: "Semi-automatic / antique napa leather",
    location: "Mombasa",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    label: "Shipped",
    brand: "Mercedes-Benz",
    model: "C-Class C200",
    price: "$59,800",
    badge: "5% OFF",
    year: "2019",
    drivetrain: "2WD",
    seats: "5 Seats",
    mileage: "1.5L",
    body: "Sedan",
    doors: "4",
    color: "Red",
    trim: "Automatic / premium trim",
    location: "Mombasa",
  },
];

export { makeOptions, listings };