import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Zap, User, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  level: number;
  display_name: string | null;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);

    // Use safe leaderboard view that excludes sensitive fields
    const { data } = await supabase
      .from("leaderboard_view" as any)
      .select("user_id, xp, level, display_name")
      .order("xp", { ascending: false })
      .limit(100);

    const list: LeaderboardEntry[] = (data ?? []).map((p: any) => ({
      user_id: p.user_id,
      xp: p.xp,
      level: p.level,
      display_name: p.display_name || "Anonymous",
    }));

    setEntries(list);
    setLoading(false);
  }

  const filtered = levelFilter === "all"
    ? entries
    : entries.filter((e) => {
        const [min, max] = levelFilter.split("-").map(Number);
        return e.level >= min && e.level <= max;
      });

  const myRank = filtered.findIndex((e) => e.user_id === user?.id) + 1;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other learners.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1-3">Level 1–3</SelectItem>
              <SelectItem value="4-6">Level 4–6</SelectItem>
              <SelectItem value="7-10">Level 7–10</SelectItem>
              <SelectItem value="11-99">Level 11+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {myRank > 0 && (
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" /> Your Rank: #{myRank}
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users in this range yet.</p>
          ) : (
            <div className="space-y-1">
              {filtered.slice(0, 50).map((entry, i) => {
                const rank = i + 1;
                const isMe = entry.user_id === user?.id;
                const medalColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-700" : "text-muted-foreground";

                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 text-center font-bold text-lg ${medalColor}`}>
                        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                      </span>
                      <div className="rounded-full bg-muted p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.display_name}
                          {isMe && <span className="text-primary ml-1">(You)</span>}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Level {entry.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-primary">
                      <Zap className="h-4 w-4" /> {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
