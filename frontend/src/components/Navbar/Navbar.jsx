import React, { useState } from "react";
import MaridadyLogo from "../../assets/MaridadyLogo.png";

const navItems = [
  "Home",
  "About Us ",
  "Inventory",
  "Motorbikes",
  "Direct Importation",
  "Financing Plans",
  "Sacco",
  "Driving School",
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#2d2d2d] text-slate-100 shadow-lg backdrop-blur-sm">
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

        <nav aria-label="Main navigation" className="hidden items-center gap-6 xl:flex">
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
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 xl:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`${menuOpen ? "block" : "hidden"} border-t border-slate-700 px-4 py-3 xl:hidden`}
      >
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-1 sm:grid-cols-3">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-amber-400"
              >
                {item.trim()}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
