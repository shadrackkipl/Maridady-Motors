import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiMail, FiPrinter } from "react-icons/fi";
import { adminApi } from "../staff/Staffapi";
import MaridadyLogo from "../../assets/MaridadyLogo.png";

// Edit these once: they appear at the top of every invoice.
// Anything left empty is simply not shown.
const COMPANY = {
  name: "Maridady Motors",
  address: "",
  phone: "",
  email: "",
  taxPin: "", // e.g. your KRA PIN
};

// Optional text printed at the bottom (payment terms, bank details, ...)
const FOOTER_NOTE = "";

const PAYMENT_LABELS = {
  cash: "Cash",
  mpesa: "M-Pesa",
  bank_transfer: "Bank transfer",
  financing: "Financing / loan",
  other: "Other",
};

const STATUS = {
  paid: ["PAID", "border-emerald-600 text-emerald-700"],
  partial: ["PART PAID", "border-amber-600 text-amber-700"],
  unpaid: ["UNPAID", "border-red-600 text-red-700"],
};

const money = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

const AdminInvoice = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get(`/sales/${id}/`, { signal: controller.signal })
      .then(({ data }) => setSale(data))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setError(
          requestError.response?.status === 404
            ? "This invoice could not be found."
            : "Unable to load this invoice. Please try again."
        );
      });

    return () => controller.abort();
  }, [id]);

  if (error) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-slate-50 px-4 text-center">
        <div>
          <p className="text-slate-600">{error}</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-slate-900 underline" to="/admin-panel/sales">
            Back to sales
          </Link>
        </div>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-slate-50 text-sm text-slate-500">
        Loading invoice...
      </main>
    );
  }

  const [statusLabel, statusTone] = STATUS[sale.payment_status] || STATUS.unpaid;
  const detailLines = (sale.vehicle_details || "")
    .split("\n")
    .map((line) => line.split(": "))
    .filter((parts) => parts.length >= 2);

  const emailLink = sale.buyer_email
    ? `mailto:${sale.buyer_email}?subject=${encodeURIComponent(
        `Invoice ${sale.invoice_number} from ${COMPANY.name}`
      )}&body=${encodeURIComponent(
        `Dear ${sale.buyer_name},\n\nPlease find attached invoice ${sale.invoice_number} for your ${sale.vehicle_description}.\n\nThank you for choosing ${COMPANY.name}.`
      )}`
    : null;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
      {/* Toolbar: not printed */}
      <div className="mx-auto mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          to="/admin-panel/sales"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" />
          Back to sales
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            to="/admin-panel/sales"
          >
            <FiEdit2 aria-hidden="true" className="size-4" />
            Edit or record payment
          </Link>
          {emailLink && (
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={emailLink}
              title="Opens your email app. Save the invoice as a PDF first, then attach it."
            >
              <FiMail aria-hidden="true" className="size-4" />
              Email to buyer
            </a>
          )}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1f1f1f] px-4 text-sm font-semibold text-white hover:bg-black"
            onClick={() => window.print()}
            type="button"
          >
            <FiPrinter aria-hidden="true" className="size-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* The invoice itself */}
      <article className="mx-auto max-w-3xl bg-white p-8 shadow-sm sm:p-12 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="flex items-start gap-4">
            <img alt="" className="h-14 w-auto" src={MaridadyLogo} />
            <div className="text-sm leading-6 text-slate-600">
              <p className="text-base font-bold text-slate-950">{COMPANY.name}</p>
              {COMPANY.address && <p>{COMPANY.address}</p>}
              {COMPANY.phone && <p>{COMPANY.phone}</p>}
              {COMPANY.email && <p>{COMPANY.email}</p>}
              {COMPANY.taxPin && <p>PIN: {COMPANY.taxPin}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">INVOICE</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700">{sale.invoice_number}</p>
            <p className="text-sm text-slate-500">Date: {formatDate(sale.sold_at)}</p>
            <span className={`mt-3 inline-block rounded border-2 px-3 py-1 text-xs font-bold tracking-wider ${statusTone}`}>
              {statusLabel}
            </span>
          </div>
        </header>

        <section className="grid gap-8 border-b border-slate-200 py-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bill to</h2>
            <p className="mt-2 text-base font-semibold text-slate-950">{sale.buyer_name}</p>
            <div className="text-sm leading-6 text-slate-600">
              {sale.buyer_phone && <p>{sale.buyer_phone}</p>}
              {sale.buyer_email && <p>{sale.buyer_email}</p>}
              {sale.buyer_address && <p>{sale.buyer_address}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Payment</h2>
            <p className="mt-2 text-sm text-slate-700">
              Method: <span className="font-semibold">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</span>
            </p>
            {sale.created_by_name && (
              <p className="text-sm text-slate-500">Prepared by {sale.created_by_name}</p>
            )}
          </div>
        </section>

        <section className="py-8">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-300 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 align-top">
                <td className="py-4 pr-4">
                  <p className="text-base font-semibold text-slate-950">{sale.vehicle_description}</p>
                  {sale.stock_number && (
                    <p className="text-xs text-slate-500">Stock no. {sale.stock_number}</p>
                  )}
                  {detailLines.length > 0 && (
                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                      {detailLines.map(([label, ...rest]) => (
                        <div className="flex justify-between gap-3 border-b border-slate-50 py-0.5" key={label}>
                          <dt className="text-slate-500">{label}</dt>
                          <dd className="font-medium text-slate-800">{rest.join(": ")}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </td>
                <td className="py-4 text-right font-semibold text-slate-950">{money(sale.sale_price)}</td>
              </tr>
            </tbody>
          </table>

          <dl className="ml-auto mt-6 w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Total</dt>
              <dd className="font-semibold text-slate-950">{money(sale.sale_price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Amount paid</dt>
              <dd className="font-semibold text-slate-950">{money(sale.amount_paid)}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base">
              <dt className="font-bold text-slate-950">Balance due</dt>
              <dd className="font-bold text-slate-950">{money(sale.balance)}</dd>
            </div>
          </dl>
        </section>

        {sale.notes && (
          <section className="border-t border-slate-200 py-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{sale.notes}</p>
          </section>
        )}

        <section className="grid gap-10 border-t border-slate-200 pt-12 sm:grid-cols-2">
          <div>
            <div className="border-t border-slate-400 pt-2 text-xs text-slate-500">Seller&apos;s signature</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2 text-xs text-slate-500">Buyer&apos;s signature</div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs leading-5 text-slate-500">
          {FOOTER_NOTE && <p className="mb-2 whitespace-pre-line">{FOOTER_NOTE}</p>}
          <p>Thank you for choosing {COMPANY.name}.</p>
        </footer>
      </article>
    </main>
  );
};

export default AdminInvoice;