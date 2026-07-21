"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is Panthrex free to use?",
    answer:
      "Yes. You can start with the Free plan and upgrade to Pro whenever you need unlimited AI features.",
  },
  {
    question: "Can AI customize my resume for each job?",
    answer:
      "Absolutely. Panthrex analyzes the job description and recommends improvements to maximize ATS compatibility.",
  },
  {
    question: "Does Panthrex help with interviews?",
    answer:
      "Yes. Our AI Interview Coach generates realistic technical and behavioral interview questions with instant feedback.",
  },
  {
    question: "Can I track all my applications?",
    answer:
      "Yes. Every application, interview, offer, and rejection is organized inside your dashboard.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          FAQ
        </p>

        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          Frequently Asked Questions
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Everything you need to know about Panthrex.
        </p>
      </div>

      <div className="mt-16 space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <span className="text-lg font-semibold">
                {faq.question}
              </span>

              <ChevronDown
                className={`transition ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-6 pb-6 text-white/60 leading-7">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}