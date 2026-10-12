import React from "react";
import { display } from "./utils";
import PlanCard from "./PlanCard";
import ComparisonTable from "./ComparisonTable";

export default function PlansSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <h2
        className="text-3xl font-bold tracking-tight text-[#2d2d2d]"
        style={display}
      >
        Compare the four plans
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <PlanCard
          title="Bank finance"
          badge="Popular"
          badgeClass="bg-[#f7f2eb] text-[#363636]"
        >
          A deposit of about 10% to 30%, then up to five years to repay. We
          arrange it with the financial institutions we work with. It suits
          salaried employees, business owners and the self-employed who can
          document their income.
        </PlanCard>
        <PlanCard
          title="Maridady Sacco"
          badge="Member plan"
          badgeClass="bg-[#f3f0e6] text-[#2d2d2d]"
        >
          Save at least half the vehicle’s value, stay a member for six months,
          then borrow the rest over up to 24 months at 1.5% a month. Joining
          costs KSh 5,000 (non-refundable). Savings can be flexible, and the
          Sacco advertises no guarantors and no CRB check.
        </PlanCard>
        <PlanCard
          title="Hire purchase"
          badge="Dealer-led"
          badgeClass="bg-[#363636] text-white"
        >
          Pay a deposit of at least 50% and settle the balance on agreed terms.
          You can also trade the vehicle in for another later. Ask us for the
          interest rate and repayment period in writing.
        </PlanCard>
        <PlanCard
          title="Flexi-Pay"
          badge="Flexible"
          badgeClass="bg-[#fff7d6] text-[#2d2d2d]"
        >
          A repayment plan built around your income. Expecting a bonus in six
          months? Propose a schedule that uses it. Good for irregular earnings
          and business cash flow.
        </PlanCard>
      </div>

      <ComparisonTable />
    </section>
  );
}