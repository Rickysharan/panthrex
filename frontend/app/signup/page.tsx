"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormData: FormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!fullName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setFormData(initialFormData);
      setSuccessMessage(
        "Account created successfully. Check your email and confirm your account before signing in.",
      );
    } catch {
      setErrorMessage(
        "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-6 py-10 text-white lg:px-8">
      <div
        aria-hidden="true"
        className="absolute left-[-140px] top-[-120px] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-[-140px] right-[-100px] h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-[130px]"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden border-r border-white/10 bg-white/[0.025] p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#050816]">
                  <Sparkles size={21} />
                </span>

                <span className="text-xl font-bold tracking-tight">
                  Panthrex
                </span>
              </Link>

              <div className="mt-16">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Start your career workspace
                </p>

                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-tight tracking-[-0.04em]">
                  Build a stronger application process from day one.
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-white/55">
                  Create tailored CVs, prepare for interviews, discover relevant
                  roles and manage every application in one intelligent
                  platform.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                <SignupBenefit text="AI-powered CV optimisation" />
                <SignupBenefit text="Role-specific interview preparation" />
                <SignupBenefit text="Application tracking and analytics" />
                <SignupBenefit text="Free plan with no credit card required" />
              </div>
            </div>

            <p className="text-sm leading-6 text-white/35">
              Join ambitious students, graduates and professionals building
              smarter job-search workflows.
            </p>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to homepage
              </Link>

              <div className="mt-8">
                <div className="flex items-center gap-3 lg:hidden">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#050816]">
                    <Sparkles size={19} />
                  </span>

                  <span className="text-xl font-bold">Panthrex</span>
                </div>

                <h2 className="mt-8 text-4xl font-semibold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-3 text-white/50">
                  Start using Panthrex and build your personalised career
                  workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {errorMessage ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                {successMessage ? (
                  <div
                    role="status"
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200"
                  >
                    {successMessage}
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-white/75"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      disabled={isSubmitting}
                      value={formData.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Alex Morgan"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-white/75"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-white/75"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      value={formData.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="Minimum 8 characters"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-white/75"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      value={formData.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                      placeholder="Enter your password again"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm leading-6 text-white/55">
                  <input
                    type="checkbox"
                    required
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-500 disabled:cursor-not-allowed"
                  />

                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-[#050816] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs uppercase tracking-[0.18em] text-white/30">
                  or
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                disabled
                title="Google authentication will be added soon"
                className="h-14 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.04] font-medium text-white/40"
              >
                Continue with Google — coming soon
              </button>

              <p className="mt-7 text-center text-sm text-white/50">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SignupBenefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/65">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <CheckCircle2 size={17} />
      </span>

      <span>{text}</span>
    </div>
  );
}
