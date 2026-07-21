"use client";

import {
  Award,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

import type { Certification } from "@/lib/resume/types";

type CertificationsFormProps = {
  certifications: Certification[];
  addCertification: () => void;
  updateCertification: (
    id: string,
    updates: Partial<Certification>,
  ) => void;
  removeCertification: (id: string) => void;
};

const inputClassName =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

export default function CertificationsForm({
  certifications,
  addCertification,
  updateCertification,
  removeCertification,
}: CertificationsFormProps) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Resume content
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Certifications
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Add recognised certifications, professional
            credentials and relevant training that strengthen
            your suitability for the target role.
          </p>
        </div>

        <button
          type="button"
          onClick={addCertification}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
        >
          <Plus size={18} />
          Add certification
        </button>
      </div>

      {certifications.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <Award
            className="mx-auto text-violet-300"
            size={42}
          />

          <h3 className="mt-5 text-lg font-semibold">
            No certifications added yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Click &quot;Add certification&quot; to include
            credentials from recognised institutions, platforms
            or professional bodies.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {certifications.map((certification, index) => (
          <article
            key={certification.id}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                  Certification {index + 1}
                </p>

                <h3 className="mt-1 truncate font-semibold">
                  {certification.name ||
                    "New certification"}
                </h3>
              </div>

              <button
                type="button"
                aria-label={`Remove certification ${index + 1}`}
                onClick={() =>
                  removeCertification(certification.id)
                }
                className="rounded-xl p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Certification name">
                <input
                  type="text"
                  value={certification.name}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      {
                        name: event.target.value,
                      },
                    )
                  }
                  placeholder="AWS Certified Cloud Practitioner"
                  className={inputClassName}
                />
              </Field>

              <Field label="Issuing organisation">
                <input
                  type="text"
                  value={certification.issuer}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      {
                        issuer: event.target.value,
                      },
                    )
                  }
                  placeholder="Amazon Web Services"
                  className={inputClassName}
                />
              </Field>

              <Field label="Issue date">
                <input
                  type="month"
                  value={certification.issueDate}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      {
                        issueDate: event.target.value,
                      },
                    )
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Credential ID">
                <input
                  type="text"
                  value={certification.credentialId}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      {
                        credentialId:
                          event.target.value,
                      },
                    )
                  }
                  placeholder="ABC123456"
                  autoComplete="off"
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Credential URL">
                <div className="relative">
                  <ExternalLink
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type="url"
                    value={certification.credentialUrl}
                    onChange={(event) =>
                      updateCertification(
                        certification.id,
                        {
                          credentialUrl:
                            event.target.value,
                        },
                      )
                    }
                    placeholder="https://www.credly.com/badges/..."
                    autoComplete="url"
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </Field>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.055] p-4">
        <p className="text-sm font-semibold text-violet-200">
          Resume guidance
        </p>

        <p className="mt-2 text-xs leading-5 text-white/45">
          Include certifications that are current, verifiable and
          directly relevant to your target role. Avoid adding
          introductory course-completion certificates when stronger
          credentials are available.
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-white/70">
      {label}
      {children}
    </label>
  );
}