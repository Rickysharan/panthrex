"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const dashboardCards = [
  {
    icon: FileText,
    title: "CV Optimizer",
    description: "Tailor your CV to each vacancy.",
    value: "12 improved",
  },
  {
    icon: Search,
    title: "Job Matches",
    description: "Discover roles aligned with your profile.",
    value: "48 matches",
  },
  {
    icon: BriefcaseBusiness,
    title: "Applications",
    description: "Track every stage of your job search.",
    value: "7 active",
  },
  {
    icon: Sparkles,
    title: "Interview AI",
    description: "Practise role-specific interview questions.",
    value: "3 sessions",
  },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-28 pt-20 lg:px-8 lg:pb-36 lg:pt-28">
      <BackgroundEffects />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/75 shadow-lg shadow-violet-950/20 backdrop-blur-xl">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
              <Sparkles size={14} />
            </span>

            AI-powered career intelligence
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5.25rem]">
            Turn every job
            <span className="block bg-gradient-to-r from-violet-300 via-white to-sky-300 bg-clip-text text-transparent">
              application into an advantage.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
            Panthrex helps you create stronger CVs, target the right jobs,
            practise interviews and manage your entire career pipeline from one
            intelligent workspace.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <motion.a
              href="#pricing"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-semibold shadow-xl shadow-white/10 transition hover:bg-white/90"
              style={{ color: "#050816" }}
            >
              <span style={{ color: "#050816" }}>Start for free</span>

              <ArrowRight
                size={18}
                color="#050816"
                className="transition-transform group-hover:translate-x-1"
              />
            </motion.a>

            <motion.a
              href="#features"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-7 py-4 font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.09]"
            >
              Explore the platform
            </motion.a>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
            <Benefit text="No credit card required" />
            <Benefit text="Free plan available" />
            <Benefit text="Built for ambitious job seekers" />
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-8">
            <Metric value="85%" label="Average ATS score" />
            <Metric value="3.2×" label="Faster applications" />
            <Metric value="24/7" label="AI career support" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-[48px] bg-gradient-to-br from-violet-500/20 via-transparent to-sky-500/15 blur-3xl" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative rounded-[34px] border border-white/10 bg-[#0b1023]/75 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-sm text-white/45">Career workspace</p>

                  <h2 className="font-semibold text-white">
                    Good afternoon, Alex
                  </h2>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Profile ready
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {dashboardCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.35 + index * 0.08,
                    }}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition-colors hover:bg-white/[0.075]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                        <Icon size={21} />
                      </div>

                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/50">
                        {card.value}
                      </span>
                    </div>

                    <h3 className="mt-5 font-semibold text-white">
                      {card.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {card.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-5">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2 text-sm text-violet-300">
                    <Sparkles size={16} />
                    AI recommendation
                  </div>

                  <h3 className="mt-2 font-semibold text-white">
                    Improve your professional summary
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    Add measurable outcomes to increase recruiter relevance.
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
                >
                  Improve now
                </button>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-white/45">
                  <span>Profile strength</span>
                  <span>82%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "82%" }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-sky-400"
                  />
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-8 top-24 hidden rounded-2xl border border-white/10 bg-[#11172b]/90 p-4 shadow-2xl backdrop-blur-xl xl:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <p className="text-xs text-white/45">Interview rate</p>

                  <p className="text-sm font-semibold text-white">
                    +34% this month
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-7 bottom-28 hidden rounded-2xl border border-white/10 bg-[#11172b]/90 p-4 shadow-2xl backdrop-blur-xl xl:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-xs text-white/45">Latest application</p>

                  <p className="text-sm font-semibold text-white">
                    ATS score: 91%
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function BackgroundEffects() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <motion.div
        animate={{
          x: [0, 35, 0],
          y: [0, 20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[8%] top-[-120px] h-[440px] w-[440px] rounded-full bg-violet-600/20 blur-[130px]"
      />

      <motion.div
        animate={{
          x: [0, -25, 0],
          y: [0, 35, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-100px] top-[140px] h-[380px] w-[380px] rounded-full bg-blue-500/15 blur-[120px]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <CheckCircle2 size={15} className="text-emerald-400" />
      {text}
    </span>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-semibold text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/40 sm:text-sm">
        {label}
      </p>
    </div>
  );
}
