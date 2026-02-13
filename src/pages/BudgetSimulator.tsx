import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Wallet, Play, DollarSign, TrendingUp, ArrowRight, AlertTriangle,
  Gift, Zap, BarChart3, CheckCircle2, RotateCcw, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

// --- Life Events ---
interface LifeEvent {
  name: string;
  description: string;
  impact: number; // negative = cost, positive = windfall
  category: "expense" | "windfall" | "neutral";
  weight: number; // probability weight
}

const LIFE_EVENTS: LifeEvent[] = [
  { name: "Car Repair", description: "Unexpected car trouble costs you", impact: -500, category: "expense", weight: 15 },
  { name: "Medical Bill", description: "An unplanned doctor visit", impact: -300, category: "expense", weight: 12 },
  { name: "Phone Broke", description: "Your phone screen shattered", impact: -200, category: "expense", weight: 10 },
  { name: "Rent Increase", description: "Landlord raised the rent this month", impact: -150, category: "expense", weight: 8 },
  { name: "Freelance Gig", description: "You picked up a side project!", impact: 400, category: "windfall", weight: 10 },
  { name: "Tax Refund", description: "Your tax refund arrived!", impact: 800, category: "windfall", weight: 5 },
  { name: "Birthday Gift", description: "A relative sent you money", impact: 200, category: "windfall", weight: 8 },
  { name: "Utility Spike", description: "Higher than usual utility bill", impact: -100, category: "expense", weight: 12 },
  { name: "Grocery Sale", description: "Great deals on groceries this month", impact: 50, category: "windfall", weight: 10 },
  { name: "Nothing Special", description: "A quiet, uneventful month", impact: 0, category: "neutral", weight: 20 },
  { name: "Pet Emergency", description: "Your pet needed vet care", impact: -400, category: "expense", weight: 6 },
  { name: "Bonus at Work", description: "Your boss gave you a small bonus!", impact: 500, category: "windfall", weight: 4 },
];

function drawLifeEvent(): LifeEvent {
  const totalWeight = LIFE_EVENTS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const event of LIFE_EVENTS) {
    r -= event.weight;
    if (r <= 0) return event;
  }
  return LIFE_EVENTS[LIFE_EVENTS.length - 1];
}

// --- Categories ---
const CATEGORIES = ["Needs", "Wants", "Savings", "Investments", "Donations"] as const;
type Category = typeof CATEGORIES[number];

interface MonthRecord {
  month: number;
  allocations: Record<Category, number>;
  lifeEvent: LifeEvent | null;
  balanceBefore: number;
  balanceAfter: number;
  savingsTotal: number;
  xpEarned: number;
}

interface SessionRecord {
  id: string;
  monthly_income: number;
  current_month: number;
  status: string;
  total_xp_earned: number;
  behavior_type: string | null;
  created_at: string;
  completed_at: string | null;
}

const TOTAL_MONTHS = 12;

type ViewState = "menu" | "setup" | "playing" | "result";

