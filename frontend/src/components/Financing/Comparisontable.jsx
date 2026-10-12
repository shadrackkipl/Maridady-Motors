import React from "react";
import { COLS, TABLE } from "./data";
import { display } from "./utils";

export default function ComparisonTable() {
  return (
    <>
      <div className="mt-10 overflow-x-auto rounded-2xl border border-[#d8d0c1] bg-white shadow-[0_12px_30px_rgba(45,45,45,0.04)]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Maridady Motors financing plans compared
          </caption>
          <thead>
            <tr className="bg-[#363636] text-white">
              <th scope="col" className="p-4 font-semibold">
                <span className="sr-only">Feature</span>
              </th>
              {COLS.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="p-4 font-semibold"
                  style={display}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 ? "bg-[#f3f0e6]" : "bg-white"}
              >
                <th scope="row" className="p-4 font-semibold text-[#2d2d2d]">
                  {row.label}
                </th>
                {row.values.map((v, j) => (
                  <td key={j} className="p-4 align-top text-[#2b2822]">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-[#6b6a68]">
        These are advertised features, not a guarantee of approval. Final terms
        depend on the lender and your application.
      </p>
    </>
  );
}