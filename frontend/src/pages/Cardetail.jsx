import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(
  /\D/g,
  "",
);

// WhatsApp Business link used by the "Ask Price" button
const WHATSAPP_ASK_PRICE_LINK = "https://wa.me/message/REOQ2KB3FWBYF1";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");

const getImageUrl = (path) => {
  try {
    return new URL(path, `${API_URL}/`).toString();
  } catch {
    return null;
  }
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Specs" },
  { id: "features", label: "Features" },
];

// Edit these to match your showroom. Times are minutes after midnight (Nairobi time).
const OPENING_HOURS = [
  {
    label: "Monday to Friday",
    days: [1, 2, 3, 4, 5],
    open: 7 * 60 + 30,
    close: 18 * 60,
  },
  { label: "Saturday", days: [6], open: 7 * 60 + 30, close: 18 * 60 },
  { label: "Sunday", days: [0], open: 10 * 60, close: 16 * 60 },
];

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const formatTime = (minutes) => {
  const hours24 = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, "0");
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${mins} ${suffix}`;
};

// Is the showroom open right now? Public holidays are not checked.
const isOpenNow = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value;
  const day = WEEKDAYS[get("weekday")];
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  return OPENING_HOURS.some(
    (slot) =>
      slot.days.includes(day) && minutes >= slot.open && minutes < slot.close,
  );
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PhoneIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ICONS = {
  calendar: (
    <>
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  body: (
    <>
      <rect height="13" width="15" x="1" y="3" />
      <path d="M16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  engine: (
    <>
      <rect height="16" rx="2" width="16" x="4" y="4" />
      <rect height="6" width="6" x="9" y="9" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>
  ),
  fuel: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  transmission: (
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  ),
  drivetrain: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z" />
    </>
  ),
  door: (
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
  ),
  seat: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  color: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </>
  ),
};

const Icon = ({ name, className = "h-4 w-4" }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    {ICONS[name]}
  </svg>
);

// Turns **bold** markers from the admin into <strong> text
const renderRichText = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong className="font-bold text-gray-900" key={index}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(isOpenNow);

  // Keep the Open/Closed badge current
  useEffect(() => {
    const timer = setInterval(() => setShowroomOpen(isOpenNow()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setActiveImage(0);

    axios
      .get(`${API_URL}/api/cars/${id}/`, { signal: controller.signal })
      .then((response) => setCar(response.data))
      .catch((requestError) => {
        if (axios.isCancel(requestError)) return;
        console.error("Error fetching car:", requestError);
        setError(
          requestError.response?.status === 404
            ? "This vehicle is no longer available."
            : "Unable to load this vehicle. Please try again later.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id]);

  // Cover image first, then gallery images, without duplicates
  const images = useMemo(() => {
    if (!car) return [];
    const urls = [car.image, ...(car.images || []).map((item) => item.image)]
      .filter(Boolean)
      .map(getImageUrl)
      .filter(Boolean);
    return [...new Set(urls)];
  }, [car]);

  const showPrevious = useCallback(
    () => setActiveImage((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const showNext = useCallback(
    () => setActiveImage((i) => (i + 1) % images.length),
    [images.length],
  );

  // Lightbox: Escape closes, arrows navigate, body scroll locked
  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, showPrevious, showNext]);

  if (loading) {
    return (
      <p className="px-4 py-12 text-center text-gray-500">Loading vehicle...</p>
    );
  }

  if (error || !car) {
    return (
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <button
          className="mb-3 text-sm text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
          type="button"
        >
          ← Back to listings
        </button>
        <p className="px-4 py-12 text-center text-gray-500" role="alert">
          {error || "Vehicle not found."}
        </p>
      </main>
    );
  }

  const title = ` ${car.make} ${car.model_name} ${car.year}`;

  // Chosen per vehicle in the Django admin
  const salesReps = car.sales_representatives || [];

  const whatsappLink = (text) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled sharing */
    }
  };

  const specifications = [
    ["Year", car.year],
    ["Make", car.make],
    ["Model", car.model_name],
    ["Variant", car.variant],
    ["Trim", car.trim],
    ["Model Code", car.model_code],
    ["Condition", car.condition],
    ["Body Type", car.body_type_display],
    ["Mileage", car.mileage != null ? `${formatNumber(car.mileage)} km` : ""],
    [
      "Engine Size",
      car.engine_capacity ? `${formatNumber(car.engine_capacity)} cc` : "",
    ],
    ["Fuel Type", car.fuel_type],
    ["Transmission", car.transmission],
    ["Drivetrain", car.drivetrain],
    ["Doors", car.doors],
    ["Seats", car.seats],
    ["Exterior Color", car.exterior_color],
    ["Interior Color", car.interior_color],
  ];

  // Cards on the Overview tab; empty values are hidden
  const keySpecs = [
    { icon: "calendar", label: "Year", value: car.year },
    { icon: "info", label: "Condition", value: car.condition },
    { icon: "body", label: "Body Type", value: car.body_type_display },
    {
      icon: "engine",
      label: "Engine",
      value: car.engine_capacity
        ? `${formatNumber(car.engine_capacity)} cc`
        : "",
    },
    { icon: "fuel", label: "Fuel Type", value: car.fuel_type },
    { icon: "transmission", label: "Transmission", value: car.transmission },
    { icon: "drivetrain", label: "Drivetrain", value: car.drivetrain },
    { icon: "door", label: "Doors", value: car.doors },
    { icon: "seat", label: "Seats", value: car.seats },
    { icon: "color", label: "Exterior Color", value: car.exterior_color },
    { icon: "color", label: "Interior Color", value: car.interior_color },
  ].filter((spec) => spec.value !== "" && spec.value != null);

  // Features tab list; falls back to the top features if no equipment is entered
  const equipmentList = car.equipment_list?.length
    ? car.equipment_list
    : car.feature_list || [];

  // Larger tap target on touch devices
  const arrowClass =
    "absolute top-1/2 flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl leading-none shadow hover:bg-white";

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 bg-[#f5f5f0]">
      <button
        className="mb-3 text-sm text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
        type="button"
      >
        ← Back to listings
      </button>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5">
        {/* Gallery */}
        <section
          aria-label="Vehicle photos"
          className="rounded-xl bg-white p-1.5 shadow-sm sm:p-2"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
            {images.length > 0 ? (
              <img
                alt={title}
                className="h-full w-full object-cover"
                src={images[activeImage]}
              />
            ) : (
              <div className="grid h-full place-items-center text-gray-500">
                No Image
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  className={`${arrowClass} left-2 sm:left-3`}
                  onClick={showPrevious}
                  type="button"
                >
                  ‹
                </button>
                <button
                  aria-label="Next photo"
                  className={`${arrowClass} right-2 sm:right-3`}
                  onClick={showNext}
                  type="button"
                >
                  ›
                </button>
              </>
            )}

            {images.length > 0 && (
              <>
                <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2.5 py-0.5 text-[11px] text-white sm:bottom-3 sm:left-3">
                  {activeImage + 1}/{images.length}
                </span>
                <button
                  className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium shadow hover:bg-white sm:bottom-3 sm:right-3 sm:px-3 sm:py-1.5 sm:text-xs"
                  onClick={() => setLightboxOpen(true)}
                  type="button"
                >
                  ⛶ Fullscreen
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5 sm:gap-2 lg:grid-cols-6">
              {images.map((src, index) => (
                <button
                  aria-label={`Show photo ${index + 1}`}
                  className={`aspect-[4/3] overflow-hidden rounded-md border-2 p-0 ${
                    index === activeImage
                      ? "border-gray-900"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  key={src}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={src}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="grid gap-4">
          <div className="rounded-xl bg-white p-3 shadow-sm sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {car.condition && (
                  <span className="rounded bg-pink-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {car.condition}
                  </span>
                )}
                {car.location && (
                  <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                    {car.location}
                  </span>
                )}
              </div>
              <button
                className="shrink-0 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs hover:bg-gray-50"
                onClick={handleShare}
                type="button"
              >
                {copied ? "Link copied" : "Share"}
              </button>
            </div>

            <h1 className="mb-1 mt-3 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {title}
            </h1>
            <p className="text-xs text-gray-500">
              Stock no. {car.stock_number || "—"}
            </p>

            <p className="my-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              KES {formatNumber(car.price)}
            </p>

            <a
              className="inline-block rounded-full border border-gray-300 px-3.5 py-1.5 text-xs text-gray-800 hover:bg-gray-50"
              href={WHATSAPP_ASK_PRICE_LINK}
              rel="noopener noreferrer"
              target="_blank"
            >
              Ask Price
            </a>

            <div className="my-4 grid grid-cols-2 gap-2">
              <div className="grid gap-0.5 rounded-lg bg-gray-50 p-2.5 text-center sm:p-3">
                <span className="text-[11px] text-gray-500">Engine</span>
                <strong className="text-[13px]">
                  {car.engine_capacity
                    ? `${formatNumber(car.engine_capacity)} cc`
                    : "—"}
                </strong>
              </div>
              <div className="grid gap-0.5 rounded-lg bg-gray-50 p-2.5 text-center sm:p-3">
                <span className="text-[11px] text-gray-500">Transmission</span>
                <strong className="text-[13px]">
                  {car.transmission || "—"}
                </strong>
              </div>
            </div>

            <a
              className="block rounded-md bg-gray-700 p-3 text-center text-[13px] font-semibold text-white hover:bg-gray-900"
              href={whatsappLink(
                `Hi Maridady Motors, I'm interested in the ${title} (Stock no. ${car.stock_number}). Is it still available?`,
              )}
              rel="noopener noreferrer"
              target="_blank"
            >
              Send Inquiry
            </a>
          </div>

          {/* Tabs */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="grid grid-cols-3" role="tablist">
              {TABS.map((tab) => (
                <button
                  aria-selected={activeTab === tab.id}
                  className={`px-1.5 py-3 text-[11px] sm:px-2 sm:text-xs ${
                    activeTab === tab.id
                      ? "bg-gray-700 font-semibold text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-3 sm:p-4" role="tabpanel">
              {activeTab === "overview" && (
                <div className="grid gap-5">
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Icon name="wrench" /> Key Specifications
                    </h2>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {keySpecs.map((spec) => (
                        <div
                          className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5 sm:gap-3 sm:p-3"
                          key={spec.label}
                        >
                          <span className="mt-0.5 shrink-0 text-gray-600">
                            <Icon name={spec.icon} />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-[11px] text-gray-500">
                              {spec.label}
                            </span>
                            <strong className="block truncate text-[12px] text-gray-900 sm:text-[13px]">
                              {spec.value}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Icon name="info" /> Description
                    </h2>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">
                      {car.description
                        ? renderRichText(car.description)
                        : "No description provided."}
                    </p>
                  </section>
                </div>
              )}

              {activeTab === "specifications" && (
                <>
                  <h2 className="mb-3 text-[13px] font-bold">
                    Vehicle Specifications
                  </h2>
                  <dl>
                    {specifications.map(([label, value]) => (
                      <div
                        className="flex justify-between gap-4 border-b border-gray-100 py-3 text-xs"
                        key={label}
                      >
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="text-right font-semibold">
                          {value === "" || value == null ? "N/A" : value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}

              {activeTab === "features" && (
                <>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Icon name="check" /> Features &amp; Equipment
                  </h2>
                  {equipmentList.length > 0 ? (
                    <ul>
                      {equipmentList.map((item) => (
                        <li
                          className="flex items-center gap-3 border-b border-gray-100 py-3 text-[13px] text-gray-700 last:border-b-0"
                          key={item}
                        >
                          <span className="shrink-0 text-gray-600">
                            <Icon className="h-4 w-4 shrink-0" name="check" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-gray-700">
                      No features listed.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Opening times & sales representatives — clean full-width row */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5 lg:mt-6">
        <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Opening times
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              <span aria-hidden="true">🇰🇪</span> Commercial
            </span>
          </div>

          <span
            className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              showroomOpen
                ? "bg-pink-100 text-pink-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {showroomOpen ? "Open now" : "Closed"}
          </span>

          <dl className="mt-3">
            {OPENING_HOURS.map((slot) => (
              <div
                className="flex justify-between gap-4 border-b border-gray-100 py-3 text-xs"
                key={slot.label}
              >
                <dt className="text-gray-500">{slot.label}:</dt>
                <dd className="text-right font-bold text-gray-900">
                  {formatTime(slot.open)} - {formatTime(slot.close)}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-3 text-xs">
              <dt className="text-gray-500">Public Holidays:</dt>
              <dd className="font-bold text-gray-900">Closed</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Sales representatives
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
              <span aria-hidden="true">🇰🇪</span> Commercial
            </span>
          </div>

          {salesReps.length === 0 && (
            <p className="mt-4 text-[13px] text-gray-500">
              No sales representative assigned to this vehicle yet.
            </p>
          )}

          <ul className="mt-4 grid gap-3">
            {salesReps.map((rep) => (
              <li
                className="flex items-center justify-between gap-3"
                key={rep.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {rep.photo ? (
                    <img
                      alt={rep.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      src={getImageUrl(rep.photo)}
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      {getInitials(rep.name)}
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {rep.name}
                  </span>
                </div>

                <div className="flex shrink-0 gap-2">
                  {rep.phone && (
                    <a
                      aria-label={`Call ${rep.name}`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                      href={`tel:+${rep.phone}`}
                    >
                      <PhoneIcon />
                    </a>
                  )}
                  {rep.whatsapp && (
                    <a
                      aria-label={`WhatsApp ${rep.name}`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white hover:bg-green-700"
                      href={`https://wa.me/${rep.whatsapp}?text=${encodeURIComponent(
                        `Hi ${rep.name}, I'm interested in the ${title} (Stock no. ${car.stock_number}).`,
                      )}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ChatIcon />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          aria-label="Photo viewer"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
        >
          <button
            aria-label="Close photo viewer"
            className="absolute right-4 top-3 text-4xl leading-none text-white sm:right-5 sm:top-4"
            onClick={() => setLightboxOpen(false)}
            type="button"
          >
            ×
          </button>
          {images.length > 1 && (
            <button
              aria-label="Previous photo"
              className={`${arrowClass} left-3 sm:left-4`}
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              type="button"
            >
              ‹
            </button>
          )}
          <img
            alt={title}
            className="max-h-[90vh] max-w-[92vw] object-contain"
            onClick={(event) => event.stopPropagation()}
            src={images[activeImage]}
          />
          {images.length > 1 && (
            <button
              aria-label="Next photo"
              className={`${arrowClass} right-3 sm:right-4`}
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              type="button"
            >
              ›
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default CarDetail;
