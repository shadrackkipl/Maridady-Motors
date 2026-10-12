import React from "react";
import { display } from "./utils";

export default function ContactSection() {
  return (
    <section className="bg-[#363636] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={display}>
            Talk to us about your plan
          </h2>
          <p className="mt-3 max-w-lg text-[#efe9dc]">
            Tell us the vehicle you want and how you earn. We’ll point you to
            the option that fits and put the terms in writing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="tel:0709888777"
              className="rounded-md bg-[#fff7d6] px-5 py-3 font-semibold text-[#2d2d2d] hover:bg-[#efe9dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Call 0709 888 777
            </a>
            <a
              href="tel:0709888333"
              className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sacco desk: 0709 888 333
            </a>
          </div>
        </div>
        <address className="space-y-2 rounded-lg bg-[#2d2d2d] p-6 not-italic">
          <p className="font-bold" style={display}>
            Maridady Motors
          </p>
          <p className="text-[#efe9dc]">Kiambu Road, Ridgeways, Nairobi</p>
          <p>
            <a
              href="mailto:info@maridadymotors.com"
              className="underline decoration-[#fff7d6] underline-offset-4 hover:text-[#fff7d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              info@maridadymotors.com
            </a>
          </p>
        </address>
      </div>
    </section>
  );
}