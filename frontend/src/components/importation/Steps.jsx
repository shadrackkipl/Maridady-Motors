import React from 'react'
import { STEPS } from './config'

function Steps() {
  return (
    <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative border-t-2 border-black-500 pt-5">
          <span className="text-sm font-bold text-black-600">Stage {i + 1}</span>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{s.title}</h3>
          <p className="mt-2 text-slate-600">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

export default Steps