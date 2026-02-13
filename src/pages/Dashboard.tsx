import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

interface UserProgress {
  xp: number;
  level: number;
  financial_health_score: number | null;
  badges_earned: string[] | null;
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

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: prog }, { data: prof }, { data: badges }] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("badges").select("*").order("xp_required"),
      ]);
      setProgress(prog);
      setProfile(prof);
      setAllBadges((badges ?? []) as BadgeInfo[]);
    };
    load();
  }, [user]);

  const xpForNextLevel = (progress?.level ?? 1) * 500;
  const xpProgress = progress ? Math.min((progress.xp / xpForNextLevel) * 100, 100) : 0;

  const earnedBadgeIds = new Set(progress?.badges_earned ?? []);
  const earnedBadges = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const lockedBadges = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}!
        </h1>
        <p className="text-muted-foreground">Here's your financial literacy overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} label="XP" value={`${progress?.xp ?? 0}`} sub={`Level ${progress?.level ?? 1}`} color="text-primary" />
        <StatCard icon={TrendingUp} label="Health Score" value={`${progress?.financial_health_score ?? 0}%`} sub="Financial Health" color="text-accent" />
        <StatCard icon={Award} label="Badges" value={`${earnedBadges.length}`} sub={`of ${allBadges.length}`} color="text-warning" />
        <StatCard icon={Target} label="Level Progress" value={`${Math.round(xpProgress)}%`} sub={`${progress?.xp ?? 0} / ${xpForNextLevel} XP`} color="text-info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {progress?.level ?? 1}</span>
              <span className="text-muted-foreground">{progress?.xp ?? 0} / {xpForNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction label="Take Assessment" desc="Test your financial knowledge" href="/assessments" />
            <QuickAction label="Try a Simulation" desc="Practice financial decisions" href="/simulations" />
            <QuickAction label="Use Tools" desc="Budget, savings & more" href="/tools" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map((b) => (
                  <Badge key={b.id} variant="default" className="gap-1 text-sm">
                    {b.icon} {b.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete activities to earn badges!</p>
            )}
            {lockedBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lockedBadges.map((b) => (
                  <Badge key={b.id} variant="outline" className="gap-1 text-sm opacity-50">
                    {b.icon} {b.name} ({b.xp_required} XP)
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-lg bg-muted p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ label, desc, href }: { label: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
    >
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="text-muted-foreground">→</span>
    </a>
  );
}
