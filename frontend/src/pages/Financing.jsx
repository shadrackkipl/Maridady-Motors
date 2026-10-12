import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import OurPartners from "../components/shared/OurPartners";
import Footer from "../components/Footer/footer";

const display = {
  fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif",
};

const kes = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

/* Advertised terms. Rates marked "example" are placeholders, not quotes. */
const PLANS = {
  bank: {
    name: "Bank finance",
    depositLabel: "Deposit",
    depositMin: 10,
    depositMax: 30,
    termMax: 60,
    termDefault: 48,
    rate: 1.25,
    fee: 0,
    rateNote: "Example rate. Use the lender’s written quote.",
  },
  sacco: {
    name: "Sacco",
    depositLabel: "Savings",
    depositMin: 50,
    depositMax: 80,
    termMax: 24,
    termDefault: 24,
    rate: 1.5,
    fee: 5000,
    rateNote:
      "Advertised at 1.5% a month. Ask if it is flat or reducing-balance.",
  },
  hire: {
    name: "Hire purchase",
    depositLabel: "Deposit",
    depositMin: 50,
    depositMax: 80,
    termMax: 60,
    termDefault: 36,
    rate: 1.5,
    fee: 0,
    rateNote: "Example rate and term. Confirm both in writing.",
  },
  flexi: { name: "Flexi-Pay" },
};

const TABLE = [
  {
    label: "Deposit",
    values: ["10%–30%", "Save at least 50%", "At least 50%", "Agreed with you"],
  },
  {
    label: "Repayment period",
    values: [
      "Up to 60 months",
      "Up to 24 months",
      "Agreed in contract",
      "Agreed with you",
    ],
  },
  {
    label: "Interest",
    values: [
      "Lender’s quote",
      "1.5% a month",
      "Agreed in contract",
      "Agreed with you",
    ],
  },
  {
    label: "Credit checks",
    values: [
      "Lender’s checks apply",
      "No CRB check, no guarantors",
      "Confirm with us",
      "Confirm with us",
    ],
  },
  {
    label: "Good fit if",
    values: [
      "You have payslips or statements and want a small deposit",
      "You can save steadily and wait six months",
      "You have a large deposit and want one dealer to handle it",
      "Your income is irregular or a lump sum is coming",
    ],
  },
];

const COLS = ["Bank finance", "Sacco", "Hire purchase", "Flexi-Pay"];

const DOCS = [
  {
    who: "Salaried employee",
    items: [
      "Three recent payslips",
      "Six months of bank statements",
      "National ID or passport",
      "KRA PIN certificate",
      "Employer introduction letter",
    ],
  },
  {
    who: "Self-employed or business owner",
    items: [
      "Six to twelve months of bank statements",
      "National ID or passport",
      "KRA PIN certificate",
      "Business registration documents, where applicable",
    ],
  },
  {
    who: "Company",
    items: [
      "Company registration documents",
      "Company KRA PIN",
      "Directors’ IDs and PINs",
      "Six to twelve months of bank statements",
    ],
  },
];

const CHECKS = [
  {
    t: "Flat or reducing-balance?",
    d: "Ask which one applies, and ask for the total amount you will repay over the full term.",
  },
  {
    t: "Every extra charge",
    d: "Membership, processing, insurance, valuation, tracking, transfer costs and early-repayment penalties.",
  },
  {
    t: "Ownership and default",
    d: "When ownership passes to you, whether the vehicle can be repossessed, and what happens if you miss a payment.",
  },
  {
    t: "Who the lender is",
    d: "Get the contract, the full repayment schedule and the legal name of the lender in writing.",
  },
  {
    t: "Sacco registration",
    d: "Check the Sacco’s registered name and status on the SASRA portal before paying the KSh 5,000 membership fee or moving savings.",
  },
];

/* ---------- loan maths ---------- */
function monthlyReducing(p, r, n) {
  if (r === 0) return p / n;
  return (p * r) / (1 - Math.pow(1 + r, -n));
}
function monthlyFlat(p, r, n) {
  return (p + p * r * n) / n;
}

