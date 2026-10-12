import React from "react";
import { display } from "./utils";
import SlideImage1 from "../../assets/slide/slide4.png";

const HERO_STATS = [
  ["Smallest deposit", "10% (bank)"],
  ["Longest term", "60 months"],
  ["Sacco savings goal", "50% of price"],
  ["Sacco loan term", "Up to 24 months"],
];

export default function FinancingHero() {
  return (
    <header
      className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-[#191919] bg-cover bg-center text-white sm:min-h-[680px] lg:min-h-[calc(100svh-72px)]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(18, 18, 18, 0.94) 0%, rgba(18, 18, 18, 0.78) 48%, rgba(18, 18, 18, 0.24) 100%), linear-gradient(0deg, rgba(18, 18, 18, 0.5), transparent 45%), url(${SlideImage1})`,
      }}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white bg-black/25 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Finance your next drive
          </div>
          <h1
            className="mt-7 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
            style={display}
          >
            The right car.
            <br />
            <span className="text-white">Your way to pay.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
            Choose a payment plan that works for you. Explore bank finance,
            Sacco, hire purchase and Flexi-Pay, then estimate your payments in
            minutes.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#estimator"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3.5 font-bold text-[#26231b] shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[#ffe8a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Estimate your payments
            </a>
            <a
              href="tel:0709888777"
              className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Talk to our team
            </a>
          </div>
          <p className="mt-5 text-xs font-medium tracking-wide text-white/60">
            Clear options. Flexible terms. Support at every step.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 text-sm shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md">
          {HERO_STATS.map(([k, v]) => (
            <div key={k} className="bg-[#202020]/90 p-5 sm:p-6">
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-white/60">
                {k}
              </dt>
              <dd
                className="mt-2 text-xl font-bold text-white sm:text-2xl"
                style={display}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
