"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";

type ExportPdfButtonProps = {
  documentTitle: string;
};

function createSafeFileName(title: string): string {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedTitle || "panthrex-resume";
}

export default function ExportPdfButton({
  documentTitle,
}: ExportPdfButtonProps) {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleExport = () => {
    if (isPreparing) {
      return;
    }

    setIsPreparing(true);

    const originalDocumentTitle = document.title;
    document.title = createSafeFileName(documentTitle);

    window.requestAnimationFrame(() => {
      window.print();

      window.setTimeout(() => {
        document.title = originalDocumentTitle;
        setIsPreparing(false);
      }, 500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPreparing}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-[#050816] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPreparing ? (
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
      ) : (
        <Download size={17} />
      )}

      {isPreparing ? "Preparing..." : "Export PDF"}
    </button>
  );
}