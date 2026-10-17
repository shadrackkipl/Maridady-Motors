import VehicleListing from "./Vehicle/VehicleListing";

const Pickuptruck = () => (
  <VehicleListing
    bodyType="pickup"
    title="Pickup Trucks"
    emptyMessage="No pickup trucks are currently available."
  />
);

export default Pickuptruck;