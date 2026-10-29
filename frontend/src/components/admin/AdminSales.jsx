import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiDollarSign,
  FiEdit2,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import { adminApi, asList } from "../staff/Staffapi";
import {
  Banner,
  ConfirmDialog,
  Field,
  Modal,
  PageHeader,
  inputClass,
  inputErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./AdminUi";

const PAYMENT_METHODS = [
  ["cash", "Cash"],
  ["mpesa", "M-Pesa"],
  ["bank_transfer", "Bank transfer"],
  ["financing", "Financing / loan"],
  ["other", "Other"],
];

const STATUS_STYLES = {
  paid: ["Paid", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  partial: ["Part paid", "bg-amber-50 text-amber-700 ring-amber-200"],
  unpaid: ["Unpaid", "bg-red-50 text-red-700 ring-red-200"],
};

// Today's date in Nairobi, as YYYY-MM-DD
const todayInNairobi = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE")}`;

const EMPTY_FORM = {
  car: "",
  buyer_name: "",
  buyer_phone: "",
  buyer_email: "",
  buyer_address: "",
  sale_price: "",
  amount_paid: "0",
  payment_method: "cash",
  sold_at: todayInNairobi(),
  notes: "",
};

const PaymentBadge = ({ status }) => {
  const [label, tone] = STATUS_STYLES[status] || STATUS_STYLES.unpaid;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`grid size-9 place-items-center rounded-lg ${tone}`}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
    </div>
    <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
  </article>
);

const AdminSales = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null); // null | "new" | sale
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sellable, setSellable] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get("/sales/", { signal: controller.signal })
      .then(({ data }) => setSales(asList(data)))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setError("Unable to load sales. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const loadSellable = async () => {
    try {
      const { data } = await adminApi.get("/sales/sellable-cars/");
      setSellable(data);
      return data;
    } catch {
      setError("Could not load the list of vehicles.");
      return [];
    }
  };

  const openNew = async (carId) => {
    setErrors({});
    const cars = await loadSellable();
    const car = cars.find((item) => String(item.id) === String(carId));
    setForm({
      ...EMPTY_FORM,
      sold_at: todayInNairobi(),
      car: car ? String(car.id) : "",
      sale_price: car ? String(Number(car.price)) : "",
    });
    setEditing("new");
  };

  // Arriving from a client request: /admin-panel/sales?sell=<vehicle id>
  useEffect(() => {
    const carId = searchParams.get("sell");
    if (carId) {
      openNew(carId);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (sale) => {
    setErrors({});
    setForm({
      car: sale.car ? String(sale.car) : "",
      buyer_name: sale.buyer_name,
      buyer_phone: sale.buyer_phone || "",
      buyer_email: sale.buyer_email || "",
      buyer_address: sale.buyer_address || "",
      sale_price: String(Number(sale.sale_price)),
      amount_paid: String(Number(sale.amount_paid)),
      payment_method: sale.payment_method,
      sold_at: sale.sold_at,
      notes: sale.notes || "",
    });
    setEditing(sale);
  };

  const closeForm = () => {
    if (!saving) setEditing(null);
  };

  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const chooseCar = (event) => {
    const carId = event.target.value;
    const car = sellable.find((item) => String(item.id) === carId);
    setForm((current) => ({
      ...current,
      car: carId,
      sale_price: car ? String(Number(car.price)) : current.sale_price,
    }));
    setErrors((current) => ({ ...current, car: undefined }));
  };

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const isNew = editing === "new";
    const clientErrors = {};
    if (isNew && !form.car) clientErrors.car = "Choose the vehicle that was sold.";
    if (!form.buyer_name.trim()) clientErrors.buyer_name = "Enter the buyer's name.";
    if (form.sale_price === "" || Number(form.sale_price) <= 0) clientErrors.sale_price = "Enter the sale price.";
    if (Number(form.amount_paid || 0) > Number(form.sale_price || 0)) {
      clientErrors.amount_paid = "The amount paid cannot be more than the sale price.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      buyer_name: form.buyer_name.trim(),
      buyer_phone: form.buyer_phone.trim(),
      buyer_email: form.buyer_email.trim(),
      buyer_address: form.buyer_address.trim(),
      sale_price: form.sale_price,
      amount_paid: form.amount_paid === "" ? "0" : form.amount_paid,
      payment_method: form.payment_method,
      sold_at: form.sold_at,
      notes: form.notes.trim(),
    };
    if (isNew) payload.car = Number(form.car);

    setSaving(true);
    setErrors({});

    try {
      if (isNew) {
        const { data } = await adminApi.post("/sales/", payload);
        navigate(`/admin-panel/sales/${data.id}/invoice`);
        return;
      }
      const { data } = await adminApi.patch(`/sales/${editing.id}/`, payload);
      setSales((current) => current.map((item) => (item.id === data.id ? data : item)));
      setNotice(`Invoice ${data.invoice_number} was updated.`);
      setEditing(null);
    } catch (requestError) {
      if (requestError.response?.status === 400 && requestError.response.data) {
        setErrors(requestError.response.data);
      } else {
        setErrors({ form: "Could not save this sale. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/sales/${deleteTarget.id}/`);
      setSales((current) => current.filter((item) => item.id !== deleteTarget.id));
      setNotice(`Invoice ${deleteTarget.invoice_number} was deleted.`);
    } catch {
      setError("Could not delete this invoice.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sales;
    return sales.filter((sale) =>
      [sale.invoice_number, sale.buyer_name, sale.vehicle_description, sale.stock_number]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [sales, search]);

  const revenue = sales.reduce((total, sale) => total + Number(sale.sale_price), 0);
  const outstanding = sales.reduce((total, sale) => total + Number(sale.balance), 0);
  const isNew = editing === "new";

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <button className={primaryButtonClass} onClick={() => openNew()} type="button">
            <FiPlus aria-hidden="true" className="size-4" />
            Record a sale
          </button>
        }
        description="When a vehicle is sold, record it here to create its invoice. The vehicle is hidden from the website automatically."
        title="Sales & invoices"
      />

      {error && <Banner onDismiss={() => setError("")}>{error}</Banner>}
      {notice && (
        <Banner onDismiss={() => setNotice("")} tone="success">
          {notice}
        </Banner>
      )}

      <section aria-label="Sales summary" className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FiFileText} label="Invoices" tone="bg-slate-100 text-slate-700" value={sales.length} />
        <StatCard icon={FiTrendingUp} label="Total sales" tone="bg-emerald-50 text-emerald-700" value={money(revenue)} />
        <StatCard icon={FiDollarSign} label="Balance still owed" tone="bg-amber-50 text-amber-700" value={money(outstanding)} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-slate-500">
            {sales.length} {sales.length === 1 ? "sale" : "sales"}
          </p>
          <label className="relative block sm:w-72">
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search sales"
              className={`${inputClass} pl-10`}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, buyer or vehicle"
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
            <span className="mr-3 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            Loading sales...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <FiFileText aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">
              {sales.length === 0 ? "No sales recorded yet" : "No matches"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {sales.length === 0
                ? "Record your first sale to create an invoice."
                : "Try a different search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <tr>
                  <th className="px-6 py-3" scope="col">Invoice</th>
                  <th className="px-4 py-3" scope="col">Vehicle</th>
                  <th className="px-4 py-3" scope="col">Buyer</th>
                  <th className="px-4 py-3" scope="col">Total</th>
                  <th className="px-4 py-3" scope="col">Balance</th>
                  <th className="px-4 py-3" scope="col">Payment</th>
                  <th className="px-6 py-3 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sale) => (
                  <tr className="hover:bg-slate-50" key={sale.id}>
                    <td className="px-6 py-3.5">
                      <Link className="font-semibold text-slate-900 hover:underline" to={`/admin-panel/sales/${sale.id}/invoice`}>
                        {sale.invoice_number}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {new Date(sale.sold_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900">{sale.vehicle_description}</p>
                      <p className="text-xs text-slate-500">{sale.stock_number}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{sale.buyer_name}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{money(sale.sale_price)}</td>
                    <td className="px-4 py-3.5 text-slate-600">{money(sale.balance)}</td>
                    <td className="px-4 py-3.5"><PaymentBadge status={sale.payment_status} /></td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Link
                          aria-label={`View invoice ${sale.invoice_number}`}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="View invoice"
                          to={`/admin-panel/sales/${sale.id}/invoice`}
                        >
                          <FiFileText aria-hidden="true" className="size-4" />
                        </Link>
                        <button
                          aria-label={`Edit ${sale.invoice_number}`}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => openEdit(sale)}
                          title="Edit or record a payment"
                          type="button"
                        >
                          <FiEdit2 aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          aria-label={`Delete ${sale.invoice_number}`}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteTarget(sale)}
                          title="Delete"
                          type="button"
                        >
                          <FiTrash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <Modal
          description={
            isNew
              ? "Fill in the buyer and payment details. The invoice is created when you save."
              : "Update the details, or record a payment by changing the amount paid."
          }
          footer={
            <>
              <button className={secondaryButtonClass} disabled={saving} onClick={closeForm} type="button">
                Cancel
              </button>
              <button className={primaryButtonClass} disabled={saving} form="sale-form" type="submit">
                {saving ? "Saving..." : isNew ? "Create invoice" : "Save changes"}
              </button>
            </>
          }
          onClose={closeForm}
          title={isNew ? "Record a sale" : `Edit ${editing.invoice_number}`}
        >
          <form className="grid gap-4" id="sale-form" noValidate onSubmit={handleSubmit}>
            {errors.form && <Banner>{errors.form}</Banner>}
            {errors.non_field_errors && <Banner>{[].concat(errors.non_field_errors).join(" ")}</Banner>}

            {isNew ? (
              <Field error={fieldError("car")} label="Vehicle sold" required>
                <select
                  aria-invalid={Boolean(fieldError("car"))}
                  className={`${inputClass} ${fieldError("car") ? inputErrorClass : ""}`}
                  onChange={chooseCar}
                  value={form.car}
                >
                  <option value="">Choose a vehicle</option>
                  {sellable.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.label} · {car.stock_number}
                      {car.is_available ? "" : " (hidden)"}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{editing.vehicle_description}</span>
                {editing.stock_number ? ` · ${editing.stock_number}` : ""}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field error={fieldError("buyer_name")} label="Buyer's name" required>
                <input
                  aria-invalid={Boolean(fieldError("buyer_name"))}
                  className={`${inputClass} ${fieldError("buyer_name") ? inputErrorClass : ""}`}
                  onChange={update("buyer_name")}
                  value={form.buyer_name}
                />
              </Field>
              <Field error={fieldError("buyer_phone")} label="Phone">
                <input className={inputClass} inputMode="tel" onChange={update("buyer_phone")} value={form.buyer_phone} />
              </Field>
              <Field error={fieldError("buyer_email")} label="Email">
                <input className={inputClass} onChange={update("buyer_email")} type="email" value={form.buyer_email} />
              </Field>
              <Field error={fieldError("buyer_address")} label="Address">
                <input className={inputClass} onChange={update("buyer_address")} value={form.buyer_address} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field error={fieldError("sale_price")} hint="Starts at the listed price; change it if you agreed a different one." label="Sale price (KES)" required>
                <input
                  aria-invalid={Boolean(fieldError("sale_price"))}
                  className={`${inputClass} ${fieldError("sale_price") ? inputErrorClass : ""}`}
                  min="0"
                  onChange={update("sale_price")}
                  step="0.01"
                  type="number"
                  value={form.sale_price}
                />
              </Field>
              <Field error={fieldError("amount_paid")} hint="Deposit or full payment received so far." label="Amount paid (KES)">
                <input
                  aria-invalid={Boolean(fieldError("amount_paid"))}
                  className={`${inputClass} ${fieldError("amount_paid") ? inputErrorClass : ""}`}
                  min="0"
                  onChange={update("amount_paid")}
                  step="0.01"
                  type="number"
                  value={form.amount_paid}
                />
              </Field>
              <Field label="Payment method">
                <select className={inputClass} onChange={update("payment_method")} value={form.payment_method}>
                  {PAYMENT_METHODS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field error={fieldError("sold_at")} label="Date of sale">
                <input className={inputClass} onChange={update("sold_at")} type="date" value={form.sold_at} />
              </Field>
            </div>

            <Field hint="Shown on the invoice." label="Notes">
              <textarea className={`${inputClass} resize-y`} onChange={update("notes")} rows={2} value={form.notes} />
            </Field>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          busy={deleting}
          confirmLabel="Delete invoice"
          message={`Invoice ${deleteTarget.invoice_number} for ${deleteTarget.vehicle_description} will be deleted. The vehicle stays hidden until you make it available again in the vehicle list.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete this invoice?"
        />
      )}
    </div>
  );
};

export default AdminSales;