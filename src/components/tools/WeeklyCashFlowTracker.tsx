import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(a: number) { return `Rs ${a.toLocaleString()}`; }

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"] as const;

interface Expense {
  category: typeof CATEGORIES[number];
  amount: number;
  note: string;
}

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

export default function WeeklyCashFlowTracker({ userId, onBack, onXP }: Props) {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [started, setStarted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newAmount, setNewAmount] = useState(0);
  const [newCategory, setNewCategory] = useState<typeof CATEGORIES[number]>("Food");
  const [newNote, setNewNote] = useState("");
  const [saved, setSaved] = useState(false);

  // Simulate 4 past weeks for the graph
  const [pastWeeks] = useState(() => [
    Math.random() * 0.3 + 0.7,
    Math.random() * 0.3 + 0.7,
    Math.random() * 0.3 + 0.65,
    0, // current week placeholder
  ]);

  const weeklyTarget = monthlyBudget / 4.3;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remainingBudget = weeklyTarget - totalSpent;
  const spentPct = weeklyTarget > 0 ? (totalSpent / weeklyTarget) * 100 : 0;

  const statusColor = spentPct > 100 ? "text-destructive" : spentPct > 90 ? "text-warning" : "text-accent";
  const statusBg = spentPct > 100 ? "bg-destructive/10" : spentPct > 90 ? "bg-warning/10" : "bg-accent/10";

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES.map(c => ({ name: c, spent: map[c] || 0, pct: weeklyTarget > 0 ? ((map[c] || 0) / weeklyTarget) * 100 : 0 }));
  }, [expenses, weeklyTarget]);

  const weekChartData = pastWeeks.map((w, i) => ({
    name: i === 3 ? "This Week" : `Week ${i + 1}`,
    spent: i === 3 ? totalSpent : Math.round(weeklyTarget * w),
    target: Math.round(weeklyTarget),
  }));

  function addExpense() {
    if (newAmount <= 0) return;
    setExpenses(prev => [...prev, { category: newCategory, amount: newAmount, note: newNote }]);
    setNewAmount(0);
    setNewNote("");
  }

  async function saveTracker() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "weekly_cashflow",
      inputs: { monthlyBudget } as Json,
      outputs: { weeklyTarget: Math.round(weeklyTarget), totalSpent, expenses, spentPct: Math.round(spentPct) } as unknown as Json,
    });
    setSaved(true);
    toast({ title: "Weekly tracker saved!" });
    onXP();
  }

  if (!started) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Weekly Cash Flow Tracker</h1>
            <p className="text-muted-foreground text-sm">Prevent silent overspending</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Monthly Budget (Rs)</Label>
              <Input type="number" value={monthlyBudget || ""} onChange={e => setMonthlyBudget(Number(e.target.value))} placeholder="e.g. 60,000" className="text-lg" />
            </div>
            {monthlyBudget > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Your Weekly Target</p>
                <p className="text-3xl font-bold font-display text-primary">{formatRs(Math.round(monthlyBudget / 4.3))}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStarted(true)} disabled={monthlyBudget <= 0} className="w-full">Start Tracking</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="font-display text-xl font-bold">Weekly Cash Flow</h1>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Weekly Target</p>
          <p className="text-xl font-bold font-display">{formatRs(Math.round(weeklyTarget))}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className={`text-xl font-bold font-display ${statusColor}`}>{formatRs(totalSpent)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`text-xl font-bold font-display ${remainingBudget >= 0 ? "text-accent" : "text-destructive"}`}>{formatRs(Math.round(remainingBudget))}</p>
        </CardContent></Card>
      </div>

      {/* Category progress bars */}
      <Card>
        <CardHeader><CardTitle className="text-base">Spending by Category</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {categoryBreakdown.filter(c => c.spent > 0).map(c => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{c.name}</span>
                <span className="font-medium">{formatRs(c.spent)}</span>
              </div>
              <Progress value={Math.min(100, c.pct)} className="h-2" />
            </div>
          ))}
          {categoryBreakdown.every(c => c.spent === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No expenses added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick add */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Add Expense</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <Badge key={c} variant={newCategory === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setNewCategory(c)}>{c}</Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="number" placeholder="Amount" value={newAmount || ""} onChange={e => setNewAmount(Number(e.target.value))} className="w-32" />
            <Input placeholder="Note (optional)" value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1" />
            <Button onClick={addExpense} size="sm">Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance summary */}
      <Card className={statusBg}>
        <CardContent className="pt-6 text-center space-y-2">
          {spentPct <= 90 ? <TrendingDown className="h-8 w-8 mx-auto text-accent" /> : <TrendingUp className="h-8 w-8 mx-auto text-destructive" />}
          <p className={`text-lg font-bold ${statusColor}`}>
            {spentPct <= 90 ? "On Track!" : spentPct <= 100 ? "Almost at limit!" : "Over budget!"}
          </p>
          <p className="text-sm text-muted-foreground">
            You've spent {Math.round(spentPct)}% of your weekly budget. {spentPct <= 85 ? "Stay disciplined." : "Review your spending."}
          </p>
        </CardContent>
      </Card>

      {/* Last 4 weeks chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Last 4 Weeks</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" fontSize={11} className="fill-muted-foreground" />
                <YAxis fontSize={11} className="fill-muted-foreground" />
                <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                  {weekChartData.map((d, i) => (
                    <Cell key={i} fill={d.spent > d.target ? "hsl(0, 72%, 51%)" : "hsl(152, 55%, 42%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveTracker} className="w-full gap-2" disabled={saved}>
        {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Weekly Report"}
      </Button>
    </div>
  );
}
