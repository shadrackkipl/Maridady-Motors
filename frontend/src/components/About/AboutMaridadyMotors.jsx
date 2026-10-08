import React from 'react';
import {
  FaShip,
  FaCreditCard,
  FaMapMarkerAlt,
  FaShieldAlt,
} from 'react-icons/fa';

const cardsData = [
  {
    id: 'import',
    title: 'Direct Auction Imports',
    icon: FaShip,
    shortDesc:
      'Sourcing quality vehicles directly from Japan, UK, and Singapore auctions with transparent pricing, full port clearing, and door-to-door delivery.',
  },
  {
    id: 'sacco',
    title: 'Flexible Financing & SACCO',
    icon: FaCreditCard,
    shortDesc:
      'Flexible bank asset financing, custom payment plans, and our proprietary Maridady SACCO created to make car ownership effortless and affordable.',
  },
  {
    id: 'presence',
    title: 'Countrywide Presence',
    icon: FaMapMarkerAlt,
    shortDesc:
      'Flagship showroom along Kiambu Road, Nairobi, integrated driving school programs, certified pre-owned stock, and dedicated after-sales support.',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-800 font-['Poppins',sans-serif] antialiased px-4 py-12 md:py-20 flex flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="mx-auto inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-stone-200/70 px-3.5 py-1.5 text-center text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-4">
            <FaShieldAlt className="w-4 h-4" aria-hidden="true" />
            Kenya's Trusted Auto & Financing Partner
          </div>
          <h1 className="text-3xl md:text-5xl font-bold  text-neutral-800 leading-tight mb-4">
            Empowering Your Drive with Maridady Motors
          </h1>
          <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            For over 14 years, we've helped thousands of drivers across Kenya buy, import, and finance quality vehicles with complete peace of mind.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {cardsData.map(({ id, title, icon: Icon, shortDesc }) => (
            <div
              key={id}
              className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-400/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-stone-400/40 sm:p-8"
            >
              <div className="w-14 h-14 bg-neutral-800 group-hover:bg-neutral-700 text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-md">
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-800 mb-3">{title}</h3>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
                {shortDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}