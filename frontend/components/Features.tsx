import { Brain, FileText, BriefcaseBusiness, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Brain size={28} />,
    title: "AI Resume Optimizer",
    description:
      "Improve your resume with AI suggestions tailored to every job description.",
  },
  {
    icon: <FileText size={28} />,
    title: "Cover Letter Generator",
    description:
      "Generate professional, personalized cover letters in seconds.",
  },
  {
    icon: <BriefcaseBusiness size={28} />,
    title: "Application Tracker",
    description:
      "Keep every application, interview, and offer organized in one dashboard.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Career Analytics",
    description:
      "Track resume score, application success rate, and interview progress.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
    >
      <div className="mb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          Features
        </p>

        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          Everything you need to get hired
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Panthrex combines AI-powered career tools into one modern platform,
          helping you prepare faster and land better opportunities.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-violet-400/50 hover:bg-white/10"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
              {feature.icon}
            </div>

            <h3 className="mb-3 text-xl font-semibold">
              {feature.title}
            </h3>

            <p className="leading-7 text-white/60">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
