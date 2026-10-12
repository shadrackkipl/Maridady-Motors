import React from 'react'
import { FAQS } from './config'

function FaqItem({ q, a }) {
  return (
    <details className="group border-b border-slate-300 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
        {q}
        <span className="text-xl text-black-600 transition group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <p className="mt-3 max-w-prose text-slate-600">{a}</p>
    </details>
  )
}

function Faqs() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6">
      <h2 className="text-3xl font-extrabold text-slate-900">Questions buyers ask</h2>
      <div className="mt-8 border-t border-slate-300">
        {FAQS.map((f) => (
          <FaqItem key={f.q} {...f} />
        ))}
      </div>
    </section>
  )
}

export default Faqs