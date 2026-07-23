"use client";

import {
  ArrowRight,
  Bot,
  CircleHelp,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  searchableNavigationItems,
} from "@/lib/navigation/navigation";

type HelpItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  href?: string;
};

const helpItems: HelpItem[] = [
  {
    id: "ats-score",
    question: "How does the ATS score work?",
    answer:
      "Panthrex compares your resume with a target job description and evaluates keyword alignment, skills coverage, structure and measurable impact.",
    keywords: [
      "ats",
      "score",
      "resume analysis",
      "keywords",
      "job description",
    ],
    href: "/ats-score",
  },
  {
    id: "resume-builder",
    question: "How do I create a resume?",
    answer:
      "Open the Resume Builder, complete each resume section, choose a template and export the finished resume when it is ready.",
    keywords: [
      "create resume",
      "build cv",
      "resume builder",
      "make cv",
      "export resume",
    ],
    href: "/resume-builder",
  },
  {
    id: "resume-enhancer",
    question: "How do I improve my resume with AI?",
    answer:
      "Use the AI Resume Enhancer from the Resume Builder to generate section-specific improvements that you can accept or reject individually.",
    keywords: [
      "improve resume",
      "enhance cv",
      "ai enhancer",
      "rewrite resume",
    ],
    href: "/resume-enhancer",
  },
  {
    id: "resume-tailor",
    question: "How do I tailor my resume to a job?",
    answer:
      "Open Resume Tailor, provide the target job description and use the generated recommendations to align your resume with the role.",
    keywords: [
      "tailor resume",
      "target job",
      "job description",
      "customise cv",
    ],
    href: "/resume-tailor",
  },
  {
    id: "job-search",
    question: "Where can I find jobs?",
    answer:
      "Use AI Job Search to discover relevant roles and Saved Jobs to keep promising opportunities for later review.",
    keywords: [
      "find jobs",
      "job search",
      "vacancies",
      "roles",
      "saved jobs",
    ],
    href: "/job-search",
  },
  {
    id: "job-tracker",
    question: "How do I track an application?",
    answer:
      "Add the role to Job Tracker and update its status as it moves through application, assessment, interview and offer stages.",
    keywords: [
      "track application",
      "application status",
      "interview",
      "offer",
      "job tracker",
    ],
    href: "/job-tracker",
  },
  {
    id: "interview",
    question: "How do I prepare for an interview?",
    answer:
      "Interview Coach generates role-specific questions and helps you practise structured, evidence-based responses.",
    keywords: [
      "interview",
      "practice questions",
      "interview preparation",
      "mock interview",
    ],
    href: "/interview-prep",
  },
  {
    id: "cover-letter",
    question: "Can Panthrex create a cover letter?",
    answer:
      "Yes. The Cover Letter tool creates a tailored draft using your background and the requirements of the target position.",
    keywords: [
      "cover letter",
      "application letter",
      "write letter",
    ],
    href: "/cover-letter",
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function GlobalSearch() {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const normalizedQuery = normalize(query);

  const matchingTools = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return searchableNavigationItems
      .filter((item) => {
        const searchableText = normalize(
          `${item.label} ${item.href}`,
        );

        return normalizedQuery
          .split(" ")
          .every((term) =>
            searchableText.includes(term),
          );
      })
      .slice(0, 6);
  }, [normalizedQuery]);

  const matchingHelp = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return helpItems
      .filter((item) => {
        const searchableText = normalize(
          [
            item.question,
            item.answer,
            ...item.keywords,
          ].join(" "),
        );

        return normalizedQuery
          .split(" ")
          .every((term) =>
            searchableText.includes(term),
          );
      })
      .slice(0, 4);
  }, [normalizedQuery]);

  const resultsOpen =
    focused && normalizedQuery.length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setFocused(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFocused(false);
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        const input =
          containerRef.current?.querySelector(
            "input",
          );

        input?.focus();
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  function closeSearch() {
    setFocused(false);
    setQuery("");
  }

  function askPanthrexAI() {
    const submittedQuery = query.trim();

    if (!submittedQuery) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "panthrex:open-career-assistant",
        {
          detail: {
            query: submittedQuery,
          },
        },
      ),
    );

    closeSearch();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <label className="relative block">
        <span className="sr-only">
          Search Panthrex
        </span>

        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
        />

        <input
          type="search"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              normalizedQuery
            ) {
              event.preventDefault();
              askPanthrexAI();
            }
          }}
          placeholder="Search tools or ask AI"
          aria-label="Search Panthrex"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-14 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-indigo-500/70 focus:bg-white/[0.06]"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/30">
          ⌘K
        </span>
      </label>

      {resultsOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[min(92vw,440px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e1d]/95 shadow-2xl backdrop-blur-2xl">
          <div className="max-h-[520px] overflow-y-auto p-2">
            {matchingTools.length > 0 ? (
              <section>
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Panthrex tools
                </p>

                {matchingTools.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSearch}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.06]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                        <Icon size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white/80">
                          {item.label}
                        </span>

                        <span className="block truncate text-xs text-white/30">
                          {item.href}
                        </span>
                      </span>

                      <ArrowRight
                        size={15}
                        className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-indigo-300"
                      />
                    </Link>
                  );
                })}
              </section>
            ) : null}

            {matchingHelp.length > 0 ? (
              <section
                className={
                  matchingTools.length > 0
                    ? "mt-2 border-t border-white/10 pt-2"
                    : ""
                }
              >
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Help and FAQs
                </p>

                {matchingHelp.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl px-3 py-3 transition hover:bg-white/[0.045]"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                        <CircleHelp size={17} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white/80">
                          {item.question}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/40">
                          {item.answer}
                        </p>

                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={closeSearch}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                          >
                            Open tool
                            <ArrowRight size={13} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {matchingTools.length === 0 &&
            matchingHelp.length === 0 ? (
              <div className="px-5 py-7 text-center">
                <Search
                  size={22}
                  className="mx-auto text-white/25"
                />

                <p className="mt-3 text-sm font-semibold text-white/75">
                  No direct results
                </p>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  Ask Panthrex AI for a personalised answer.
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-2">
            <button
              type="button"
              onClick={askPanthrexAI}
              className="group flex w-full items-center gap-3 rounded-xl bg-indigo-500/10 px-3 py-3 text-left transition hover:bg-indigo-500/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
                <Bot size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-indigo-100">
                  Ask Panthrex AI
                </span>

                <span className="block truncate text-xs text-white/40">
                  “{query.trim()}”
                </span>
              </span>

              <Sparkles
                size={16}
                className="text-indigo-300 transition group-hover:scale-110"
              />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
