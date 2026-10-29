import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiMail,
  FiSend,
} from "react-icons/fi";
import { adminApi, asList } from "../staff/Staffapi";
import {
  Banner,
  Field,
  PageHeader,
  inputClass,
  inputErrorClass,
  primaryButtonClass,
} from "./AdminUi";

const MAX_MESSAGE = 5000;

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminAnnouncements = () => {
  const [reps, setReps] = useState([]);
  const [history, setHistory] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      adminApi.get("/sales-reps/", { signal }),
      adminApi.get("/announcements/", { signal }),
      adminApi.get("/announcements/email-status/", { signal }),
    ])
      .then(([repsResponse, historyResponse, statusResponse]) => {
        const list = asList(repsResponse.data).filter((rep) => rep.is_active);
        setReps(list);
        setSelectedIds(list.filter((rep) => rep.email).map((rep) => rep.id));
        setHistory(asList(historyResponse.data));
        setEmailStatus(statusResponse.data);
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setLoadError("Unable to load this page. Please try again.");
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const withEmail = useMemo(() => reps.filter((rep) => rep.email), [reps]);
  const withoutEmail = reps.filter((rep) => !rep.email);
  const allSelected = withEmail.length > 0 && selectedIds.length === withEmail.length;

  const toggleRep = (repId) =>
    setSelectedIds((current) =>
      current.includes(repId) ? current.filter((value) => value !== repId) : [...current, repId]
    );

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : withEmail.map((rep) => rep.id));

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  const clearError = (name) =>
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const clientErrors = {};
    if (!subject.trim()) clientErrors.subject = "Enter a subject.";
    if (!message.trim()) clientErrors.message = "Write your message.";
    if (selectedIds.length === 0) clientErrors.recipient_ids = "Choose at least one person.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const names = withEmail.filter((rep) => selectedIds.includes(rep.id)).length;
    if (!window.confirm(`Send this announcement to ${names} ${names === 1 ? "person" : "people"}?`)) {
      return;
    }

    setSending(true);
    setErrors({});
    setResult(null);

    try {
      const { data } = await adminApi.post("/announcements/", {
        subject: subject.trim(),
        message: message.trim(),
        recipient_ids: selectedIds,
      });
      setResult(data);
      setHistory((current) => [data, ...current]);
      setSubject("");
      setMessage("");
    } catch (requestError) {
      if (requestError.response?.status === 400 && requestError.response.data) {
        setErrors(requestError.response.data);
      } else {
        setErrors({ form: "The announcement could not be sent. Please try again." });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Send an email to your sales representatives. Each person receives their own copy, and replies come back to you."
        title="Announcements"
      />

      {loadError && <Banner>{loadError}</Banner>}

      {emailStatus && !emailStatus.configured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <FiAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong>Email sending is not set up yet.</strong> Announcements will only be printed in
            the server console and will not reach anyone. Add your email account (SMTP) to the{" "}
            <code className="rounded bg-amber-100 px-1">MAILERS</code> setting to send real emails.
          </p>
        </div>
      )}

      {result && (
        <Banner onDismiss={() => setResult(null)} tone={result.failed_count ? "error" : "success"}>
          {result.real_delivery
            ? `Sent to ${result.sent_count} of ${result.sent_count + result.failed_count} ${result.sent_count + result.failed_count === 1 ? "person" : "people"}.`
            : "Test mode: the emails were only printed in the server console and were not delivered."}
          {result.failed_count > 0 && (
            <span className="mt-1 block whitespace-pre-line text-xs">{result.failures}</span>
          )}
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <form
          className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          noValidate
          onSubmit={handleSubmit}
        >
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <FiMail aria-hidden="true" className="size-5 text-slate-500" />
            New announcement
          </h2>

          {errors.form && <Banner>{errors.form}</Banner>}

          <Field error={fieldError("subject")} label="Subject" required>
            <input
              aria-invalid={Boolean(fieldError("subject"))}
              className={`${inputClass} ${fieldError("subject") ? inputErrorClass : ""}`}
              maxLength={200}
              onChange={(event) => {
                setSubject(event.target.value);
                clearError("subject");
              }}
              placeholder="e.g. New price list for November"
              value={subject}
            />
          </Field>

          <Field
            error={fieldError("message")}
            hint={`${message.length}/${MAX_MESSAGE} characters. Each email starts with "Hi" and the person's first name.`}
            label="Message"
            required
          >
            <textarea
              aria-invalid={Boolean(fieldError("message"))}
              className={`${inputClass} resize-y ${fieldError("message") ? inputErrorClass : ""}`}
              maxLength={MAX_MESSAGE}
              onChange={(event) => {
                setMessage(event.target.value);
                clearError("message");
              }}
              placeholder="Write your announcement here..."
              rows={9}
              value={message}
            />
          </Field>

          {fieldError("recipient_ids") && (
            <p className="text-sm font-medium text-red-600">{fieldError("recipient_ids")}</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              To {selectedIds.length} {selectedIds.length === 1 ? "person" : "people"}
            </p>
            <button
              className={primaryButtonClass}
              disabled={sending || loading || withEmail.length === 0}
              type="submit"
            >
              <FiSend aria-hidden="true" className="size-4" />
              {sending ? "Sending..." : "Send announcement"}
            </button>
          </div>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Recipients</h2>
            {withEmail.length > 0 && (
              <button
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                onClick={toggleAll}
                type="button"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : reps.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No sales representatives yet.{" "}
              <Link className="font-semibold text-slate-900 underline" to="/admin-panel/sales-reps">
                Add some
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-1">
              {withEmail.map((rep) => (
                <li key={rep.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                    <input
                      checked={selectedIds.includes(rep.id)}
                      className="mt-1 size-4 accent-slate-900"
                      onChange={() => {
                        toggleRep(rep.id);
                        clearError("recipient_ids");
                      }}
                      type="checkbox"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{rep.name}</span>
                      <span className="block truncate text-xs text-slate-500">{rep.email}</span>
                    </span>
                  </label>
                </li>
              ))}
              {withoutEmail.map((rep) => (
                <li className="flex items-start gap-3 rounded-lg px-2 py-2 opacity-60" key={rep.id}>
                  <input className="mt-1 size-4" disabled type="checkbox" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{rep.name}</span>
                    <span className="block text-xs text-slate-500">No email address</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {withoutEmail.length > 0 && (
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              Add their email on the{" "}
              <Link className="font-semibold text-slate-900 underline" to="/admin-panel/sales-reps">
                Sales team
              </Link>{" "}
              page to include them.
            </p>
          )}
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-base font-semibold text-slate-900">
          Sent announcements
        </h2>
        {history.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Nothing sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((item) => {
              const open = openId === item.id;
              return (
                <li key={item.id}>
                  <button
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
                    onClick={() => setOpenId(open ? null : item.id)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{item.subject}</span>
                      <span className="block text-xs text-slate-500">
                        {formatDateTime(item.created_at)}
                        {item.sent_by_name ? ` · ${item.sent_by_name}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {item.failed_count > 0 ? (
                        <span className="text-xs font-semibold text-red-600">{item.failed_count} failed</span>
                      ) : item.real_delivery ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <FiCheckCircle aria-hidden="true" className="size-3.5" />
                          {item.sent_count} sent
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700">Test mode</span>
                      )}
                      <FiChevronDown
                        aria-hidden="true"
                        className={`size-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  {open && (
                    <div className="space-y-3 bg-slate-50 px-5 py-4 text-sm">
                      <p className="whitespace-pre-line leading-6 text-slate-700">{item.message}</p>
                      {item.recipients && (
                        <p className="whitespace-pre-line text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">Sent to:</span>
                          {"\n"}
                          {item.recipients}
                        </p>
                      )}
                      {item.failures && (
                        <p className="whitespace-pre-line text-xs text-red-600">{item.failures}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminAnnouncements;