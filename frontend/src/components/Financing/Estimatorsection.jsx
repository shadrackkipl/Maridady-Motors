import React from "react";
import { display } from "./utils";
import Estimator from "./Estimator";

export default function EstimatorSection() {
  return (
    <section id="estimator" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-16">
      <h2
        className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
        style={display}
      >
        See what a plan would cost
      </h2>
      <p className="mt-3 max-w-2xl text-[#2b2822]">
        Choose a plan, enter a vehicle price and adjust the deposit and term.
        The calculator shows the payment under both flat and reducing-balance
        interest, so you can see how much the method matters.
      </p>
      <div className="mt-8">
        <Estimator />
      </div>
    </section>
  );
}