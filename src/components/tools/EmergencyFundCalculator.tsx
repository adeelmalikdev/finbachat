import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, CheckCircle2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(a: number) { return `Rs ${a.toLocaleString()}`; }

type Stability = "stable" | "freelance" | "irregular";

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

const MILESTONES = [1, 2, 3, 4, 5, 6];

export default function EmergencyFundCalculator({ userId, onBack, onXP }: Props) {
  const [essentials, setEssentials] = useState(0);
  const [stability, setStability] = useState<Stability>("stable");
  const [monthlySaving, setMonthlySaving] = useState(0);
  const [currentFund, setCurrentFund] = useState(0);
  const [saved, setSaved] = useState(false);

  const recommendedMonths = stability === "stable" ? 3 : 6;
  const requiredFund = essentials * recommendedMonths;
  const timeToBuild = monthlySaving > 0 ? Math.ceil((requiredFund - currentFund) / monthlySaving) : 0;
  const progressPct = requiredFund > 0 ? Math.min(100, Math.round((currentFund / requiredFund) * 100)) : 0;
  const monthsCovered = essentials > 0 ? currentFund / essentials : 0;

  const safetyLevel = monthsCovered >= recommendedMonths ? "Safe" : monthsCovered >= recommendedMonths / 2 ? "Building" : "Vulnerable";
  const safetyColor = safetyLevel === "Safe" ? "text-accent" : safetyLevel === "Building" ? "text-warning" : "text-destructive";

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "emergency_fund_calc",
      inputs: { essentials, stability, monthlySaving, currentFund } as Json,
      outputs: { requiredFund, timeToBuild, progressPct, safetyLevel } as unknown as Json,
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
          <p className="text-muted-foreground text-sm">Create safety buffer awareness</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label>Monthly Essential Expenses (Rs)</Label>
            <Input type="number" value={essentials || ""} onChange={e => setEssentials(Number(e.target.value))} placeholder="Rent + food + utilities + transport" className="text-lg" />
            <p className="text-xs text-muted-foreground mt-1">Only include expenses you can't avoid</p>
          </div>

          <div>
            <Label className="mb-2 block">Income Stability</Label>
            <RadioGroup value={stability} onValueChange={v => setStability(v as Stability)} className="flex gap-4">
              {[
                { value: "stable", label: "Stable", desc: "Salaried job" },
                { value: "freelance", label: "Freelance", desc: "Contract work" },
                { value: "irregular", label: "Irregular", desc: "Variable income" },
              ].map(o => (
                <Label key={o.value} className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${stability === o.value ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value={o.value} />
                  <div>
                    <p className="text-sm font-medium">{o.label}</p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Emergency Fund (Rs)</Label>
              <Input type="number" value={currentFund || ""} onChange={e => setCurrentFund(Number(e.target.value))} />
            </div>
            <div>
              <Label>Monthly Saving Capacity (Rs)</Label>
              <Input type="number" value={monthlySaving || ""} onChange={e => setMonthlySaving(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {essentials > 0 && (
        <>
          {/* Safety Level */}
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <ShieldCheck className={`h-12 w-12 mx-auto ${safetyColor}`} />
              <div>
                <Badge variant={safetyLevel === "Safe" ? "default" : "secondary"} className="text-sm">{safetyLevel}</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  You have {monthsCovered.toFixed(1)} months of essential expenses covered
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress with milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Progress to {recommendedMonths}-Month Fund</CardTitle>
              <CardDescription>Target: {formatRs(requiredFund)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatRs(currentFund)}</span>
                  <span className="font-semibold">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-4" />
              </div>

              {/* Milestone markers */}
              <div className="flex justify-between">
                {MILESTONES.slice(0, recommendedMonths).map(m => {
                  const milestoneAmt = essentials * m;
                  const reached = currentFund >= milestoneAmt;
                  return (
                    <div key={m} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${reached ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {m}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m}mo</p>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Still Needed</p>
                  <p className="text-xl font-bold font-display">{formatRs(Math.max(0, requiredFund - currentFund))}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Time to Build</p>
                  <p className="text-xl font-bold font-display">{timeToBuild > 0 ? `${timeToBuild} months` : "—"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveResult} className="w-full gap-2" disabled={saved}>
                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Plan"}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
