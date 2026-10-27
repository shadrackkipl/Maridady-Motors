import { useEffect, useRef } from "react";
import { FiAlertCircle, FiTrash2, FiX } from "react-icons/fi";

export const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100";

export const inputErrorClass =
  "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-100";

/** Label + control + hint + error message. Defined outside pages so inputs keep focus. */
export const Field = ({ label, error, hint, required, children, className = "" }) => (
  <label className={`grid min-w-0 content-start gap-1.5 text-sm font-medium text-slate-700 ${className}`}>
    <span>
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
    {children}
    {hint && !error && (
      <span className="text-xs font-normal text-slate-500">{hint}</span>
    )}
    {error && (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
        <FiAlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
        {error}
      </span>
    )}
  </label>
);

export const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export const StatusPill = ({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      active
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-slate-100 text-slate-600 ring-slate-200"
    }`}
  >
    <span className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    {active ? activeLabel : inactiveLabel}
  </span>
);

export const Banner = ({ tone = "error", children, onDismiss }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
      tone === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800"
    }`}
    role={tone === "error" ? "alert" : "status"}
  >
    <p className="flex-1">{children}</p>
    {onDismiss && (
      <button aria-label="Dismiss" onClick={onDismiss} type="button">
        <FiX aria-hidden="true" className="size-4" />
      </button>
    )}
  </div>
);

/** Accessible dialog: Escape and backdrop click close it, the page behind stops scrolling. */
export const Modal = ({ title, description, onClose, children, footer }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("input, select, textarea")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900" id="modal-title">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <FiX aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Delete",
  busy,
  onCancel,
  onConfirm,
}) => (
  <Modal
    footer={
      <>
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          disabled={busy}
          onClick={onConfirm}
          type="button"
        >
          <FiTrash2 aria-hidden="true" className="size-4" />
          {busy ? "Working..." : confirmLabel}
        </button>
      </>
    }
    onClose={busy ? () => {} : onCancel}
    title={title}
  >
    <p className="text-sm leading-6 text-slate-600">{message}</p>
  </Modal>
);

export const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#1f1f1f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-60";