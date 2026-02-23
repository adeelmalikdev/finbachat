import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Shield, Target, Zap, BookOpen, BarChart3,
  Calculator, Gamepad2, ChevronRight, Award, Users,
  PieChart, ArrowRight, CheckCircle2, Star
} from "lucide-react";

export default function Landing() {
  usePageTitle();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Tools />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

/* ─── Navigation ─── */
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            FB
          </div>
          <span className="font-display text-xl font-bold">FinBachat</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-display">
            <Zap className="h-3 w-3 text-primary" />
            Pakistan's Financial Literacy Platform
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Master Your Money,{" "}
            <span className="text-primary">Build Your Future</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FinBachat makes financial literacy engaging and practical. Learn through gamified assessments,
            real-world simulations, and professional tools — all designed for Pakistan's financial landscape.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-display" asChild>
              <Link to="/auth">
                Start Learning Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="#features">
                Explore Features <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Free to use</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> PKR-based tools</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Earn XP & badges</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function Stats() {
  const stats = [
    { value: "6+", label: "Financial Tools", icon: Calculator },
    { value: "100+", label: "Assessment Questions", icon: BarChart3 },
    { value: "50+", label: "Video Lessons", icon: BookOpen },
    { value: "15+", label: "Badges to Earn", icon: Award },
  ];
  return (
    <section className="border-y bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl bg-primary/10 p-3">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    {
      icon: BarChart3,
      title: "Financial Assessments",
      description: "Baseline and post assessments to measure your knowledge growth across budgeting, saving, investing, and debt management.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Gamepad2,
      title: "Real-World Simulations",
      description: "Practice financial decisions in risk-free scenarios. Budget for a month, handle emergencies, and learn from outcomes.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Calculator,
      title: "Professional Tools",
      description: "Budget builders, debt planners, inflation calculators, and savings planners — all calibrated for Pakistan's economy.",
      color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
    },
    {
      icon: BookOpen,
      title: "Expert Content",
      description: "Curated video lessons and articles from financial experts, organized by category and difficulty level.",
      color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
    },
    {
      icon: Zap,
      title: "Gamified Learning",
      description: "Earn XP for every action, unlock badges, level up, and compete on the leaderboard to stay motivated.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Shield,
      title: "Behavioral Insights",
      description: "Get personalized feedback on your spending patterns with psychology-backed nudges to improve financial habits.",
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <section id="features" className="scroll-mt-16">
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="secondary" className="mb-4 font-display">Features</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything you need to become financially literate</h2>
          <p className="mt-3 text-muted-foreground">A complete platform that combines education, practice, and tools in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group hover:border-primary/30 hover:shadow-md transition-all">
              <CardContent className="pt-6 space-y-3">
                <div className={`inline-flex rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tools Preview ─── */
function Tools() {
  const tools = [
    { name: "Smart Budget Builder", desc: "Pie chart breakdowns, health score, slider-based inputs", icon: PieChart },
    { name: "Weekly Cash Flow Tracker", desc: "Weekly targets, progress bars, 4-week comparisons", icon: TrendingUp },
    { name: "Emergency Fund Calculator", desc: "Stability-based recommendations with milestones", icon: Shield },
    { name: "Debt Control Planner", desc: "Side-by-side payoff comparison and interest savings", icon: Target },
    { name: "Inflation Impact Tool", desc: "Visualize wealth erosion over time with charts", icon: BarChart3 },
    { name: "Savings Goal Planner", desc: "Feasibility scoring and timeline visualization", icon: Award },
  ];

  return (
    <section id="tools" className="scroll-mt-16 bg-muted/30">
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="secondary" className="mb-4 font-display">Tools</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Professional financial tools, zero cost</h2>
          <p className="mt-3 text-muted-foreground">Every tool uses PKR values and is designed for Pakistan's financial reality.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { step: "01", title: "Create Your Account", desc: "Sign up in seconds and take your baseline assessment to measure your starting point." },
    { step: "02", title: "Learn & Practice", desc: "Watch expert videos, run simulations, and use our tools to build real-world financial skills." },
    { step: "03", title: "Track & Improve", desc: "Earn XP, unlock badges, climb the leaderboard, and watch your financial health score grow." },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="secondary" className="mb-4 font-display">How It Works</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Start in under 2 minutes</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="font-display text-2xl font-bold text-primary">{s.step}</span>
              </div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    {
      name: "Ahmed R.",
      role: "University Student",
      text: "FinBachat helped me understand budgeting for the first time. The sliders and pie charts make it so intuitive — I actually enjoy tracking my spending now.",
    },
    {
      name: "Sana K.",
      role: "Freelance Designer",
      text: "The Emergency Fund Calculator showed me exactly how long it would take to build a safety net. I went from zero savings to 2 months of expenses in 4 months.",
    },
    {
      name: "Bilal M.",
      role: "Small Business Owner",
      text: "The Debt Control Planner opened my eyes to how much I was losing to interest. Just adding 10% extra to payments saved me Rs 45,000 over 2 years.",
    },
  ];

  return (
    <section id="testimonials" className="scroll-mt-16 bg-muted/30">
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="secondary" className="mb-4 font-display">Testimonials</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Trusted by learners across Pakistan</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10" />
      <div className="container relative py-20">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready to take control of your finances?</h2>
          <p className="text-muted-foreground">Join thousands of Pakistanis building better financial habits with FinBachat.</p>
          <Button size="lg" className="gap-2 font-display" asChild>
            <Link to="/auth">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t bg-sidebar text-sidebar-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent font-display text-xs font-bold text-sidebar-primary">
                FB
              </div>
              <span className="font-display text-lg font-bold text-sidebar-primary-foreground">FinBachat</span>
            </div>
            <p className="text-sm text-sidebar-foreground/60">Pakistan's financial literacy platform. Learn, practice, and master your money.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sidebar-primary-foreground text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/60">
              <li><a href="#features" className="hover:text-sidebar-primary transition-colors">Features</a></li>
              <li><a href="#tools" className="hover:text-sidebar-primary transition-colors">Tools</a></li>
              <li><a href="#how-it-works" className="hover:text-sidebar-primary transition-colors">How It Works</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sidebar-primary-foreground text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/60">
              <li><a href="#" className="hover:text-sidebar-primary transition-colors">Expert Articles</a></li>
              <li><a href="#" className="hover:text-sidebar-primary transition-colors">Video Lessons</a></li>
              <li><a href="#" className="hover:text-sidebar-primary transition-colors">Assessments</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sidebar-primary-foreground text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/60">
              <li><Link to="/auth" className="hover:text-sidebar-primary transition-colors">Sign In</Link></li>
              <li><Link to="/auth" className="hover:text-sidebar-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-sidebar-border pt-6 text-center text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} FinBachat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
