import React, { useEffect, useRef, useState } from "react";
import SlideImage1 from "../../assets/slide/slide1.png";
import SlideImage2 from "../../assets/slide/slide2.png";
import SlideImage3 from "../../assets/slide/slide3.png";
import SlideImage4 from "../../assets/slide/slide4.png";

const slides = [
  {
    image: SlideImage1,
    tag: "FEATURED MODEL",
    title: "Redefining Adventure: The All-New Hilux",
    subtitle: "Rugged capability meets sophisticated tech. Built to dominate every Kenyan road.",
    button: "View Inventory",
  },
  {
    image: SlideImage2,
    tag: "PREMIUM SELECTION",
    title: "Precision Performance for Every Journey",
    subtitle: "Kenya's trusted partner for high-quality, fully inspected pre-owned and new vehicles.",
    button: "Explore Models",
  },
  {
    image: SlideImage3,
    tag: "VERSATILE DRIVES",
    title: "Built for the City. Ready for the Wild.",
    subtitle: "From daily city commutes to weekend getaways, find the perfect ride for your lifestyle.",
    button: "Browse Collection",
  },
  {
    image: SlideImage4,
    tag: "EXCLUSIVE OFFERS",
    title: "Drive the Future. Own the Road.",
    subtitle: "Unbeatable deals, flexible financing, and a seamless buying experience at Maridady Motors.",
    button: "Book a Test Drive",
  },
];

const SlideCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (isPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const showSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const swipeDistance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(swipeDistance) > 50) {
      showSlide(activeIndex + (swipeDistance < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="group relative w-full overflow-hidden  border border-zinc-200/80 bg-zinc-950 shadow-2xl transition-all duration-300 dark:border-zinc-800"
      role="region"
      aria-label="Featured vehicles"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out motion-reduce:transition-none ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={!isActive}
            >
              {/* Background Image with Cinematic Gradient Overlay */}
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent sm:bg-gradient-to-r sm:from-zinc-950/90 sm:via-zinc-950/50 sm:to-transparent" />

              {/* Glassmorphic Content Card */}
              <div className="absolute inset-0 flex items-end p-4 pb-12 sm:items-center sm:p-10 lg:p-16">
                <div
                  className={`max-w-xl rounded-xl border border-white/10 bg-zinc-950/45 p-4 backdrop-blur-md transition-all duration-700 sm:p-8 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="text-[10px] font-semibold tracking-wider text-zinc-300 uppercase sm:text-xs">
                      {slide.tag}
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-300 sm:mt-3 sm:text-base">
                    {slide.subtitle}
                  </p>

                  <div className="mt-4 flex items-center gap-4 sm:mt-6">
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      className="group/btn relative inline-flex min-h-11 items-center justify-center overflow-hidden rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black sm:px-6 sm:py-3 sm:text-sm"
                    >
                      <span>{slide.button}</span>
                      <svg
                        className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}


        {/* Navigation Arrow Controls */}
        <button
          type="button"
          onClick={() => showSlide(activeIndex - 1)}
          aria-label="Show previous slide"
          className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-950/30 text-white backdrop-blur-md transition-all duration-200 hover:bg-zinc-950/60 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => showSlide(activeIndex + 1)}
          aria-label="Show next slide"
          className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-950/30 text-white backdrop-blur-md transition-all duration-200 hover:bg-zinc-950/60 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Modern Bar Indicators */}
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2 px-4 sm:bottom-6">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => showSlide(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideCard;