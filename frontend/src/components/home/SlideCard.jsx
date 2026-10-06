import React, { useEffect, useState } from "react";
import SlideImage1 from "../../assets/slide/slide1.png";
import SlideImage2 from "../../assets/slide/slide2.png";
import SlideImage3 from "../../assets/slide/slide3.png";
import SlideImage4 from "../../assets/slide/slide4.png";

const slides = [
  {
    image: SlideImage1,
    title: "Redefining Adventure: The All-New Hilux",
    subtitle: "Rugged capability meets sophisticated tech. Built to dominate every Kenyan road.",
    button: "View Inventory",
  },
  {
    image: SlideImage2,
    title: "Precision Performance for Every Journey",
    subtitle: "Kenya's trusted partner for high-quality, fully inspected pre-owned and new vehicles.",
    button: "Explore Models",
  },
  {
    image: SlideImage3,
    title: "Built for the City. Ready for the Wild.",
    subtitle: "From daily city commutes to weekend getaways, find the perfect ride for your lifestyle.",
    button: "Browse Collection",
  },
  {
    image: SlideImage4,
    title: "Drive the Future. Own the Road.",
    subtitle: "Unbeatable deals, flexible financing, and a seamless buying experience at Maridady Motors.",
    button: "Book a Test Drive",
  },
];

const SlideCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, isPaused]);

  const showSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const activeSlide = slides[activeIndex];

  return (
    <div
      className="w-full min-w-0 overflow-hidden rounded-[18px] border border-[#d8d0c1] bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.14)] sm:p-3"
      role="region"
      aria-label="Featured vehicles"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] sm:aspect-[16/9] lg:aspect-[16/7]">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== activeIndex}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15),rgba(0,0,0,0.68)_62%,rgba(0,0,0,0.78))]" />
          </div>
        ))}

        <div className="absolute inset-0 z-10 flex items-center justify-between px-5 pb-6 pt-7 sm:px-7 lg:px-10">
          <div className="max-w-[660px] text-left text-white">
            <h2 className="max-w-[640px] text-[2rem] font-semibold leading-[0.96] tracking-[-0.04em] text-[#f4efe8] drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] sm:text-[3rem] lg:text-[4rem]">
              {activeSlide.title}
            </h2>
            <p className="mt-4 max-w-[560px] text-sm leading-[1.5] text-[#f0ece7] drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:text-base lg:text-[1.1rem]">
              {activeSlide.subtitle}
            </p>
            <button
              type="button"
              className="mt-7 inline-flex items-center justify-center rounded-[10px] border border-[#e8e1d6] bg-[#d7d0c3]/70 px-5 py-3 text-base font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-[#d7d0c3]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {activeSlide.button}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showSlide(activeIndex - 1)}
          aria-label="Show previous slide"
          className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white transition hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-3 sm:h-10 sm:w-10 sm:text-2xl"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => showSlide(activeIndex + 1)}
          aria-label="Show next slide"
          className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white transition hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3 sm:h-10 sm:w-10 sm:text-2xl"
        >
          &#8250;
        </button>

        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 sm:bottom-4">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => showSlide(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideCard;
