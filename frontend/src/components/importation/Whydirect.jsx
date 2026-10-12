import React from 'react'
import { WHY_DIRECT } from './config'

function WhyDirect() {
  return (
    <section className="bg-[#2d2d2d] py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-12">
        {WHY_DIRECT.map(([t, b]) => (
          <div key={t}>
            <h3 className="text-xl font-bold text-white">{t}</h3>
            <p className="mt-2 text-white-400">{b}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhyDirect