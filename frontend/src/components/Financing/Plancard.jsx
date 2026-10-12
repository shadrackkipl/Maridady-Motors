import React from "react";
import { display } from "./utils";

export default function PlanCard({ title, badge, badgeClass, children }) {
  return (
    <article className="rounded-2xl border border-[#d8d0c1] bg-white p-6 shadow-[0_14px_30px_rgba(45,45,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(45,45,45,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-[#2d2d2d]" style={display}>
          {title}
        </h3>
        <span
          className={
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] " +
            badgeClass
          }
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 text-[#2b2822]">{children}</p>
    </article>
  );
}