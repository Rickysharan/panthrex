"use client";

import {
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";

const faqs = [
  {
    q: "What is Panthrex Pro?",
    a: "Panthrex Pro unlocks premium AI career tools including advanced resume optimisation, job matching and interview preparation.",
  },
  {
    q: "How does the 1-day premium access work?",
    a: "Eligible users receive temporary premium access with a countdown until expiry.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes. You can manage your subscription from Settings.",
  },
  {
    q: "How does Refer & Earn work?",
    a: "Invite friends and receive rewards according to the referral programme.",
  },
];

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submitTicket() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject,
          message,
        });

      setSent(true);
      setSubject("");
      setMessage("");
    }

    setLoading(false);
  }

  return (
    <AppLayout
      title="Help & Support"
      description="Get help with your Panthrex account."
    >
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-indigo-300" />
            <h2 className="text-xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="font-semibold">
                  {item.q}
                </p>

                <p className="mt-2 text-sm text-white/50">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>


        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex items-center gap-3">
            <MessageSquare className="text-indigo-300" />
            <h2 className="text-xl font-bold">
              Contact Support
            </h2>
          </div>

          {sent ? (
            <p className="mt-5 text-emerald-300">
              Your support request has been submitted.
            </p>
          ) : (
            <div className="mt-5 space-y-4">

              <input
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                placeholder="Subject"
                className="w-full rounded-xl bg-white/5 p-3 text-white outline-none"
              />

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Describe your issue..."
                rows={5}
                className="w-full rounded-xl bg-white/5 p-3 text-white outline-none"
              />

              <button
                disabled={loading}
                onClick={submitTicket}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400"
              >
                <Send size={18}/>
                {loading
                  ? "Sending..."
                  : "Send Request"}
              </button>

            </div>
          )}

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex gap-3">
            <Mail className="text-indigo-300"/>
            <p className="text-white/60">
              Need urgent help? Contact Panthrex support.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
