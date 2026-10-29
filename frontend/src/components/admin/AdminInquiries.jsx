import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiFileText,
  FiInbox,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { adminApi, asList } from "../staff/Staffapi";
import {
  Banner,
  ConfirmDialog,
  Modal,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./AdminUi";

const STATUSES = [
  { id: "new", label: "New", tone: "bg-pink-50 text-pink-700 ring-pink-200" },
  { id: "contacted", label: "Contacted", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  { id: "closed", label: "Closed", tone: "bg-slate-100 text-slate-600 ring-slate-200" },
];

const TABS = [{ id: "all", label: "All" }, ...STATUSES];

const statusOf = (id) => STATUSES.find((item) => item.id === id) || STATUSES[0];

const StatusBadge = ({ status }) => {
  const { label, tone } = statusOf(status);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {label}
    </span>
  );
};

// 0712345678 or +254712345678 -> 254712345678 (for wa.me links)
const toWhatsAppNumber = (value) => {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9 && /^[17]/.test(digits)) return `254${digits}`;
  return digits;
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminInquiries = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get("/inquiries/", { signal: controller.signal })
      .then(({ data }) => setItems(asList(data)))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setError("Unable to load client requests. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    const result = { all: items.length, new: 0, contacted: 0, closed: 0 };
    items.forEach((item) => {
      result[item.status] = (result[item.status] || 0) + 1;
    });
    return result;
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (tab !== "all" && item.status !== tab) return false;
      if (!query) return true;
      return [item.name, item.phone, item.email, item.vehicle_label, item.message]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, tab, search]);

  const replaceItem = (updated) =>
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));

  const patch = async (item, changes) => {
    const { data } = await adminApi.patch(`/inquiries/${item.id}/`, changes);
    replaceItem(data);
    return data;
  };

  const openRequest = async (item) => {
    setSelected(item);
    setNotes(item.admin_notes || "");

    // Opening a new request marks it as seen
    if (item.status === "new") {
      try {
        const updated = await patch(item, { status: "contacted" });
        setSelected(updated);
      } catch {
        /* the admin can still change the status by hand */
      }
    }
  };

  const changeStatus = async (status) => {
    setError("");
    try {
      setSelected(await patch(selected, { status }));
    } catch {
      setError("Could not change the status.");
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    setError("");
    try {
      setSelected(await patch(selected, { admin_notes: notes }));
      setNotice("Notes saved.");
    } catch {
      setError("Could not save the notes.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/inquiries/${deleteTarget.id}/`);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setNotice("The request was deleted.");
      setSelected(null);
    } catch {
      setError("Could not delete this request.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const whatsappLink = (item) =>
    `https://wa.me/${toWhatsAppNumber(item.phone)}?text=${encodeURIComponent(
      `Hi ${item.name.split(" ")[0]}, thank you for contacting Maridady Motors${
        item.vehicle_label ? ` about the ${item.vehicle_label}` : ""
      }.`
    )}`;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Requests customers send from the website. Open one to contact the customer and keep track of progress."
        title="Client requests"
      />

      {error && <Banner onDismiss={() => setError("")}>{error}</Banner>}
      {notice && (
        <Banner onDismiss={() => setNotice("")} tone="success">
          {notice}
        </Banner>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5">
          <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 lg:w-auto" role="tablist">
            {TABS.map((item) => (
              <button
                aria-selected={tab === item.id}
                className={`flex-1 rounded-md px-3.5 py-1.5 text-sm font-medium transition lg:flex-none ${
                  tab === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                key={item.id}
                onClick={() => setTab(item.id)}
                role="tab"
                type="button"
              >
                {item.label}
                <span className="ml-1.5 text-xs text-slate-400">{counts[item.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search requests"
              className={`${inputClass} pl-10`}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, vehicle"
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
            <span className="mr-3 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <FiInbox aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">
              {items.length === 0 ? "No requests yet" : "Nothing matches"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {items.length === 0
                ? "When a customer sends a request from a vehicle page, it appears here."
                : "Try another tab or search."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  className="flex w-full flex-col gap-2 px-4 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  onClick={() => openRequest(item)}
                  type="button"
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${item.status === "new" ? "bg-pink-500" : "bg-transparent"}`}
                    />
                    <span className="min-w-0">
                      <span className={`block truncate text-sm text-slate-900 ${item.status === "new" ? "font-bold" : "font-semibold"}`}>
                        {item.name}
                        <span className="ml-2 font-normal text-slate-400">{item.phone}</span>
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {item.vehicle_label || "General inquiry"}
                      </span>
                      <span className="mt-1 line-clamp-1 block text-sm text-slate-600">{item.message}</span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && (
        <Modal
          description={formatDateTime(selected.created_at)}
          footer={
            <>
              <button
                className="mr-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                onClick={() => setDeleteTarget(selected)}
                type="button"
              >
                <FiTrash2 aria-hidden="true" className="size-4" />
                Delete
              </button>
              <button className={secondaryButtonClass} onClick={() => setSelected(null)} type="button">
                Close
              </button>
            </>
          }
          onClose={() => setSelected(null)}
          title={selected.name}
        >
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              <a className={secondaryButtonClass} href={`tel:${selected.phone}`}>
                <FiPhone aria-hidden="true" className="size-4" />
                Call
              </a>
              <a className={secondaryButtonClass} href={whatsappLink(selected)} rel="noopener noreferrer" target="_blank">
                <FiMessageCircle aria-hidden="true" className="size-4" />
                WhatsApp
              </a>
              {selected.email && (
                <a className={secondaryButtonClass} href={`mailto:${selected.email}`}>
                  <FiMail aria-hidden="true" className="size-4" />
                  Email
                </a>
              )}
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-900">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{selected.email || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Vehicle</dt>
                <dd className="font-medium text-slate-900">{selected.vehicle_label || "General inquiry"}</dd>
              </div>
            </dl>

            <div>
              <p className="text-xs text-slate-500">Message</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selected.message}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-slate-500">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button
                    aria-pressed={selected.status === item.id}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                      selected.status === item.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    key={item.id}
                    onClick={() => changeStatus(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500" htmlFor="request-notes">
                Private notes (only you see these)
              </label>
              <textarea
                className={`${inputClass} mt-1 resize-y`}
                id="request-notes"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Called, wants a test drive on Saturday"
                rows={3}
                value={notes}
              />
              <button
                className={`${primaryButtonClass} mt-2`}
                disabled={saving || notes === (selected.admin_notes || "")}
                onClick={saveNotes}
                type="button"
              >
                <FiCheckCircle aria-hidden="true" className="size-4" />
                {saving ? "Saving..." : "Save notes"}
              </button>
            </div>

            {selected.car && (
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-pink-700 hover:underline"
                to={`/admin-panel/sales?sell=${selected.car}`}
              >
                <FiFileText aria-hidden="true" className="size-4" />
                This vehicle was sold? Record the sale and create an invoice
              </Link>
            )}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          busy={deleting}
          message={`The request from ${deleteTarget.name} will be deleted for good.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete this request?"
        />
      )}
    </div>
  );
}

export default AdminInquiries;