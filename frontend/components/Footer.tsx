import { Code2, Mail, Network } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050816]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-12 lg:flex-row lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Panthrex</h2>

          <p className="mt-3 max-w-md leading-7 text-white/60">
            The AI way to get hired. Build better resumes, prepare for
            interviews, and manage your job search from one intelligent
            platform.
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href="#"
            aria-label="Panthrex source code"
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Code2 size={20} />
          </a>

          <a
            href="#"
            aria-label="Panthrex professional network"
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Network size={20} />
          </a>

          <a
            href="mailto:hello@panthrex.com"
            aria-label="Email Panthrex"
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Panthrex. All rights reserved.
      </div>
    </footer>
  );
}