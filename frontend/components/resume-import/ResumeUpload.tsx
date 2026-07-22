"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type ResumeUploadProps = {
  onFileSelected?: (file: File) => void;
  disabled?: boolean;
  maxFileSizeMb?: number;
};

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".docx"];

export default function ResumeUpload({
  onFileSelected,
  disabled = false,
  maxFileSizeMb = 5,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

  function validateFile(file: File): string | null {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const hasValidType = ACCEPTED_FILE_TYPES.includes(file.type);
    const hasValidExtension = ACCEPTED_FILE_EXTENSIONS.includes(extension);

    if (!hasValidType && !hasValidExtension) {
      return "Please upload a PDF or DOCX resume.";
    }

    if (file.size > maxFileSizeBytes) {
      return `The file must be smaller than ${maxFileSizeMb} MB.`;
    }

    if (file.size === 0) {
      return "The selected file is empty.";
    }

    return null;
  }

  function processFile(file: File) {
    setError("");

    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelected?.(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    processFile(file);

    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    processFile(file);
  }

  function handleBrowseClick() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setError("");
  }

  function formatFileSize(size: number) {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "rounded-2xl border-2 border-dashed p-8 text-center transition",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-blue-400 hover:bg-slate-50",
          ].join(" ")}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleBrowseClick();
            }
          }}
          aria-disabled={disabled}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path
                d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v2A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Upload your existing resume
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Drag and drop your file here, or click to browse.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            PDF or DOCX only · Maximum {maxFileSizeMb} MB
          </p>

          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              handleBrowseClick();
            }}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose resume
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M8 12.5l2.5 2.5L16 9.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Resume selected successfully and ready for processing.
          </div>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}