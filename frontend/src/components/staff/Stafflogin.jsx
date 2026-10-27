import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiHelpCircle,
  FiImage,
  FiLock,
  FiPackage,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { staffLogin } from "./Staffapi";
import SlideImage1 from "../../assets/slide/slide4.png";
import MaridadyLogo from "../../assets/MaridadyLogo.png";

const REMEMBER_KEY = "staff_remembered_username";

const HIGHLIGHTS = [
  {
    icon: FiPackage,
    title: "Manage inventory",
    text: "Add, edit and remove vehicles in seconds.",
  },
  {
    icon: FiImage,
    title: "Photos and details",
    text: "Upload galleries and keep every spec accurate.",
  },
  {
    icon: FiEye,
    title: "Control visibility",
    text: "Show or hide listings on the website instantly.",
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-pink-600 focus:ring-4 focus:ring-pink-600/10";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
};

const StaffLogin = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const heroRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [username, setUsername] = useState(readRemembered);
  const [remember, setRemember] = useState(() => Boolean(readRemembered()));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Start typing where it makes sense: password if the username is remembered
  useEffect(() => {
    (username ? passwordRef : usernameRef).current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gentle entrance and a slow zoom on the showroom image
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const animations = [];
    if (cardRef.current) {
      animations.push(
        cardRef.current.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 500, easing: "ease-out" }
        )
      );
    }
    if (heroRef.current) {
      animations.push(
        heroRef.current.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.08)" }],
          {
            direction: "alternate",
            duration: 24000,
            easing: "ease-in-out",
            iterations: Infinity,
          }
        )
      );
    }

    return () => animations.forEach((animation) => animation.cancel());
  }, []);

  const shake = () => {
    if (prefersReducedMotion() || !formRef.current) return;
    formRef.current.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 400, easing: "ease-in-out" }
    );
  };

  const checkCapsLock = (event) =>
    setCapsLock(Boolean(event.getModifierState?.("CapsLock")));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const me = await staffLogin(username.trim(), password);

      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, username.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* storage unavailable: nothing to remember */
      }

      navigate(me.is_superuser ? "/admin-panel" : "/staff/cars", {
        replace: true,
      });
    } catch (loginError) {
      if (loginError.code === "no-access") {
        setError("This account does not have access to the staff panel.");
      } else if (loginError.response?.status === 401) {
        setError("Incorrect username or password. Please check and try again.");
      } else if (loginError.response?.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (!loginError.response) {
        setError("Cannot reach the server. Check your connection and try again.");
      } else {
        setError("Could not sign in. Please try again.");
      }

      setFailedAttempts((count) => count + 1);
      setPassword("");
      setSubmitting(false);
      shake();
      passwordRef.current?.focus();
    }
  };

  const helpVisible = showHelp || failedAttempts >= 3;

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Form side */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md" ref={cardRef}>
          <Link
            aria-label="Maridady Motors, back to the website"
            className="mb-12 inline-flex items-center gap-3"
            to="/"
          >
            <img alt="" className="h-10 w-auto" src={MaridadyLogo} />
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-[0.14em] text-slate-950">
                MARIDADY MOTORS
              </span>
              <span className="mt-1 block text-xs font-medium tracking-wide text-slate-500">
                STAFF PORTAL
              </span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-pink-700">
              <FiShield aria-hidden="true" className="size-3.5" />
              Secure staff access
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in to manage vehicle listings and keep your showroom up to date.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} ref={formRef}>
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
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  className={inputClass}
                  id="staff-username"
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your username"
                  ref={usernameRef}
                  required
                  spellCheck={false}
                  value={username}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="block text-sm font-semibold text-slate-700"
                  htmlFor="staff-password"
                >
                  Password
                </label>
                <button
                  aria-controls="staff-help"
                  aria-expanded={helpVisible}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-pink-700 focus:outline-none focus-visible:underline"
                  onClick={() => setShowHelp((visible) => !visible)}
                  type="button"
                >
                  <FiHelpCircle aria-hidden="true" className="size-3.5" />
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FiLock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                />
                <input
                  autoComplete="current-password"
                  className={`${inputClass} pr-12`}
                  id="staff-password"
                  onBlur={() => setCapsLock(false)}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  placeholder="Enter your password"
                  ref={passwordRef}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-600/30"
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

              {capsLock && (
                <p
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700"
                  role="status"
                >
                  <FiAlertTriangle aria-hidden="true" className="size-3.5" />
                  Caps Lock is on
                </p>
              )}

              {helpVisible && (
                <p
                  className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600"
                  id="staff-help"
                >
                  Staff accounts are managed by the showroom administrator. If you
                  cannot sign in, ask them to check your username or reset your
                  password.
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input
                checked={remember}
                className="size-4 rounded border-slate-300 accent-pink-600"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              Remember my username on this device
            </label>

            {error && (
              <div
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                role="alert"
              >
                <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d2d2d] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-950/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              {submitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to your account
                  <FiArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2.5 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
            <FiShield aria-hidden="true" className="size-4 shrink-0 text-emerald-700" />
            <span>Your sign-in is protected and only available to authorized staff.</span>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
            <Link
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition hover:text-slate-900"
              to="/"
            >
              <FiArrowLeft aria-hidden="true" className="size-3.5" />
              Back to website
            </Link>
            <span>© {new Date().getFullYear()} Maridady Motors</span>
          </div>
        </div>
      </section>

      {/* Showroom side */}
      <aside
        aria-label="Maridady Motors showroom"
        className="relative hidden overflow-hidden bg-slate-950 lg:block"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          ref={heroRef}
          style={{ backgroundImage: `url(${SlideImage1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/20" />

        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <div className="mb-5 h-1 w-12 rounded-full bg-pink-500" />
          <p className="max-w-lg text-3xl font-semibold leading-tight text-white xl:text-4xl">
            Everything you need to keep your showroom moving.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
            Manage your inventory with the tools built for the Maridady Motors team.
          </p>

          <ul className="mt-8 grid gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15"
                key={title}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs leading-5 text-white/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
};

export default StaffLogin;