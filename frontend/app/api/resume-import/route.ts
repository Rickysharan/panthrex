import { NextRequest, NextResponse } from "next/server";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";



const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const PDF_MIME_TYPE = "application/pdf";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

type ExtractedResumeResponse = {
  fileName: string;
  fileType: "pdf" | "docx";
  text: string;
  characterCount: number;
  wordCount: number;
  pageCount?: number;
  warnings: string[];
};

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function countWords(text: string): number {
  if (!text.trim()) {
    return 0;
  }

  return text.trim().split(/\s+/).length;
}

function validateFile(file: File): string | null {
  const extension = getFileExtension(file.name);

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Only PDF and DOCX files are supported.";
  }

  if (file.size === 0) {
    return "The uploaded file is empty.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "The uploaded file must be smaller than 5 MB.";
  }

  const hasAcceptedMimeType =
    file.type === PDF_MIME_TYPE ||
    file.type === DOCX_MIME_TYPE ||
    file.type === "application/octet-stream" ||
    file.type === "";

  if (!hasAcceptedMimeType) {
    return "The uploaded file type is not supported.";
  }

  return null;
}

async function extractPdfText(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();

    return {
      text: result.text,
      pageCount: result.total,
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<{
  text: string;
  warnings: string[];
}> {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return {
    text: result.value,
    warnings: result.messages.map((message) => message.message),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          error: "A resume file is required.",
        },
        {
          status: 400,
        },
      );
    }

    const validationError = validateFile(uploadedFile);

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    const extension = getFileExtension(uploadedFile.name);
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    let pageCount: number | undefined;
    let warnings: string[] = [];

    if (extension === ".pdf") {
      const result = await extractPdfText(buffer);

      extractedText = result.text;
      pageCount = result.pageCount;
    } else {
      const result = await extractDocxText(buffer);

      extractedText = result.text;
      warnings = result.warnings;
    }

    const normalizedText = normalizeExtractedText(extractedText);

    if (!normalizedText) {
      return NextResponse.json(
        {
          error:
            "No readable text was found. The resume may be scanned, image-based, encrypted, or corrupted.",
        },
        {
          status: 422,
        },
      );
    }

    const response: ExtractedResumeResponse = {
      fileName: uploadedFile.name,
      fileType: extension === ".pdf" ? "pdf" : "docx",
      text: normalizedText,
      characterCount: normalizedText.length,
      wordCount: countWords(normalizedText),
      warnings,
    };

    if (pageCount !== undefined) {
      response.pageCount = pageCount;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Resume extraction failed:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown resume extraction error.";

    return NextResponse.json(
      {
        error: `The resume could not be extracted: ${errorMessage}`,
      },
      {
        status: 500,
      },
    );
  }
}