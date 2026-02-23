import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Info,
  Wallet, Home, Zap, Car, GraduationCap, CreditCard,
  UtensilsCrossed, Clapperboard, ShoppingBag, Tv
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString()}`;
}

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

const STEPS = ["Income", "Fixed Commitments", "Lifestyle Spending", "Results"] as const;

const PIE_COLORS = [
  "hsl(217, 72%, 45%)",
  "hsl(152, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(190, 70%, 45%)",
];

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help inline ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export default function SmartBudgetBuilder({ userId, onBack, onXP }: Props) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  // Step 1: Income
  const [primaryIncome, setPrimaryIncome] = useState(0);
  const [sideIncome, setSideIncome] = useState(0);
  const totalIncome = primaryIncome + sideIncome;

  // Step 2: Fixed commitments
  const [rent, setRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [transport, setTransport] = useState(0);
  const [education, setEducation] = useState(0);
  const [debt, setDebt] = useState(0);
  const totalFixed = rent + utilities + transport + education + debt;

  // Step 3: Lifestyle (sliders, max = remaining after fixed)
  const maxLifestyle = Math.max(0, totalIncome - totalFixed);
  const [food, setFood] = useState(0);
  const [entertainment, setEntertainment] = useState(0);
  const [shopping, setShopping] = useState(0);
  const [subscriptions, setSubscriptions] = useState(0);
  const totalLifestyle = food + entertainment + shopping + subscriptions;

  // Calculations
  const totalExpenses = totalFixed + totalLifestyle;
  const remaining = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;
  const spendingRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const healthScore = useMemo(() => {
    if (totalIncome === 0) return 0;
    let score = 50;
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 15) score += 15;
    else if (savingsRate >= 10) score += 5;
    else score -= 10;
    if (spendingRatio <= 70) score += 15;
    else if (spendingRatio <= 80) score += 5;
    else score -= 10;
    if (totalFixed / totalIncome <= 0.5) score += 10;
    return Math.max(0, Math.min(100, score));
  }, [totalIncome, savingsRate, spendingRatio, totalFixed]);

  const riskLevel = spendingRatio > 90 ? "critical" : spendingRatio > 80 ? "warning" : "healthy";

  const pieData = [
    { name: "Rent/Hostel", value: rent },
    { name: "Utilities", value: utilities },
    { name: "Transport", value: transport },
    { name: "Education", value: education },
    { name: "Debt", value: debt },
    { name: "Food", value: food },
    { name: "Entertainment", value: entertainment },
    { name: "Shopping", value: shopping },
    { name: "Subscriptions", value: subscriptions },
    { name: "Savings", value: Math.max(0, remaining) },
  ].filter(d => d.value > 0);

  const allPieColors = [...PIE_COLORS, "hsl(200, 50%, 55%)", "hsl(330, 60%, 50%)", "hsl(60, 70%, 45%)", "hsl(152, 70%, 35%)"];

  const sliderMax = Math.max(1, Math.round(maxLifestyle * 0.6));

  async function saveBudget() {
    if (!userId) return;
    const outputs = {
      primaryIncome, sideIncome, totalIncome,
      rent, utilities, transport, education, debt, totalFixed,
      food, entertainment, shopping, subscriptions, totalLifestyle,
      remaining, savingsRate: Math.round(savingsRate), spendingRatio: Math.round(spendingRatio), healthScore,
    } as unknown as Json;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "smart_budget_builder",
      inputs: { primaryIncome, sideIncome } as Json, outputs,
    });
    setSaved(true);
    toast({ title: "Budget saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Smart Budget Builder</h1>
          <p className="text-muted-foreground text-sm">Create clarity in less than 5 minutes</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-1">
            <div className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      {/* STEP 1: Income */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Monthly Income</CardTitle>
            <CardDescription>Enter all your income sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Income (Rs) <InfoTip text="Your main salary or wage after deductions" /></Label>
              <Input type="number" value={primaryIncome || ""} onChange={e => setPrimaryIncome(Number(e.target.value))} placeholder="e.g. 80,000" className="text-lg" />
            </div>
            <div>
              <Label>Side Income (Rs) <InfoTip text="Freelancing, part-time, or any extra earnings" /></Label>
              <Input type="number" value={sideIncome || ""} onChange={e => setSideIncome(Number(e.target.value))} placeholder="e.g. 15,000" className="text-lg" />
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">Total Monthly Income</p>
              <p className="text-3xl font-bold font-display text-primary">{formatRs(totalIncome)}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => setStep(1)} disabled={totalIncome <= 0} className="gap-2">Next <ArrowRight className="h-4 w-4" /></Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Fixed Commitments */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Fixed Commitments</CardTitle>
            <CardDescription>Monthly bills you must pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Rent / Hostel", value: rent, set: setRent, icon: Home, tip: "Monthly housing cost" },
              { label: "Utilities", value: utilities, set: setUtilities, icon: Zap, tip: "Electricity, water, internet, phone" },
              { label: "Transport", value: transport, set: setTransport, icon: Car, tip: "Commute, fuel, or public transport" },
              { label: "Tuition / Education", value: education, set: setEducation, icon: GraduationCap, tip: "Tuition fees, courses, books" },
              { label: "Debt Payments", value: debt, set: setDebt, icon: CreditCard, tip: "Loan EMIs, credit card minimums" },
            ].map(({ label, value, set, icon: Icon, tip }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Label className="w-36 text-sm shrink-0">{label} <InfoTip text={tip} /></Label>
                <Input type="number" value={value || ""} onChange={e => set(Number(e.target.value))} className="flex-1" />
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total Fixed</span>
              <span className="text-lg font-bold">{formatRs(totalFixed)}</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} className="gap-2">Next <ArrowRight className="h-4 w-4" /></Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Lifestyle Spending */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Lifestyle Spending</CardTitle>
            <CardDescription>Use sliders to estimate your variable expenses. Available: {formatRs(maxLifestyle)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Food", value: food, set: setFood, icon: UtensilsCrossed, tip: "Groceries, dining out, delivery" },
              { label: "Entertainment", value: entertainment, set: setEntertainment, icon: Clapperboard, tip: "Movies, outings, hobbies" },
              { label: "Shopping", value: shopping, set: setShopping, icon: ShoppingBag, tip: "Clothing, gadgets, personal items" },
              { label: "Subscriptions", value: subscriptions, set: setSubscriptions, icon: Tv, tip: "Netflix, Spotify, gym, apps" },
            ].map(({ label, value, set, icon: Icon, tip }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" /> {label} <InfoTip text={tip} />
                  </Label>
                  <span className="text-sm font-semibold">{formatRs(value)}</span>
                </div>
                <Slider value={[value]} min={0} max={sliderMax} step={500} onValueChange={([v]) => set(v)} />
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total Lifestyle</span>
              <span className="text-lg font-bold">{formatRs(totalLifestyle)}</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="gap-2">See Results <ArrowRight className="h-4 w-4" /></Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: Results */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Risk warnings */}
          {riskLevel === "critical" && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">Critical: Spending over 90%</p>
                <p className="text-xs text-muted-foreground">You're at financial risk. Reduce lifestyle spending immediately.</p>
              </div>
            </div>
          )}
          {riskLevel === "warning" && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-warning">Warning: Spending over 80%</p>
                <p className="text-xs text-muted-foreground">Consider reducing expenses to build a safety buffer.</p>
              </div>
            </div>
          )}
          {savingsRate < 15 && savingsRate >= 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold">Low Savings Rate ({Math.round(savingsRate)}%)</p>
                <p className="text-xs text-muted-foreground">Try reducing lifestyle spending by 5% to boost your savings.</p>
              </div>
            </div>
          )}

          {/* Health Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Financial Health Score</p>
                <p className={`text-6xl font-bold font-display ${healthScore >= 70 ? "text-accent" : healthScore >= 40 ? "text-warning" : "text-destructive"}`}>
                  {healthScore}
                </p>
                <p className="text-sm text-muted-foreground">out of 100</p>
                <Progress value={healthScore} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Budget Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={allPieColors[i % allPieColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary Numbers */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Remaining / Savings</p>
                  <p className={`text-2xl font-bold font-display ${remaining >= 0 ? "text-accent" : "text-destructive"}`}>{formatRs(remaining)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Savings Rate</p>
                  <p className={`text-2xl font-bold font-display ${savingsRate >= 15 ? "text-accent" : "text-warning"}`}>{Math.round(savingsRate)}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Spending Ratio</p>
                  <p className={`text-2xl font-bold font-display ${spendingRatio <= 80 ? "text-accent" : spendingRatio <= 90 ? "text-warning" : "text-destructive"}`}>{Math.round(spendingRatio)}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold font-display">{formatRs(totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Adjust</Button>
              <Button onClick={saveBudget} className="flex-1 gap-2" disabled={saved}>
                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Budget"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
