import { Star } from "lucide-react";

const featured = {
  name: "Ahmed Raza",
  role: "University Student, LUMS",
  text: "FinBachat completely changed how I think about money. The budget simulator made me realize I was spending 40% of my income on food alone. Within 3 months, I built an emergency fund for the first time in my life.",
  avatar: "A",
};

const testimonials = [
  {
    name: "Sana Khan",
    role: "",
    text: "The Emergency Fund Calculator showed me exactly how long it would take. I went from zero savings to 2 months of expenses in just 4 months.",
    avatar: "S",
  },
  {
    name: "Bilal Malik",
    role: "Small Business Owner",
    text: "The Debt Control Planner opened my eyes. Adding just 10% extra to payments saved me Rs 45,000 over 2 years.",
    avatar: "B",
  },
];

const stats = [
  { value: "10,000+", label: "Active Learners" },
  { value: "500,000+", label: "XP Earned" },
  { value: "50+", label: "Modules" },
  { value: "4.9★", label: "Average Rating" },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
      ))}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section id="testimonials" className="scroll-mt-16 bg-sidebar relative">
      <div className="container py-24">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">Social Proof</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-sidebar-primary-foreground mt-3 leading-tight">
            Trusted by learners across{" "}
            <span className="text-accent">Pakistan</span>
          </h2>
        </div>

        {/* Asymmetric testimonials */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Featured — large */}
          <div className="lg:col-span-3 rounded-xl border border-sidebar-border bg-sidebar-accent p-8 flex flex-col justify-between">
            <div>
              <Stars />
              <blockquote className="font-display text-xl sm:text-2xl font-medium text-sidebar-primary-foreground mt-4 leading-relaxed">
                "{featured.text}"
              </blockquote>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-display text-lg font-bold text-accent">
                {featured.avatar}
              </div>
              <div>
                <p className="font-display font-semibold text-sidebar-primary-foreground">{featured.name}</p>
                <p className="text-sm text-sidebar-foreground/60">{featured.role}</p>
              </div>
            </div>
          </div>

          {/* Smaller — stacked */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 flex-1">
                <Stars />
                <p className="text-sm text-sidebar-foreground mt-3 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sidebar-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-sidebar-primary-foreground">{t.name}</p>
                    <p className="text-xs text-sidebar-foreground/60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
