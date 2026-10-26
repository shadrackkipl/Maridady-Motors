import React from 'react'
import showroom from '../../assets/About/showroom.jpg'

const WhoAreWe = ({ image = showroom }) => {
  return (
    <section
      aria-labelledby="who-we-are-title"
      className="bg-white px-4 py-12 font-['Poppins',sans-serif] sm:px-8 sm:py-16 lg:px-16 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-200/70 px-4 py-2 text-sm font-semibold text-neutral-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Who We Are
          </span>

          <h2
            id="who-we-are-title"
            className="mt-5 text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl lg:text-[2.6rem]"
          >
            15+ Years Helping Drivers Across Kenya
          </h2>

          <p className="mt-5 leading-relaxed text-neutral-600">
            We're a Nairobi motor company built on one idea: buying a car should
            feel safe, clear and within reach. For over 15 years, we've helped
            thousands of drivers across Kenya buy, import and finance quality
            vehicles.
          </p>

          <p className="mt-4 leading-relaxed text-neutral-600">
            We source directly from auctions, show you exactly what you're
            paying for, and stay with you long after the keys change hands.
          </p>

          <p className="mt-4 leading-relaxed text-neutral-600">
            We also founded the Maridady SACCO and run driving school programs,
            so you can finance your car and learn to drive it with the same
            trusted team.
          </p>
        </div>

        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-stone-400/40">
          <img
            src={image}
            alt="Our Nairobi showroom with vehicles on display"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export default WhoAreWe