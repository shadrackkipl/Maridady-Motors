import React, { useState } from 'react'
import { CLASSES, NTSA_FEE, ksh } from './data'

const Fees = () => {
  const [selected, setSelected] = useState('saloon')
  const chosen = CLASSES.find((c) => c.id === selected)

  return (
    <section aria-labelledby="fees" className="pb-2 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="fees" className="mb-2 text-3xl font-bold tracking-tight text-[#22262b]">
            What will it cost me?
          </h2>
          <p className="max-w-xl text-[#5b6168]">
            Pick your licence class to see the training fee plus the NTSA charge.
          </p>
        </div>
        
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-2" role="radiogroup" aria-label="Licence class">
          {CLASSES.map((c) => {
            const on = c.id === selected
            return (
              <label
                key={c.id}
                className={
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3.5 py-3 shadow-sm transition-all duration-200  ' +
                  (on ? ' bg-[#eef6f1]' : 'border-[#d9dad4] bg-white hover:border-slate-900/50')
                }
              >
                <input
                  type="radio"
                  name="licence"
                  value={c.id}
                  checked={on}
                  onChange={() => setSelected(c.id)}
                  className="h-[18px] w-[18px] accent-slate-900"
                />
                <b className="flex-1 font-semibold text-[#22262b]">{c.label}</b>
                <small className="text-[#5b6168]">
                  Class {c.code}, age {c.minAge}+
                </small>
              </label>
            )
          })}
        </div>

        <aside className="rounded-2xl bg-[#202020] p-6 text-white shadow-[0_18px_40px_rgba(34,38,43,0.18)] md:sticky md:top-4" aria-live="polite">
          <div className="mb-3 inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            Selected fee
          </div>
          <dl className="mb-4">
            <div className="flex justify-between py-1.5 text-gray-300">
              <dt>Training fee</dt>
              <dd>{ksh(chosen.training)}</dd>
            </div>
            <div className="flex justify-between py-1.5 text-gray-300">
              <dt>NTSA charges</dt>
              <dd>{ksh(NTSA_FEE)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t-2 border-dashed border-white pt-3.5 text-2xl font-extrabold text-white">
              <dt>Total</dt>
              <dd>{ksh(chosen.training + NTSA_FEE)}</dd>
            </div>
          </dl>
          <p className="text-sm text-gray-400">
            Introductory offer prices. Confirm the current rate with your branch.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default Fees