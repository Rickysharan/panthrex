import {
  ArrowRight,
  BriefcaseBusiness,
  FileCheck2,
  UserRoundCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <UserRoundCheck size={24} />,
    title: "Create your profile",
    description:
      "Add your experience, education, skills, and career goals so Panthrex can understand your professional background.",
  },
  {
    number: "02",
    icon: <BriefcaseBusiness size={24} />,
    title: "Choose a target role",
    description:
      "Select a job or paste a job description to receive role-specific recommendations and application support.",
  },
  {
    number: "03",
    icon: <FileCheck2 size={24} />,
    title: "Apply with confidence",
    description:
      "Optimize your CV, generate tailored documents, practise interviews, and track your progress in one place.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-white/10 bg-white/[0.02] px-6 py-24 lg:px-8"
    >
      <div className="absolute left-[-160px] top-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              How it works
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
              From profile to offer in three focused steps
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-white/60 lg:justify-self-end">
            Panthrex removes the fragmented workflow of job searching by
            combining preparation, optimization, interview practice, and
            application management into one intelligent system.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="group relative rounded-3xl border border-white/10 bg-black/20 p-8 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.06]"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-[0.2em] text-white/35">
                  {step.number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-2xl font-semibold">{step.title}</h3>

              <p className="mt-4 leading-7 text-white/55">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="mt-8 hidden items-center gap-3 text-sm font-medium text-white/30 lg:flex">
                  Continue
                  <ArrowRight size={16} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}