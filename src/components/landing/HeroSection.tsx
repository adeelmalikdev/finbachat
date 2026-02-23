import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Trophy, Flame, Shield } from "lucide-react";

const floatingCards = [
  { text: "+50 XP Earned", icon: Zap, delay: "0s", duration: "5s", position: "top-12 right-[12%]" },
  { text: "🔥 Streak: 7 Days", icon: Flame, delay: "1.5s", duration: "6s", position: "top-1/3 right-[5%]" },
  { text: "Level Up: Investor", icon: Trophy, delay: "0.8s", duration: "4.5s", position: "bottom-1/4 right-[18%]" },
  { text: "Badge Unlocked", icon: Shield, delay: "2s", duration: "5.5s", position: "bottom-12 right-[8%]" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-sidebar min-h-[90vh] flex items-center">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container relative py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-sidebar-foreground">Pakistan's #1 Financial Literacy Platform</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-sidebar-primary-foreground">
              Learn Money.
              <br />
              Earn Rewards.
              <br />
              <span className="text-accent">Build Wealth.</span>
            </h1>

            <p className="text-lg text-sidebar-foreground max-w-lg leading-relaxed">
              Master budgeting, saving, and investing through gamified lessons, real-world simulations,
              and professional tools — all calibrated for Pakistan's economy.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-display gap-2 h-12 px-8 text-base shadow-[0_0_30px_hsl(var(--accent)/0.3)] hover:shadow-[0_0_40px_hsl(var(--accent)/0.4)] transition-shadow" asChild>
                <Link to="/auth">
                  Start Learning Free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary-foreground h-12 px-8 text-base" asChild>
                <a href="#features">Explore Platform</a>
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-sidebar-foreground/60">
              <span>✓ Free forever</span>
              <span>✓ PKR-based tools</span>
              <span>✓ Earn XP & badges</span>
            </div>
          </div>

          {/* Right — Floating mock dashboard + cards */}
          <div className="relative hidden lg:block h-[500px]">
            {/* Main dashboard mock */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1200px" }}>
              <div
                className="w-[380px] rounded-xl border border-sidebar-border bg-sidebar-accent shadow-2xl overflow-hidden"
                style={{ transform: "rotateY(-8deg) rotateX(4deg)" }}
              >
                {/* Mock header */}
                <div className="p-4 border-b border-sidebar-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-sidebar-foreground/60">Financial Health</p>
                      <p className="font-display text-2xl font-bold text-accent">78/100</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent">
                      <span className="font-display text-sm font-bold text-accent">A-</span>
                    </div>
                  </div>
                </div>
                {/* Mock XP bar */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-xs text-sidebar-foreground">
                    <span>Level 12</span>
                    <span>2,450 / 3,000 XP</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-sidebar-border overflow-hidden">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-accent to-primary" />
                  </div>
                </div>
                {/* Mock leaderboard rows */}
                <div className="px-4 pb-4 space-y-2">
                  {[
                    { rank: 1, name: "Ahmed R.", xp: "12,450", color: "text-warning" },
                    { rank: 2, name: "Sana K.", xp: "11,200", color: "text-sidebar-foreground" },
                    { rank: 3, name: "Bilal M.", xp: "10,800", color: "text-sidebar-foreground" },
                    { rank: 4, name: "You", xp: "9,340", color: "text-accent" },
                  ].map((row) => (
                    <div key={row.rank} className={`flex items-center gap-3 rounded-lg p-2.5 ${row.rank === 4 ? "bg-accent/10 border border-accent/20" : "bg-sidebar/50"}`}>
                      <span className={`font-display text-sm font-bold w-5 ${row.rank === 1 ? "text-warning" : "text-sidebar-foreground/40"}`}>
                        #{row.rank}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-border text-xs font-bold text-sidebar-foreground">
                        {row.name[0]}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${row.color}`}>{row.name}</span>
                      <span className="text-xs font-display font-bold text-accent">{row.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            {floatingCards.map((card, i) => (
              <div
                key={i}
                className={`absolute ${card.position} z-10`}
                style={{
                  animation: `landing-float ${card.duration} ease-in-out infinite`,
                  animationDelay: card.delay,
                }}
              >
                <div className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2 shadow-lg backdrop-blur-sm">
                  <card.icon className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-sidebar-primary-foreground whitespace-nowrap">{card.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
