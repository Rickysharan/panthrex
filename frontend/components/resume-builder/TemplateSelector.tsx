"use client";

import {
  Check,
  ChevronDown,
  LayoutTemplate,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ResumeTemplate } from "@/lib/resume/types";

type TemplateSelectorProps = {
  selectedTemplate: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
};

type TemplateOption = {
  id: ResumeTemplate;
  name: string;
  description: string;
};

const templateOptions: TemplateOption[] = [
  {
    id: "professional",
    name: "Professional",
    description:
      "Traditional ATS-friendly layout for corporate and technical roles.",
  },
  {
    id: "modern",
    name: "Modern",
    description:
      "Contemporary layout with strong typography and visual hierarchy.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Clean, compact design focused entirely on resume content.",
  },
  {
    id: "executive",
    name: "Executive",
    description:
      "Refined leadership-focused layout for senior and management roles.",
  },
  {
    id: "technical",
    name: "Technical",
    description:
      "Structured layout designed for software, data and engineering roles.",
  },
  {
    id: "finance",
    name: "Finance",
    description:
      "Conservative professional design for banking, consulting and finance.",
  },
  {
    id: "academic",
    name: "Academic",
    description:
      "Content-dense format for research, education and graduate applications.",
  },
  {
    id: "creative",
    name: "Creative",
    description:
      "Distinctive presentation with a stronger personal brand and hierarchy.",
  },
];

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    templateOptions.find(
      (template) => template.id === selectedTemplate,
    ) ?? templateOptions[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function handleTemplateSelection(
    template: ResumeTemplate,
  ) {
    onTemplateChange(template);
    setIsOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-12 min-w-56 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left transition hover:bg-white/[0.08]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
            <LayoutTemplate size={17} />
          </span>

          <span className="min-w-0">
            <span className="block text-xs text-white/35">
              Resume template
            </span>

            <span className="block truncate text-sm font-semibold text-white/75">
              {selectedOption.name}
            </span>
          </span>
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-white/40 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-[340px] max-w-[calc(100vw-40px)] overflow-hidden rounded-3xl border border-white/10 bg-[#0b0e1d]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <div
            role="listbox"
            aria-label="Resume templates"
            className="space-y-1"
          >
            {templateOptions.map((template) => {
              const isSelected =
                template.id === selectedTemplate;

              return (
                <button
                  key={template.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() =>
                    handleTemplateSelection(template.id)
                  }
                  className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition ${
                    isSelected
                      ? "bg-violet-400/10"
                      : "hover:bg-white/[0.055]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-violet-400/15 text-violet-300"
                        : "bg-white/[0.05] text-white/35"
                    }`}
                  >
                    {isSelected ? (
                      <Check size={17} />
                    ) : (
                      <LayoutTemplate size={17} />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        isSelected
                          ? "text-violet-200"
                          : "text-white/75"
                      }`}
                    >
                      {template.name}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-white/35">
                      {template.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mx-2 mb-2 mt-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-xs leading-5 text-white/35">
              Changing the template only changes the visual
              presentation. Your resume content remains unchanged.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}