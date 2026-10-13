import React from 'react'
import { PACKAGES, ksh } from './data'

const Packages = () => {
  return (
    <section aria-labelledby="packages" className="pb-2 pt-12">
      <h2 id="packages" className="mb-2 text-3xl font-bold tracking-tight text-[#22262b]">
        Car lesson packages (B/B1)
      </h2>
      <p className="mb-6 max-w-xl text-[#5b6168]">
        All three include unlimited theory classes and 20 practical lessons. They differ in how far
        you drive each lesson.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-[#d9dad4] bg-white shadow-[0_12px_24px_rgba(34,38,43,0.04)]">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="bg-[#ecece5] text-[#22262b]">
              <th className="px-4 py-3 font-bold">Package</th>
              <th className="px-4 py-3 font-bold">Practical lessons</th>
              <th className="px-4 py-3 font-bold">Distance per lesson</th>
              <th className="px-4 py-3 font-bold">Fee</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGES.map((p) => (
              <tr key={p.name} className="border-t border-[#e6e7e1] text-[#22262b]">
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3">{p.lessons}</td>
                <td className="px-4 py-3">{p.km} km</td>
                <td className="px-4 py-3 font-semibold ">{ksh(p.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-xl text-[#5b6168]">
        Learning material is Ksh 1,000 and NTSA fees of Ksh 2,450 are listed separately.
      </p>
    </section>
  )
}

export default Packages