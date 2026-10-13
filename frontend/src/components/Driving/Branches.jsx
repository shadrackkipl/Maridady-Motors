import React from 'react'
import { BRANCHES } from './data'

const Branches = () => {
  return (
    <section aria-labelledby="branches" className="pb-16 pt-12">
      <h2 id="branches" className="mb-2 text-3xl font-bold tracking-tight text-[#22262b]">
        Branches
      </h2>
      <p className="mb-6 max-w-xl text-[#5b6168]">
        Call first to confirm a branch is open and offers your licence class.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BRANCHES.map((b) => (
          <div key={b.name} className="rounded-2xl border border-[#d9dad4] bg-white px-[18px] py-4 shadow-[0_12px_24px_rgba(34,38,43,0.04)] ring-1 ring-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(34,38,43,0.08)]">
            <div className="mb-3 inline-flex rounded-full bg-pink-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-pink-500">
              Branch
            </div>
            <h3 className="mb-1 text-[1.05rem] font-semibold text-[#22262b]">{b.name}</h3>
            <p className="mb-2 text-[#5b6168]">{b.place}</p>
            <a href={'tel:' + b.phone.replace(/\s/g, '')} className="font-bold text-slate-960 transition-colors hover:text-[#154f37]">
              {b.phone}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Branches