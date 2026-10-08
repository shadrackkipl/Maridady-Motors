import React, { useRef } from 'react';
import { partners } from '../../constants/partners';

const OurPartners = () => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-black sm:text-3xl">
        Our Partners
      </h2>

      <div className="relative flex items-center group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-2.5 bg-gray-400/80 hover:bg-gray-500 text-white transition-colors duration-200 flex items-center justify-center rounded-l shadow-sm"
          aria-label="Scroll left"
        >
          <span className="text-xl font-bold">&#10094;</span>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-10 overflow-x-auto scrollbar-hide scroll-smooth py-6 px-12 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {partners.map((partner, index) => (
            <div
              key={partner.id || partner.name || index}
              className="flex-shrink-0 flex items-center justify-center w-36 h-20 transition-transform duration-200 hover:scale-105"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="max-h-full max-w-full"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-2.5 bg-gray-400/80 hover:bg-gray-500 text-white transition-colors duration-200 flex items-center justify-center rounded-r shadow-sm"
          aria-label="Scroll right"
        >
          <span className="text-xl font-bold">&#10095;</span>
        </button>
      </div>
    </section>
  );
};

export default OurPartners;