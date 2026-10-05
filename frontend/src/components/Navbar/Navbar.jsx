import React from "react";
import MaridadyLogo from "../../assets/MaridadyLogo.png";

const navItems = [
  "Home",
  "About",
  "Inventory",
  "Motorbikes",
  "Direct Importation",
  "Financing Plans",
  "Sacco",
  "Driving School",
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-black text-slate-100 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3" aria-label="Maridady Motors home">
          <img src={MaridadyLogo} alt="Maridady Motors logo" className="h-10 w-auto" />
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-wide text-white">Maridady</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.28em] text-amber-400">
              Motors
            </span>
          </div>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-slate-200 transition-colors duration-200 hover:text-amber-400"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden rounded-full border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-400 hover:text-slate-950 md:inline-flex"
          >
            Sell A Car
          </a>
          <button
            type="button"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 lg:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
