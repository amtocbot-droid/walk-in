import Link from "next/link";
import { PLANS } from "@/lib/billing/plans";

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-amber-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200/50 bg-white/70 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold text-slate-800">
          Walk In
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/demo" className="text-sm text-slate-600 hover:text-sky-600">
            Demo
          </Link>
          <Link href="/signin" className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-200 hover:shadow-xl">
            Sign up
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-800">Pricing</h1>
        <p className="mt-4 text-slate-600">Choose the plan that fits your establishment.</p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg ${
                plan.id === "pro"
                  ? "border-sky-300 bg-gradient-to-br from-sky-50 to-cyan-50 ring-2 ring-sky-200"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.id === "pro" && (
                <div className="mb-4 inline-block rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-800">{plan.name}</h2>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                ${plan.priceMonthly}
                <span className="text-lg text-slate-500">/mo</span>
              </p>
              {plan.priceYearly && (
                <p className="text-sm text-slate-500">or ${plan.priceYearly}/yr</p>
              )}
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-slate-500">
                Up to {plan.maxStores === 999 ? "unlimited" : plan.maxStores} stores ·{" "}
                {plan.maxSkus === 999999 ? "unlimited" : plan.maxSkus} SKUs
              </p>
              <button
                className={`mt-6 w-full rounded-lg py-2 font-medium transition-all ${
                  plan.id === "pro"
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md hover:shadow-lg"
                    : plan.id === "free"
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
                disabled={plan.id === "free"}
              >
                {plan.id === "free" ? "Current plan" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Stripe Checkout is enabled when `STRIPE_SECRET_KEY` is set in `.env.local`.
        </p>
      </section>
    </main>
  );
}
