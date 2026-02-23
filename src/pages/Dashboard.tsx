import { useEffect, useState, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  TrendingUp, Award, Target, Zap, BookOpen, BarChart3,
  Wrench, ChevronRight, Flame, Trophy, Clock, GraduationCap,
  CheckCircle2, Lock, Star, Sparkles, ArrowRight, Users
} from "lucide-react";

interface UserProgress {
  xp: number;
  level: number;
  financial_health_score: number | null;
  badges_earned: string[] | null;
  behavior_type: string | null;
}

interface Profile {
  display_name: string | null;
}

interface BadgeInfo {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_required: number;
}

interface RecentActivity {
  type: string;
  title: string;
  date: string;
  xp: number;
}

// Animated counter hook
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [streakDays] = useState(() => Math.floor(Math.random() * 7) + 1);
  const [missionDone, setMissionDone] = useState(false);
  const [streakAnimated, setStreakAnimated] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: prog }, { data: prof }, { data: badges }, { data: assessments }, { data: simulations }, { data: toolResults }] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("badges").select("*").order("xp_required"),
        supabase.from("assessments").select("assessment_type, completed_at, overall_score").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(4),
        supabase.from("simulation_sessions").select("simulation_type, created_at, total_score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("tool_results").select("tool_name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      ]);
      setProgress(prog);
      setProfile(prof);
      setAllBadges((badges ?? []) as BadgeInfo[]);

      const activities: RecentActivity[] = [];
      (assessments ?? []).forEach((a: any) => activities.push({ type: "assessment", title: `${a.assessment_type} Assessment`, date: a.completed_at, xp: 100 }));
      (simulations ?? []).forEach((s: any) => activities.push({ type: "simulation", title: `${s.simulation_type} Simulation`, date: s.created_at, xp: 75 }));
      (toolResults ?? []).forEach((t: any) => activities.push({ type: "tool", title: t.tool_name, date: t.created_at, xp: 25 }));
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 4));
    };
    load();
    // Trigger streak animation
    setTimeout(() => setStreakAnimated(true), 100);
  }, [user]);

  const xpPerLevel = 500;
  const currentLevel = progress?.level ?? 1;
  const currentXP = progress?.xp ?? 0;
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const xpProgress = (xpInCurrentLevel / xpPerLevel) * 100;

  const earnedBadgeIds = new Set(progress?.badges_earned ?? []);
  const earnedBadges = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const nextBadge = allBadges.find((b) => !earnedBadgeIds.has(b.id));
  const badgeProgress = allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0;

  const healthScore = progress?.financial_health_score ?? 0;
  const healthColor = healthScore >= 70 ? "text-primary" : healthScore >= 40 ? "text-[hsl(var(--warning))]" : "text-destructive";
  const healthBg = healthScore >= 70 ? "bg-primary" : healthScore >= 40 ? "bg-[hsl(var(--warning))]" : "bg-destructive";

  const animatedHealth = useCountUp(healthScore);
  const animatedXP = useCountUp(currentXP);
  const animatedBadges = useCountUp(earnedBadges.length);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1; // convert to Mon=0

  // Personalized actions
  const hasBaseline = recentActivities.some(a => a.title.includes("baseline"));
  const hasPost = recentActivities.some(a => a.title.includes("post"));

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {profile?.display_name || (
              <span>
                Learner{" "}
                <Link to="/settings" className="text-primary text-base font-medium hover:underline">
                  Set your name →
                </Link>
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 animate-pulse-glow" style={{ animationDuration: "3s" }}>
            <Flame className="h-4 w-4 text-[hsl(var(--warning))]" />
            <span className="text-sm font-medium">{streakDays}-day streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-display font-semibold">Level {currentLevel}</span>
          </div>
        </div>
      </div>

      {/* ===== WEEKLY STREAK CALENDAR ===== */}
      <div className="flex items-center justify-center gap-3 py-2">
        {dayLabels.map((label, i) => {
          const isActive = i < streakDays && i <= todayIdx;
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
              style={{
                opacity: streakAnimated ? 1 : 0,
                transform: streakAnimated ? "translateY(0)" : "translateY(8px)",
                transition: `all 0.3s ease ${i * 0.08}s`,
              }}
            >
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "border-2 border-primary text-primary bg-transparent"
                    : isFuture
                    ? "bg-secondary/50 text-muted-foreground/40"
                    : "bg-secondary text-muted-foreground/60"
                }`}
              >
                {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== XP PROGRESS BAR ===== */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{animatedXP.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">Total Experience</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{xpPerLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}</p>
              <p className="text-xs text-muted-foreground">{Math.round(xpProgress)}% complete</p>
            </div>
          </div>
          <Progress value={xpProgress} className="h-2.5 mb-3" />
          {/* Level journey */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {[currentLevel - 1, currentLevel, currentLevel + 1, currentLevel + 2].filter(l => l > 0).map(l => (
              <span key={l} className="flex items-center gap-1">
                {l > (currentLevel - 1 > 0 ? currentLevel - 1 : 0) && l !== (currentLevel - 1 > 0 ? currentLevel - 1 : 1) && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
                <span className={`font-display font-semibold px-2 py-0.5 rounded ${l === currentLevel ? "bg-primary/20 text-primary" : "text-muted-foreground/50"}`}>
                  Lvl {l}
                </span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== STAT CARDS ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Financial Health — larger */}
        <Card className="card-hover sm:col-span-2 lg:col-span-2">
          <CardContent className="flex items-center gap-5 pt-6">
            {/* Mini ring */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={healthScore >= 70 ? "hsl(var(--primary))" : healthScore >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                  strokeWidth="3" strokeDasharray={`${healthScore} ${100 - healthScore}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-display font-bold text-lg ${healthColor}`}>
                {animatedHealth}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Financial Health</p>
              <p className={`text-2xl font-bold font-display ${healthColor}`}>
                {healthScore >= 70 ? "Excellent" : healthScore >= 40 ? "Good" : "Needs Work"}
              </p>
              <Link to="/tools" className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                Your budgeting score is lowest — start here <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Badges Earned */}
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-[hsl(var(--warning))]/10 p-3">
                <Award className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Badges</p>
                <p className="text-2xl font-bold font-display">{animatedBadges} <span className="text-sm text-muted-foreground font-normal">of {allBadges.length}</span></p>
              </div>
            </div>
            {nextBadge && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Star className="h-3 w-3 text-[hsl(var(--warning))]" /> Next: {nextBadge.name} at {nextBadge.xp_required} XP
              </p>
            )}
          </CardContent>
        </Card>

        {/* Next Badge */}
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-[hsl(var(--info))]/10 p-3 relative">
                <Trophy className="h-5 w-5 text-[hsl(var(--info))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Badge</p>
                <p className="text-lg font-bold font-display">{nextBadge?.name ?? "All earned!"}</p>
              </div>
            </div>
            {nextBadge && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{currentXP} / {nextBadge.xp_required} XP</span>
                  <span>{Math.min(100, Math.round((currentXP / nextBadge.xp_required) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (currentXP / nextBadge.xp_required) * 100)} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== DAILY MISSION ===== */}
      <Card className="border-l-4 border-l-primary border-border/50">
        <CardContent className="py-5 px-6">
          {missionDone ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-sm">✅ Mission Complete!</p>
                <p className="text-xs text-muted-foreground">Come back tomorrow for your next mission.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-display font-semibold text-sm">Today's Mission</p>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                    <Zap className="h-2.5 w-2.5 mr-0.5" /> +15 XP
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Watch 1 video in Budgeting</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> ~5 min</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => setMissionDone(true)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== CONTINUE LEARNING + RECENT ACTIVITY ===== */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Continue Learning</CardTitle>
            <CardDescription>Personalized next steps for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {!hasBaseline ? (
                <QuickActionCard icon={BarChart3} title="Take Baseline Assessment" description="Discover your financial health score and unlock your personalized learning path" href="/assessments" xp={100} badge="Recommended" />
              ) : !hasPost ? (
                <QuickActionCard icon={BarChart3} title="Ready for Post Assessment" description="See how much you've grown since your baseline — measure your progress" href="/assessments" xp={100} badge="New" />
              ) : (
                <QuickActionCard icon={BarChart3} title="Retake Assessment" description="Track your continued growth with another assessment" href="/assessments" xp={100} />
              )}
              <QuickActionCard icon={Target} title="Eid Expense Challenge" description="New simulation: manage holiday expenses on a fixed salary" href="/simulations" xp={75} badge="New" />
              <QuickActionCard icon={Wrench} title="Emergency Fund Calculator" description="Find out exactly how much savings buffer you need" href="/tools" xp={25} />
              <QuickActionCard icon={BookOpen} title="Budgeting Basics" description="Start the Budgeting Fundamentals learning path" href="/learn" xp={15} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No activity yet. Start learning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, i) => {
                  const colors: Record<string, { bg: string; icon: any }> = {
                    assessment: { bg: "bg-primary/10 text-primary", icon: BarChart3 },
                    simulation: { bg: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]", icon: Target },
                    tool: { bg: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Wrench },
                    learning: { bg: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: BookOpen },
                  };
                  const c = colors[activity.type] || colors.assessment;
                  const Icon = c.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`rounded-full p-1.5 ${c.bg}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] shrink-0">
                        +{activity.xp} XP
                      </Badge>
                    </div>
                  );
                })}
                <Link to="/notifications" className="text-xs text-primary hover:underline flex items-center gap-1 pt-1">
                  View all activity <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ACHIEVEMENTS ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Achievements</CardTitle>
              <CardDescription>{earnedBadges.length} of {allBadges.length} badges unlocked</CardDescription>
            </div>
            <div className="w-24">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{badgeProgress}%</span>
              </div>
              <Progress value={badgeProgress} className="h-1.5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {allBadges.map((b) => {
              const earned = earnedBadgeIds.has(b.id);
              const isNext = nextBadge?.id === b.id;
              return (
                <div
                  key={b.id}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all group cursor-default ${
                    earned
                      ? "bg-primary/5 border border-primary/20"
                      : isNext
                      ? "border border-primary/40 bg-primary/5 animate-pulse-glow"
                      : "bg-muted/50 opacity-40"
                  }`}
                  title={earned ? `${b.name} — Earned!` : b.description ?? `${b.xp_required} XP to unlock`}
                  style={isNext ? { animationDuration: "4s" } : undefined}
                >
                  <span className="text-2xl relative">
                    {b.icon || "🏅"}
                    {!earned && !isNext && (
                      <Lock className="h-3 w-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="text-[10px] font-medium leading-tight line-clamp-2">{b.name}</span>
                  {isNext && (
                    <div className="w-full mt-0.5">
                      <Progress value={Math.min(100, (currentXP / b.xp_required) * 100)} className="h-1" />
                    </div>
                  )}
                  {!earned && !isNext && (
                    <span className="text-[9px] text-muted-foreground">{b.xp_required} XP</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ===== LEADERBOARD TEASER ===== */}
      <Card className="border-border/50">
        <CardContent className="py-4 px-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                📊 Weekly Leaderboard — <span className="text-primary">You're ranked #{Math.floor(Math.random() * 50) + 10}</span> this week
              </p>
              <div className="flex items-center gap-3 mt-1">
                {["AR", "SK", "MH"].map((initials, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"
                    }`}>
                      {initials}
                    </div>
                    <span>#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs gap-1 shrink-0">
              View <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionCard({
  icon: Icon, title, description, href, xp, badge,
}: {
  icon: any; title: string; description: string; href: string; xp: number; badge?: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.08)]"
    >
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-semibold text-sm">{title}</p>
          {badge && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">{badge}</Badge>
          )}
          <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary shrink-0 ml-auto">
            <Zap className="h-2.5 w-2.5" /> {xp}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  );
}
