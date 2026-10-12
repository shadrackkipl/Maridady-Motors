import React, { useState } from "react";
import { CONFIG } from "./config";

const fieldCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30";

function Enquiry() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // Replace with your API call, EmailJS, or form backend.
    setSent(true);
  };

  return (
    <section id="enquire" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Tell us what you are looking for
          </h2>
          <p className="mt-3 text-slate-600">
            We reply within one working day with options, prices and a timeline.
          </p>
          <p className="mt-6 text-sm text-slate-700">
            {CONFIG.phone}
            <br />
            {CONFIG.email}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-slate-900/10 sm:p-8 lg:col-span-3">
          {sent ? (
            <div role="status">
              <h3 className="text-2xl font-bold text-slate-900">
                Request sent
              </h3>
              <p className="mt-2 text-slate-600">
                Thank you. We will contact you within one working day.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Full name
                <input required name="name" className={fieldCls + " mt-1"} />
              </label>
              <label className="text-sm font-medium">
                Phone or WhatsApp
                <input
                  required
                  name="phone"
                  type="tel"
                  className={fieldCls + " mt-1"}
                />
              </label>
              <label className="text-sm font-medium">
                Make and model
                <input
                  required
                  name="model"
                  placeholder="e.g. Toyota Harrier"
                  className={fieldCls + " mt-1"}
                />
              </label>
              <label className="text-sm font-medium">
                Budget (KES)
                <input
                  name="budget"
                  inputMode="numeric"
                  className={fieldCls + " mt-1"}
                />
              </label>
              <label className="text-sm font-medium">
                Preferred origin
                <select name="origin" className={fieldCls + " mt-1"}>
                  <option>No preference</option>
                  {CONFIG.origins.map((x) => (
                    <option key={x.id}>{x.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Year range
                <input
                  name="years"
                  placeholder="e.g. 2019 to 2022"
                  className={fieldCls + " mt-1"}
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Anything else (colour, mileage, features)
                <textarea
                  name="notes"
                  rows="3"
                  className={fieldCls + " mt-1"}
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-neutral-800 px-6 py-3 font-semibold text-white sm:col-span-2"
              >
                Send request
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default Enquiry;