export default function BudgetSimulator() {
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [view, setView] = useState<ViewState>("menu");
  const [income, setIncome] = useState(4000);
  const [balance, setBalance] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [allocations, setAllocations] = useState<Record<Category, number>>(
    { Needs: 0, Wants: 0, Savings: 0, Investments: 0, Donations: 0 }
  );
  const [lifeEvent, setLifeEvent] = useState<LifeEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [monthHistory, setMonthHistory] = useState<MonthRecord[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<SessionRecord[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (user) loadPastSessions();
  }, [user]);

  async function loadPastSessions() {
    const { data } = await supabase
      .from("budget_sim_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setPastSessions((data ?? []) as SessionRecord[]);
  }

  async function startGame() {
    if (!user) return;
    const { data } = await supabase
      .from("budget_sim_sessions")
      .insert({ user_id: user.id, monthly_income: income })
      .select()
      .single();
    if (data) setSessionId(data.id);
    setBalance(0);
    setSavingsTotal(0);
    setCurrentMonth(1);
    setMonthHistory([]);
    setTotalXP(0);
    resetAllocations();
    setLifeEvent(null);
    setShowEvent(false);
    setView("playing");
  }

  function resetAllocations() {
    setAllocations({ Needs: 0, Wants: 0, Savings: 0, Investments: 0, Donations: 0 });
  }

  function totalAllocated() {
    return Object.values(allocations).reduce((s, v) => s + v, 0);
  }

  function remaining() {
    return income - totalAllocated();
  }

  async function submitMonth() {
    if (!user || !sessionId) return;
    if (remaining() < 0) {
      toast({ title: "Over budget!", description: "Your allocations exceed your income.", variant: "destructive" });
      return;
    }

    // Draw a life event
    const event = drawLifeEvent();
    setLifeEvent(event);
    setShowEvent(true);

    // Calculate
    const balanceBefore = balance + income;
    const spent = allocations.Needs + allocations.Wants + (allocations.Donations || 0);
    const saved = allocations.Savings + allocations.Investments;
    const balanceAfter = balanceBefore - spent + event.impact;
    const newSavingsTotal = savingsTotal + saved;

    // XP: base 20 + bonus for good behavior
    const savingsRatio = income > 0 ? saved / income : 0;
    let monthXP = 20;
    if (savingsRatio >= 0.2) monthXP += 15; // saved 20%+
    if (savingsRatio >= 0.3) monthXP += 10; // saved 30%+
    if (allocations.Needs / income <= 0.5) monthXP += 5; // needs under 50%
    if (allocations.Donations > 0) monthXP += 5; // donated

    const record: MonthRecord = {
      month: currentMonth,
      allocations: { ...allocations },
      lifeEvent: event,
      balanceBefore,
      balanceAfter,
      savingsTotal: newSavingsTotal,
      xpEarned: monthXP,
    };

    setMonthHistory((prev) => [...prev, record]);
    setBalance(balanceAfter);
    setSavingsTotal(newSavingsTotal);
    setTotalXP((prev) => prev + monthXP);

    // Save month to DB
    await supabase.from("budget_sim_months").insert({
      session_id: sessionId,
      user_id: user.id,
      month_number: currentMonth,
      allocations: allocations as unknown as Json,
      life_event: event as unknown as Json,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      savings_total: newSavingsTotal,
      xp_earned: monthXP,
    });
  }

  async function proceedAfterEvent() {
    setShowEvent(false);
    if (currentMonth >= TOTAL_MONTHS) {
      await finishGame();
    } else {
      setCurrentMonth((m) => m + 1);
      resetAllocations();
    }
  }

  function classifyBehavior(history: MonthRecord[]): string {
    if (history.length === 0) return "Unknown";
    const avgSavingsRatio = history.reduce((s, m) => s + (m.allocations.Savings + m.allocations.Investments) / income, 0) / history.length;
    const avgNeedsRatio = history.reduce((s, m) => s + m.allocations.Needs / income, 0) / history.length;
    const avgWantsRatio = history.reduce((s, m) => s + m.allocations.Wants / income, 0) / history.length;
    const investRatio = history.reduce((s, m) => s + m.allocations.Investments / income, 0) / history.length;

    if (avgSavingsRatio >= 0.3 && avgWantsRatio <= 0.2) return "Conservative Saver";
    if (investRatio >= 0.15 && avgWantsRatio <= 0.3) return "Aggressive Investor";
    if (avgWantsRatio >= 0.4) return "Impulsive Spender";
    return "Balanced Planner";
  }

  async function finishGame() {
    if (!user || !sessionId) return;
    const behaviorType = classifyBehavior(monthHistory);

    await supabase.from("budget_sim_sessions").update({
      current_month: TOTAL_MONTHS,
      status: "completed",
      total_xp_earned: totalXP,
      behavior_type: behaviorType,
      completed_at: new Date().toISOString(),
    }).eq("id", sessionId);

    // Update user progress behavior type
    await supabase.from("user_progress").update({ behavior_type: behaviorType }).eq("user_id", user.id);

    // Award XP
    await awardXP("simulation_complete", `Budget Simulator (${totalXP} XP earned)`);
    toast({ title: `+${totalXP} XP!`, description: `Simulation complete! You're a "${behaviorType}".` });

    setView("result");
    await loadPastSessions();
  }

  // --- MENU VIEW ---
  if (view === "menu") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Budget Simulator</h1>
          <p className="text-muted-foreground">Manage your monthly budget through 12 months of life events and decisions.</p>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> New Simulation
            </CardTitle>
            <CardDescription>Set your monthly income and navigate 12 months of financial decisions and surprises.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setView("setup")} className="gap-2">
              <Play className="h-4 w-4" /> Start New Game
            </Button>
          </CardContent>
        </Card>

        {pastSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Past Games</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pastSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                      {s.status === "completed" ? "Completed" : `Month ${s.current_month}`}
                    </Badge>
                    <span className="text-sm">${s.monthly_income.toLocaleString()}/mo</span>
                    {s.behavior_type && <Badge variant="outline">{s.behavior_type}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {s.total_xp_earned} XP</span>
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- SETUP VIEW ---
  if (view === "setup") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Set Your Income</h1>
          <p className="text-muted-foreground">Choose your monthly take-home pay for the simulation.</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Monthly Income ($)</Label>
              <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} min={1000} max={50000} />
              <p className="text-xs text-muted-foreground mt-1">Recommended: $3,000 – $8,000</p>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={() => setView("menu")}>Back</Button>
            <Button onClick={startGame} disabled={income < 1000} className="gap-2">
              Start Simulation <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- PLAYING VIEW ---
  if (view === "playing") {
    const allocated = totalAllocated();
    const rem = remaining();
    const progressPct = (currentMonth / TOTAL_MONTHS) * 100;

    if (showEvent && lifeEvent) {
      const eventIcon = lifeEvent.category === "expense" ? AlertTriangle : lifeEvent.category === "windfall" ? Gift : Calendar;
      const eventColor = lifeEvent.category === "expense" ? "text-destructive" : lifeEvent.category === "windfall" ? "text-green-600" : "text-muted-foreground";
      const latestMonth = monthHistory[monthHistory.length - 1];

      return (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Month {currentMonth} Result</h2>
            <Badge variant="outline">{currentMonth}/{TOTAL_MONTHS}</Badge>
          </div>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              {(() => { const Icon = eventIcon; return <Icon className={`h-12 w-12 mx-auto ${eventColor}`} />; })()}
              <div>
                <h3 className="font-display font-bold text-lg">{lifeEvent.name}</h3>
                <p className="text-sm text-muted-foreground">{lifeEvent.description}</p>
                <p className={`text-2xl font-bold mt-2 ${lifeEvent.impact >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {lifeEvent.impact >= 0 ? "+" : ""}${lifeEvent.impact.toLocaleString()}
                </p>
              </div>
              {latestMonth && (
                <div className="grid grid-cols-3 gap-3 text-center border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={`font-bold ${latestMonth.balanceAfter >= 0 ? "" : "text-destructive"}`}>
                      ${latestMonth.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Saved</p>
                    <p className="font-bold text-green-600">${latestMonth.savingsTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                    <p className="font-bold text-primary">+{latestMonth.xpEarned}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={proceedAfterEvent} className="w-full gap-2">
                {currentMonth >= TOTAL_MONTHS ? "Finish Game" : "Next Month"} <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Month {currentMonth}</h2>
          <Badge variant="outline">{currentMonth}/{TOTAL_MONTHS}</Badge>
        </div>
        <Progress value={progressPct} className="h-2" />

        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Income</p><p className="font-bold text-lg">${income.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Balance</p><p className={`font-bold text-lg ${balance < 0 ? "text-destructive" : ""}`}>${balance.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Saved</p><p className="font-bold text-lg text-green-600">${savingsTotal.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Allocate Your Income
            </CardTitle>
            <CardDescription>
              Remaining: <span className={rem < 0 ? "text-destructive font-bold" : "font-semibold"}>${rem.toLocaleString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <Label className="w-24 text-sm">{cat}</Label>
                <Input
                  type="number"
                  value={allocations[cat] || ""}
                  onChange={(e) => setAllocations((prev) => ({ ...prev, [cat]: Number(e.target.value) }))}
                  className="flex-1"
                  min={0}
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {income > 0 ? Math.round((allocations[cat] / income) * 100) : 0}%
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={submitMonth} disabled={allocated === 0 || rem < 0} className="w-full gap-2">
              Submit Month <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {monthHistory.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monthHistory.map((m) => (
                  <div key={m.month} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                    <span className="font-medium">Month {m.month}</span>
                    <div className="flex items-center gap-3">
                      {m.lifeEvent && m.lifeEvent.impact !== 0 && (
                        <span className={m.lifeEvent.impact > 0 ? "text-green-600" : "text-destructive"}>
                          {m.lifeEvent.name} ({m.lifeEvent.impact > 0 ? "+" : ""}${m.lifeEvent.impact})
                        </span>
                      )}
                      <span className="text-muted-foreground">${m.balanceAfter.toLocaleString()}</span>
                      <Badge variant="secondary" className="text-xs">+{m.xpEarned} XP</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (view === "result") {
    const behaviorType = classifyBehavior(monthHistory);
    const finalBalance = monthHistory.length > 0 ? monthHistory[monthHistory.length - 1].balanceAfter : 0;
    const finalSavings = monthHistory.length > 0 ? monthHistory[monthHistory.length - 1].savingsTotal : 0;

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold">Simulation Complete!</h1>
          <p className="text-muted-foreground">12 months of budgeting done. Here's your report.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Final Balance</p>
            <p className={`text-2xl font-bold ${finalBalance >= 0 ? "" : "text-destructive"}`}>${finalBalance.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-2xl font-bold text-green-600">${finalSavings.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">XP Earned</p>
            <p className="text-2xl font-bold text-primary">{totalXP}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Behavior Type</p>
            <Badge variant="default" className="text-sm mt-1">{behaviorType}</Badge>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Month-by-Month</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {monthHistory.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <span>M{m.month}</span>
                  <div className="flex items-center gap-2">
                    {m.lifeEvent && m.lifeEvent.impact !== 0 && (
                      <span className={m.lifeEvent.impact > 0 ? "text-green-600" : "text-destructive"}>
                        {m.lifeEvent.name}
                      </span>
                    )}
                    <span className="text-muted-foreground">${m.balanceAfter.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setView("menu")} className="gap-1">
            <RotateCcw className="h-4 w-4" /> Play Again
          </Button>
          <Button onClick={() => window.location.href = "/leaderboard"} className="gap-1">
            <BarChart3 className="h-4 w-4" /> Leaderboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
