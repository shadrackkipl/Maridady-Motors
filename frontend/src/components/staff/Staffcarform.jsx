import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiEye,
  FiFileText,
  FiImage,
  FiInfo,
  FiLock,
  FiMapPin,
  FiSave,
  FiSettings,
  FiTrash2,
  FiUploadCloud,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { MdDirectionsCar } from "react-icons/md";
import { asList, getImageUrl, staffApi } from "./Staffapi";
import { useStaff } from "./StaffRoute";

/* ------------------------------ constants ------------------------------ */

const BODY_TYPES = [
  ["suv", "SUV"],
  ["sedan", "Sedan / Saloon"],
  ["hatchback", "Hatchback"],
  ["station_wagon", "Station Wagon"],
  ["pickup", "Pickup"],
  ["van", "Van"],
  ["minivan", "Minivan"],
  ["commercial", "Commercial Vehicle"],
  ["other", "Other"],
];

const MAX_MODEL_YEAR = new Date().getFullYear() + 1;
const MAX_FILE_MB = 10;
const MAX_GALLERY_PHOTOS = 20;

const EMPTY_FORM = {
  make: "",
  model_name: "",
  body_type: "suv",
  year: "",
  stock_number: "",
  condition: "Used",
  location: "",
  price: "",
  mileage: "",
  engine_capacity: "",
  drivetrain: "2WD",
  transmission: "Automatic",
  fuel_type: "Petrol",
  variant: "",
  trim: "",
  model_code: "",
  doors: "",
  seats: "",
  exterior_color: "",
  interior_color: "",
  description: "",
  features: "",
  equipment: "",
  is_available: true,
};

const REQUIRED_FIELDS = [
  ["make", "Make"],
  ["model_name", "Model"],
  ["year", "Year"],
  ["stock_number", "Stock number"],
  ["price", "Price"],
  ["mileage", "Mileage"],
  ["engine_capacity", "Engine capacity"],
];

// Which section each required field lives in (used by the progress checklist)
const FIELD_SECTION = {
  make: "details",
  model_name: "details",
  year: "details",
  stock_number: "details",
  price: "details",
  mileage: "details",
  engine_capacity: "specs",
};

const SECTIONS = [
  ["details", "Details"],
  ["specs", "Specifications"],
  ["description", "Description"],
  ["photos", "Photos"],
  ["team", "Sales team"],
  ["visibility", "Visibility"],
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100";
const inputErrorClass =
  "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-100";

const sectionClass =
  "grid scroll-mt-24 gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-KE");

const makeSnapshot = (form, repIds) =>
  JSON.stringify({ form, repIds: [...repIds].sort((a, b) => a - b) });

/* ------------------------------ helpers ------------------------------ */

// Creates temporary preview URLs for chosen files and cleans them up
const useObjectUrls = (files) => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return urls;
};

const ErrorsContext = createContext({});

// Defined outside StaffCarForm on purpose: a component created inside another
// one is rebuilt on every keystroke, which makes inputs lose focus.
const Field = ({ label, name, children, hint, required, className = "" }) => {
  const errors = useContext(ErrorsContext);
  const error = [].concat(errors[name] ?? []).join(" ");

  return (
    <label
      className={`grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700 ${className}`}
    >
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="text-xs font-normal leading-relaxed text-slate-500">
          {hint}
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1 text-xs font-medium text-red-600">
          <FiAlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </span>
      )}
    </label>
  );
};

const SectionHeading = ({ icon: Icon, number, title, description }) => (
  <div className="flex items-start gap-3 sm:col-span-2">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
      <Icon aria-hidden="true" className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {number}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  </div>
);

