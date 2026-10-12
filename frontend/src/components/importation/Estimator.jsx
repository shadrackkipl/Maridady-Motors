import React, { useMemo, useState } from 'react'
import { CONFIG } from './config'

const fmt = (n) => 'KES ' + Math.round(n).toLocaleString('en-KE')

const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30'

function Estimator() {
  const [origin, setOrigin] = useState(CONFIG.origins[0].id)
  const [price, setPrice] = useState(8000)
  const [insurance, setInsurance] = useState(150)

  const o = CONFIG.origins.find((x) => x.id === origin)

  const calc = useMemo(() => {
    const r = CONFIG.rates
    const cif = (Number(price) + o.shipping + Number(insurance)) * CONFIG.usdToKes
    const duty = cif * r.duty
    const excise = (cif + duty) * r.excise
    const vat = (cif + duty + excise) * r.vat
    const idf = cif * r.idf
    const rdl = cif * r.rdl
    const taxes = duty + excise + vat + idf + rdl
    return { cif, duty, excise, vat, idf, rdl, taxes, total: cif + taxes }
  }, [price, insurance, o])

  const rows = [
    ['Vehicle, shipping and insurance (CIF)', calc.cif],
    ['Import duty', calc.duty],
    ['Excise duty', calc.excise],
    ['VAT', calc.vat],
    ['IDF and RDL', calc.idf + calc.rdl],
  ]

  return (
    <div className="rounded-xl bg-white p-6 text-slate-900 shadow-xl ring-1 ring-slate-900/10 sm:p-8">
      <h2 className="text-2xl font-bold">Estimate your landed cost</h2>
      <p className="mt-1 text-sm text-slate-600">
        See roughly what a car costs once it is cleared in Kenya.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Country of origin
          <select value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputCls + ' mt-1'}>
            {CONFIG.origins.map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Vehicle price (USD)
          <input
            type="number" min="0" step="100" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls + ' mt-1'}
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Marine insurance (USD)
          <input
            type="number" min="0" step="10" value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className={inputCls + ' mt-1'}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Shipping assumed at USD {o.shipping.toLocaleString()}. {o.note}.
      </p>

      <dl className="mt-6 divide-y divide-slate-200 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2.5">
            <dt className="text-slate-600">{label}</dt>
            <dd className="font-medium tabular-nums">{fmt(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-2 flex items-baseline justify-between rounded-lg bg-slate-900 px-4 py-4 text-white">
        <span className="font-medium">Estimated total</span>
        <span className="text-2xl font-bold tabular-nums text- white">{fmt(calc.total)}</span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Estimate only. Actual duty follows KRA's CRSP valuation for the specific model and year, and
        rates change. Excludes registration and our service fee. Rates used: USD 1 = KES {CONFIG.usdToKes}.
      </p>
    </div>
  )
}

export default Estimator