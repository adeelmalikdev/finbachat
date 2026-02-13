import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, PiggyBank, ShieldCheck, TrendingUp, ArrowLeft, Plus, Trash2,
  Target, BarChart3, CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

type ActiveTool = null | "budget" | "savings" | "emergency" | "risk";

function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString()}`;
}

async function loadLastResult(userId: string, toolName: string) {
  const { data } = await supabase
    .from("tool_results")
    .select("inputs, outputs")
    .eq("user_id", userId)
    .eq("tool_name", toolName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

const TOOL_META = [
  { id: "budget" as const, title: "Budget Planner", desc: "Track income and expenses with the 50/30/20 rule", icon: Calculator },
  { id: "savings" as const, title: "Savings Calculator", desc: "Plan goal-based savings with projections", icon: PiggyBank },
  { id: "emergency" as const, title: "Emergency Fund", desc: "Calculate your recommended safety net", icon: ShieldCheck },
  { id: "risk" as const, title: "Risk Profile", desc: "Assess your investment risk tolerance", icon: TrendingUp },
];

export default function Tools() {
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  const onXP = async (toolName: string) => {
    await awardXP("tool_use", toolName);
    toast({ title: "+25 XP!", description: "You earned XP for using a financial tool." });
  };

  if (activeTool === "budget") return <BudgetPlanner userId={user?.id} onBack={() => setActiveTool(null)} onXP={() => onXP("Budget Planner")} />;
  if (activeTool === "savings") return <SavingsCalculator userId={user?.id} onBack={() => setActiveTool(null)} onXP={() => onXP("Savings Calculator")} />;
  if (activeTool === "emergency") return <EmergencyFund userId={user?.id} onBack={() => setActiveTool(null)} onXP={() => onXP("Emergency Fund")} />;
  if (activeTool === "risk") return <RiskProfile userId={user?.id} onBack={() => setActiveTool(null)} onXP={() => onXP("Risk Profile")} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Financial Tools</h1>
        <p className="text-muted-foreground">Practical calculators and planners to improve your finances.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOL_META.map((tool) => (
          <Card key={tool.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40" onClick={() => setActiveTool(tool.id)}>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <tool.icon className="h-5 w-5 text-primary" /> {tool.title}
              </CardTitle>
              <CardDescription>{tool.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">Open Tool <TrendingUp className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===================== BUDGET PLANNER =====================
interface BudgetItem { label: string; amount: number }

function BudgetPlanner({ userId, onBack, onXP }: { userId?: string; onBack: () => void; onXP: () => void }) {
  const [income, setIncome] = useState(0);
  const [needs, setNeeds] = useState<BudgetItem[]>([{ label: "Rent/Mortgage", amount: 0 }, { label: "Utilities", amount: 0 }, { label: "Groceries", amount: 0 }]);
  const [wants, setWants] = useState<BudgetItem[]>([{ label: "Entertainment", amount: 0 }, { label: "Dining Out", amount: 0 }]);
  const [savings, setSavings] = useState<BudgetItem[]>([{ label: "Emergency Fund", amount: 0 }, { label: "Investments", amount: 0 }]);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadLastResult(userId, "budget_planner").then((data) => {
      if (data?.outputs) {
        const o = data.outputs as any;
        if (o.income) setIncome(o.income);
        if (o.needs?.length) setNeeds(o.needs);
        if (o.wants?.length) setWants(o.wants);
        if (o.savings?.length) setSavings(o.savings);
        setLoaded(true);
      }
    });
  }, [userId]);

  const totalNeeds = needs.reduce((s, i) => s + i.amount, 0);
  const totalWants = wants.reduce((s, i) => s + i.amount, 0);
  const totalSavings = savings.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = totalNeeds + totalWants + totalSavings;
  const remaining = income - totalExpenses;

  const needsPct = income > 0 ? Math.round((totalNeeds / income) * 100) : 0;
  const wantsPct = income > 0 ? Math.round((totalWants / income) * 100) : 0;
  const savingsPct = income > 0 ? Math.round((totalSavings / income) * 100) : 0;

  async function saveBudget() {
    if (!userId) return;
    const outputs = { income, needs: needs.map(i => ({ ...i })), wants: wants.map(i => ({ ...i })), savings: savings.map(i => ({ ...i })), totalNeeds, totalWants, totalSavings, remaining, needsPct, wantsPct, savingsPct } as unknown as Json;
    await supabase.from("tool_results").insert({ user_id: userId, tool_name: "budget_planner", inputs: { income } as Json, outputs });
    setSaved(true);
    toast({ title: "Budget saved!" });
    onXP();
  }

  function addItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>) {
    setter((prev) => [...prev, { label: "", amount: 0 }]);
  }
  function removeItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>, index: number) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }
  function updateItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>, index: number, field: "label" | "amount", value: string | number) {
    setter((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Budget Planner</h1>
          <p className="text-muted-foreground">Plan your monthly budget using the 50/30/20 rule.</p>
        </div>
      </div>

      {loaded && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          ✓ Loaded your last saved budget. Make changes and save again to update.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">Monthly Income (Rs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="number" placeholder="Enter monthly take-home pay" value={income || ""} onChange={(e) => { setIncome(Number(e.target.value)); setSaved(false); }} />
        </CardContent>
      </Card>

      <BudgetSection title="Needs (Target: 50%)" items={needs} setter={setNeeds} total={totalNeeds} pct={needsPct} target={50} onAdd={() => addItem(setNeeds)} onRemove={(i) => removeItem(setNeeds, i)} onUpdate={(i, f, v) => { updateItem(setNeeds, i, f, v); setSaved(false); }} />
      <BudgetSection title="Wants (Target: 30%)" items={wants} setter={setWants} total={totalWants} pct={wantsPct} target={30} onAdd={() => addItem(setWants)} onRemove={(i) => removeItem(setWants, i)} onUpdate={(i, f, v) => { updateItem(setWants, i, f, v); setSaved(false); }} />
      <BudgetSection title="Savings (Target: 20%)" items={savings} setter={setSavings} total={totalSavings} pct={savingsPct} target={20} onAdd={() => addItem(setSavings)} onRemove={(i) => removeItem(setSavings, i)} onUpdate={(i, f, v) => { updateItem(setSavings, i, f, v); setSaved(false); }} />

      {income > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span>Total Income</span><span className="font-semibold">{formatRs(income)}</span></div>
            <div className="flex justify-between text-sm"><span>Total Expenses</span><span className="font-semibold">{formatRs(totalExpenses)}</span></div>
            <div className={`flex justify-between text-sm font-semibold ${remaining >= 0 ? "text-green-600" : "text-destructive"}`}><span>Remaining</span><span>{formatRs(remaining)}</span></div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <PctIndicator label="Needs" pct={needsPct} target={50} />
              <PctIndicator label="Wants" pct={wantsPct} target={30} />
              <PctIndicator label="Savings" pct={savingsPct} target={20} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveBudget} className="w-full gap-2" disabled={saved}>
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Budget"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

function BudgetSection({ title, items, total, pct, target, onAdd, onRemove, onUpdate }: {
  title: string; items: BudgetItem[]; setter: any; total: number; pct: number; target: number;
  onAdd: () => void; onRemove: (i: number) => void; onUpdate: (i: number, f: "label" | "amount", v: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={Math.abs(pct - target) <= 5 ? "default" : "secondary"}>{pct}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Label" value={item.label} onChange={(e) => onUpdate(i, "label", e.target.value)} className="flex-1" />
            <Input type="number" placeholder="Amount" value={item.amount || ""} onChange={(e) => onUpdate(i, "amount", Number(e.target.value))} className="w-28" />
            <Button variant="ghost" size="icon" onClick={() => onRemove(i)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1 mt-1"><Plus className="h-3 w-3" /> Add Item</Button>
      </CardContent>
    </Card>
  );
}

function PctIndicator({ label, pct, target }: { label: string; pct: number; target: number }) {
  const isGood = Math.abs(pct - target) <= 5;
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${isGood ? "text-green-600" : "text-amber-600"}`}>{pct}%</div>
      <div className="text-xs text-muted-foreground">Target: {target}%</div>
    </div>
  );
}

