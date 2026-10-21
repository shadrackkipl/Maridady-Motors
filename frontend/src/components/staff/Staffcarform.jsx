import { createContext, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700";

const ErrorsContext = createContext({});

// Defined outside StaffCarForm on purpose: a component created inside another
// one is rebuilt on every keystroke, which makes inputs lose focus.
const Field = ({ label, name, children, hint }) => {
  const errors = useContext(ErrorsContext);
  const error = [].concat(errors[name] ?? []).join(" ");

  return (
    <label className="grid gap-1 text-xs font-semibold text-gray-600">
      {label}
      {children}
      {hint && <span className="font-normal text-gray-400">{hint}</span>}
      {error && <span className="font-normal text-red-600">{error}</span>}
    </label>
  );
};

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
    return <p className="px-4 py-12 text-center text-gray-500">Loading vehicle...</p>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link className="text-sm text-blue-600 hover:underline" to="/staff/cars">
        ← Back to vehicles
      </Link>
      <h1 className="mb-5 mt-2 text-2xl font-bold text-gray-900">
        {isEdit ? "Edit vehicle" : "Add vehicle"}
      </h1>

      {message && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {message}
        </p>
      )}

      <ErrorsContext.Provider value={errors}>
      <form className="grid gap-6" onSubmit={handleSubmit}>
        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
          <h2 className="text-sm font-bold text-gray-900 sm:col-span-2">Vehicle</h2>
          <Field label="Make" name="make">{textInput("make", { required: true })}</Field>
          <Field label="Model" name="model_name">{textInput("model_name", { required: true })}</Field>
          <Field label="Car type" name="body_type">{select("body_type", BODY_TYPES)}</Field>
          <Field label="Year" name="year">{textInput("year", { required: true, type: "number", min: 1900 })}</Field>
          <Field label="Stock no." name="stock_number" hint="Must be unique">
            {textInput("stock_number", { required: true })}
          </Field>
          <Field label="Condition" name="condition">
            {select("condition", [["Used", "Used"], ["New", "New"]])}
          </Field>
          <Field label="Location" name="location" hint="e.g. Mombasa">{textInput("location")}</Field>
          <Field label="Price (KES)" name="price">{textInput("price", { required: true, type: "number", min: 0, step: "0.01" })}</Field>
          <Field label="Mileage (km)" name="mileage">{textInput("mileage", { required: true, type: "number", min: 0 })}</Field>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
          <h2 className="text-sm font-bold text-gray-900 sm:col-span-2">Specifications</h2>
          <Field label="Engine capacity (cc)" name="engine_capacity">{textInput("engine_capacity", { required: true, type: "number", min: 1 })}</Field>
          <Field label="Drivetrain" name="drivetrain">
            {select("drivetrain", [["2WD", "2WD"], ["4WD", "4WD"], ["AWD", "AWD"]])}
          </Field>
          <Field label="Transmission" name="transmission">
            {select("transmission", [["Automatic", "Automatic"], ["Manual", "Manual"]])}
          </Field>
          <Field label="Fuel type" name="fuel_type">
            {select("fuel_type", [["Petrol", "Petrol"], ["Diesel", "Diesel"], ["Hybrid", "Hybrid"], ["Electric", "Electric"]])}
          </Field>
          <Field label="Variant" name="variant">{textInput("variant")}</Field>
          <Field label="Trim" name="trim">{textInput("trim")}</Field>
          <Field label="Model code" name="model_code">{textInput("model_code")}</Field>
          <Field label="Doors" name="doors">{textInput("doors", { type: "number", min: 0 })}</Field>
          <Field label="Seats" name="seats">{textInput("seats", { type: "number", min: 0 })}</Field>
          <Field label="Exterior color" name="exterior_color">{textInput("exterior_color")}</Field>
          <Field label="Interior color" name="interior_color">{textInput("interior_color")}</Field>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-bold text-gray-900">Description &amp; features</h2>
          <Field label="Description" name="description" hint="Wrap text in **double asterisks** to make it bold.">
            <textarea className={inputClass} onChange={update("description")} rows={5} value={form.description} />
          </Field>
          <Field label="Top features" name="features" hint="One per line. Shown on the Overview tab.">
            <textarea className={inputClass} onChange={update("features")} rows={4} value={form.features} />
          </Field>
          <Field label="Features & equipment" name="equipment" hint="One per line. Shown on the Features tab.">
            <textarea className={inputClass} onChange={update("equipment")} rows={6} value={form.equipment} />
          </Field>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-bold text-gray-900">Photos</h2>

          <Field label="Cover photo" name="image" hint="Shown on the listing cards.">
            <div className="flex items-center gap-3">
              {existingCover && !coverFile && (
                <img alt="" className="h-16 w-24 rounded-md object-cover" src={getImageUrl(existingCover)} />
              )}
              <input
                accept="image/*"
                className="text-sm"
                onChange={(event) => setCoverFile(event.target.files[0] || null)}
                type="file"
              />
            </div>
          </Field>

          {isEdit && existingImages.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-600">Gallery photos</p>
              <ul className="flex flex-wrap gap-3">
                {existingImages.map((image) => (
                  <li className="relative" key={image.id}>
                    <img alt="" className="h-20 w-28 rounded-md object-cover" src={getImageUrl(image.image)} />
                    <button
                      aria-label="Remove photo"
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-sm text-white"
                      onClick={() => removeExistingImage(image)}
                      type="button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Field label="Add gallery photos" name="images" hint="You can choose several at once.">
            <input
              accept="image/*"
              className="text-sm"
              multiple
              onChange={(event) => setGalleryFiles([...event.target.files])}
              type="file"
            />
          </Field>
        </section>

        <section className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-bold text-gray-900">Sales representatives</h2>
          {reps.length === 0 ? (
            <p className="text-sm text-gray-500">No sales representatives have been added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {reps.map((rep) => (
                <label className="flex items-center gap-2 text-sm text-gray-700" key={rep.id}>
                  <input
                    checked={repIds.includes(rep.id)}
                    className="h-4 w-4 accent-black"
                    onChange={() => toggleRep(rep.id)}
                    type="checkbox"
                  />
                  {rep.name}
                </label>
              ))}
            </div>
          )}
          {fieldError("sales_representative_ids") && (
            <p className="text-xs text-red-600">{fieldError("sales_representative_ids")}</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              checked={form.is_available}
              className="h-4 w-4 accent-black"
              onChange={update("is_available")}
              type="checkbox"
            />
            Available on the website
          </label>
          <p className="mt-1 text-xs text-gray-400">Untick to hide this vehicle from customers.</p>
        </section>

        <div className="flex gap-3">
          <button
            className="rounded-lg bg-[#2d2d2d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add vehicle"}
          </button>
          <Link
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            to="/staff/cars"
          >
            Cancel
          </Link>
        </div>
      </form>
      </ErrorsContext.Provider>
    </main>
  );
};

export default StaffCarForm;