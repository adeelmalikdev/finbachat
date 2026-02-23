import { useEffect, useState } from "react";
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
  Wrench, ChevronRight, Flame, Trophy, Clock, GraduationCap
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
}

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [streakDays] = useState(() => Math.floor(Math.random() * 7) + 1);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: prog }, { data: prof }, { data: badges }, { data: assessments }, { data: simulations }] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("badges").select("*").order("xp_required"),
        supabase.from("assessments").select("assessment_type, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(3),
        supabase.from("simulation_sessions").select("simulation_type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      ]);
      setProgress(prog);
      setProfile(prof);
      setAllBadges((badges ?? []) as BadgeInfo[]);

      const activities: RecentActivity[] = [];
      (assessments ?? []).forEach((a: any) => activities.push({ type: "assessment", title: `${a.assessment_type} Assessment`, date: a.completed_at }));
      (simulations ?? []).forEach((s: any) => activities.push({ type: "simulation", title: `${s.simulation_type} Simulation`, date: s.created_at }));
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));
    };
    load();
  }, [user]);

  const xpPerLevel = 500;
  const currentLevel = progress?.level ?? 1;
  const currentXP = progress?.xp ?? 0;
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const xpProgress = (xpInCurrentLevel / xpPerLevel) * 100;

  const earnedBadgeIds = new Set(progress?.badges_earned ?? []);
  const earnedBadges = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const nextBadge = allBadges.find((b) => !earnedBadgeIds.has(b.id));

  const healthScore = progress?.financial_health_score ?? 0;
  const healthColor = healthScore >= 70 ? "text-primary" : healthScore >= 40 ? "text-[hsl(var(--warning))]" : "text-destructive";
  const healthLabel = healthScore >= 70 ? "Excellent" : healthScore >= 40 ? "Good" : "Needs Work";

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {profile?.display_name || "Learner"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Flame className="h-4 w-4 text-[hsl(var(--warning))]" />
            <span className="text-sm font-medium">{streakDays}-day streak</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-display font-semibold">Level {currentLevel}</span>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{currentXP.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">Total Experience</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{xpPerLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}</p>
              <p className="text-xs text-muted-foreground">{Math.round(xpProgress)}% complete</p>
            </div>
          </div>
          <Progress value={xpProgress} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Financial Health" value={`${healthScore}%`} sub={healthLabel} iconColor={healthColor} />
        <StatCard icon={Award} label="Badges Earned" value={`${earnedBadges.length}`} sub={`of ${allBadges.length} available`} iconColor="text-[hsl(var(--warning))]" />
        <StatCard icon={Target} label="Level" value={`${currentLevel}`} sub={`${currentXP.toLocaleString()} total XP`} iconColor="text-primary" />
        <StatCard icon={Trophy} label="Next Badge" value={nextBadge ? `${nextBadge.xp_required} XP` : "All earned!"} sub={nextBadge?.name ?? "Congratulations"} iconColor="text-[hsl(var(--info))]" />
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickActionCard icon={BarChart3} title="Take Assessment" description="Evaluate your financial knowledge and earn 100 XP" href="/assessments" xp={100} />
              <QuickActionCard icon={Target} title="Run Simulation" description="Practice real-world financial decisions for 75 XP" href="/simulations" xp={75} />
              <QuickActionCard icon={Wrench} title="Financial Tools" description="Budget planner, savings calculator & more for 25 XP" href="/tools" xp={25} />
              <QuickActionCard icon={BookOpen} title="Learn" description="Watch videos and read expert articles for 15 XP" href="/learn" xp={15} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No activity yet. Start learning to see your progress here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      activity.type === "assessment" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                    }`}>
                      {activity.type === "assessment" ? <BarChart3 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">Achievements</CardTitle>
            <CardDescription>{earnedBadges.length} of {allBadges.length} badges unlocked</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {Math.round((earnedBadges.length / Math.max(allBadges.length, 1)) * 100)}% complete
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {allBadges.map((b) => {
              const earned = earnedBadgeIds.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all ${
                    earned
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-muted/50 opacity-40"
                  }`}
                  title={b.description ?? b.name}
                >
                  <span className="text-2xl">{b.icon || "🏅"}</span>
                  <span className="text-[10px] font-medium leading-tight line-clamp-2">{b.name}</span>
                  {!earned && (
                    <span className="text-[9px] text-muted-foreground">{b.xp_required} XP</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  iconColor: string;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-xl bg-primary/10 p-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold font-display leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  xp,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  xp: number;
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
        <div className="flex items-center justify-between gap-2">
          <p className="font-display font-semibold text-sm">{title}</p>
          <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary shrink-0">
            <Zap className="h-2.5 w-2.5" /> {xp}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  );
}
