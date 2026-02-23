import { BarChart3, Gamepad2, Calculator, BookOpen, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Adaptive Assessments",
    description: "Baseline and post assessments that measure your knowledge growth across budgeting, saving, investing, and debt management.",
    stat: "100+",
    statLabel: "Questions",
    large: true,
    mockContent: "assessment",
  },
  {
    icon: Gamepad2,
    title: "Life Simulations",
    description: "Navigate real-world financial scenarios in risk-free environments. Handle emergencies and learn from outcomes.",
    stat: "12",
    statLabel: "Scenarios",
    large: false,
    mockContent: "simulation",
  },
  {
    icon: Calculator,
    title: "PKR Financial Tools",
    description: "Budget builders, debt planners, inflation calculators — all calibrated for Pakistan's economy.",
    stat: "6",
    statLabel: "Pro Tools",
    large: false,
    mockContent: "tools",
  },
  {
    icon: Zap,
    title: "Gamified XP System",
    description: "Earn XP for every action, unlock badges, level up, and compete on the leaderboard to stay motivated.",
    stat: "500+",
    statLabel: "XP Actions",
    large: false,
    mockContent: "xp",
  },
  {
    icon: BookOpen,
    title: "Expert Video Lessons",
    description: "Curated video lessons from financial experts, organized by category and difficulty level.",
    stat: "50+",
    statLabel: "Lessons",
    large: true,
    mockContent: "lessons",
  },
  {
    icon: Shield,
    title: "Behavioral Insights",
    description: "Psychology-backed nudges and personalized feedback to improve your financial habits over time.",
    stat: "15+",
    statLabel: "Badges",
    large: false,
    mockContent: "badges",
  },
];

function MockXPBar() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-sidebar-foreground/60">
        <span>Level 8 → 9</span>
        <span>1,840 / 2,500 XP</span>
      </div>
      <div className="h-3 rounded-full bg-sidebar-border overflow-hidden">
        <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-accent to-primary transition-all" />
      </div>
      <div className="flex gap-2 mt-3">
        {["Budget Pro", "Quiz Master", "Saver"].map((b) => (
          <span key={b} className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

function MockLeaderboardMini() {
  return (
    <div className="mt-4 space-y-1.5">
      {[
        { rank: 1, name: "Ahmed R.", xp: "12,450" },
        { rank: 2, name: "Sana K.", xp: "11,200" },
        { rank: 3, name: "Bilal M.", xp: "10,800" },
      ].map((row) => (
        <div key={row.rank} className="flex items-center gap-2 rounded-md bg-sidebar/60 p-2">
          <span className={`text-xs font-bold w-4 ${row.rank === 1 ? "text-warning" : "text-sidebar-foreground/40"}`}>
            {row.rank}
          </span>
          <div className="h-5 w-5 rounded-full bg-sidebar-border flex items-center justify-center text-[9px] font-bold text-sidebar-foreground">
            {row.name[0]}
          </div>
          <span className="text-xs text-sidebar-foreground flex-1">{row.name}</span>
          <span className="text-[10px] font-bold text-accent">{row.xp}</span>
        </div>
      ))}
    </div>
  );
}

function MockProgressRing() {
  return (
    <div className="mt-4 flex items-center gap-4">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--sidebar-border))" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" strokeDasharray="65, 100" strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-accent">65%</span>
      </div>
      <div>
        <p className="text-xs text-sidebar-foreground/60">Modules Complete</p>
        <p className="text-sm font-display font-bold text-sidebar-primary-foreground">13 of 20</p>
      </div>
    </div>
  );
}

function getMockContent(type: string) {
  switch (type) {
    case "xp": return <MockXPBar />;
    case "simulation": return <MockLeaderboardMini />;
    case "lessons": return <MockProgressRing />;
    default: return null;
  }
}

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 bg-sidebar relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--accent)/0.03),transparent_50%)]" />
      <div className="container relative py-24">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">Platform Features</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-sidebar-primary-foreground mt-3 leading-tight">
            Everything you need to become{" "}
            <span className="text-accent">financially literate</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-xl border border-sidebar-border bg-sidebar-accent p-6 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_hsl(var(--accent)/0.08)] overflow-hidden ${
                f.large ? "md:col-span-2 md:row-span-1" : ""
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background stat */}
              <span className="absolute top-4 right-6 font-display text-7xl font-bold text-sidebar-foreground/[0.04] select-none pointer-events-none leading-none">
                {f.stat}
              </span>

              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2.5 text-accent shrink-0 group-hover:bg-accent/20 transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-sidebar-primary-foreground">{f.title}</h3>
                      <span className="rounded-full bg-sidebar-border px-2 py-0.5 text-[10px] font-medium text-sidebar-foreground/60">
                        {f.stat} {f.statLabel}
                      </span>
                    </div>
                    <p className="text-sm text-sidebar-foreground mt-1 leading-relaxed">{f.description}</p>
                    {getMockContent(f.mockContent)}
                  </div>
                </div>
              </div>

              {/* Subtle inner glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/[0.02] via-transparent to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
