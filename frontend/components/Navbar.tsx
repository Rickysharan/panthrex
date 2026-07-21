import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
            <Sparkles size={20} />
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            Panthrex
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>

          <a href="#testimonials" className="transition hover:text-white">
            Testimonials
          </a>

          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>

          <a href="#faq" className="transition hover:text-white">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 sm:block"
          >
            Sign in
          </button>

          <button
            type="button"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}