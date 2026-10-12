import React from "react";
import { DOCS } from "./data";
import { display } from "./utils";

export default function DocumentsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2
          className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
          style={display}
        >
          Documents to bring
        </h2>
        <p className="mt-3 max-w-2xl text-[#2b2822]">
          For bank finance, applicants have been asked for the documents below.
          Call us to confirm the current list before you apply.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {DOCS.map((d) => (
            <div key={d.who} className="rounded-lg border border-[#d8d0c1] p-6">
              <h3 className="text-lg font-bold text-[#2d2d2d]" style={display}>
                {d.who}
              </h3>
              <ul className="mt-4 space-y-2 text-[#2b2822]">
                {d.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fff7d6]"
                    />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-[#6b6a68]">
          Sacco membership works differently: you join, save at least half the
          vehicle’s value and hold membership for six months or more.
        </p>
      </div>
    </section>
  );
}