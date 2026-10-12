/* Advertised terms. Rates marked "example" are placeholders, not quotes. */
export const PLANS = {
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

export const COLS = ["Bank finance", "Sacco", "Hire purchase", "Flexi-Pay"];

export const TABLE = [
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

export const DOCS = [
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

export const CHECKS = [
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