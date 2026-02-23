import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, CheckCircle2, Info, Clock, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(a: number) { return `Rs ${a.toLocaleString()}`; }

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

function calcPayoff(principal: number, annualRate: number, monthlyPayment: number) {
  if (monthlyPayment <= 0 || principal <= 0) return { months: 0, totalInterest: 0, totalPaid: 0 };
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600;

  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    const principalPaid = monthlyPayment - interest;
    if (principalPaid <= 0) return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
    balance -= principalPaid;
    months++;
  }

  return { months, totalInterest: Math.round(totalInterest), totalPaid: Math.round(principal + totalInterest) };
}

export default function DebtControlPlanner({ userId, onBack, onXP }: Props) {
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [minPayment, setMinPayment] = useState(0);
  const [extraPayment, setExtraPayment] = useState(0);
  const [saved, setSaved] = useState(false);

  const scenarioA = useMemo(() => calcPayoff(loanAmount, interestRate, minPayment), [loanAmount, interestRate, minPayment]);
  const extraAmount = minPayment + (extraPayment || Math.round(minPayment * 0.1));
  const scenarioB = useMemo(() => calcPayoff(loanAmount, interestRate, extraAmount), [loanAmount, interestRate, extraAmount]);

  const timeSaved = scenarioA.months - scenarioB.months;
  const interestSaved = scenarioA.totalInterest - scenarioB.totalInterest;

  const chartData = [
    { name: "Minimum Only", interest: scenarioA.totalInterest, principal: loanAmount },
    { name: "With Extra", interest: scenarioB.totalInterest, principal: loanAmount },
  ];

  const hasValidInput = loanAmount > 0 && interestRate > 0 && minPayment > 0 && scenarioA.months < Infinity;

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "debt_control_planner",
      inputs: { loanAmount, interestRate, minPayment, extraPayment } as Json,
      outputs: { scenarioA, scenarioB, timeSaved, interestSaved } as unknown as Json,
    });
    setSaved(true);
    toast({ title: "Debt plan saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Debt Control Planner</h1>
          <p className="text-muted-foreground text-sm">Show the cost of delay</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loan Amount (Rs)</Label>
              <Input type="number" value={loanAmount || ""} onChange={e => setLoanAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label>Interest Rate (% annual)</Label>
              <Input type="number" value={interestRate || ""} onChange={e => setInterestRate(Number(e.target.value))} step={0.5} />
            </div>
            <div>
              <Label>Minimum Monthly Payment (Rs)</Label>
              <Input type="number" value={minPayment || ""} onChange={e => setMinPayment(Number(e.target.value))} />
            </div>
            <div>
              <Label>Extra Payment (Rs, optional)</Label>
              <Input type="number" value={extraPayment || ""} onChange={e => setExtraPayment(Number(e.target.value))} placeholder={`Default: +${Math.round(minPayment * 0.1)}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasValidInput && (
        <>
          {/* Two-column comparison */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Scenario A: Minimum Only</CardTitle>
                <p className="text-xs text-muted-foreground">{formatRs(minPayment)}/mo</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold font-display">{Math.floor(scenarioA.months / 12)}y {scenarioA.months % 12}m</span>
                </div>
                <p className="text-sm">Total Interest: <span className="font-semibold text-destructive">{formatRs(scenarioA.totalInterest)}</span></p>
                <p className="text-sm">Total Paid: <span className="font-semibold">{formatRs(scenarioA.totalPaid)}</span></p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-primary">Scenario B: With Extra</CardTitle>
                <p className="text-xs text-muted-foreground">{formatRs(extraAmount)}/mo</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold font-display text-primary">{Math.floor(scenarioB.months / 12)}y {scenarioB.months % 12}m</span>
                </div>
                <p className="text-sm">Total Interest: <span className="font-semibold text-accent">{formatRs(scenarioB.totalInterest)}</span></p>
                <p className="text-sm">Total Paid: <span className="font-semibold">{formatRs(scenarioB.totalPaid)}</span></p>
              </CardContent>
            </Card>
          </div>

          {/* Savings highlight */}
          <Card className="bg-accent/5 border-accent/30">
            <CardContent className="pt-6 text-center space-y-2">
              <TrendingDown className="h-8 w-8 mx-auto text-accent" />
              <p className="text-sm text-muted-foreground">By paying just {formatRs(extraAmount - minPayment)} extra/month</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold font-display text-accent">{timeSaved} months</p>
                  <p className="text-xs text-muted-foreground">Time Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-accent">{formatRs(interestSaved)}</p>
                  <p className="text-xs text-muted-foreground">Interest Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Interest Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" fontSize={11} className="fill-muted-foreground" />
                    <YAxis fontSize={11} className="fill-muted-foreground" />
                    <Legend />
                    <Bar dataKey="principal" name="Principal" fill="hsl(217, 72%, 45%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interest" name="Interest" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveResult} className="w-full gap-2" disabled={saved}>
                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Debt Plan"}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
