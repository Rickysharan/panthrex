"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface ExportPdfButtonProps {
  targetId: string;
  fileName?: string;
}

function applySafeStyles(
  sourceElement: HTMLElement,
  clonedElement: HTMLElement,
) {
  const sourceNodes = [
    sourceElement,
    ...Array.from(
      sourceElement.querySelectorAll<HTMLElement>("*"),
    ),
  ];

  const clonedNodes = [
    clonedElement,
    ...Array.from(
      clonedElement.querySelectorAll<HTMLElement>("*"),
    ),
  ];

  sourceNodes.forEach((sourceNode, index) => {
    const clonedNode = clonedNodes[index];

    if (!clonedNode) {
      return;
    }

    const computedStyle =
      window.getComputedStyle(sourceNode);

    clonedNode.style.color =
      computedStyle.color;

    clonedNode.style.backgroundColor =
      computedStyle.backgroundColor;

    clonedNode.style.borderTopColor =
      computedStyle.borderTopColor;

    clonedNode.style.borderRightColor =
      computedStyle.borderRightColor;

    clonedNode.style.borderBottomColor =
      computedStyle.borderBottomColor;

    clonedNode.style.borderLeftColor =
      computedStyle.borderLeftColor;

    clonedNode.style.outlineColor =
      computedStyle.outlineColor;

    clonedNode.style.textDecorationColor =
      computedStyle.textDecorationColor;

    clonedNode.style.boxShadow = "none";
    clonedNode.style.textShadow = "none";
  });
}

export default function ExportPdfButton({
  targetId,
  fileName = "Panthrex_Cover_Letter.pdf",
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] =
    useState(false);

  const handleExport = async () => {
    const element =
      document.getElementById(targetId);

    if (!element) {
      window.alert(
        "Unable to locate the cover letter preview.",
      );
      return;
    }

    try {
      setIsExporting(true);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDocument) => {
          const clonedElement =
            clonedDocument.getElementById(
              targetId,
            );

          if (!clonedElement) {
            return;
          }

          applySafeStyles(
            element,
            clonedElement,
          );

          clonedElement.style.width =
            `${element.offsetWidth}px`;

          clonedElement.style.maxWidth = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.borderRadius = "0";
        },
      });

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;
      const printableWidth =
        pageWidth - margin * 2;
      const printablePageHeight =
        pageHeight - margin * 2;

      const renderedHeight =
        (canvas.height * printableWidth) /
        canvas.width;

      let remainingHeight = renderedHeight;
      let verticalOffset = 0;
      let pageNumber = 0;

      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          margin - verticalOffset,
          printableWidth,
          renderedHeight,
        );

        remainingHeight -=
          printablePageHeight;

        verticalOffset +=
          printablePageHeight;

        pageNumber += 1;
      }

      pdf.save(fileName);
    } catch (error) {
      console.error(
        "PDF export failed:",
        error,
      );

      window.alert(
        "Failed to export the PDF. Check the browser console for details.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting
        ? "Generating PDF..."
        : "Export PDF"}
    </button>
  );
}
