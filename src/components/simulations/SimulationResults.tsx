import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw, ChevronRight, ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import type { Scenario } from "@/data/scenarios";

interface Decision {
  stepIndex: number;
  choiceIndex: number;
  score: number;
}

interface SimulationResultsProps {
  scenario: Scenario;
  decisions: Decision[];
  score: number;
  insights: string;
  onReplay: () => void;
  onBack: () => void;
}

function formatRs(amount: number): string {
  const abs = Math.abs(amount);
  return `${amount < 0 ? "-" : ""}Rs ${abs.toLocaleString()}`;
}

export function SimulationResults({ scenario, decisions, score, insights, onReplay, onBack }: SimulationResultsProps) {
  const scoreColor = score >= 80 ? "text-primary" : score >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive";

  // Calculate sub-scores
  const maxPerStep = 10;
  const totalSteps = scenario.steps.length;
  const smartSpending = decisions.filter(d => {
    const choice = scenario.steps[d.stepIndex].choices[d.choiceIndex];
    return (choice.risk === "low");
  }).length;
  const smartSpendingPct = Math.round((smartSpending / totalSteps) * 100);

  const highScoreDecisions = decisions.filter(d => d.score >= 8).length;
  const savingsDisciplinePct = Math.round((highScoreDecisions / totalSteps) * 100);

  const riskMgmt = decisions.filter(d => {
    const choice = scenario.steps[d.stepIndex].choices[d.choiceIndex];
    return choice.risk !== "high";
  }).length;
  const riskMgmtPct = Math.round((riskMgmt / totalSteps) * 100);

  // Calculate optimal vs actual balance
  const actualBalance = decisions.reduce((sum, d) => {
    const choice = scenario.steps[d.stepIndex].choices[d.choiceIndex];
    return sum + (choice.impact ?? 0);
  }, scenario.startingBalance);

  const optimalBalance = scenario.steps.reduce((sum, step) => {
    const best = step.choices.reduce((max, c) => (c.score > max.score ? c : max), step.choices[0]);
    return sum + (best.impact ?? 0);
  }, scenario.startingBalance);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold">Your Financial Journey — Complete</h1>
        <p className="text-muted-foreground">{scenario.title}</p>
      </div>

      {/* Score Ring */}
      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <circle
                cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--primary))"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display text-3xl font-bold ${scoreColor}`}>{score}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">{insights}</p>
        </CardContent>
      </Card>

      {/* Sub-scores */}
      <div className="grid grid-cols-3 gap-3">
        <SubScore label="Smart Spending" value={smartSpendingPct} />
        <SubScore label="Savings Discipline" value={savingsDisciplinePct} />
        <SubScore label="Risk Management" value={riskMgmtPct} />
      </div>

      {/* Balance comparison */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Your ending position</p>
              <p className={`font-display text-xl font-bold ${actualBalance >= 0 ? "" : "text-destructive"}`}>{formatRs(actualBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Optimal path</p>
              <p className="font-display text-xl font-bold text-primary">{formatRs(optimalBalance)}</p>
            </div>
          </div>
          {optimalBalance > actualBalance && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              The optimal decisions would have left you {formatRs(optimalBalance - actualBalance)} better off.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Decision Review */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Decision Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {decisions.map((d, i) => {
            const step = scenario.steps[d.stepIndex];
            const choice = step.choices[d.choiceIndex];
            const bestChoice = step.choices.reduce((max, c) => (c.score > max.score ? c : max), step.choices[0]);
            const isOptimal = d.score === bestChoice.score;

            return (
              <div key={i} className={`p-4 rounded-lg border ${isOptimal ? "border-primary/20 bg-primary/5" : "border-border bg-secondary/30"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {isOptimal ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    {step.title}
                  </span>
                  <Badge variant={d.score >= 8 ? "default" : d.score >= 5 ? "secondary" : "destructive"}>
                    {d.score}/{maxPerStep}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{choice.text}</p>
                {!isOptimal && (
                  <div className="mt-2 pl-6 border-l-2 border-primary/20">
                    <p className="text-xs text-primary">Optimal: {bestChoice.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bestChoice.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onReplay} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Retry to Beat Your Score
        </Button>
        <Button onClick={onBack} className="gap-2">
          Continue <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-primary" : value >= 40 ? "text-[hsl(var(--warning))]" : "text-destructive";
  return (
    <Card className="card-hover">
      <CardContent className="pt-5 text-center">
        <p className={`font-display text-2xl font-bold ${color}`}>{value}%</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        <Progress value={value} className="mt-2 h-1.5" />
      </CardContent>
    </Card>
  );
}
