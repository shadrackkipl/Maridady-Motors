import React from 'react'
import SlideImage1 from "../../assets/slide/slide2.png";
import { WHATSAPP, MAIN_PHONE } from './data'

const Hero = () => {
  return (
    <header className="bg-[#202020] pb-14 pt-16 text-white"
     style={{
            backgroundImage: `linear-gradient(90deg, rgba(18, 18, 18, 0.94) 0%, rgba(18, 18, 18, 0.78) 48%, rgba(18, 18, 18, 0.24) 100%), linear-gradient(0deg, rgba(18, 18, 18, 0.5), transparent 45%), url(${SlideImage1})`,
          }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
          MARIDADY AUTO ACADEMY
        </div>
        <h1 className="mb-4 max-w-[14em] text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          Learn to drive with Maridady Driving Academy
        </h1>
        <p className="mb-7 max-w-xl text-lg text-gray-300">
          Theory, defensive driving and practical lessons for motorbikes, saloon cars, trucks and
          PSVs. Morning, evening and weekend classes.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={WHATSAPP}
            className="rounded-md border-2 border-white bg-white px-5 py-3 font-bold text-[#22262b] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Chat on WhatsApp
          </a>
          <a
            href={'tel:' + MAIN_PHONE.replace(/\s/g, '')}
           className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
            Call {MAIN_PHONE}
          </a>
        </div>
        <div/>
      </div>
    </header>
  )
}

export default Hero