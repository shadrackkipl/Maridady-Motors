import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiEdit2,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { adminApi, asList, getImageUrl } from "../staff/Staffapi";
import {
  Banner,
  ConfirmDialog,
  Field,
  Modal,
  PageHeader,
  StatusPill,
  inputClass,
  inputErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./AdminUi";

const MAX_PHOTO_MB = 5;

const EMPTY_FORM = {
  name: "",
  phone: "",
  whatsapp_number: "",
  email: "",
  order: "0",
  is_active: true,
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Avatar = ({ name, src, className = "size-12" }) =>
  src ? (
    <img alt="" className={`${className} rounded-full object-cover`} src={src} />
  ) : (
    <span className={`${className} grid place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-600`}>
      {getInitials(name || "?")}
    </span>
  );

const AdminSalesReps = () => {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [editing, setEditing] = useState(null); // null | "new" | rep
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get("/sales-reps/", { signal: controller.signal })
      .then(({ data }) => setReps(asList(data)))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setError("Unable to load the sales team. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Preview of a newly chosen photo
  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  );
  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview]
  );

  const openForm = (rep) => {
    setErrors({});
    setPhotoFile(null);
    setForm(
      rep === "new"
        ? EMPTY_FORM
        : {
            name: rep.name,
            phone: rep.phone || "",
            whatsapp_number: rep.whatsapp_number || "",
            email: rep.email || "",
            order: String(rep.order ?? 0),
            is_active: rep.is_active,
          }
    );
    setEditing(rep);
  };

  const closeForm = () => {
    if (!saving) setEditing(null);
  };

  const update = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const fieldError = (name) => [].concat(errors[name] ?? []).join(" ");

  const choosePhoto = (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: `Choose an image under ${MAX_PHOTO_MB} MB.`,
      }));
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next.photo;
      return next;
    });
    setPhotoFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const isNew = editing === "new";
    const clientErrors = {};
    if (!form.name.trim()) clientErrors.name = "Name is required.";
    if (!form.phone.trim()) clientErrors.phone = "A phone number is required.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("phone", form.phone.trim());
    data.append("whatsapp_number", form.whatsapp_number.trim());
    data.append("email", form.email.trim());
    data.append("order", form.order === "" ? "0" : form.order);
    data.append("is_active", String(form.is_active));
    if (photoFile) data.append("photo", photoFile);

    setSaving(true);
    setErrors({});

    try {
      const { data: saved } = isNew
        ? await adminApi.post("/sales-reps/", data)
        : await adminApi.patch(`/sales-reps/${editing.id}/`, data);

      setReps((current) =>
        isNew
          ? [...current, { ...saved, cars_count: saved.cars_count ?? 0 }]
          : current.map((item) =>
              item.id === saved.id
                ? { ...saved, cars_count: saved.cars_count ?? item.cars_count }
                : item
            )
      );
      setNotice(isNew ? `${saved.name} was added to the sales team.` : `${saved.name} was updated.`);
      setEditing(null);
    } catch (requestError) {
      if (requestError.response?.status === 400 && requestError.response.data) {
        setErrors(requestError.response.data);
      } else {
        setErrors({ form: "Could not save this person. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rep) => {
    setBusyId(rep.id);
    setError("");
    setNotice("");

    try {
      const body = new FormData();
      body.append("is_active", String(!rep.is_active));
      const { data } = await adminApi.patch(`/sales-reps/${rep.id}/`, body);
      setReps((current) =>
        current.map((item) =>
          item.id === data.id ? { ...data, cars_count: data.cars_count ?? item.cars_count } : item
        )
      );
    } catch {
      setError("Could not change this person's status.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const rep = deleteTarget;
    setBusyId(rep.id);
    setError("");
    setNotice("");

    try {
      await adminApi.delete(`/sales-reps/${rep.id}/`);
      setReps((current) => current.filter((item) => item.id !== rep.id));
      setNotice(`${rep.name} was removed from the sales team.`);
    } catch {
      setError("Could not delete this person.");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const isNew = editing === "new";
  const currentPhoto =
    photoPreview || (editing && editing !== "new" && editing.photo ? getImageUrl(editing.photo) : null);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <button className={primaryButtonClass} onClick={() => openForm("new")} type="button">
            <FiPlus aria-hidden="true" className="size-4" />
            Add sales representative
          </button>
        }
        description="People customers can call or message about vehicles. Assign them to cars when adding or editing a vehicle."
        title="Sales team"
      />

      {error && <Banner onDismiss={() => setError("")}>{error}</Banner>}
      {notice && (
        <Banner onDismiss={() => setNotice("")} tone="success">
          {notice}
        </Banner>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
          <span className="mr-3 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          Loading sales team...
        </div>
      ) : reps.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <FiBriefcase aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 font-semibold text-slate-900">No sales representatives yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Add your first person so customers can contact them from vehicle pages.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reps.map((rep) => (
            <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={rep.id}>
              <div className="flex items-start gap-4">
                <Avatar name={rep.name} src={rep.photo ? getImageUrl(rep.photo) : null} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-slate-900">{rep.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <FiPhone aria-hidden="true" className="size-3.5" />
                    {rep.phone}
                  </p>
                  {rep.whatsapp_number && rep.whatsapp_number !== rep.phone && (
                    <p className="text-xs text-slate-400">WhatsApp: {rep.whatsapp_number}</p>
                  )}
                  {rep.email && (
                    <p className="truncate text-xs text-slate-400">{rep.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    className="disabled:opacity-60"
                    disabled={busyId === rep.id}
                    onClick={() => toggleActive(rep)}
                    title={rep.is_active ? "Click to hide from the website" : "Click to show on the website"}
                    type="button"
                  >
                    <StatusPill active={rep.is_active} />
                  </button>
                  <span className="text-xs text-slate-500">
                    {rep.cars_count ?? 0} {rep.cars_count === 1 ? "vehicle" : "vehicles"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    aria-label={`Edit ${rep.name}`}
                    className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => openForm(rep)}
                    title="Edit"
                    type="button"
                  >
                    <FiEdit2 aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${rep.name}`}
                    className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    disabled={busyId === rep.id}
                    onClick={() => setDeleteTarget(rep)}
                    title="Delete"
                    type="button"
                  >
                    <FiTrash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal
          description="This is what customers see on vehicle pages."
          footer={
            <>
              <button className={secondaryButtonClass} disabled={saving} onClick={closeForm} type="button">
                Cancel
              </button>
              <button className={primaryButtonClass} disabled={saving} form="rep-form" type="submit">
                {saving ? "Saving..." : isNew ? "Add to team" : "Save changes"}
              </button>
            </>
          }
          onClose={closeForm}
          title={isNew ? "Add sales representative" : `Edit ${editing.name}`}
        >
          <form className="grid gap-4" id="rep-form" noValidate onSubmit={handleSubmit}>
            {errors.form && <Banner>{errors.form}</Banner>}

            <div className="flex items-center gap-4">
              <Avatar className="size-16" name={form.name} src={currentPhoto} />
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-within:ring-4 focus-within:ring-slate-100">
                  <FiUpload aria-hidden="true" className="size-4" />
                  {currentPhoto ? "Change photo" : "Upload photo"}
                  <input accept="image/*" className="sr-only" onChange={choosePhoto} type="file" />
                </label>
                {fieldError("photo") ? (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldError("photo")}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Optional. Initials show without one.</p>
                )}
              </div>
            </div>

            <Field error={fieldError("name")} label="Full name" required>
              <input
                aria-invalid={Boolean(fieldError("name"))}
                className={`${inputClass} ${fieldError("name") ? inputErrorClass : ""}`}
                onChange={update("name")}
                value={form.name}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field error={fieldError("phone")} hint="e.g. 0712345678" label="Phone number" required>
                <input
                  aria-invalid={Boolean(fieldError("phone"))}
                  className={`${inputClass} ${fieldError("phone") ? inputErrorClass : ""}`}
                  inputMode="tel"
                  onChange={update("phone")}
                  value={form.phone}
                />
              </Field>
              <Field error={fieldError("whatsapp_number")} hint="Leave empty to use the phone number" label="WhatsApp number">
                <input
                  className={inputClass}
                  inputMode="tel"
                  onChange={update("whatsapp_number")}
                  value={form.whatsapp_number}
                />
              </Field>
            </div>

            <Field error={fieldError("email")} hint="Used for announcements you send from the admin panel. Customers never see it." label="Email address">
              <input
                className={inputClass}
                onChange={update("email")}
                type="email"
                value={form.email}
              />
            </Field>

            <Field error={fieldError("order")} hint="Lower numbers are shown first" label="Display order">
              <input
                className={inputClass}
                min="0"
                onChange={update("order")}
                type="number"
                value={form.order}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                checked={form.is_active}
                className="size-4 accent-slate-900"
                onChange={update("is_active")}
                type="checkbox"
              />
              Show on the website
            </label>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          busy={busyId === deleteTarget.id}
          confirmLabel="Delete"
          message={`${deleteTarget.name} will be removed and unassigned from ${deleteTarget.cars_count ?? 0} ${deleteTarget.cars_count === 1 ? "vehicle" : "vehicles"}. To hide them without deleting, switch them to Inactive instead.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete this sales representative?"
        />
      )}
    </div>
  );
};

export default AdminSalesReps;