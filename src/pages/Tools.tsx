import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator, CalendarClock, ShieldCheck, CreditCard, TrendingDown, Target, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import SmartBudgetBuilder from "@/components/tools/SmartBudgetBuilder";
import WeeklyCashFlowTracker from "@/components/tools/WeeklyCashFlowTracker";
import EmergencyFundCalculator from "@/components/tools/EmergencyFundCalculator";
import DebtControlPlanner from "@/components/tools/DebtControlPlanner";
import InflationImpactTool from "@/components/tools/InflationImpactTool";
import SavingsGoalPlanner from "@/components/tools/SavingsGoalPlanner";

type ActiveTool = null | "budget" | "cashflow" | "emergency" | "debt" | "inflation" | "savings";

const TOOL_META = [
  { id: "budget" as const, title: "Smart Budget Builder", desc: "Create budget clarity in under 5 minutes with sliders, pie charts, and health scores", icon: Calculator },
  { id: "cashflow" as const, title: "Weekly Cash Flow Tracker", desc: "Prevent silent overspending with weekly targets and category tracking", icon: CalendarClock },
  { id: "emergency" as const, title: "Emergency Fund Calculator", desc: "Build safety buffer awareness with milestones and progress tracking", icon: ShieldCheck },
  { id: "debt" as const, title: "Debt Control Planner", desc: "See the true cost of delay with side-by-side payment comparisons", icon: CreditCard },
  { id: "inflation" as const, title: "Inflation Impact Tool", desc: "Visualize silent wealth erosion — cash vs invested over time", icon: TrendingDown },
  { id: "savings" as const, title: "Savings Goal Planner", desc: "Convert dreams into numbers with feasibility scores and timelines", icon: Target },
];

export default function Tools() {
  usePageTitle("Tools");
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  const onXP = async (toolName: string) => {
    await awardXP("tool_use", toolName);
    toast({ title: "+25 XP!", description: "You earned XP for using a financial tool." });
  };

  const back = () => setActiveTool(null);

  if (activeTool === "budget") return <SmartBudgetBuilder userId={user?.id} onBack={back} onXP={() => onXP("Smart Budget Builder")} />;
  if (activeTool === "cashflow") return <WeeklyCashFlowTracker userId={user?.id} onBack={back} onXP={() => onXP("Weekly Cash Flow")} />;
  if (activeTool === "emergency") return <EmergencyFundCalculator userId={user?.id} onBack={back} onXP={() => onXP("Emergency Fund")} />;
  if (activeTool === "debt") return <DebtControlPlanner userId={user?.id} onBack={back} onXP={() => onXP("Debt Control")} />;
  if (activeTool === "inflation") return <InflationImpactTool userId={user?.id} onBack={back} onXP={() => onXP("Inflation Impact")} />;
  if (activeTool === "savings") return <SavingsGoalPlanner userId={user?.id} onBack={back} onXP={() => onXP("Savings Goal")} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Financial Tools</h1>
        <p className="text-muted-foreground">Professional calculators and planners to master your money.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_META.map((tool) => (
          <Card
            key={tool.id}
            className="cursor-pointer card-hover group"
            onClick={() => setActiveTool(tool.id)}
          >
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display text-base">{tool.title}</CardTitle>
              <CardDescription className="text-xs">{tool.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                Open Tool <TrendingUp className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
