import { useState, useEffect, useRef } from "react";
import { BookOpen, Trophy, Target, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Assess Your Knowledge",
    desc: "Take a baseline assessment to discover your financial literacy starting point across key areas.",
    icon: BarChart3,
    mockTitle: "Financial Assessment",
    mockValue: "72/100",
    mockLabel: "Your Baseline Score",
  },
  {
    num: "02",
    title: "Learn Through Lessons",
    desc: "Watch expert video lessons and read curated content organized by difficulty and category.",
    icon: BookOpen,
    mockTitle: "Video Lessons",
    mockValue: "13/20",
    mockLabel: "Modules Complete",
  },
  {
    num: "03",
    title: "Complete Challenges",
    desc: "Run budget simulations, use financial tools, and practice real-world money decisions.",
    icon: Target,
    mockTitle: "Budget Simulation",
    mockValue: "Month 4",
    mockLabel: "Savings: Rs 45,000",
  },
  {
    num: "04",
    title: "Earn XP & Rank Up",
    desc: "Collect XP for every action, unlock badges, climb the leaderboard, and track your growth.",
    icon: Trophy,
    mockTitle: "Your Progress",
    mockValue: "Level 12",
    mockLabel: "2,450 / 3,000 XP",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = steps[activeStep];

  return (
    <section id="how-it-works" className="scroll-mt-16 bg-sidebar relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.04),transparent_50%)]" />
      <div className="container relative py-24" ref={sectionRef}>
        <div className="max-w-xl mb-16">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">How It Works</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-sidebar-primary-foreground mt-3 leading-tight">
            Four steps to{" "}
            <span className="text-accent">financial mastery</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Vertical steps */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-sidebar-border">
              <div
                className="w-full bg-accent transition-all duration-500 ease-out"
                style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(i)}
                  className={`relative flex items-start gap-5 text-left pl-0 w-full transition-all duration-300 ${
                    i === activeStep ? "opacity-100" : "opacity-40 hover:opacity-60"
                  }`}
                >
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold transition-colors duration-300 ${
                    i <= activeStep
                      ? "bg-accent text-accent-foreground"
                      : "bg-sidebar-accent text-sidebar-foreground/40 border border-sidebar-border"
                  }`}>
                    {step.num}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display text-lg font-semibold text-sidebar-primary-foreground">{step.title}</h3>
                    <p className="text-sm text-sidebar-foreground mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right — Visual panel */}
          <div className="relative">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-8 min-h-[320px] flex flex-col justify-center transition-all duration-500">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-tr-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <current.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-sidebar-foreground">{current.mockTitle}</span>
                </div>

                <p className="font-display text-6xl font-bold text-sidebar-primary-foreground leading-none">
                  {current.mockValue}
                </p>
                <p className="text-sm text-sidebar-foreground/60 mt-3">{current.mockLabel}</p>

                {/* Decorative bar */}
                <div className="mt-8 h-2 rounded-full bg-sidebar-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700"
                    style={{ width: `${25 + activeStep * 25}%` }}
                  />
                </div>

                <div className="mt-6 flex gap-2">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeStep ? "w-8 bg-accent" : "w-4 bg-sidebar-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
