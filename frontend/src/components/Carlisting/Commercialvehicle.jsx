import VehicleListing from "./Vehicle/VehicleListing";

const Commercialvehicle = () => (
  <VehicleListing
    bodyType="commercial"
    title="Commercial Vehicles"
    emptyMessage="No commercial vehicles are currently available."
  />
);

export default Commercialvehicle;