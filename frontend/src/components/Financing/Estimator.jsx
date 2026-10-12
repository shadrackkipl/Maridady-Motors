import React, { useMemo, useState } from "react";
import { PLANS } from "./data";
import { display, kes, monthlyReducing, monthlyFlat } from "./utils";
import Range from "./Range";
import Stat from "./Stat";

export default function Estimator() {
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
                        ? "bg-slate-900 text-white shadow-sm"
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
              <span className="rounded-full bg-emerald-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
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
