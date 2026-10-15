import VehicleListing from "./Vehicle/VehicleListing";

const Hatchbacks = () => (
  <VehicleListing
    bodyType="hatchback"
    title="Hatchbacks"
    emptyMessage="No hatchbacks are currently available."
  />
);

export default Hatchbacks;