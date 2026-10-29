import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700 focus:ring-2 focus:ring-gray-200";

/**
 * "Send us a request" form for a vehicle. Saves the request so the
 * administrator can see it in the admin panel.
 */
const InquiryModal = ({ car, onClose }) => {
  const title = `${car.year} ${car.make} ${car.model_name}`;
  const panelRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: `Hello, I'm interested in the ${title} (Stock no. ${car.stock_number}). Is it still available?`,
    website: "", // hidden spam trap: real visitors leave it empty
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");
  const [failure, setFailure] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("input")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const clientErrors = {};
    if (!form.name.trim()) clientErrors.name = "Please enter your name.";
    if (form.phone.replace(/\D/g, "").length < 9) {
      clientErrors.phone = "Please enter a valid phone number.";
    }
    if (!form.message.trim()) clientErrors.message = "Please write a short message.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSending(true);
    setFailure("");

    try {
      const { data } = await axios.post(`${API_URL}/api/inquiries/`, {
        car: car.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        website: form.website,
      });
      setDone(data.message || "Thank you! We will contact you shortly.");
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 400 && requestError.response.data) {
        setErrors(requestError.response.data);
      } else if (status === 429) {
        setFailure("You have sent several requests already. Please try again later or contact us on WhatsApp.");
      } else {
        setFailure("Your request could not be sent. Please try again or contact us on WhatsApp.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby="inquiry-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900" id="inquiry-title">
              Send us a request
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{title}</p>
          </div>
          <button
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            <FiX aria-hidden="true" className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCheckCircle aria-hidden="true" className="size-6" />
            </span>
            <p className="mt-4 text-sm leading-6 text-gray-700" role="status">
              {done}
            </p>
            <button
              className="mt-6 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="mt-5 grid gap-4" noValidate onSubmit={handleSubmit}>
            {failure && (
              <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {failure}
              </p>
            )}

            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Your name
              <input
                aria-invalid={Boolean(fieldError("name"))}
                autoComplete="name"
                className={inputClass}
                maxLength={100}
                onChange={update("name")}
                value={form.name}
              />
              {fieldError("name") && <span className="text-xs font-normal text-red-600">{fieldError("name")}</span>}
            </label>

            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Phone number
              <input
                aria-invalid={Boolean(fieldError("phone"))}
                autoComplete="tel"
                className={inputClass}
                inputMode="tel"
                onChange={update("phone")}
                placeholder="e.g. 0712 345 678"
                value={form.phone}
              />
              {fieldError("phone") && <span className="text-xs font-normal text-red-600">{fieldError("phone")}</span>}
            </label>

            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Email <span className="font-normal text-gray-400">(optional)</span>
              <input
                aria-invalid={Boolean(fieldError("email"))}
                autoComplete="email"
                className={inputClass}
                onChange={update("email")}
                type="email"
                value={form.email}
              />
              {fieldError("email") && <span className="text-xs font-normal text-red-600">{fieldError("email")}</span>}
            </label>

            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Message
              <textarea
                aria-invalid={Boolean(fieldError("message"))}
                className={`${inputClass} resize-y`}
                maxLength={2000}
                onChange={update("message")}
                rows={4}
                value={form.message}
              />
              {fieldError("message") && <span className="text-xs font-normal text-red-600">{fieldError("message")}</span>}
            </label>

            {/* Spam trap: hidden from people, bots tend to fill it in */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input autoComplete="off" onChange={update("website")} tabIndex={-1} value={form.website} />
              </label>
            </div>

            <button
              className="mt-1 rounded-lg bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={sending}
              type="submit"
            >
              {sending ? "Sending..." : "Send request"}
            </button>
            <p className="text-center text-xs text-gray-400">
              We use your details only to answer this request.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;