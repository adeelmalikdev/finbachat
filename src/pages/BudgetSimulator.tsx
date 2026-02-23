import { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Wallet, Play, TrendingUp, ArrowRight, AlertTriangle,
  Gift, Zap, BarChart3, CheckCircle2, RotateCcw, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import { SimulationDashboard } from "@/components/simulations/SimulationDashboard";

// --- Life Events ---
interface LifeEvent {
  name: string;
  description: string;
  impact: number;
  category: "expense" | "windfall" | "neutral";
  weight: number;
}

const LIFE_EVENTS: LifeEvent[] = [
  { name: "Car Repair", description: "Unexpected car trouble costs you", impact: -15000, category: "expense", weight: 15 },
  { name: "Medical Bill", description: "An unplanned doctor visit", impact: -9000, category: "expense", weight: 12 },
  { name: "Phone Broke", description: "Your phone screen shattered", impact: -6000, category: "expense", weight: 10 },
  { name: "Rent Increase", description: "Landlord raised the rent this month", impact: -4500, category: "expense", weight: 8 },
  { name: "Freelance Gig", description: "You picked up a side project!", impact: 12000, category: "windfall", weight: 10 },
  { name: "Tax Refund", description: "Your tax refund arrived!", impact: 24000, category: "windfall", weight: 5 },
  { name: "Birthday Gift", description: "A relative sent you money", impact: 6000, category: "windfall", weight: 8 },
  { name: "Utility Spike", description: "Higher than usual utility bill", impact: -3000, category: "expense", weight: 12 },
  { name: "Grocery Sale", description: "Great deals on groceries this month", impact: 1500, category: "windfall", weight: 10 },
  { name: "Nothing Special", description: "A quiet, uneventful month", impact: 0, category: "neutral", weight: 20 },
  { name: "Pet Emergency", description: "Your pet needed vet care", impact: -12000, category: "expense", weight: 6 },
  { name: "Bonus at Work", description: "Your boss gave you a small bonus!", impact: 15000, category: "windfall", weight: 4 },
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

const CATEGORIES = ["Needs", "Wants", "Savings", "Investments", "Donations"] as const;
type Category = typeof CATEGORIES[number];

// Recommended 50/30/20 adapted percentages
const BENCHMARKS: Record<Category, number> = {
  Needs: 50,
  Wants: 20,
  Savings: 15,
  Investments: 10,
  Donations: 5,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Needs: "hsl(var(--chart-1))",
  Wants: "hsl(var(--chart-2))",
  Savings: "hsl(var(--chart-3))",
  Investments: "hsl(var(--chart-4))",
  Donations: "hsl(var(--chart-5))",
};

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

function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString()}`;
}

export default function BudgetSimulator() {
  usePageTitle("Budget Simulator");
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [view, setView] = useState<ViewState>("menu");
  const [income, setIncome] = useState(120000);
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
    // Set default allocations based on benchmarks
    setAllocations({
      Needs: Math.round(income * 0.5),
      Wants: Math.round(income * 0.2),
      Savings: Math.round(income * 0.15),
      Investments: Math.round(income * 0.1),
      Donations: Math.round(income * 0.05),
    });
    setLifeEvent(null);
    setShowEvent(false);
    setView("playing");
  }

  function totalAllocated() {
    return Object.values(allocations).reduce((s, v) => s + v, 0);
  }

  function remaining() {
    return income - totalAllocated();
  }

  function setSliderValue(cat: Category, pct: number) {
    setAllocations(prev => ({ ...prev, [cat]: Math.round(income * pct / 100) }));
  }

  async function submitMonth() {
    if (!user || !sessionId) return;
    if (remaining() < 0) {
      toast({ title: "Over budget!", description: "Your allocations exceed your income.", variant: "destructive" });
      return;
    }

    const event = drawLifeEvent();
    setLifeEvent(event);
    setShowEvent(true);

    const balanceBefore = balance + income;
    const spent = allocations.Needs + allocations.Wants + (allocations.Donations || 0);
    const saved = allocations.Savings + allocations.Investments;
    const balanceAfter = balanceBefore - spent + event.impact;
    const newSavingsTotal = savingsTotal + saved;

    const savingsRatio = income > 0 ? saved / income : 0;
    let monthXP = 20;
    if (savingsRatio >= 0.2) monthXP += 15;
    if (savingsRatio >= 0.3) monthXP += 10;
    if (allocations.Needs / income <= 0.5) monthXP += 5;
    if (allocations.Donations > 0) monthXP += 5;

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
    }
  }

  function classifyBehavior(history: MonthRecord[]): string {
    if (history.length === 0) return "Unknown";
    const avgSavingsRatio = history.reduce((s, m) => s + (m.allocations.Savings + m.allocations.Investments) / income, 0) / history.length;
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

    await supabase.from("user_progress").update({ behavior_type: behaviorType }).eq("user_id", user.id);

    await awardXP("simulation_complete", `Budget Simulator (${totalXP} XP earned)`);
    toast({ title: `+${totalXP} XP!`, description: `Simulation complete! You're a "${behaviorType}".` });

    setView("result");
    await loadPastSessions();
  }

  const allocated = totalAllocated();
  const rem = remaining();

  // --- MENU VIEW ---
  if (view === "menu") {
    return (
      <div className="space-y-6">
        <Card className="relative overflow-hidden border-primary/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <CardContent className="relative py-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Budget Simulator</h2>
                <p className="text-sm text-muted-foreground">Allocate your monthly income across 12 months. Navigate life events and build good habits.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Zap className="h-3 w-3" /> Earn XP per month
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground">
                12 months • ~15 min
              </span>
            </div>
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
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Badge variant={s.status === "completed" ? "default" : "secondary"} className="text-[10px]">
                      {s.status === "completed" ? "Completed" : `Month ${s.current_month}`}
                    </Badge>
                    <span className="text-sm">{formatRs(s.monthly_income)}/mo</span>
                    {s.behavior_type && <Badge variant="outline" className="text-[10px]">{s.behavior_type}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary font-medium"><Zap className="h-3 w-3" /> {s.total_xp_earned} XP</span>
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
          <h2 className="font-display text-2xl font-bold">Set Your Income</h2>
          <p className="text-muted-foreground">Choose your monthly take-home pay for the simulation.</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Monthly Income (Rs)</Label>
              <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} min={30000} max={1500000} />
              <p className="text-xs text-muted-foreground mt-1">Recommended: Rs 80,000 – Rs 250,000</p>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={() => setView("menu")}>Back</Button>
            <Button onClick={startGame} disabled={income < 30000} className="gap-2">
              Start Simulation <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- PLAYING VIEW ---
  if (view === "playing") {
    const savingsRate = income > 0 ? Math.round(((allocations.Savings + allocations.Investments) / income) * 100) : 0;
    const healthScore = Math.min(100, Math.max(0, 50 + savingsRate - (allocations.Needs / income > 0.5 ? 10 : 0) + (allocations.Donations > 0 ? 5 : 0)));

    if (showEvent && lifeEvent) {
      const latestMonth = monthHistory[monthHistory.length - 1];
      return (
        <div className="max-w-2xl mx-auto space-y-5">
          <SimulationDashboard
            balance={balance}
            monthlyIncome={income}
            monthlyExpenses={allocations.Needs + allocations.Wants}
            savingsRate={savingsRate}
            healthScore={healthScore}
            currentStep={currentMonth}
            totalSteps={TOTAL_MONTHS}
            xpEarned={totalXP}
            label={`Month ${currentMonth} of ${TOTAL_MONTHS}`}
          />

          <Card className="border-primary/10">
            <CardContent className="pt-6 text-center space-y-4">
              <div className={`inline-flex items-center justify-center rounded-full p-4 ${
                lifeEvent.category === "expense" ? "bg-destructive/10" : lifeEvent.category === "windfall" ? "bg-primary/10" : "bg-secondary"
              }`}>
                {lifeEvent.category === "expense" ? <AlertTriangle className="h-8 w-8 text-destructive" /> :
                 lifeEvent.category === "windfall" ? <Gift className="h-8 w-8 text-primary" /> :
                 <Calendar className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">{lifeEvent.name}</h3>
                <p className="text-sm text-muted-foreground">{lifeEvent.description}</p>
                <p className={`text-2xl font-bold font-display mt-2 ${lifeEvent.impact >= 0 ? "text-primary" : "text-destructive"}`}>
                  {lifeEvent.impact >= 0 ? "+" : ""}Rs {Math.abs(lifeEvent.impact).toLocaleString()}
                </p>
              </div>
              {latestMonth && (
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                    <p className={`font-bold font-display ${latestMonth.balanceAfter >= 0 ? "" : "text-destructive"}`}>
                      {formatRs(latestMonth.balanceAfter)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Saved</p>
                    <p className="font-bold font-display text-primary">{formatRs(latestMonth.savingsTotal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">XP Earned</p>
                    <p className="font-bold font-display text-primary">+{latestMonth.xpEarned}</p>
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

    // Budget allocation with sliders
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <SimulationDashboard
          balance={balance}
          monthlyIncome={income}
          monthlyExpenses={allocations.Needs + allocations.Wants}
          savingsRate={savingsRate}
          healthScore={healthScore}
          currentStep={currentMonth}
          totalSteps={TOTAL_MONTHS}
          xpEarned={totalXP}
          label={`Month ${currentMonth} of ${TOTAL_MONTHS}`}
        />

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sliders */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="font-display text-base">Allocate Your Income</CardTitle>
              <CardDescription>
                Remaining: <span className={`font-semibold ${rem < 0 ? "text-destructive" : rem === 0 ? "text-primary" : ""}`}>{formatRs(rem)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {CATEGORIES.map((cat) => {
                const pct = income > 0 ? Math.round((allocations[cat] / income) * 100) : 0;
                const benchmark = BENCHMARKS[cat];
                const warning = cat === "Savings" && pct < 10 ? "⚠️ Below 10%" :
                                cat === "Needs" && pct > 50 ? "⚠️ Above 50%" : null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        <Label className="text-sm">{cat}</Label>
                        {warning && <span className="text-[10px] text-[hsl(var(--warning))]">{warning}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Benchmark: {benchmark}%</span>
                        <span className="font-medium w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <Slider
                      value={[pct]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setSliderValue(cat, v)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{formatRs(allocations[cat])}</span>
                    </div>
                  </div>
                );
              })}

              {rem < 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">You've over-allocated by {formatRs(Math.abs(rem))}. Reduce some categories.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={submitMonth} disabled={allocated === 0 || rem < 0} className="w-full gap-2">
                Submit Month <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Donut Chart */}
          <Card className="lg:w-64 shrink-0">
            <CardHeader>
              <CardTitle className="font-display text-sm">Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <DonutChart allocations={allocations} income={income} />
              <div className="w-full space-y-1.5">
                {CATEGORIES.map(cat => {
                  const pct = income > 0 ? Math.round((allocations[cat] / income) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        <span className="text-muted-foreground">{cat}</span>
                      </div>
                      <span className="font-medium">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        {monthHistory.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="font-display text-sm">Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {monthHistory.map((m) => (
                  <div key={m.month} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border/50 bg-secondary/30">
                    <span className="font-medium">Month {m.month}</span>
                    <div className="flex items-center gap-3">
                      {m.lifeEvent && m.lifeEvent.impact !== 0 && (
                        <span className={m.lifeEvent.impact > 0 ? "text-primary" : "text-destructive"}>
                          {m.lifeEvent.name} ({m.lifeEvent.impact > 0 ? "+" : ""}{formatRs(m.lifeEvent.impact)})
                        </span>
                      )}
                      <span className="text-muted-foreground">{formatRs(m.balanceAfter)}</span>
                      <Badge variant="secondary" className="text-[10px]">+{m.xpEarned} XP</Badge>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Simulation Complete!</h1>
          <p className="text-muted-foreground">12 months of budgeting done. Here's your financial report.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Final Balance</p>
              <p className={`text-2xl font-bold font-display ${finalBalance >= 0 ? "" : "text-destructive"}`}>{formatRs(finalBalance)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Saved</p>
              <p className="text-2xl font-bold font-display text-primary">{formatRs(finalSavings)}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">XP Earned</p>
              <p className="text-2xl font-bold font-display text-primary">{totalXP}</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-6 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Behavior Type</p>
              <Badge className="mt-1">{behaviorType}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-base">Month-by-Month</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {monthHistory.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border/50 bg-secondary/30">
                  <span className="font-medium">M{m.month}</span>
                  <div className="flex items-center gap-2">
                    {m.lifeEvent && m.lifeEvent.impact !== 0 && (
                      <span className={m.lifeEvent.impact > 0 ? "text-primary" : "text-destructive"}>
                        {m.lifeEvent.name}
                      </span>
                    )}
                    <span className="text-muted-foreground">{formatRs(m.balanceAfter)}</span>
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
          <Button onClick={() => setView("menu")} className="gap-1">
            <BarChart3 className="h-4 w-4" /> Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// Simple SVG donut chart
function DonutChart({ allocations, income }: { allocations: Record<Category, number>; income: number }) {
  const total = Object.values(allocations).reduce((s, v) => s + v, 0);
  const size = 120;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {total === 0 ? (
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="16" />
      ) : (
        CATEGORIES.map(cat => {
          const pct = total > 0 ? allocations[cat] / total : 0;
          const dashLength = circumference * pct;
          const currentOffset = offset;
          offset += dashLength;

          if (pct === 0) return null;
          return (
            <circle
              key={cat}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth="16"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-currentOffset}
            />
          );
        })
      )}
    </svg>
  );
}
