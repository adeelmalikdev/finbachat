const leaderboardData = [
  { rank: 1, name: "Ahmed Raza", title: "Budget Master", xp: "12,450", avatar: "A" },
  { rank: 2, name: "Sana Khan", title: "Savings Pro", xp: "11,200", avatar: "S" },
  { rank: 3, name: "Bilal Malik", title: "Investor", xp: "10,800", avatar: "B" },
  { rank: 4, name: "Fatima Noor", title: "Debt Slayer", xp: "9,340", avatar: "F" },
  { rank: 5, name: "Hassan Ali", title: "Quiz Master", xp: "8,920", avatar: "H" },
];

export function LeaderboardSection() {
  return (
    <section id="leaderboard" className="scroll-mt-16 bg-sidebar relative overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--sidebar-foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container relative py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-accent">Leaderboard</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-sidebar-primary-foreground mt-3 leading-tight">
              Compete with{" "}
              <span className="text-accent">10,000+</span>
              <br />learners
            </h2>
            <p className="text-sidebar-foreground mt-4 max-w-md leading-relaxed">
              Climb the ranks, earn badges, and see how your financial knowledge stacks up against learners across Pakistan.
            </p>
          </div>

          {/* Right — Leaderboard card */}
          <div className="relative">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <span className="font-display text-sm font-semibold text-sidebar-primary-foreground">Top Learners</span>
                <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-sidebar-border">
                {leaderboardData.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-sidebar/50 ${
                      user.rank <= 3 ? "relative" : ""
                    }`}
                  >
                    {user.rank <= 3 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.03] to-transparent pointer-events-none" />
                    )}
                    <span className={`font-display text-sm font-bold w-6 text-center relative z-10 ${
                      user.rank === 1 ? "text-warning" : user.rank <= 3 ? "text-accent" : "text-sidebar-foreground/30"
                    }`}>
                      {user.rank}
                    </span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold relative z-10 ${
                      user.rank === 1
                        ? "bg-warning/20 text-warning ring-2 ring-warning/30"
                        : user.rank <= 3
                        ? "bg-accent/15 text-accent"
                        : "bg-sidebar-border text-sidebar-foreground"
                    }`}>
                      {user.avatar}
                    </div>
                    <div className="flex-1 relative z-10">
                      <p className="text-sm font-medium text-sidebar-primary-foreground">{user.name}</p>
                      <p className="text-xs text-sidebar-foreground/50">{user.title}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-accent relative z-10">{user.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