/* ---------- small pieces ---------- */
function Range({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display: shown,
  hint,
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-[#2d2d2d]">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-[#2d2d2d]">
          {shown}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d8d0c1] accent-[#363636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#363636]"
      />
      {hint && <p className="mt-1 text-xs text-[#6b6a68]">{hint}</p>}
    </div>
  );
}

function Stat({ label, value, strong }) {
  return (
    <div>
      <dt className="text-sm text-[#6b6a68]">{label}</dt>
      <dd
        className={
          "tabular-nums " +
          (strong
            ? "mt-1 text-4xl font-bold text-[#2d2d2d]"
            : "mt-1 text-lg font-semibold text-[#2d2d2d]")
        }
        style={strong ? display : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

/* ---------- calculator ---------- */
function Estimator() {
  const [planKey, setPlanKey] = useState("bank");
  const [price, setPrice] = useState(1000000);
  const [deposit, setDeposit] = useState(PLANS.bank.depositMin);
  const [term, setTerm] = useState(PLANS.bank.termDefault);
  const [rate, setRate] = useState(PLANS.bank.rate);
  const [method, setMethod] = useState("reducing");

  const plan = PLANS[planKey];
  const isFlexi = planKey === "flexi";

  const choose = (key) => {
    setPlanKey(key);
    if (key === "flexi") return;
    const p = PLANS[key];
    setDeposit(p.depositMin);
    setTerm(p.termDefault);
    setRate(p.rate);
  };

  const calc = useMemo(() => {
    if (isFlexi) return null;
    const down = (price * deposit) / 100;
    const financed = price - down;
    const r = rate / 100;
    const reducing = monthlyReducing(financed, r, term);
    const flat = monthlyFlat(financed, r, term);
    const monthly = method === "reducing" ? reducing : flat;
    const other = method === "reducing" ? flat : reducing;
    const repaid = monthly * term;
    const interest = repaid - financed;
    return {
      down,
      financed,
      monthly,
      other,
      interest,
      fee: plan.fee,
      upfront: down + plan.fee,
      total: down + plan.fee + repaid,
    };
  }, [isFlexi, price, deposit, term, rate, method, plan]);

  const pct = (v, t) => (t > 0 ? (v / t) * 100 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8d0c1] bg-white shadow-[0_18px_45px_rgba(45,45,45,0.08)]">
      <div
        role="tablist"
        aria-label="Financing plan"
        className="flex flex-wrap gap-2 border-b border-[#d8d0c1] bg-[#f3f0e6] p-3"
      >
        {Object.entries(PLANS).map(([key, p]) => (
          <button
            key={key}
            role="tab"
            aria-selected={planKey === key}
            onClick={() => choose(key)}
            className={
              "rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#363636] " +
              (planKey === key
                ? "bg-[#363636] text-white"
                : "text-[#2d2d2d] hover:bg-[#f7f2eb]")
            }
          >
            {p.name}
          </button>
        ))}
      </div>

      {isFlexi ? (
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center rounded-full border border-[#d8d0c1] bg-[#f3f0e6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#363636]">
            Flexible option
          </div>
          <h3
            className="mt-5 text-2xl font-bold text-[#2d2d2d]"
            style={display}
          >
            Flexi-Pay has no fixed formula
          </h3>
          <p className="mt-3 max-w-prose text-[#2b2822]">
            You and the dealership agree a repayment schedule that fits your
            income. If you expect a work bonus in six months, for example, you
            can propose a plan that uses it. Deposit, interest, fees and term
            all depend on what you agree, so there is nothing to estimate here.
          </p>
          <p className="mt-3 max-w-prose text-[#2b2822]">
            Call us with your price range and your income pattern, and ask for
            the proposal in writing.
          </p>
          <a
            href="tel:0709888777"
            className="mt-6 inline-block rounded-md bg-[#fff7d6] px-5 py-3 font-semibold text-[#2d2d2d] shadow-sm transition hover:bg-[#efe9dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2d2d]"
          >
            Call 0709 888 777
          </a>
        </div>
      ) : (
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          {/* inputs */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium text-[#2d2d2d]"
              >
                Vehicle price (KSh)
              </label>
              <div className="mt-2 rounded-xl border border-[#d8d0c1] bg-[#f3f0e6] px-3 py-2 shadow-inner shadow-[#2d2d2d]/[0.02]">
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={100000}
                  step={50000}
                  value={price}
                  onChange={(e) =>
                    setPrice(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full bg-transparent text-lg tabular-nums text-[#2d2d2d] outline-none placeholder:text-[#6b6a68] focus-visible:outline-none"
                />
              </div>
            </div>

            <Range
              id="deposit"
              label={plan.depositLabel}
              value={deposit}
              min={plan.depositMin}
              max={plan.depositMax}
              step={1}
              onChange={setDeposit}
              display={`${deposit}% · ${kes((price * deposit) / 100)}`}
              hint={`Advertised minimum: ${plan.depositMin}%`}
            />

            <Range
              id="term"
              label="Repayment period"
              value={term}
              min={6}
              max={plan.termMax}
              step={1}
              onChange={setTerm}
              display={`${term} months`}
              hint={`Advertised maximum: ${plan.termMax} months`}
            />

            <div>
              <label
                htmlFor="rate"
                className="text-sm font-medium text-[#2d2d2d]"
              >
                Interest per month (%)
              </label>
              <div className="mt-2 w-32 rounded-xl border border-[#d8d0c1] bg-[#f3f0e6] px-3 py-2 shadow-inner shadow-[#2d2d2d]/[0.02]">
                <input
                  id="rate"
                  type="number"
                  min={0}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent tabular-nums text-[#2d2d2d] outline-none focus-visible:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-[#6b6a68]">{plan.rateNote}</p>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-[#2d2d2d]">
                How interest is charged
              </legend>
              <div className="mt-2 inline-flex rounded-md border border-[#d8cdb6] p-1">
                {[
                  ["reducing", "Reducing balance"],
                  ["flat", "Flat rate"],
                ].map(([val, text]) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={method === val}
                    onClick={() => setMethod(val)}
                    className={
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#363636] " +
                      (method === val
                        ? "bg-[#2d2d2d] text-white shadow-sm"
                        : "text-[#2d2d2d] hover:bg-[#f7f2eb]")
                    }
                  >
                    {text}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {/* results */}
          <div className="rounded-2xl bg-[#f3f0e6] p-6 shadow-[inset_0_1px_0_rgba(45,45,45,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#d8d0c1] pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#363636]">
                Payment snapshot
              </p>
              <span className="rounded-full bg-[#2d2d2d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                {plan.name}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="col-span-2">
                <Stat
                  label="Estimated monthly payment"
                  value={kes(calc.monthly)}
                  strong
                />
                <p className="mt-1 text-sm text-[#6b6a68]">
                  The same loan charged{" "}
                  {method === "reducing" ? "flat" : "on a reducing balance"}{" "}
                  would be{" "}
                  <span className="font-semibold text-[#2d2d2d]">
                    {kes(calc.other)}
                  </span>{" "}
                  a month.
                </p>
              </div>
              <Stat label="Amount financed" value={kes(calc.financed)} />
              <Stat label="Total interest" value={kes(calc.interest)} />
              <Stat
                label={
                  planKey === "sacco"
                    ? "Paid upfront (savings + fee)"
                    : "Paid upfront"
                }
                value={kes(calc.upfront)}
              />
              <Stat label="Total you pay" value={kes(calc.total)} />
            </dl>

            {/* where your money goes */}
            <div className="mt-6">
              <p className="text-sm font-bold text-[#2d2d2d]">
                Where the money goes
              </p>
              <div
                className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-[#d8d0c1]"
                role="img"
                aria-label={`Of ${kes(calc.total)} total: ${kes(calc.upfront)} upfront, ${kes(
                  calc.financed,
                )} repaid principal, ${kes(calc.interest)} interest`}
              >
                <div
                  className="bg-[#103B30]"
                  style={{ width: pct(calc.upfront, calc.total) + "%" }}
                />
                <div
                  className="bg-[#60877B]"
                  style={{ width: pct(calc.financed, calc.total) + "%" }}
                />
                <div
                  className="bg-[#F5B800]"
                  style={{ width: pct(calc.interest, calc.total) + "%" }}
                />
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#2b2822]">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#103B30]" />
                  Upfront
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#60877B]" />
                  Loan repaid
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#F5B800]" />
                  Interest
                </li>
              </ul>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-[#6b6a68]">
              An illustration, not a quotation. It leaves out insurance,
              transfer costs, processing fees and any early-repayment charges.
              {planKey === "sacco" &&
                " Sacco members must also hold membership for at least six months before they qualify."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */
const Financing = () => {
  return (
    <div className="bg-[#f3f0e6] text-[#2b2822]">
      <Navbar />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap');`}</style>

      {/* Hero */}
      <header className="bg-[#2d2d2d] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]">
              Finance options
            </div>
            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
              style={display}
            >
              Drive the car now.
              <br />
              Pay for it your way.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#efe9dc]">
              Maridady Motors offers four ways to buy: bank finance, our Sacco,
              hire purchase and Flexi-Pay. Estimate your payments below, then
              pick the plan that fits your income.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#estimator"
                className="rounded-md bg-[#fff7d6] px-5 py-3 font-semibold text-[#2d2d2d] shadow-sm transition hover:bg-[#efe9dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Estimate my payments
              </a>
              <a
                href="tel:0709888777"
                className="rounded-md border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Call 0709 888 777
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15 text-sm shadow-[0_20px_45px_rgba(0,0,0,0.16)]">
            {[
              ["Smallest deposit", "10% (bank)"],
              ["Longest term", "60 months"],
              ["Sacco savings goal", "50% of price"],
              ["Sacco loan term", "Up to 24 months"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#2d2d2d] p-4">
                <dt className="text-[#e9e3d6]">{k}</dt>
                <dd
                  className="mt-1 text-lg font-semibold text-white"
                  style={display}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main>
        {/* Estimator */}
        <section
          id="estimator"
          className="mx-auto max-w-6xl scroll-mt-6 px-6 py-16"
        >
          <h2
            className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
            style={display}
          >
            See what a plan would cost
          </h2>
          <p className="mt-3 max-w-2xl text-[#2b2822]">
            Choose a plan, enter a vehicle price and adjust the deposit and
            term. The calculator shows the payment under both flat and
            reducing-balance interest, so you can see how much the method
            matters.
          </p>
          <div className="mt-8">
            <Estimator />
          </div>
        </section>

        {/* Plans */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2
            className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
            style={display}
          >
            Compare the four plans
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-[#d8d0c1] bg-white p-6 shadow-[0_14px_30px_rgba(45,45,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(45,45,45,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-xl font-bold text-[#2d2d2d]"
                  style={display}
                >
                  Bank finance
                </h3>
                <span className="rounded-full bg-[#f7f2eb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#363636]">
                  Popular
                </span>
              </div>
              <p className="mt-2 text-[#2b2822]">
                A deposit of about 10% to 30%, then up to five years to repay.
                We arrange it with the financial institutions we work with. It
                suits salaried employees, business owners and the self-employed
                who can document their income.
              </p>
            </article>
            <article className="rounded-2xl border border-[#d8d0c1] bg-white p-6 shadow-[0_14px_30px_rgba(45,45,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(45,45,45,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-xl font-bold text-[#2d2d2d]"
                  style={display}
                >
                  Maridady Sacco
                </h3>
                <span className="rounded-full bg-[#f3f0e6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2d2d2d]">
                  Member plan
                </span>
              </div>
              <p className="mt-2 text-[#2b2822]">
                Save at least half the vehicle’s value, stay a member for six
                months, then borrow the rest over up to 24 months at 1.5% a
                month. Joining costs KSh 5,000 (non-refundable). Savings can be
                flexible, and the Sacco advertises no guarantors and no CRB
                check.
              </p>
            </article>
            <article className="rounded-2xl border border-[#d8d0c1] bg-white p-6 shadow-[0_14px_30px_rgba(45,45,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(45,45,45,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-xl font-bold text-[#2d2d2d]"
                  style={display}
                >
                  Hire purchase
                </h3>
                <span className="rounded-full bg-[#363636] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Dealer-led
                </span>
              </div>
              <p className="mt-2 text-[#2b2822]">
                Pay a deposit of at least 50% and settle the balance on agreed
                terms. You can also trade the vehicle in for another later. Ask
                us for the interest rate and repayment period in writing.
              </p>
            </article>
            <article className="rounded-2xl border border-[#d8d0c1] bg-white p-6 shadow-[0_14px_30px_rgba(45,45,45,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(45,45,45,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-xl font-bold text-[#2d2d2d]"
                  style={display}
                >
                  Flexi-Pay
                </h3>
                <span className="rounded-full bg-[#fff7d6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2d2d2d]">
                  Flexible
                </span>
              </div>
              <p className="mt-2 text-[#2b2822]">
                A repayment plan built around your income. Expecting a bonus in
                six months? Propose a schedule that uses it. Good for irregular
                earnings and business cash flow.
              </p>
            </article>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-[#d8d0c1] bg-white shadow-[0_12px_30px_rgba(45,45,45,0.04)]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Maridady Motors financing plans compared
              </caption>
              <thead>
                <tr className="bg-[#363636] text-white">
                  <th scope="col" className="p-4 font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="p-4 font-semibold"
                      style={display}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 ? "bg-[#f3f0e6]" : "bg-white"}
                  >
                    <th
                      scope="row"
                      className="p-4 font-semibold text-[#2d2d2d]"
                    >
                      {row.label}
                    </th>
                    {row.values.map((v, j) => (
                      <td key={j} className="p-4 align-top text-[#2b2822]">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#6b6a68]">
            These are advertised features, not a guarantee of approval. Final
            terms depend on the lender and your application.
          </p>
        </section>

        {/* Documents */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2
              className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
              style={display}
            >
              Documents to bring
            </h2>
            <p className="mt-3 max-w-2xl text-[#2b2822]">
              For bank finance, applicants have been asked for the documents
              below. Call us to confirm the current list before you apply.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {DOCS.map((d) => (
                <div
                  key={d.who}
                  className="rounded-lg border border-[#d8d0c1] p-6"
                >
                  <h3
                    className="text-lg font-bold text-[#2d2d2d]"
                    style={display}
                  >
                    {d.who}
                  </h3>
                  <ul className="mt-4 space-y-2 text-[#2b2822]">
                    {d.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fff7d6]"
                        />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#6b6a68]">
              Sacco membership works differently: you join, save at least half
              the vehicle’s value and hold membership for six months or more.
            </p>
          </div>
        </section>

        {/* Before you sign */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2
                className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
                style={display}
              >
                Before you sign
              </h2>
              <p className="mt-3 text-[#2b2822]">
                Whichever plan you choose, get answers to these in writing. Ask
                for quotations on at least two options and compare the total
                cost, not just the deposit.
              </p>
            </div>
            <dl className="divide-y divide-[#d8d0c1] rounded-lg border border-[#d8d0c1] bg-white">
              {CHECKS.map((c) => (
                <div key={c.t} className="p-5">
                  <dt className="font-bold text-[#2d2d2d]" style={display}>
                    {c.t}
                  </dt>
                  <dd className="mt-1 text-[#2b2822]">{c.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[#363636] text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight" style={display}>
                Talk to us about your plan
              </h2>
              <p className="mt-3 max-w-lg text-[#efe9dc]">
                Tell us the vehicle you want and how you earn. We’ll point you
                to the option that fits and put the terms in writing.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:0709888777"
                  className="rounded-md bg-[#fff7d6] px-5 py-3 font-semibold text-[#2d2d2d] hover:bg-[#efe9dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Call 0709 888 777
                </a>
                <a
                  href="tel:0709888333"
                  className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Sacco desk: 0709 888 333
                </a>
              </div>
            </div>
            <address className="space-y-2 rounded-lg bg-[#2d2d2d] p-6 not-italic">
              <p className="font-bold" style={display}>
                Maridady Motors
              </p>
              <p className="text-[#efe9dc]">Kiambu Road, Ridgeways, Nairobi</p>
              <p>
                <a
                  href="mailto:info@maridadymotors.com"
                  className="underline decoration-[#fff7d6] underline-offset-4 hover:text-[#fff7d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  info@maridadymotors.com
                </a>
              </p>
            </address>
          </div>
        </section>
      </main>
      <OurPartners />

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Financing;
