import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Target, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(a: number) { return `Rs ${a.toLocaleString()}`; }

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

export default function SavingsGoalPlanner({ userId, onBack, onXP }: Props) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [deadlineMonths, setDeadlineMonths] = useState(12);
  const [currentSaved, setCurrentSaved] = useState(0);
  const [saved, setSaved] = useState(false);

  const remaining = Math.max(0, targetAmount - currentSaved);
  const requiredMonthly = deadlineMonths > 0 ? remaining / deadlineMonths : 0;
  const incomePct = monthlyIncome > 0 ? (requiredMonthly / monthlyIncome) * 100 : 0;
  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((currentSaved / targetAmount) * 100)) : 0;

  const feasibility = incomePct <= 20 ? "High" : incomePct <= 35 ? "Moderate" : "Low";
  const feasColor = feasibility === "High" ? "text-accent" : feasibility === "Moderate" ? "text-warning" : "text-destructive";

  // Milestones: 25%, 50%, 75%, 100%
  const milestones = [25, 50, 75, 100].map(pct => ({
    pct,
    amount: Math.round(targetAmount * pct / 100),
    reached: progressPct >= pct,
  }));

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "savings_goal_planner",
      inputs: { goalName, targetAmount, deadlineMonths, monthlyIncome, currentSaved } as Json,
      outputs: { requiredMonthly: Math.round(requiredMonthly), feasibility, incomePct: Math.round(incomePct), progressPct } as unknown as Json,
    });
    setSaved(true);
    toast({ title: "Goal plan saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Savings Goal Planner</h1>
          <p className="text-muted-foreground text-sm">Convert dreams into numbers</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Goal Name</Label>
            <Input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. New Laptop, Vacation, Emergency Fund" className="text-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Amount (Rs)</Label>
              <Input type="number" value={targetAmount || ""} onChange={e => setTargetAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label>Already Saved (Rs)</Label>
              <Input type="number" value={currentSaved || ""} onChange={e => setCurrentSaved(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Monthly Income (Rs)</Label>
            <Input type="number" value={monthlyIncome || ""} onChange={e => setMonthlyIncome(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Deadline</Label>
              <span className="text-sm font-semibold">{deadlineMonths} months ({(deadlineMonths / 12).toFixed(1)} years)</span>
            </div>
            <Slider value={[deadlineMonths]} min={1} max={60} step={1} onValueChange={([v]) => setDeadlineMonths(v)} />
          </div>
        </CardContent>
      </Card>

      {targetAmount > 0 && goalName && (
        <>
          {/* Goal Card */}
          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full" />
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">{goalName}</h3>
                  <p className="text-sm text-muted-foreground">{formatRs(targetAmount)} in {deadlineMonths} months</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatRs(currentSaved)} saved</span>
                  <span>{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-3" />
              </div>

              {/* Milestones */}
              <div className="flex justify-between">
                {milestones.map(m => (
                  <div key={m.pct} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto transition-colors ${m.reached ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {m.pct}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatRs(m.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground">Required Monthly Saving</p>
                <p className="text-2xl font-bold font-display">{formatRs(Math.round(requiredMonthly))}</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round(incomePct)}% of income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground">Feasibility</p>
                <p className={`text-2xl font-bold font-display ${feasColor}`}>{feasibility}</p>
                <Badge variant={feasibility === "High" ? "default" : "secondary"} className="mt-1">
                  {feasibility === "High" ? "Very achievable" : feasibility === "Moderate" ? "Doable with discipline" : "Consider extending deadline"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {feasibility === "Low" && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
              <p className="text-sm font-medium">💡 Try extending your deadline to reduce monthly pressure</p>
              <p className="text-xs text-muted-foreground mt-1">Use the slider above to see how different timelines affect feasibility</p>
            </div>
          )}

          <Button onClick={saveResult} className="w-full gap-2" disabled={saved}>
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Goal Plan"}
          </Button>
        </>
      )}
    </div>
  );
}
