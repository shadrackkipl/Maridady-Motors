import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { staffLogin } from "./Staffapi";
import SlideImage1 from "../../assets/slide/slide4.png";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-600/10";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await staffLogin(username.trim(), password);
      navigate("/staff/cars", { replace: true });
    } catch (loginError) {
      if (loginError.code === "no-access") {
        setError("This account does not have access to the staff panel.");
      } else if (loginError.response?.status === 401) {
        setError("Incorrect username or password.");
      } else {
        setError("Could not sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          <a
            aria-label="Maridady Motors staff portal"
            className="mb-14 inline-flex items-center gap-3"
            href="/"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-sm font-bold tracking-wider text-amber-400">
              MM
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-[0.14em] text-slate-950">
                MARIDADY MOTORS
              </span>
              <span className="mt-1 block text-xs font-medium tracking-wide text-slate-500">
                STAFF PORTAL
              </span>
            </span>
          </a>

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Secure staff access
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-black-950 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in to manage vehicle listings and keep your showroom up to date.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="staff-username"
              >
                Username
              </label>
              <div className="relative">
                <FiUser
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                />
                <input
                  autoComplete="username"
                  className={inputClass}
                  id="staff-username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                  value={username}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="staff-password"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                />
                <input
                  autoComplete="current-password"
                  className={`${inputClass} pr-12`}
                  id="staff-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? (
                    <FiEyeOff aria-hidden="true" className="size-[18px]" />
                  ) : (
                    <FiEye aria-hidden="true" className="size-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-950/15 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Signing in..." : "Sign in to your account"}
              {!submitting && (
                <FiArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2.5 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
            <FiShield aria-hidden="true" className="size-4 shrink-0 text-emerald-700" />
            <span>Your sign-in is protected and only available to authorized staff.</span>
          </div>
        </div>
      </section>

      <aside
        aria-label="Maridady Motors showroom"
        className="relative hidden overflow-hidden bg-slate-950 bg-cover bg-center lg:block"
        style={{ backgroundImage: `url(${SlideImage1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/45 to-slate-950/15" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <div className="mb-5 h-1 w-12 rounded-full bg-amber-400" />
          <p className="max-w-lg text-3xl font-semibold leading-tight text-white xl:text-4xl">
            Everything you need to keep your showroom moving.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
            Manage your inventory with the tools built for the Maridady Motors team.
          </p>
        </div>
      </aside>
    </main>
  );
};

export default StaffLogin;
