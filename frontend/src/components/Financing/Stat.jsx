import React from "react";
import { display } from "./utils";

export default function Stat({ label, value, strong }) {
  return (
    <div>
      <dt className="text-sm text-[#6b6a68]">{label}</dt>
      <dd
        className={
          "tabular-nums " +
          (strong
            ? "mt-1 text-4xl font-bold text-[#2d2d2d]"
            : "mt-1 text-lg font-semibold text-[#2d2d2d]")
        }
        style={strong ? display : undefined}
      >
        {value}
      </dd>
    </div>
  );
}