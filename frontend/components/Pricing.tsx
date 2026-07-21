import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "£0",
    description: "Perfect for getting started.",
    features: [
      "Basic Resume Builder",
      "5 AI Resume Optimizations / month",
      "Job Search",
      "Application Tracker",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "£9.99",
    description: "Everything needed to land interviews.",
    features: [
      "Unlimited AI Resume Optimization",
      "Unlimited Cover Letters",
      "AI Interview Coach",
      "ATS Resume Score",
      "Application Analytics",
      "Priority Support",
    ],
    featured: true,
  },
  {
    name: "Teams",
    price: "Custom",
    description: "Universities & career centers.",
    features: [
      "Student Dashboard",
      "Admin Analytics",
      "Bulk User Management",
      "Institution Branding",
    ],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
    >
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          Pricing
        </p>

        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          Simple pricing
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Start for free and upgrade whenever you're ready.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-8 transition ${
              plan.featured
                ? "border-violet-500 bg-violet-500/10 scale-105"
                : "border-white/10 bg-white/5"
            }`}
          >
            <h3 className="text-2xl font-bold">{plan.name}</h3>

            <p className="mt-2 text-white/60">{plan.description}</p>

            <div className="mt-6 text-5xl font-bold">
              {plan.price}
              {plan.name === "Pro" && (
                <span className="text-lg text-white/60"> / month</span>
              )}
            </div>

            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-white/80"
                >
                  <Check size={18} className="text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`mt-10 w-full rounded-2xl py-4 font-semibold transition ${
                plan.featured
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {plan.featured ? "Start Pro" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}