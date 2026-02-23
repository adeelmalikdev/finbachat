import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gamepad2, ChevronRight, Trophy, Wallet, Zap, AlertTriangle, ShieldCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import BudgetSimulator from "./BudgetSimulator";

import { SCENARIOS, type Scenario, type Choice } from "@/data/scenarios";
import { ScenarioCard } from "@/components/simulations/ScenarioCard";
import { SimulationDashboard } from "@/components/simulations/SimulationDashboard";
import { SimulationResults } from "@/components/simulations/SimulationResults";

interface SessionRecord {
  id: string;
  simulation_type: string;
  status: string;
  total_score: number | null;
  insights: string | null;
  completed_at: string | null;
  started_at: string;
  decisions: Json;
}

type ViewState = "catalog" | "playing" | "result";

export default function Simulations() {
  usePageTitle("Simulations");
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [view, setView] = useState<ViewState>("catalog");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [decisions, setDecisions] = useState<{ stepIndex: number; choiceIndex: number; score: number }[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pastSessions, setPastSessions] = useState<SessionRecord[]>([]);
  const [latestResult, setLatestResult] = useState<{ score: number; total: number; insights: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Running balance for the dashboard
  const [runningBalance, setRunningBalance] = useState(0);
  const [cumulativeXP, setCumulativeXP] = useState(0);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  async function loadSessions() {
    const { data } = await supabase
      .from("simulation_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false });
    setPastSessions((data ?? []) as SessionRecord[]);
  }

  function startScenario(scenario: Scenario) {
    setActiveScenario(scenario);
    setStepIndex(0);
    setDecisions([]);
    setSelectedChoice(null);
    setShowFeedback(false);
    setRunningBalance(scenario.startingBalance);
    setCumulativeXP(0);
    setView("playing");
  }

  function confirmChoice() {
    if (selectedChoice === null || !activeScenario) return;
    const step = activeScenario.steps[stepIndex];
    const choice = step.choices[selectedChoice];
    setDecisions((prev) => [...prev, { stepIndex, choiceIndex: selectedChoice, score: choice.score }]);

    // Update balance
    if (choice.impact) {
      setRunningBalance(prev => prev + choice.impact!);
    }

    // Update XP
    const stepXP = choice.score >= 8 ? 25 : choice.score >= 5 ? 15 : 5;
    setCumulativeXP(prev => prev + stepXP);

    setShowFeedback(true);
  }

  function nextStep() {
    if (!activeScenario) return;
    if (stepIndex < activeScenario.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      finishSimulation();
    }
  }

  async function finishSimulation() {
    if (!activeScenario || !user) return;
    setSubmitting(true);

    const totalScore = decisions.reduce((sum, d) => sum + d.score, 0);
    const maxScore = activeScenario.steps.length * 10;
    const pct = Math.round((totalScore / maxScore) * 100);

    let insights: string;
    if (pct >= 80) insights = "Excellent decision-making! You demonstrated strong financial judgment across all scenarios.";
    else if (pct >= 60) insights = "Good job! You made mostly sound decisions. Review the areas where you could improve.";
    else if (pct >= 40) insights = "You're on the right track but some decisions could be improved. Consider revisiting the learning materials.";
    else insights = "There's room for improvement. Focus on building foundational financial knowledge before retaking this simulation.";

    const decisionsJson: Json = decisions.map((d) => ({
      stepIndex: d.stepIndex,
      choiceIndex: d.choiceIndex,
      score: d.score,
    }));

    await supabase.from("simulation_sessions").insert({
      user_id: user.id,
      simulation_type: activeScenario.id,
      status: "completed",
      total_score: pct,
      insights,
      decisions: decisionsJson,
      completed_at: new Date().toISOString(),
    });

    setLatestResult({ score: pct, total: maxScore, insights });
    setView("result");
    setSubmitting(false);
    await awardXP("simulation_complete", `${activeScenario.title} (Score: ${pct}%)`);
    toast({ title: "+75 XP!", description: "You earned XP for completing a simulation." });
    await loadSessions();
  }

  // --- Catalog ---
  if (view === "catalog") {
    return (
      <div className="space-y-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <CardContent className="relative py-8 px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Financial Simulations</h1>
                <p className="text-sm text-muted-foreground">Live through real financial scenarios. Watch your money move. Learn from consequences.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Zap className="h-3 w-3" /> +75 XP per scenario
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                {SCENARIOS.length} scenarios available
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                🇵🇰 Pakistan-specific
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="scenarios">
          <TabsList>
            <TabsTrigger value="scenarios" className="gap-1.5">
              <Gamepad2 className="h-4 w-4" /> Scenarios
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-1.5">
              <Wallet className="h-4 w-4" /> Budget Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6 mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCENARIOS.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  sessions={pastSessions}
                  onStart={() => startScenario(scenario)}
                />
              ))}
            </div>

            {/* Session History */}
            {pastSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Session History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pastSessions.slice(0, 10).map((s) => {
                      const scenario = SCENARIOS.find((sc) => sc.id === s.simulation_type);
                      const scoreColor = (s.total_score ?? 0) >= 80 ? "text-primary" : (s.total_score ?? 0) >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive";
                      return (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <Badge variant={s.status === "completed" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                            <span className="text-sm font-medium">{scenario?.title ?? s.simulation_type}</span>
                            <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`font-display font-bold text-sm ${scoreColor}`}>{s.total_score ?? 0}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            <BudgetSimulator />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // --- Playing ---
  if (view === "playing" && activeScenario) {
    const step = activeScenario.steps[stepIndex];
    const healthScore = Math.min(100, Math.max(0,
      decisions.reduce((sum, d) => sum + d.score * 10, 50)
    ));
    const savingsRate = activeScenario.monthlyIncome > 0
      ? Math.max(0, Math.round(((runningBalance - activeScenario.startingBalance) / activeScenario.monthlyIncome) * 100))
      : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Persistent Dashboard */}
        <SimulationDashboard
          balance={runningBalance}
          monthlyIncome={activeScenario.monthlyIncome}
          monthlyExpenses={0}
          savingsRate={savingsRate}
          healthScore={healthScore}
          currentStep={stepIndex + 1}
          totalSteps={activeScenario.steps.length}
          xpEarned={cumulativeXP}
          label={`Decision ${stepIndex + 1} of ${activeScenario.steps.length}`}
        />

        {/* Scene Card */}
        <Card className="border-primary/10">
          <CardContent className="pt-6">
            <Badge variant="outline" className="mb-3 text-[10px]">{activeScenario.title}</Badge>
            <h2 className="font-display text-lg font-bold mb-3">{step.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.narrative}</p>
          </CardContent>
        </Card>

        {/* Decision Cards */}
        <div className="space-y-3">
          {step.choices.map((choice, i) => {
            const isSelected = selectedChoice === i;
            const showResult = showFeedback && isSelected;
            const riskColors: Record<string, string> = {
              low: "bg-primary/10 text-primary border-primary/20",
              medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20",
              high: "bg-destructive/10 text-destructive border-destructive/20",
            };

            return (
              <button
                key={i}
                onClick={() => !showFeedback && setSelectedChoice(i)}
                disabled={showFeedback}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? showFeedback
                      ? choice.score >= 8
                        ? "border-primary bg-primary/5"
                        : choice.score >= 5
                        ? "border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5"
                        : "border-destructive bg-destructive/5"
                      : "border-primary bg-primary/5 -translate-y-1 shadow-[0_4px_20px_hsl(var(--primary)/0.1)]"
                    : "border-border bg-card hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_hsl(var(--primary)/0.05)]"
                } disabled:cursor-default`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{choice.text}</p>
                    {choice.impact != null && choice.impact !== 0 && (
                      <p className={`text-xs mt-1 font-medium ${choice.impact > 0 ? "text-primary" : "text-destructive"}`}>
                        {choice.impact > 0 ? "+" : ""}Rs {Math.abs(choice.impact).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {choice.risk && (
                    <Badge className={`text-[10px] shrink-0 ${riskColors[choice.risk]}`}>
                      {choice.risk === "low" ? "Low Risk" : choice.risk === "medium" ? "Medium Risk" : "High Risk"}
                    </Badge>
                  )}
                </div>
                {showResult && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      {choice.score >= 8 ? (
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-medium mb-1">Expert Insight</p>
                        <p className="text-xs text-muted-foreground">{choice.feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Floating feedback card */}
        {showFeedback && selectedChoice !== null && (
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
              step.choices[selectedChoice].score >= 8
                ? "border-primary/30 bg-primary/10 text-primary"
                : step.choices[selectedChoice].score >= 5
                ? "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}>
              {step.choices[selectedChoice].score >= 8 ? "💰 Smart move!" : step.choices[selectedChoice].score >= 5 ? "⚠️ Could be better" : "❌ Risky choice"}
              {step.choices[selectedChoice].impact != null && step.choices[selectedChoice].impact !== 0 && (
                <span className="font-bold">
                  {step.choices[selectedChoice].impact! > 0 ? "+" : ""}Rs {Math.abs(step.choices[selectedChoice].impact!).toLocaleString()}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setView("catalog")} className="text-muted-foreground">
            ← Exit
          </Button>
          {!showFeedback ? (
            <Button onClick={confirmChoice} disabled={selectedChoice === null} className="gap-1">
              Confirm Decision <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={submitting} className="gap-1">
              {stepIndex < activeScenario.steps.length - 1 ? (
                <>Next Decision <ChevronRight className="h-4 w-4" /></>
              ) : (
                <>{submitting ? "Saving..." : "See Results"} <Trophy className="h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // --- Result ---
  if (view === "result" && latestResult && activeScenario) {
    return (
      <SimulationResults
        scenario={activeScenario}
        decisions={decisions}
        score={latestResult.score}
        insights={latestResult.insights}
        onReplay={() => startScenario(activeScenario)}
        onBack={() => setView("catalog")}
      />
    );
  }

  return null;
}
