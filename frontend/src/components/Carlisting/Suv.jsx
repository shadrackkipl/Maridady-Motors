import VehicleListing from "./Vehicle/VehicleListing";

const Suv = () => (
  <VehicleListing
    bodyType="suv"
    title="SUVs"
    emptyMessage="No SUVs are currently available."
  />
);

export default Suv;