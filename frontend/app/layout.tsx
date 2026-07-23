import type { Metadata } from "next";
import { Inter } from "next/font/google";

import BackButton from "@/components/common/BackButton";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://panthrex.com",
  ),
  title: {
    default: "Panthrex | The AI Way to Get Hired",
    template: "%s | Panthrex",
  },
  description:
    "Panthrex is an AI career platform that helps job seekers build ATS resumes, prepare interviews and find better opportunities.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Panthrex | The AI Way to Get Hired",
    description:
      "AI-powered resumes, job search and interview preparation platform.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <BackButton />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={5000}
        />
      </body>
    </html>
  );
}
