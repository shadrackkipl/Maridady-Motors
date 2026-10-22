import { createContext, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CarFront,
  Check,
  CircleAlert,
  ImagePlus,
  MapPin,
  Save,
  Trash2,
  UsersRound,
} from "lucide-react";
import { asList, getImageUrl, staffApi } from "./Staffapi";
import { useStaff } from "./StaffRoute";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100";

const sectionClass =
  "grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7";

const ErrorsContext = createContext({});

// Defined outside StaffCarForm on purpose: a component created inside another
// one is rebuilt on every keystroke, which makes inputs lose focus.
const Field = ({ label, name, children, hint }) => {
  const errors = useContext(ErrorsContext);
  const error = [].concat(errors[name] ?? []).join(" ");

  return (
    <label className="grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-normal leading-relaxed text-slate-500">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
};

const SectionHeading = ({ icon: Icon, number, title, description }) => (
  <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
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

const StaffCarForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { me } = useStaff();

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

  const allowed = isEdit ? me.can.change : me.can.add;

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

    staffApi
      .get(`/cars/${id}/`, { signal: controller.signal })
      .then(({ data }) => {
        const next = { ...EMPTY_FORM };
        Object.keys(EMPTY_FORM).forEach((key) => {
          if (key === "is_available") next[key] = Boolean(data[key]);
          else next[key] = data[key] ?? "";
        });
        setForm(next);
        setExistingCover(data.image);
        setExistingImages(data.images || []);
        setRepIds(data.sales_representative_ids || []);
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

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleRep = (repId) =>
    setRepIds((current) =>
      current.includes(repId)
        ? current.filter((value) => value !== repId)
        : [...current, repId]
    );

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  const removeExistingImage = async (image) => {
    if (!window.confirm("Remove this photo?")) return;
    try {
      await staffApi.delete(`/cars/${id}/images/${image.id}`);
      setExistingImages((current) => current.filter((item) => item.id !== image.id));
    } catch {
      setMessage("Could not remove that photo.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, typeof value === "boolean" ? String(value) : value);
    });
    repIds.forEach((repId) => data.append("sales_representative_ids", repId));
    if (coverFile) data.append("image", coverFile);

    try {
      const response = isEdit
        ? await staffApi.put(`/cars/${id}/`, data)
        : await staffApi.post("/cars/", data);

      if (galleryFiles.length > 0) {
        const gallery = new FormData();
        galleryFiles.forEach((file) => gallery.append("images", file));
        await staffApi.post(`/cars/${response.data.id}/images/`, gallery);
      }

      navigate("/staff/cars");
    } catch (requestError) {
      const responseData = requestError.response?.data;
      if (requestError.response?.status === 400 && responseData) {
        setErrors(responseData);
        setMessage("Please fix the highlighted fields.");
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

  const textInput = (name, extra = {}) => (
    <input
      className={inputClass}
      onChange={update(name)}
      value={form[name]}
      {...extra}
    />
  );

  const select = (name, options) => (
    <select className={inputClass} onChange={update(name)} value={form[name]}>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  if (!allowed) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-gray-600">You do not have permission to do this.</p>
        <Link className="mt-4 inline-block text-sm text-blue-600 hover:underline" to="/staff/cars">
          Back to vehicles
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-[50vh] place-items-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-500">Loading vehicle...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          to="/staff/cars"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Back to vehicles
        </Link>

        <header className="mb-8 mt-6 border-b border-slate-200 pb-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
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
                  : "Add a new vehicle to your inventory and prepare it for your customers."}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Staff workspace
            </span>
          </div>
        </header>

        {message && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
            role="alert"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <ErrorsContext.Provider value={errors}>
          <form className="grid gap-5 sm:gap-6" onSubmit={handleSubmit}>
            <section className={`${sectionClass} sm:grid-cols-2 lg:grid-cols-3`}>
              <SectionHeading
                description="Start with the essentials customers use to identify and find this vehicle."
                icon={CarFront}
                number="01"
                title="Vehicle details"
              />
              <Field label="Make" name="make">
                {textInput("make", { autoComplete: "off", placeholder: "e.g. Toyota", required: true })}
              </Field>
              <Field label="Model" name="model_name">
                {textInput("model_name", { autoComplete: "off", placeholder: "e.g. Land Cruiser", required: true })}
              </Field>
              <Field label="Body type" name="body_type">{select("body_type", BODY_TYPES)}</Field>
              <Field label="Year" name="year">
                {textInput("year", { max: MAX_MODEL_YEAR, min: 1900, placeholder: "2024", required: true, type: "number" })}
              </Field>
              <Field hint="Must be unique" label="Stock number" name="stock_number">
                {textInput("stock_number", { placeholder: "e.g. MM-0241", required: true })}
              </Field>
              <Field label="Condition" name="condition">
                {select("condition", [["Used", "Used"], ["New", "New"]])}
              </Field>
              <Field hint="e.g. Mombasa" label="Location" name="location">
                <span className="relative">
                  <MapPin aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  {textInput("location", { className: `${inputClass} pl-10`, placeholder: "Where is the vehicle?" })}
                </span>
              </Field>
              <Field label="Price (KES)" name="price">
                {textInput("price", { min: 0, placeholder: "0.00", required: true, step: "0.01", type: "number" })}
              </Field>
              <Field label="Mileage (km)" name="mileage">
                {textInput("mileage", { min: 0, placeholder: "e.g. 45,000", required: true, type: "number" })}
              </Field>
            </section>

            <section className={`${sectionClass} sm:grid-cols-2 lg:grid-cols-3`}>
              <SectionHeading
                description="Add the technical details buyers compare when choosing their next car."
                icon={BadgeCheck}
                number="02"
                title="Specifications"
              />
              <Field label="Engine capacity (cc)" name="engine_capacity">
                {textInput("engine_capacity", { min: 1, placeholder: "e.g. 2700", required: true, type: "number" })}
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
              <Field label="Variant" name="variant">{textInput("variant", { placeholder: "Optional" })}</Field>
              <Field label="Trim" name="trim">{textInput("trim", { placeholder: "Optional" })}</Field>
              <Field label="Model code" name="model_code">{textInput("model_code", { placeholder: "Optional" })}</Field>
              <Field label="Doors" name="doors">{textInput("doors", { min: 0, placeholder: "e.g. 5", type: "number" })}</Field>
              <Field label="Seats" name="seats">{textInput("seats", { min: 0, placeholder: "e.g. 7", type: "number" })}</Field>
              <Field label="Exterior color" name="exterior_color">{textInput("exterior_color", { placeholder: "e.g. Pearl white" })}</Field>
              <Field label="Interior color" name="interior_color">{textInput("interior_color", { placeholder: "e.g. Black" })}</Field>
            </section>

            <section className={sectionClass}>
              <SectionHeading
                description="Help customers picture the vehicle and call out its most useful features."
                icon={Check}
                number="03"
                title="Description & features"
              />
              <Field hint="Wrap text in **double asterisks** to make it bold." label="Description" name="description">
                <textarea className={`${inputClass} resize-y`} onChange={update("description")} placeholder="Describe the vehicle's condition, history, and highlights..." rows={5} value={form.description} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field hint="One per line. Shown on the Overview tab." label="Top features" name="features">
                  <textarea className={`${inputClass} resize-y`} onChange={update("features")} placeholder={"Leather seats\nReverse camera\nSunroof"} rows={5} value={form.features} />
                </Field>
                <Field hint="One per line. Shown on the Features tab." label="Features & equipment" name="equipment">
                  <textarea className={`${inputClass} resize-y`} onChange={update("equipment")} placeholder={"Cruise control\nBluetooth audio\nParking sensors"} rows={5} value={form.equipment} />
                </Field>
              </div>
            </section>

            <section className={`${sectionClass} sm:grid-cols-2`}>
              <SectionHeading
                description="Choose a clear cover image and add extra photos to complete the listing."
                icon={ImagePlus}
                number="04"
                title="Vehicle photos"
              />
              <Field hint="This is the main image shown on vehicle cards." label="Cover photo" name="image">
                <div className="grid gap-3">
                  {existingCover && !coverFile && (
                    <img alt="Current vehicle cover" className="h-44 w-full rounded-xl border border-slate-200 object-cover sm:max-w-xs" src={getImageUrl(existingCover)} />
                  )}
                  <div className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-100">
                    <ImagePlus aria-hidden="true" className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      {coverFile ? coverFile.name : "Choose a cover photo"}
                    </span>
                    <span className="text-xs text-slate-500">JPG, PNG or WEBP</span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => setCoverFile(event.target.files[0] || null)}
                      type="file"
                    />
                  </div>
                </div>
              </Field>

              <Field hint="You can select several images at once." label="Add gallery photos" name="images">
                <div className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-100">
                  <ImagePlus aria-hidden="true" className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {galleryFiles.length
                      ? `${galleryFiles.length} photo${galleryFiles.length === 1 ? "" : "s"} selected`
                      : "Choose gallery photos"}
                  </span>
                  <span className="max-w-full truncate text-xs text-slate-500">
                    {galleryFiles.length ? galleryFiles.map((file) => file.name).join(", ") : "JPG, PNG or WEBP"}
                  </span>
                  <input
                    accept="image/*"
                    className="sr-only"
                    multiple
                    onChange={(event) => setGalleryFiles([...event.target.files])}
                    type="file"
                  />
                </div>
              </Field>

              {isEdit && existingImages.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="mb-3 text-sm font-medium text-slate-700">Current gallery photos</p>
                  <ul className="flex flex-wrap gap-3">
                    {existingImages.map((image) => (
                      <li className="group relative" key={image.id}>
                        <img alt="Vehicle gallery" className="h-24 w-32 rounded-xl border border-slate-200 object-cover" src={getImageUrl(image.image)} />
                        <button
                          aria-label="Remove photo"
                          className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white bg-red-600 text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => removeExistingImage(image)}
                          title="Remove photo"
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className={`${sectionClass} gap-4`}>
              <SectionHeading
                description="Choose the team members who will represent this vehicle to customers."
                icon={UsersRound}
                number="05"
                title="Sales representatives"
              />
              {reps.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No sales representatives have been added yet.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {reps.map((rep) => (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" key={rep.id}>
                      <input
                        checked={repIds.includes(rep.id)}
                        className="h-4 w-4 accent-slate-900"
                        onChange={() => toggleRep(rep.id)}
                        type="checkbox"
                      />
                      <span>{rep.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {fieldError("sales_representative_ids") && (
                <p className="text-sm text-red-600">{fieldError("sales_representative_ids")}</p>
              )}
            </section>

            <section className={`${sectionClass} sm:flex sm:items-center sm:justify-between`}>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Website visibility</h2>
                <p className="mt-1 text-sm text-slate-500">Make this vehicle visible to customers on the website.</p>
              </div>
              <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.is_available}
                  className="h-4 w-4 accent-slate-900"
                  onChange={update("is_available")}
                  type="checkbox"
                />
                {form.is_available ? "Available" : "Hidden"}
              </label>
            </section>

            <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:px-5 sm:shadow-sm">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                to="/staff/cars"
              >
                Cancel
              </Link>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                <Save aria-hidden="true" className="h-4 w-4" />
                {saving ? "Saving..." : isEdit ? "Save changes" : "Add vehicle"}
              </button>
            </div>
          </form>
        </ErrorsContext.Provider>
      </div>
    </main>
  );
};

export default StaffCarForm;