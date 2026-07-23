"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const normalisedEmail = email.trim().toLowerCase();

    if (!normalisedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalisedEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Please confirm your email address before signing in.",
          );
          return;
        }

        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Incorrect email address or password.");
          return;
        }

        setErrorMessage(error.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to sign in right now. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

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
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#050816]">
                  <Sparkles size={21} />
                </span>

                <span className="text-xl font-bold tracking-tight">
                  Panthrex
                </span>
              </Link>

              <div className="mt-20">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Welcome back
                </p>

                <h1 className="mt-5 max-w-lg text-5xl font-semibold leading-tight tracking-[-0.04em]">
                  Continue building your next career move.
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-white/55">
                  Access your CV tools, interview preparation, job matches and
                  application pipeline from one focused workspace.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm text-white/45">Career progress</p>

              <div className="mt-4 flex items-end justify-between gap-6">
                <div>
                  <p className="text-3xl font-semibold">82%</p>

                  <p className="mt-1 text-sm text-white/45">
                    Profile strength
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-emerald-300">
                    +14%
                  </p>

                  <p className="mt-1 text-sm text-white/45">
                    This month
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-sky-400" />
              </div>
            </div>
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

              <div className="mt-10">
                <div className="flex items-center gap-3 lg:hidden">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#050816]">
                    <Sparkles size={19} />
                  </span>

                  <span className="text-xl font-bold">Panthrex</span>
                </div>

                <h2 className="mt-8 text-4xl font-semibold tracking-tight">
                  Sign in
                </h2>

                <p className="mt-3 text-white/50">
                  Enter your details to access your career workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {errorMessage ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
                  >
                    {errorMessage}
                  </div>
                ) : null}

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
                      value={email}
                      onChange={(event) =>
                        handleEmailChange(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-white/75"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      disabled
                      title="Password recovery will be added next"
                      className="cursor-not-allowed text-sm font-medium text-violet-300/45"
                    >
                      Forgot password?
                    </button>
                  </div>

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
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      value={password}
                      onChange={(event) =>
                        handlePasswordChange(event.target.value)
                      }
                      placeholder="Enter your password"
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

                <label className="flex items-center gap-3 text-sm text-white/55">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-500 disabled:cursor-not-allowed"
                  />
                  Keep me signed in
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
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
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

              <p className="mt-8 text-center text-sm text-white/50">
                New to Panthrex?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
