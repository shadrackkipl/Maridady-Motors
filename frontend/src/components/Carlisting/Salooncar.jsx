import VehicleListing from "./Vehicle/VehicleListing";

const Salooncar = () => (
  <VehicleListing
    bodyType="sedan"
    title="Sedan"
    emptyMessage="No saloon cars are currently available."
  />
);

export default Salooncar;