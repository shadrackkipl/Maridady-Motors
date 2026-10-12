import React from "react";
import { CHECKS } from "./data";
import { display } from "./utils";

export default function BeforeYouSign() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2
            className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
            style={display}
          >
            Before you sign
          </h2>
          <p className="mt-3 text-[#2b2822]">
            Whichever plan you choose, get answers to these in writing. Ask for
            quotations on at least two options and compare the total cost, not
            just the deposit.
          </p>
        </div>
        <dl className="divide-y divide-[#d8d0c1] rounded-lg border border-[#d8d0c1] bg-white">
          {CHECKS.map((c) => (
            <div key={c.t} className="p-5">
              <dt className="font-bold text-[#2d2d2d]" style={display}>
                {c.t}
              </dt>
              <dd className="mt-1 text-[#2b2822]">{c.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}