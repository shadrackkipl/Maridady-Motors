import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom"; // remove if not using React Router
import MaridadyLogo from "../../assets/MaridadyLogo.png";

// Items with `children` render as a dropdown. Add more children any time.
const navItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Stock List", to: "/car-listing" },
  {
    label: "Investment",
    children: [
      { label: "Import To Sale", to: "/importers-club" },
        { label: "Smart Cab", to: "/smart-cab" },
      { label: "Driving School", to: "/driving-school" },
    ],
  },
  { label: "Motorbikes", to: "/motorbikes" },
  { label: "Direct Importation", to: "/importation" },
  { label: "Financing Plans", to: "/financing" },
  { label: "Sacco", to: "/sacco" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400";

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // desktop
  const [openMobileGroup, setOpenMobileGroup] = useState(null); // mobile accordion
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close everything on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close mobile menu if viewport grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const desktopLink = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 hover:text-pink-400 ${focusRing} ${
      isActive ? "text-pink-400" : "text-slate-100"
    }`;

  const mobileLink = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-pink-400 ${focusRing} ${
      isActive ? "text-pink-400" : "text-slate-200"
    }`;

  const dropdownLink = ({ isActive }) =>
    `block px-4 py-2 text-sm transition-colors hover:bg-white/10 hover:text-pink-400 ${focusRing} ${
      isActive ? "text-pink-400" : "text-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#2d2d2d] text-slate-100 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8 lg:px-12">
        <Link to="/" className={`flex items-center gap-3 ${focusRing}`} aria-label="Maridady Motors home">
          <img src={MaridadyLogo} alt="" className="h-10 w-auto" />
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-wide text-white">Maridady</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white">
              Motors
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          ref={navRef}
          aria-label="Main navigation"
          className="hidden items-center gap-5 xl:flex"
        >
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  aria-haspopup="true"
                  aria-expanded={openDropdown === item.label}
                  className={`flex items-center gap-1 text-sm font-medium text-slate-100 transition-colors duration-200 hover:text-pink-400 ${focusRing}`}
                >
                  {item.label}
                  <Chevron open={openDropdown === item.label} />
                </button>

                {openDropdown === item.label && (
                  // pt-2 keeps the hover area continuous between button and panel
                  <div className="absolute left-0 top-full pt-2">
                    <ul className="min-w-[13rem] overflow-hidden rounded-xl border border-slate-700 bg-[#2d2d2d] py-1 shadow-xl">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            onClick={() => setOpenDropdown(null)}
                            className={dropdownLink}
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={desktopLink}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/sell"
            className={`hidden rounded-full border border-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 hover:text-slate-950 md:inline-flex ${focusRing}`}
          >
            Sell A Car
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-pink-200 xl:hidden ${focusRing}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`${menuOpen ? "block" : "hidden"} border-t border-slate-700 px-4 py-3 xl:hidden`}
      >
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-1 sm:grid-cols-3">
          {navItems.map((item) =>
            item.children ? (
              <li key={item.label} className="col-span-full">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMobileGroup(openMobileGroup === item.label ? null : item.label)
                  }
                  aria-expanded={openMobileGroup === item.label}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-pink-400 ${focusRing}`}
                >
                  {item.label}
                  <Chevron open={openMobileGroup === item.label} />
                </button>
                {openMobileGroup === item.label && (
                  <ul className="ml-3 mt-1 border-l border-slate-600 pl-2">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          onClick={() => setMenuOpen(false)}
                          className={mobileLink}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLink}
                >
                  {item.label}
                </NavLink>
              </li>
            )
          )}
          <li className="col-span-full mt-2 md:hidden">
            <Link
              to="/sell"
              onClick={() => setMenuOpen(false)}
              className={`block rounded-full border border-pink-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-pink-500 hover:text-slate-950 ${focusRing}`}
            >
              Sell A Car
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;