const DropZone = ({ multiple = false, onFiles, title, subtitle, ariaLabel }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (list) => {
    const files = [...list];
    if (files.length > 0) onFiles(files);
  };

  return (
    <div
      aria-label={ariaLabel}
      className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus:outline-none focus:ring-4 focus:ring-slate-200 ${
        dragging
          ? "border-slate-900 bg-slate-100"
          : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
        <FiUploadCloud aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-800">{title}</span>
      <span className="text-xs text-slate-500">{subtitle}</span>
      <input
        accept="image/*"
        className="sr-only"
        multiple={multiple}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
        onClick={(event) => event.stopPropagation()}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
    </div>
  );
};

const Switch = ({ checked, onChange, label }) => (
  <button
    aria-checked={checked}
    aria-label={label}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus:outline-none focus:ring-4 focus:ring-slate-200 ${
      checked ? "bg-emerald-500" : "bg-slate-300"
    }`}
    onClick={() => onChange(!checked)}
    role="switch"
    type="button"
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const PreviewCard = ({ form, coverSrc, repNames }) => {
  const title =
    [form.year, form.make, form.model_name].filter(Boolean).join(" ") ||
    "Year Make Model";
  const specs = [
    form.mileage !== "" && `${formatNumber(form.mileage)} km`,
    form.engine_capacity !== "" && `${formatNumber(form.engine_capacity)} cc`,
    form.transmission,
    form.fuel_type,
    form.drivetrain,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        {coverSrc ? (
          <img alt="" className="h-full w-full object-cover" src={coverSrc} />
        ) : (
          <div className="grid h-full place-items-center text-slate-400">
            <FiImage aria-hidden="true" className="h-8 w-8" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-semibold text-white">
          {form.condition}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[11px] font-semibold ${
            form.is_available
              ? "bg-emerald-500 text-white"
              : "bg-white/90 text-slate-600"
          }`}
        >
          {form.is_available ? "In Stock" : "Hidden"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          {form.stock_number ? `Stock no. ${form.stock_number}` : "Stock no. —"}
          {form.location && (
            <>
              <span aria-hidden="true">·</span>
              <FiMapPin aria-hidden="true" className="h-3 w-3" />
              {form.location}
            </>
          )}
        </p>
        <p className="mt-3 text-lg font-bold text-slate-900">
          {Number(form.price) > 0 ? `KES ${formatNumber(form.price)}` : "KES —"}
        </p>
        {specs.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {specs.map((spec) => (
              <li
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                key={spec}
              >
                {spec}
              </li>
            ))}
          </ul>
        )}
        {repNames.length > 0 && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Contact: <span className="font-medium text-slate-700">{repNames.join(", ")}</span>
          </p>
        )}
      </div>
    </article>
  );
};

/* -------------------------------- page -------------------------------- */

const StaffCarForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { me } = useStaff();

  const formRef = useRef(null);
  const snapshotRef = useRef(makeSnapshot(EMPTY_FORM, []));

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingCover, setExistingCover] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [reps, setReps] = useState([]);
  const [repIds, setRepIds] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");
  const [activeSection, setActiveSection] = useState("details");

  const allowed = isEdit ? me.can.change : me.can.add;

  const coverFiles = useMemo(() => (coverFile ? [coverFile] : []), [coverFile]);
  const coverPreview = useObjectUrls(coverFiles)[0];
  const galleryPreviews = useObjectUrls(galleryFiles);
  const coverSrc =
    coverPreview || (existingCover ? getImageUrl(existingCover) : null);

  const dirty =
    makeSnapshot(form, repIds) !== snapshotRef.current ||
    Boolean(coverFile) ||
    galleryFiles.length > 0;

  const checklist = [
    ...REQUIRED_FIELDS.map(([key, label]) => ({
      label,
      done: String(form[key]).trim() !== "",
      target: FIELD_SECTION[key],
    })),
    { label: "Cover photo", done: Boolean(coverSrc), target: "photos" },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  const repNames = reps
    .filter((rep) => repIds.includes(rep.id))
    .map((rep) => rep.name);

  /* ---------------------------- data loading ---------------------------- */

  useEffect(() => {
    if (location.state?.flash) setMessage(location.state.flash);
  }, [location.state]);

  useEffect(() => {
    staffApi
      .get("/sales-reps/")
      .then(({ data }) => setReps(asList(data)))
      .catch((requestError) =>
        console.error("Error loading sales reps:", requestError)
      );
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    const controller = new AbortController();

    setLoading(true);
    setCoverFile(null);
    setGalleryFiles([]);
    setErrors({});

    staffApi
      .get(`/cars/${id}/`, { signal: controller.signal })
      .then(({ data }) => {
        const next = { ...EMPTY_FORM };
        Object.keys(EMPTY_FORM).forEach((key) => {
          if (key === "is_available") next[key] = Boolean(data[key]);
          else next[key] = data[key] ?? "";
        });
        const loadedReps = data.sales_representative_ids || [];

        snapshotRef.current = makeSnapshot(next, loadedReps);
        setForm(next);
        setExistingCover(data.image);
        setExistingImages(data.images || []);
        setRepIds(loadedReps);
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setMessage(
          requestError.response?.status === 404
            ? "This vehicle no longer exists."
            : "Unable to load this vehicle."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, isEdit]);

  /* ------------------------- page-level behaviours ------------------------- */

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Ctrl/Cmd + S saves
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Highlight the section being read in the top navigation
  useEffect(() => {
    if (loading || !allowed) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );

    SECTIONS.forEach(([sectionId]) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading, allowed]);

  /* ------------------------------- handlers ------------------------------- */

  const goToSection = (sectionId) => {
    setActiveSection(sectionId);
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const confirmLeave = (event) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      event.preventDefault();
    }
  };

  const clearError = (field) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const toggleRep = (repId) =>
    setRepIds((current) =>
      current.includes(repId)
        ? current.filter((value) => value !== repId)
        : [...current, repId]
    );

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  // Keeps only real images under the size limit
  const acceptImages = (files) => {
    const valid = [];
    let rejected = 0;

    files.forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= MAX_FILE_MB * 1024 * 1024) {
        valid.push(file);
      } else {
        rejected += 1;
      }
    });

    setPhotoNotice(
      rejected > 0
        ? `${rejected} file${rejected === 1 ? " was" : "s were"} skipped. Use images under ${MAX_FILE_MB} MB.`
        : ""
    );
    return valid;
  };

  const chooseCover = (files) => {
    const [first] = acceptImages(files);
    if (first) setCoverFile(first);
  };

  const addGalleryFiles = (files) => {
    const valid = acceptImages(files);
    setGalleryFiles((current) => {
      const known = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );
      const fresh = valid.filter(
        (file) => !known.has(`${file.name}-${file.size}-${file.lastModified}`)
      );
      return [...current, ...fresh].slice(0, MAX_GALLERY_PHOTOS);
    });
  };

  const removeExistingImage = async (image) => {
    if (!window.confirm("Remove this photo?")) return;
    try {
      // The trailing slash matters: the API route requires it
      await staffApi.delete(`/cars/${id}/images/${image.id}/`);
      setExistingImages((current) =>
        current.filter((item) => item.id !== image.id)
      );
    } catch {
      setMessage("Could not remove that photo.");
    }
  };

  const validate = () => {
    const found = {};

    REQUIRED_FIELDS.forEach(([key, label]) => {
      if (String(form[key]).trim() === "") found[key] = `${label} is required.`;
    });

    const year = Number(form.year);
    if (form.year !== "" && (year < 1900 || year > MAX_MODEL_YEAR)) {
      found.year = `Enter a year between 1900 and ${MAX_MODEL_YEAR}.`;
    }
    if (form.price !== "" && Number(form.price) <= 0) {
      found.price = "Price must be greater than zero.";
    }
    if (form.engine_capacity !== "" && Number(form.engine_capacity) < 1) {
      found.engine_capacity = "Engine capacity must be at least 1 cc.";
    }
    if (form.mileage !== "" && Number(form.mileage) < 0) {
      found.mileage = "Mileage cannot be negative.";
    }
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setMessage("Please fix the highlighted fields.");
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus()
      );
      return;
    }

    setSaving(true);
    setErrors({});
    setMessage("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, typeof value === "boolean" ? String(value) : value);
    });
    repIds.forEach((repId) => data.append("sales_representative_ids", repId));
    if (coverFile) data.append("image", coverFile);

    const name = [form.year, form.make, form.model_name].join(" ");

    try {
      const response = isEdit
        ? await staffApi.put(`/cars/${id}/`, data)
        : await staffApi.post("/cars/", data);
      const savedId = response.data.id;

      if (galleryFiles.length > 0) {
        try {
          const gallery = new FormData();
          galleryFiles.forEach((file) => gallery.append("images", file));
          await staffApi.post(`/cars/${savedId}/images/`, gallery);
        } catch {
          // The vehicle itself is saved; only the extra photos failed
          const warning =
            "The vehicle was saved, but its gallery photos could not be uploaded. Please add them again below.";
          if (isEdit) {
            snapshotRef.current = makeSnapshot(form, repIds);
            setCoverFile(null);
            setGalleryFiles([]);
            setMessage(warning);
            window.scrollTo(0, 0);
          } else {
            navigate(`/staff/cars/${savedId}/edit`, { state: { flash: warning } });
          }
          return;
        }
      }

      navigate("/staff/cars", {
        state: { notice: `${name} was ${isEdit ? "updated" : "added"}.` },
      });
    } catch (requestError) {
      const responseData = requestError.response?.data;
      if (requestError.response?.status === 400 && responseData) {
        setErrors(responseData);
        setMessage(
          responseData.detail || "Please fix the highlighted fields."
        );
      } else if (requestError.response?.status === 403) {
        setMessage("You do not have permission to do that.");
      } else {
        setMessage("Could not save this vehicle. Please try again.");
      }
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ field helpers ------------------------------ */

  const textInput = (name, extra = {}) => {
    const { className = "", ...rest } = extra;
    const hasError = Boolean(fieldError(name));

    return (
      <input
        aria-invalid={hasError}
        className={`${inputClass} ${hasError ? inputErrorClass : ""} ${className}`}
        onChange={update(name)}
        onWheel={(event) => event.currentTarget.blur()}
        value={form[name]}
        {...rest}
      />
    );
  };

  const select = (name, options) => (
    <select className={inputClass} onChange={update(name)} value={form[name]}>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  /* -------------------------------- render -------------------------------- */

  if (!allowed) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-slate-50 px-4">
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
            <FiLock aria-hidden="true" className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-semibold text-slate-900">Access restricted</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your account does not have permission to do this.
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
            to="/staff/cars"
          >
            Back to vehicles
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-[50vh] place-items-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          Loading vehicle...
        </div>
      </main>
    );
  }

  const sectionIcons = {
    details: MdDirectionsCar,
    specs: FiSettings,
    description: FiFileText,
    photos: FiImage,
    team: FiUsers,
    visibility: FiEye,
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          onClick={confirmLeave}
          to="/staff/cars"
        >
          <FiArrowLeft
            aria-hidden="true"
            className="h-4 w-4 transition group-hover:-translate-x-0.5"
          />
          Back to vehicles
        </Link>

        <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Vehicle inventory
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {isEdit ? "Edit vehicle" : "Add a vehicle"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {isEdit
                ? "Update the listing details, specifications, and photos."
                : "Fill in the details below. The preview updates as you type."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Staff workspace
          </span>
        </header>

        {/* Section navigation */}
        <nav
          aria-label="Form sections"
          className="sticky top-0 z-20 -mx-4 mt-6 border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <ul className="flex gap-1 overflow-x-auto py-2">
            {SECTIONS.map(([sectionId, label]) => {
              const Icon = sectionIcons[sectionId];
              const active = activeSection === sectionId;
              return (
                <li key={sectionId}>
                  <button
                    aria-current={active ? "true" : undefined}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                    onClick={() => goToSection(sectionId)}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {message && (
          <div
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
            role="alert"
          >
            <FiAlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1">{message}</p>
            <button aria-label="Dismiss" onClick={() => setMessage("")} type="button">
              <FiX aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <ErrorsContext.Provider value={errors}>
            <form
              className="grid gap-5 sm:gap-6"
              id="vehicle-form"
              noValidate
              onSubmit={handleSubmit}
              ref={formRef}
            >
              <section className={sectionClass} id="details">
                <SectionHeading
                  description="The essentials customers use to identify and find this vehicle."
                  icon={MdDirectionsCar}
                  number="01"
                  title="Vehicle details"
                />
                <Field label="Make" name="make" required>
                  {textInput("make", { autoComplete: "off", placeholder: "e.g. Toyota" })}
                </Field>
                <Field label="Model" name="model_name" required>
                  {textInput("model_name", { autoComplete: "off", placeholder: "e.g. Land Cruiser" })}
                </Field>
                <Field label="Body type" name="body_type">
                  {select("body_type", BODY_TYPES)}
                </Field>
                <Field label="Year" name="year" required>
                  {textInput("year", { max: MAX_MODEL_YEAR, min: 1900, placeholder: "2024", type: "number" })}
                </Field>
                <Field hint="Must be unique" label="Stock number" name="stock_number" required>
                  {textInput("stock_number", { placeholder: "e.g. MM-0241" })}
                </Field>
                <Field label="Condition" name="condition">
                  {select("condition", [["Used", "Used"], ["New", "New"]])}
                </Field>
                <Field hint="e.g. Mombasa" label="Location" name="location">
                  <span className="relative">
                    <FiMapPin
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    {textInput("location", {
                      className: "pl-10",
                      placeholder: "Where is the vehicle?",
                    })}
                  </span>
                </Field>
                <Field
                  hint={Number(form.price) > 0 ? `KES ${formatNumber(form.price)}` : "Enter the selling price"}
                  label="Price (KES)"
                  name="price"
                  required
                >
                  {textInput("price", { min: 0, placeholder: "0.00", step: "0.01", type: "number" })}
                </Field>
                <Field
                  hint={form.mileage !== "" && Number(form.mileage) >= 0 ? `${formatNumber(form.mileage)} km` : undefined}
                  label="Mileage (km)"
                  name="mileage"
                  required
                >
                  {textInput("mileage", { min: 0, placeholder: "e.g. 45000", type: "number" })}
                </Field>
              </section>

              <section className={sectionClass} id="specs">
                <SectionHeading
                  description="The technical details buyers compare when choosing their next car."
                  icon={FiSettings}
                  number="02"
                  title="Specifications"
                />
                <Field label="Engine capacity (cc)" name="engine_capacity" required>
                  {textInput("engine_capacity", { min: 1, placeholder: "e.g. 2700", type: "number" })}
                </Field>
                <Field label="Drivetrain" name="drivetrain">
                  {select("drivetrain", [["2WD", "2WD"], ["4WD", "4WD"], ["AWD", "AWD"]])}
                </Field>
                <Field label="Transmission" name="transmission">
                  {select("transmission", [["Automatic", "Automatic"], ["Manual", "Manual"]])}
                </Field>
                <Field label="Fuel type" name="fuel_type">
                  {select("fuel_type", [["Petrol", "Petrol"], ["Diesel", "Diesel"], ["Hybrid", "Hybrid"], ["Electric", "Electric"]])}
                </Field>
                <Field label="Variant" name="variant">
                  {textInput("variant", { placeholder: "Optional" })}
                </Field>
                <Field label="Trim" name="trim">
                  {textInput("trim", { placeholder: "Optional" })}
                </Field>
                <Field label="Model code" name="model_code">
                  {textInput("model_code", { placeholder: "Optional" })}
                </Field>
                <Field label="Doors" name="doors">
                  {textInput("doors", { min: 0, placeholder: "e.g. 5", type: "number" })}
                </Field>
                <Field label="Seats" name="seats">
                  {textInput("seats", { min: 0, placeholder: "e.g. 7", type: "number" })}
                </Field>
                <Field label="Exterior color" name="exterior_color">
                  {textInput("exterior_color", { placeholder: "e.g. Pearl white" })}
                </Field>
                <Field label="Interior color" name="interior_color">
                  {textInput("interior_color", { placeholder: "e.g. Black" })}
                </Field>
              </section>

              <section className={sectionClass} id="description">
                <SectionHeading
                  description="Help customers picture the vehicle and call out its most useful features."
                  icon={FiFileText}
                  number="03"
                  title="Description & features"
                />
                <Field
                  className="sm:col-span-2"
                  hint={`Wrap text in **double asterisks** to make it bold. ${form.description.length} characters.`}
                  label="Description"
                  name="description"
                >
                  <textarea
                    className={`${inputClass} resize-y`}
                    onChange={update("description")}
                    placeholder="Describe the vehicle's condition, history, and highlights..."
                    rows={5}
                    value={form.description}
                  />
                </Field>
                <Field hint="One per line. Shown on the Overview tab." label="Top features" name="features">
                  <textarea
                    className={`${inputClass} resize-y`}
                    onChange={update("features")}
                    placeholder={"Leather seats\nReverse camera\nSunroof"}
                    rows={5}
                    value={form.features}
                  />
                </Field>
                <Field hint="One per line. Shown on the Features tab." label="Features & equipment" name="equipment">
                  <textarea
                    className={`${inputClass} resize-y`}
                    onChange={update("equipment")}
                    placeholder={"Cruise control\nBluetooth audio\nParking sensors"}
                    rows={5}
                    value={form.equipment}
                  />
                </Field>
              </section>

              <section className={sectionClass} id="photos">
                <SectionHeading
                  description="Drag and drop images, or click to browse. The cover photo appears on vehicle cards."
                  icon={FiImage}
                  number="04"
                  title="Vehicle photos"
                />

                <div className="grid content-start gap-2">
                  <p className="text-sm font-medium text-slate-700">Cover photo</p>
                  {coverSrc ? (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200">
                      <img alt="Vehicle cover" className="aspect-[16/10] w-full object-cover" src={coverSrc} />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white">
                        <span className="truncate">
                          {coverFile ? coverFile.name : "Current cover photo"}
                        </span>
                        {coverFile && (
                          <button
                            className="rounded-md bg-white/90 px-2 py-1 font-semibold text-slate-800 hover:bg-white"
                            onClick={() => setCoverFile(null)}
                            type="button"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                  <DropZone
                    ariaLabel="Choose a cover photo"
                    onFiles={chooseCover}
                    subtitle="JPG, PNG or WEBP"
                    title={coverSrc ? "Replace cover photo" : "Drop a cover photo here"}
                  />
                </div>

                <div className="grid content-start gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    Gallery photos
                    <span className="ml-1.5 font-normal text-slate-400">
                      {galleryFiles.length}/{MAX_GALLERY_PHOTOS} new
                    </span>
                  </p>
                  <DropZone
                    ariaLabel="Choose gallery photos"
                    multiple
                    onFiles={addGalleryFiles}
                    subtitle="Select several images at once"
                    title="Drop gallery photos here"
                  />
                </div>

                {photoNotice && (
                  <p className="flex items-center gap-2 text-xs font-medium text-amber-700 sm:col-span-2">
                    <FiInfo aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {photoNotice}
                  </p>
                )}

                {galleryFiles.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      Ready to upload
                    </p>
                    <ul className="flex flex-wrap gap-3">
                      {galleryPreviews.map((src, index) => (
                        <li className="relative" key={src}>
                          <img alt="" className="h-24 w-32 rounded-xl border border-slate-200 object-cover" src={src} />
                          <button
                            aria-label={`Remove ${galleryFiles[index]?.name ?? "photo"}`}
                            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white bg-slate-800 text-white shadow hover:bg-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            onClick={() =>
                              setGalleryFiles((current) =>
                                current.filter((_, position) => position !== index)
                              )
                            }
                            type="button"
                          >
                            <FiX aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isEdit && existingImages.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      Current gallery photos
                    </p>
                    <ul className="flex flex-wrap gap-3">
                      {existingImages.map((image) => (
                        <li className="relative" key={image.id}>
                          <img
                            alt="Vehicle gallery"
                            className="h-24 w-32 rounded-xl border border-slate-200 object-cover"
                            src={getImageUrl(image.image)}
                          />
                          <button
                            aria-label="Remove photo"
                            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white bg-red-600 text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => removeExistingImage(image)}
                            title="Remove photo"
                            type="button"
                          >
                            <FiTrash2 aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section className={sectionClass} id="team">
                <SectionHeading
                  description="Choose who customers should contact about this vehicle."
                  icon={FiUsers}
                  number="05"
                  title="Sales representatives"
                />
                {reps.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 sm:col-span-2">
                    No sales representatives have been added yet.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                    {reps.map((rep) => (
                      <label className="relative block cursor-pointer" key={rep.id}>
                        <input
                          checked={repIds.includes(rep.id)}
                          className="peer sr-only"
                          onChange={() => toggleRep(rep.id)}
                          type="checkbox"
                        />
                        <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 peer-checked:border-slate-900 peer-checked:bg-slate-50 peer-focus-visible:ring-4 peer-focus-visible:ring-slate-200">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                            {rep.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <span className="flex-1">{rep.name}</span>
                          {repIds.includes(rep.id) && (
                            <FiCheckCircle aria-hidden="true" className="h-4 w-4 text-slate-900" />
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {fieldError("sales_representative_ids") && (
                  <p className="text-sm text-red-600 sm:col-span-2">
                    {fieldError("sales_representative_ids")}
                  </p>
                )}
              </section>

              <section className={sectionClass} id="visibility">
                <SectionHeading
                  description="Control whether customers can see this vehicle right now."
                  icon={FiEye}
                  number="06"
                  title="Website visibility"
                />
                <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3.5 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {form.is_available ? "Visible on the website" : "Hidden from customers"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {form.is_available
                        ? "Customers can find and view this vehicle."
                        : "Only staff can see this vehicle."}
                    </p>
                  </div>
                  <Switch
                    checked={form.is_available}
                    label="Show this vehicle on the website"
                    onChange={(value) =>
                      setForm((current) => ({ ...current, is_available: value }))
                    }
                  />
                </div>
              </section>
            </form>
          </ErrorsContext.Provider>

          {/* Live preview + progress */}
          <aside className="hidden space-y-5 lg:sticky lg:top-20 lg:block">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Listing progress</h2>
                <span className="text-sm font-semibold text-slate-900">{progress}%</span>
              </div>
              <div
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={progress}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? "bg-emerald-500" : "bg-slate-900"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ul className="mt-4 grid gap-1.5">
                {checklist.map((item) => (
                  <li key={item.label}>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                      onClick={() => goToSection(item.target)}
                      type="button"
                    >
                      {item.done ? (
                        <FiCheckCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <FiCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span className={item.done ? "text-slate-400 line-through" : ""}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Live preview
              </h2>
              <PreviewCard coverSrc={coverSrc} form={form} repNames={repNames} />
              <p className="mt-2 text-xs text-slate-400">
                This is how the card appears on the website listings.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p aria-live="polite" className="flex items-center gap-2 text-sm text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`}
            />
            {dirty
              ? "You have unsaved changes"
              : isEdit
                ? "All changes saved"
                : "Fill in the details to get started"}
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              {doneCount}/{checklist.length} required items · Ctrl+S to save
            </span>
          </p>
          <div className="flex gap-3">
            <Link
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 sm:flex-none"
              onClick={confirmLeave}
              to="/staff/cars"
            >
              Cancel
            </Link>
            <button
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              disabled={saving}
              form="vehicle-form"
              type="submit"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <FiSave aria-hidden="true" className="h-4 w-4" />
              )}
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add vehicle"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StaffCarForm;