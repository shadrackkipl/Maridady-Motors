import { useEffect, useMemo, useState } from "react";
import {
  FiCopy,
  FiEdit2,
  FiKey,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { adminApi, asList } from "../staff/Staffapi";
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

const EMPTY_FORM = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_active: true,
};

// Letters and digits without look-alikes (no 0/O or 1/l/I)
const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

const generatePassword = (length = 12) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => PASSWORD_CHARS[value % PASSWORD_CHARS.length]).join("");
};

const fullName = (person) =>
  [person.first_name, person.last_name].filter(Boolean).join(" ") || person.username;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
    : "Never";

const AdminStaff = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [editing, setEditing] = useState(null); // null | "new" | person
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get("/staff/", { signal: controller.signal })
      .then(({ data }) => setPeople(asList(data)))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setError("Unable to load staff members. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return people;
    return people.filter((person) =>
      [person.username, person.first_name, person.last_name, person.email]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [people, search]);

  const openForm = (person) => {
    setErrors({});
    setShowPassword(false);
    setCopied(false);
    setForm(
      person === "new"
        ? EMPTY_FORM
        : {
            username: person.username,
            first_name: person.first_name || "",
            last_name: person.last_name || "",
            email: person.email || "",
            password: "",
            is_active: person.is_active,
          }
    );
    setEditing(person);
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

  const handleGenerate = () => {
    setForm((current) => ({ ...current, password: generatePassword() }));
    setShowPassword(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(form.password);
      setCopied(true);
    } catch {
      setShowPassword(true); // clipboard blocked: at least reveal it
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const isNew = editing === "new";
    const clientErrors = {};
    if (!form.username.trim()) clientErrors.username = "Username is required.";
    if (isNew && !form.password) clientErrors.password = "A password is required.";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      username: form.username.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;

    setSaving(true);
    setErrors({});

    try {
      const { data } = isNew
        ? await adminApi.post("/staff/", payload)
        : await adminApi.patch(`/staff/${editing.id}/`, payload);

      setPeople((current) =>
        isNew ? [data, ...current] : current.map((item) => (item.id === data.id ? data : item))
      );
      setNotice(
        isNew
          ? `${fullName(data)} was added. Share their username and password with them.`
          : form.password
            ? `${fullName(data)} was updated and their password was changed.`
            : `${fullName(data)} was updated.`
      );
      setEditing(null);
    } catch (requestError) {
      if (requestError.response?.status === 400 && requestError.response.data) {
        setErrors(requestError.response.data);
      } else {
        setErrors({ form: "Could not save this staff member. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (person) => {
    setBusyId(person.id);
    setError("");
    setNotice("");

    try {
      const { data } = await adminApi.patch(`/staff/${person.id}/`, {
        is_active: !person.is_active,
      });
      setPeople((current) => current.map((item) => (item.id === data.id ? data : item)));
      setNotice(
        data.is_active
          ? `${fullName(data)} can sign in again.`
          : `${fullName(data)} can no longer sign in.`
      );
    } catch {
      setError("Could not change this account's status.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const person = deleteTarget;
    setBusyId(person.id);
    setError("");
    setNotice("");

    try {
      await adminApi.delete(`/staff/${person.id}/`);
      setPeople((current) => current.filter((item) => item.id !== person.id));
      setNotice(`${fullName(person)} was removed.`);
    } catch {
      setError("Could not delete this staff member.");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const isNew = editing === "new";

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <button className={primaryButtonClass} onClick={() => openForm("new")} type="button">
            <FiPlus aria-hidden="true" className="size-4" />
            Add staff member
          </button>
        }
        description="Staff can sign in to the staff panel and manage vehicles only."
        title="Staff members"
      />

      {error && <Banner onDismiss={() => setError("")}>{error}</Banner>}
      {notice && (
        <Banner onDismiss={() => setNotice("")} tone="success">
          {notice}
        </Banner>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-slate-500">
            {people.length} {people.length === 1 ? "account" : "accounts"}
          </p>
          <label className="relative block sm:w-72">
            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search staff"
              className={`${inputClass} pl-10`}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, username or email"
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
            <span className="mr-3 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            Loading staff...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <FiUsers aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">
              {people.length === 0 ? "No staff members yet" : "No matches"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {people.length === 0
                ? "Add your first staff member so they can manage vehicles."
                : "Try a different search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <tr>
                  <th className="px-6 py-3" scope="col">Name</th>
                  <th className="px-4 py-3" scope="col">Email</th>
                  <th className="px-4 py-3" scope="col">Last sign-in</th>
                  <th className="px-4 py-3" scope="col">Status</th>
                  <th className="px-6 py-3 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((person) => (
                  <tr className="hover:bg-slate-50" key={person.id}>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-900">{fullName(person)}</p>
                      <p className="text-xs text-slate-500">@{person.username}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{person.email || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(person.last_login)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        className="disabled:opacity-60"
                        disabled={busyId === person.id}
                        onClick={() => toggleActive(person)}
                        title={person.is_active ? "Click to block sign-in" : "Click to allow sign-in"}
                        type="button"
                      >
                        <StatusPill active={person.is_active} />
                      </button>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Edit ${fullName(person)}`}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => openForm(person)}
                          title="Edit or reset password"
                          type="button"
                        >
                          <FiEdit2 aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          aria-label={`Delete ${fullName(person)}`}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          disabled={busyId === person.id}
                          onClick={() => setDeleteTarget(person)}
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
              ? "They will sign in at the staff login page."
              : "Leave the password empty to keep it unchanged."
          }
          footer={
            <>
              <button className={secondaryButtonClass} disabled={saving} onClick={closeForm} type="button">
                Cancel
              </button>
              <button className={primaryButtonClass} disabled={saving} form="staff-form" type="submit">
                {saving ? "Saving..." : isNew ? "Add staff member" : "Save changes"}
              </button>
            </>
          }
          onClose={closeForm}
          title={isNew ? "Add staff member" : `Edit ${fullName(editing)}`}
        >
          <form className="grid gap-4" id="staff-form" noValidate onSubmit={handleSubmit}>
            {errors.form && <Banner>{errors.form}</Banner>}
            {errors.non_field_errors && <Banner>{[].concat(errors.non_field_errors).join(" ")}</Banner>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field error={fieldError("first_name")} label="First name">
                <input className={inputClass} onChange={update("first_name")} value={form.first_name} />
              </Field>
              <Field error={fieldError("last_name")} label="Last name">
                <input className={inputClass} onChange={update("last_name")} value={form.last_name} />
              </Field>
            </div>

            <Field error={fieldError("username")} hint="Used to sign in. Letters, numbers and @/./+/-/_ only." label="Username" required>
              <input
                aria-invalid={Boolean(fieldError("username"))}
                autoCapitalize="none"
                autoComplete="off"
                className={`${inputClass} ${fieldError("username") ? inputErrorClass : ""}`}
                onChange={update("username")}
                value={form.username}
              />
            </Field>

            <Field error={fieldError("email")} label="Email">
              <input
                aria-invalid={Boolean(fieldError("email"))}
                className={`${inputClass} ${fieldError("email") ? inputErrorClass : ""}`}
                onChange={update("email")}
                type="email"
                value={form.email}
              />
            </Field>

            <Field
              error={fieldError("password")}
              hint={isNew ? "At least 8 characters, not too common." : "Fill in only to set a new password."}
              label={isNew ? "Password" : "New password"}
              required={isNew}
            >
              <div className="flex gap-2">
                <input
                  aria-invalid={Boolean(fieldError("password"))}
                  autoComplete="new-password"
                  className={`${inputClass} ${fieldError("password") ? inputErrorClass : ""}`}
                  onChange={(event) => {
                    update("password")(event);
                    setCopied(false);
                  }}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button
                  aria-label="Generate a password"
                  className="grid size-[42px] shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={handleGenerate}
                  title="Generate a password"
                  type="button"
                >
                  <FiRefreshCw aria-hidden="true" className="size-4" />
                </button>
                <button
                  aria-label="Copy password"
                  className="grid size-[42px] shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  disabled={!form.password}
                  onClick={handleCopy}
                  title="Copy password"
                  type="button"
                >
                  <FiCopy aria-hidden="true" className="size-4" />
                </button>
              </div>
              {copied && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <FiKey aria-hidden="true" className="size-3.5" />
                  Copied. Share it with the staff member privately.
                </span>
              )}
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                checked={form.is_active}
                className="size-4 accent-slate-900"
                onChange={update("is_active")}
                type="checkbox"
              />
              Account is active (can sign in)
            </label>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          busy={busyId === deleteTarget.id}
          confirmLabel="Delete account"
          message={`${fullName(deleteTarget)} will be removed and can no longer sign in. Vehicles they added stay on the site. This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete this staff member?"
        />
      )}
    </div>
  );
};

export default AdminStaff;