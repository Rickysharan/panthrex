"use client";

import { useState } from "react";

import {
  JOB_APPLICATION_PRIORITIES,
  JOB_APPLICATION_STATUSES,
  type CreateJobApplicationInput,
  type JobApplicationPriority,
  type JobApplicationStatus,
} from "@/lib/job-tracker/types";

type JobApplicationFormProps = {
  onSubmit: (input: CreateJobApplicationInput) => void;
  onCancel?: () => void;
};

const initialFormState: CreateJobApplicationInput = {
  companyName: "",
  jobTitle: "",
  location: "",
  jobUrl: "",
  salary: "",
  status: "wishlist",
  priority: "medium",
  appliedDate: "",
  interviewDate: "",
  recruiterName: "",
  recruiterEmail: "",
  resumeId: "",
  coverLetterId: "",
  notes: "",
};

export default function JobApplicationForm({
  onSubmit,
  onCancel,
}: JobApplicationFormProps) {
  const [formData, setFormData] =
    useState<CreateJobApplicationInput>(initialFormState);

  const [errorMessage, setErrorMessage] = useState("");

  function updateField<
    Key extends keyof CreateJobApplicationInput,
  >(
    field: Key,
    value: CreateJobApplicationInput[Key],
  ): void {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const companyName = formData.companyName.trim();
    const jobTitle = formData.jobTitle.trim();

    if (!companyName || !jobTitle) {
      setErrorMessage(
        "Company name and job title are required.",
      );

      return;
    }

    setErrorMessage("");

    onSubmit({
      ...formData,
      companyName,
      jobTitle,
      location: formData.location.trim(),
      jobUrl: formData.jobUrl.trim(),
      salary: formData.salary.trim(),
      recruiterName: formData.recruiterName.trim(),
      recruiterEmail: formData.recruiterEmail.trim(),
      resumeId: formData.resumeId.trim(),
      coverLetterId: formData.coverLetterId.trim(),
      notes: formData.notes.trim(),
    });

    setFormData(initialFormState);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="companyName"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Company name
          </label>

          <input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(event) =>
              updateField("companyName", event.target.value)
            }
            placeholder="Example: Barclays"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label
            htmlFor="jobTitle"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Job title
          </label>

          <input
            id="jobTitle"
            type="text"
            value={formData.jobTitle}
            onChange={(event) =>
              updateField("jobTitle", event.target.value)
            }
            placeholder="Example: Fraud Analyst"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Location
          </label>

          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(event) =>
              updateField("location", event.target.value)
            }
            placeholder="Example: London, UK"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label
            htmlFor="salary"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Salary
          </label>

          <input
            id="salary"
            type="text"
            value={formData.salary}
            onChange={(event) =>
              updateField("salary", event.target.value)
            }
            placeholder="Example: £35,000–£42,000"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="jobUrl"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Job URL
        </label>

        <input
          id="jobUrl"
          type="url"
          value={formData.jobUrl}
          onChange={(event) =>
            updateField("jobUrl", event.target.value)
          }
          placeholder="https://company.com/jobs/role"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Status
          </label>

          <select
            id="status"
            value={formData.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as JobApplicationStatus,
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            {JOB_APPLICATION_STATUSES.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Priority
          </label>

          <select
            id="priority"
            value={formData.priority}
            onChange={(event) =>
              updateField(
                "priority",
                event.target.value as JobApplicationPriority,
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            {JOB_APPLICATION_PRIORITIES.map((priority) => (
              <option
                key={priority.value}
                value={priority.value}
              >
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="appliedDate"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Applied date
          </label>

          <input
            id="appliedDate"
            type="date"
            value={formData.appliedDate}
            onChange={(event) =>
              updateField("appliedDate", event.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label
            htmlFor="interviewDate"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Interview date
          </label>

          <input
            id="interviewDate"
            type="datetime-local"
            value={formData.interviewDate}
            onChange={(event) =>
              updateField("interviewDate", event.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="recruiterName"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Recruiter name
          </label>

          <input
            id="recruiterName"
            type="text"
            value={formData.recruiterName}
            onChange={(event) =>
              updateField("recruiterName", event.target.value)
            }
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label
            htmlFor="recruiterEmail"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Recruiter email
          </label>

          <input
            id="recruiterEmail"
            type="email"
            value={formData.recruiterEmail}
            onChange={(event) =>
              updateField("recruiterEmail", event.target.value)
            }
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="resumeId"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Resume ID
          </label>

          <input
            id="resumeId"
            type="text"
            value={formData.resumeId}
            onChange={(event) =>
              updateField("resumeId", event.target.value)
            }
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label
            htmlFor="coverLetterId"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Cover letter ID
          </label>

          <input
            id="coverLetterId"
            type="text"
            value={formData.coverLetterId}
            onChange={(event) =>
              updateField("coverLetterId", event.target.value)
            }
            placeholder="Optional"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Notes
        </label>

        <textarea
          id="notes"
          value={formData.notes}
          onChange={(event) =>
            updateField("notes", event.target.value)
          }
          placeholder="Application notes, requirements, follow-up details or interview preparation."
          rows={5}
          className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-500"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Add application
        </button>
      </div>
    </form>
  );
}