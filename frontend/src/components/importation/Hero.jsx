import React from 'react'
import { CONFIG } from './config'
import Estimator from './Estimator'

function Hero() {
  return (
    <section id="estimate" className="scroll-mt-24 bg-[#2d2d2d] pb-16 pt-6 text-white">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-12">
        <div className="pt-6 lg:pt-12">
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Buy direct from Japan, the UK and the UAE. Know the cost before you pay.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-300">
            We find the car, inspect it, ship it to Mombasa, clear it with KRA and register it in
            your name. You see every charge along the way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#enquire"
              className="rounded-md bg-white px-6 py-3 font-semibold text-black hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-[#2d2d2d]"
            >
              Request a car search
            </a>
            <a
              href={`https://wa.me/${CONFIG.whatsapp}`}
              className="rounded-md border border-slate-500 px-6 py-3 font-semibold hover:border-pink-400"
            >
              Chat on WhatsApp
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
            {CONFIG.origins.map((x) => (
              <li key={x.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-400" aria-hidden="true" />
                {x.name}
              </li>
            ))}
          </ul>
        </div>
        <Estimator />
      </div>
    </section>
  )
}

export default Hero