import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend, Tooltip as RTooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

function formatRs(a: number) { return `Rs ${a.toLocaleString()}`; }

interface Props {
  userId?: string;
  onBack: () => void;
  onXP: () => void;
}

const INFLATION_RATES = [6, 8, 10, 12];
const INVESTMENT_RETURN = 12;
const YEARS = 20;

export default function InflationImpactTool({ userId, onBack, onXP }: Props) {
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [selectedInflation, setSelectedInflation] = useState(10);
  const [saved, setSaved] = useState(false);

  const chartData = useMemo(() => {
    return Array.from({ length: YEARS + 1 }, (_, y) => {
      const cashValue = currentSavings / Math.pow(1 + selectedInflation / 100, y);
      const investedValue = currentSavings * Math.pow(1 + INVESTMENT_RETURN / 100, y) / Math.pow(1 + selectedInflation / 100, y);
      return {
        year: y,
        "Cash (Real Value)": Math.round(cashValue),
        "Invested at 12% (Real Value)": Math.round(investedValue),
      };
    });
  }, [currentSavings, selectedInflation]);

  const after5 = Math.round(currentSavings / Math.pow(1 + selectedInflation / 100, 5));
  const after10 = Math.round(currentSavings / Math.pow(1 + selectedInflation / 100, 10));
  const after20 = Math.round(currentSavings / Math.pow(1 + selectedInflation / 100, 20));
  const erosionPct5 = Math.round((1 - after5 / currentSavings) * 100);

  async function saveResult() {
    if (!userId) return;
    await supabase.from("tool_results").insert({
      user_id: userId, tool_name: "inflation_impact",
      inputs: { currentSavings, selectedInflation } as Json,
      outputs: { after5, after10, after20, erosionPct5 } as unknown as Json,
    });
    setSaved(true);
    toast({ title: "Inflation analysis saved!" });
    onXP();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Inflation Impact Tool</h1>
          <p className="text-muted-foreground text-sm">Show silent wealth erosion</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Current Savings (Rs)</Label>
            <Input type="number" value={currentSavings || ""} onChange={e => setCurrentSavings(Number(e.target.value))} className="text-lg" />
          </div>
          <div>
            <Label className="mb-2 block">Inflation Rate</Label>
            <div className="flex gap-2">
              {INFLATION_RATES.map(r => (
                <Badge key={r} variant={selectedInflation === r ? "default" : "outline"} className="cursor-pointer text-sm px-4 py-1.5" onClick={() => setSelectedInflation(r)}>
                  {r}%
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {currentSavings > 0 && (
        <>
          {/* Key insight */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6 text-center space-y-2">
              <TrendingDown className="h-10 w-10 mx-auto text-destructive" />
              <p className="text-sm text-muted-foreground">At {selectedInflation}% inflation, your {formatRs(currentSavings)} in cash</p>
              <p className="text-3xl font-bold font-display text-destructive">loses {erosionPct5}% in 5 years</p>
              <p className="text-sm text-muted-foreground">Real value drops to {formatRs(after5)}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "After 5 Years", value: after5 },
              { label: "After 10 Years", value: after10 },
              { label: "After 20 Years", value: after20 },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold font-display text-destructive">{formatRs(value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Line chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cash vs Invested (Real Value Over Time)</CardTitle>
              <CardDescription>Invested at {INVESTMENT_RETURN}% annual return vs cash at {selectedInflation}% inflation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" fontSize={11} className="fill-muted-foreground" label={{ value: "Years", position: "insideBottom", offset: -5, fontSize: 11 }} />
                    <YAxis fontSize={11} className="fill-muted-foreground" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <RTooltip formatter={(v: number) => formatRs(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="Cash (Real Value)" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Invested at 12% (Real Value)" stroke="hsl(152, 55%, 42%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm font-medium">💡 Cash alone is risky in high-inflation environments.</p>
            <p className="text-xs text-muted-foreground mt-1">Investing can preserve and grow your purchasing power over time.</p>
          </div>

          <Button onClick={saveResult} className="w-full gap-2" disabled={saved}>
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Analysis"}
          </Button>
        </>
      )}
    </div>
  );
}
