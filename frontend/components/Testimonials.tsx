import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Graduate",
    quote:
      "Panthrex completely transformed my job search. The AI optimised my CV, and I landed interviews within two weeks.",
  },
  {
    name: "David Chen",
    role: "Software Engineer",
    quote:
      "The interview practice feature was incredibly realistic. I felt much more confident during technical interviews.",
  },
  {
    name: "Emily Brown",
    role: "Data Analyst",
    quote:
      "Instead of using five different websites, I managed everything from one dashboard. It is exactly what I needed.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Testimonials
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Loved by job seekers
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Thousands of students and professionals use AI to improve their
            applications and prepare for interviews.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((person) => (
            <article
              key={person.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-violet-400/40"
            >
              <div
                className="mb-6 flex gap-1 text-yellow-400"
                aria-label="Five-star testimonial"
              >
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="leading-7 text-white/70">
                &ldquo;{person.quote}&rdquo;
              </p>

              <div className="mt-8">
                <h3 className="text-lg font-semibold">{person.name}</h3>

                <p className="text-sm text-white/50">
                  {person.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}