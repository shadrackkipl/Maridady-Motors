import React, { useState } from "react";
import {
  FiMail,
  FiSend,
  FiMapPin,
  FiPhone,
  FiArrowUp,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Stock List", href: "/stock" },
  { label: "Makes List", href: "/makes" },
  { label: "How to Buy", href: "/how-to-buy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const categories = [
  { label: "Sedan", href: "/stock?type=sedan" },
  { label: "SUV", href: "/stock?type=suv" },
  { label: "Hatchback", href: "/stock?type=hatchback" },
  { label: "Trucks", href: "/stock?type=trucks" },
  { label: "Commercial Vehicles", href: "/stock?type=commercial" },
  { label: "Vans & Buses", href: "/stock?type=vans-buses" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/MaridadyMotors/",
    Icon: FiFacebook,
  },
  { label: "Twitter", href: "https://x.com/MaridadyMotors/", Icon: FiTwitter },
  {
    label: "Instagram",
    href: "https://www.instagram.com/maridadymotors/",
    Icon: FiInstagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@MaridadyMotorsLtd",
    Icon: FiYoutube,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@maridadymotors",
    Icon: FaTiktok,
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffbd6]";

const Heading = ({ children }) => (
  <h4 className="mb-5 inline-block border-b-2 border-white/15 pb-1 text-base font-semibold text-white sm:mb-6 sm:text-[17px]">
    {children}
  </h4>
);

const LinkList = ({ items }) => (
  <ul className="grid gap-3 sm:gap-3.5">
    {items.map(({ label, href }) => (
      <li key={label}>
        <a
          href={href}
          className={`group inline-flex items-center gap-2.5 py-0.5 transition-colors hover:text-white ${focusRing}`}
        >
          <span className="h-[1.5px] w-3.5 bg-current transition-all group-hover:w-5" />
          {label}
        </a>
      </li>
    ))}
  </ul>
);

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: send `email` to your newsletter endpoint
    setEmail("");
  };

  return (
    <footer className="relative w-full overflow-x-hidden bg-[linear-gradient(180deg,#302b27,#3b3631_42%,#2e2a27)] pb-8 pt-8 font-['Poppins',system-ui,sans-serif] text-sm text-[#e9e3d6] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] sm:pt-10">
      {/* Newsletter */}
      <div className="mx-auto max-w-[1425px] px-4 sm:px-6">
        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-6 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="mb-1.5 text-xl font-semibold text-[#fff7d6] sm:text-2xl">
              <span aria-hidden="true">✨</span> Subscribe to Our Newsletter
            </h3>
            <p className="text-[#efe9dc]">
              Get the latest updates on new arrivals and exclusive deals.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="flex w-full flex-col gap-3 sm:flex-row sm:gap-3.5 lg:w-auto"
          >
            <label className="flex h-[50px] w-full items-center gap-3 rounded-[10px] border border-white/15 bg-[#f7f2eb]/[0.08] px-4 transition-colors focus-within:border-[#fff7d6] focus-within:bg-white/[0.1] sm:flex-1 lg:w-80 lg:flex-none">
              <FiMail size={18} aria-hidden="true" className="shrink-0 text-[#fff7d6]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#e9e3d6]/75"
              />
            </label>
            <button
              type="submit"
              className={`inline-flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#fff7d6] px-6 text-[15px] font-semibold text-[#2b2822] shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white sm:w-auto ${focusRing}`}
            >
              <FiSend size={16} aria-hidden="true" /> Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="my-10 h-px bg-white/15 sm:my-12" />

      {/* Main columns */}
      <div className="mx-auto grid max-w-[1425px] grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="inline-flex flex-col gap-0.5">
            <span className="text-[19px] font-black leading-none tracking-[0.08em] text-white sm:text-[21px]">
              MARIDADY MOTORS
            </span>
            <span className="border-t border-[#d8cdb6] pt-1 text-center text-[7px] font-medium tracking-[3px] text-[#f5f1e8]">
              MOVE YOUR START
            </span>
          </div>

          <p className="my-5 max-w-xs leading-relaxed text-[#f0eadf]">
            Looking for trustworthy car dealers in Kenya? Maridady Motors is
            your destination for quality vehicles, customer-first service, and a
            seamless buying experience.
          </p>

          <div className="flex flex-wrap gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.08] text-[#f3efe8] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff7d6] hover:text-[#2b2822] sm:h-10 sm:w-10 ${focusRing}`}
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links + categories sit side by side on the smallest screens to save vertical space */}
        <nav aria-label="Quick links">
          <Heading>Quick Links</Heading>
          <LinkList items={quickLinks} />
        </nav>

        <nav aria-label="Vehicle categories">
          <Heading>Vehicle Categories</Heading>
          <LinkList items={categories} />
        </nav>

        <div className="sm:col-span-2 lg:col-span-1">
          <Heading>Contact Us</Heading>
          <ul className="grid gap-4 text-[#f3efe8]">
            <li className="flex items-start gap-3 leading-snug">
              <FiMapPin
                size={16}
                className="mt-0.5 shrink-0 text-[#fff7d6]"
                aria-hidden="true"
              />
              <span>
                Maridady Motors Limited, Head Office Kiambu Road, Ridgeways,
                Nairobi
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FiPhone
                size={16}
                className="mt-0.5 shrink-0 text-[#fff7d6]"
                aria-hidden="true"
              />
              <a
                href="tel:+254709888777"
                className="transition-colors hover:text-white"
              >
                +254 709 88877
              </a>
            </li>
            <li className="flex items-start gap-3">
              <FiMail
                size={16}
                className="mt-0.5 shrink-0 text-[#fff7d6]"
                aria-hidden="true"
              />
              <a
                href="mailto:info@maridadymotors.com"
                className="break-all transition-colors hover:text-white"
              >
                info@maridadymotors.com
              </a>
            </li>
          </ul>

          <div className="mt-6 rounded-[10px] border border-white/15 bg-white/[0.06] px-4 pb-3.5 pt-4 sm:max-w-sm">
            <strong className="font-semibold text-[#fff7d6]">
              Business Hours:
            </strong>
            <p className="mt-2.5 text-[#f3efe8]">
              Mon-Sat: 8AM-6PM, Sun: Closed
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-10 max-w-[1425px] border-t border-white/15 px-4 pt-5 sm:mt-12 sm:px-6">
        <div className="flex flex-col gap-3 text-center text-sm text-[#efe9dc] sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© 2026 Maridady Motors. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.12em] text-[#f5f1e8]/80 sm:justify-end">
            <a
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-white">
              Terms of Use
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-4 right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-[#fff7d6]/15 text-white backdrop-blur-sm transition-all duration-200 hover:bg-[#fff7d6]/25 sm:bottom-6 sm:right-6 ${focusRing}`}
      >
        <FiArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;