// ===================== SAVINGS CALCULATOR =====================
function SavingsCalculator({ userId, onBack, onXP }: { userId?: string; onBack: () => void; onXP: () => void }) {
  const [goal, setGoal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [rate, setRate] = useState(5);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadLastResult(userId, "savings_calculator").then((data) => {
      if (data?.inputs) {
        const i = data.inputs as any;
        if (i.goal) setGoal(i.goal);
        if (i.current) setCurrent(i.current);
        if (i.monthly) setMonthly(i.monthly);
        if (i.rate !== undefined) setRate(i.rate);
        setLoaded(true);
      }
    });
  }, [userId]);

  const remainingAmt = Math.max(0, goal - current);
  const monthsNeeded = monthly > 0 ? Math.ceil(remainingAmt / monthly) : 0;
  const yearsMonths = monthsNeeded > 0 ? `${Math.floor(monthsNeeded / 12)}y ${monthsNeeded % 12}m` : "—";

  const projectionMonths = 60;
  const monthlyRate = rate / 100 / 12;
  const projections = Array.from({ length: projectionMonths + 1 }, (_, m) => {
    if (monthlyRate > 0) {
      return current * Math.pow(1 + monthlyRate, m) + monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
    }
    return current + monthly * m;
  });
  const monthToGoal = projections.findIndex((v) => v >= goal && goal > 0);
  const projectedYearsMonths = monthToGoal >= 0 ? `${Math.floor(monthToGoal / 12)}y ${monthToGoal % 12}m` : monthsNeeded > 0 ? yearsMonths : "—";

  const progressPct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "savings_calculator",
      inputs: { goal, current, monthly, rate } as Json,
      outputs: { remaining: remainingAmt, monthsNeeded, progressPct, projectedYearsMonths } as Json,
    });
    setSaved(true);
    toast({ title: "Savings plan saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Savings Calculator</h1>
          <p className="text-muted-foreground">Project how long it takes to reach your savings goal.</p>
        </div>
      </div>

      {loaded && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          ✓ Loaded your last saved plan. Make changes and save again to update.
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Savings Goal (Rs)</Label><Input type="number" value={goal || ""} onChange={(e) => { setGoal(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Current Savings (Rs)</Label><Input type="number" value={current || ""} onChange={(e) => { setCurrent(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Monthly Contribution (Rs)</Label><Input type="number" value={monthly || ""} onChange={(e) => { setMonthly(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate || ""} onChange={(e) => { setRate(Number(e.target.value)); setSaved(false); }} /></div>
          </div>
        </CardContent>
      </Card>

      {goal > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Projection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{progressPct}%</span></div>
              <Progress value={progressPct} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-display">{formatRs(remainingAmt)}</div>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
              <div>
                <div className="text-2xl font-bold font-display">{projectedYearsMonths}</div>
                <p className="text-xs text-muted-foreground">Time to Goal</p>
              </div>
              <div>
                <div className="text-2xl font-bold font-display">{formatRs(Math.round(projections[Math.min(projectionMonths, 12)]))}</div>
                <p className="text-xs text-muted-foreground">After 1 Year</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveResult} className="w-full" disabled={saved}>{saved ? "Saved ✓" : "Save Plan"}</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// ===================== EMERGENCY FUND =====================
function EmergencyFund({ userId, onBack, onXP }: { userId?: string; onBack: () => void; onXP: () => void }) {
  const [rent, setRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [food, setFood] = useState(0);
  const [transport, setTransport] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [other, setOther] = useState(0);
  const [currentFund, setCurrentFund] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadLastResult(userId, "emergency_fund").then((data) => {
      if (data?.inputs) {
        const i = data.inputs as any;
        if (i.rent) setRent(i.rent);
        if (i.utilities) setUtilities(i.utilities);
        if (i.food) setFood(i.food);
        if (i.transport) setTransport(i.transport);
        if (i.insurance) setInsurance(i.insurance);
        if (i.other) setOther(i.other);
        if (i.currentFund) setCurrentFund(i.currentFund);
        setLoaded(true);
      }
    });
  }, [userId]);

  const monthlyEssentials = rent + utilities + food + transport + insurance + other;
  const target3 = monthlyEssentials * 3;
  const target6 = monthlyEssentials * 6;
  const progress3 = target3 > 0 ? Math.min(100, Math.round((currentFund / target3) * 100)) : 0;
  const progress6 = target6 > 0 ? Math.min(100, Math.round((currentFund / target6) * 100)) : 0;
  const monthsCovered = monthlyEssentials > 0 ? (currentFund / monthlyEssentials).toFixed(1) : "0";

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "emergency_fund",
      inputs: { rent, utilities, food, transport, insurance, other, currentFund } as Json,
      outputs: { monthlyEssentials, target3, target6, monthsCovered, progress3, progress6 } as Json,
    });
    setSaved(true);
    toast({ title: "Emergency fund plan saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Emergency Fund Calculator</h1>
          <p className="text-muted-foreground">Find out how much you need for a solid safety net.</p>
        </div>
      </div>

      {loaded && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          ✓ Loaded your last saved data. Make changes and save again to update.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Essential Expenses (Rs)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Rent/Mortgage</Label><Input type="number" value={rent || ""} onChange={(e) => { setRent(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Utilities</Label><Input type="number" value={utilities || ""} onChange={(e) => { setUtilities(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Food/Groceries</Label><Input type="number" value={food || ""} onChange={(e) => { setFood(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Transportation</Label><Input type="number" value={transport || ""} onChange={(e) => { setTransport(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Insurance</Label><Input type="number" value={insurance || ""} onChange={(e) => { setInsurance(Number(e.target.value)); setSaved(false); }} /></div>
            <div><Label>Other Essentials</Label><Input type="number" value={other || ""} onChange={(e) => { setOther(Number(e.target.value)); setSaved(false); }} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Current Emergency Savings (Rs)</CardTitle></CardHeader>
        <CardContent>
          <Input type="number" value={currentFund || ""} onChange={(e) => { setCurrentFund(Number(e.target.value)); setSaved(false); }} placeholder="How much do you have saved?" />
        </CardContent>
      </Card>

      {monthlyEssentials > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Your Emergency Fund Target</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Monthly Essentials</div>
              <div className="text-3xl font-bold font-display">{formatRs(monthlyEssentials)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">3-Month Target</div>
                <div className="text-xl font-bold">{formatRs(target3)}</div>
                <Progress value={progress3} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{progress3}% funded</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">6-Month Target</div>
                <div className="text-xl font-bold">{formatRs(target6)}</div>
                <Progress value={progress6} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{progress6}% funded</div>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5">
              <span className="text-sm">Your current savings cover <strong>{monthsCovered} months</strong> of essential expenses.</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveResult} className="w-full" disabled={saved}>{saved ? "Saved ✓" : "Save Plan"}</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// ===================== RISK PROFILE =====================
const RISK_QUESTIONS = [
  { q: "How would you react if your investments dropped 20% in a month?", options: ["Sell everything immediately", "Sell some to reduce risk", "Hold and wait for recovery", "Buy more at lower prices"] },
  { q: "What is your primary investment goal?", options: ["Preserve my money", "Steady income with some growth", "Growth with moderate risk", "Maximum growth, high risk ok"] },
  { q: "How long do you plan to keep your money invested?", options: ["Less than 1 year", "1-3 years", "3-10 years", "10+ years"] },
  { q: "How much of your income can you afford to invest?", options: ["Very little — I need most for expenses", "A small amount after bills", "A moderate amount — I budget well", "A significant amount — I have surplus"] },
  { q: "How would you describe your investment experience?", options: ["None at all", "Some basic knowledge", "Moderate experience", "Very experienced"] },
];

function RiskProfile({ userId, onBack, onXP }: { userId?: string; onBack: () => void; onXP: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; profile: string; description: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadLastResult(userId, "risk_profile").then((data) => {
      if (data?.outputs) {
        const o = data.outputs as any;
        if (o.score !== undefined && o.profile && o.description) {
          setResult({ score: o.score, profile: o.profile, description: o.description });
          setLoaded(true);
        }
      }
      if (data?.inputs) {
        const i = data.inputs as any;
        if (i.answers) setAnswers(i.answers);
      }
    });
  }, [userId]);

  const allAnswered = Object.keys(answers).length === RISK_QUESTIONS.length;

  function calculate() {
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const maxScore = RISK_QUESTIONS.length * 3;
    const pct = Math.round((total / maxScore) * 100);

    let profile: string, description: string;
    if (pct <= 25) { profile = "Conservative"; description = "You prefer safety and stability. Focus on savings accounts, bonds, and low-risk investments."; }
    else if (pct <= 50) { profile = "Moderate-Conservative"; description = "You want some growth but prioritize capital preservation. A balanced mix of bonds and stocks suits you."; }
    else if (pct <= 75) { profile = "Moderate-Aggressive"; description = "You're comfortable with risk for higher returns. A stock-heavy portfolio with some bonds is appropriate."; }
    else { profile = "Aggressive"; description = "You seek maximum growth and can handle significant volatility. Growth stocks and alternative investments fit your style."; }

    setResult({ score: pct, profile, description });
  }

  async function saveResult2() {
    if (!userId || !result) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "risk_profile",
      inputs: { answers } as Json,
      outputs: result as unknown as Json,
    });
    setSaved(true);
    toast({ title: "Risk profile saved!" });
    onXP();
  }

  if (result) {
    const color = result.score <= 25 ? "text-blue-600" : result.score <= 50 ? "text-green-600" : result.score <= 75 ? "text-amber-600" : "text-destructive";
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="font-display text-2xl font-bold">Your Risk Profile</h1>
        </div>
        {loaded && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            ✓ Showing your last saved risk profile. Retake to update.
          </div>
        )}
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <BarChart3 className="h-10 w-10 text-primary mx-auto" />
            <div className={`text-3xl font-bold font-display ${color}`}>{result.profile}</div>
            <Progress value={result.score} className="h-3 max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{result.description}</p>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); setSaved(false); setLoaded(false); }}>Retake</Button>
            <Button onClick={saveResult2} disabled={saved}>{saved ? "Saved ✓" : "Save Result"}</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Risk Profile Assessment</h1>
          <p className="text-muted-foreground">Discover your investment risk tolerance.</p>
        </div>
      </div>

      {RISK_QUESTIONS.map((rq, qi) => (
        <Card key={qi}>
          <CardHeader>
            <CardTitle className="text-base font-display">{qi + 1}. {rq.q}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={answers[qi]?.toString() ?? ""} onValueChange={(v) => setAnswers((prev) => ({ ...prev, [qi]: Number(v) }))}>
              {rq.options.map((opt, oi) => (
                <div key={oi} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={oi.toString()} id={`rq${qi}-${oi}`} />
                  <Label htmlFor={`rq${qi}-${oi}`} className="flex-1 cursor-pointer text-sm">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Button onClick={calculate} disabled={!allAnswered} className="w-full">
        Calculate Risk Profile
      </Button>
    </div>
  );
}
