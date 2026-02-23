import { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator, CalendarClock, ShieldCheck, CreditCard, TrendingDown, Target,
  Zap, ArrowRight, Clock, ChevronRight, Lock, Star, CheckCircle2,
  BarChart3, PieChart, Lightbulb, TrendingUp, Sparkles, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SmartBudgetBuilder from "@/components/tools/SmartBudgetBuilder";
import WeeklyCashFlowTracker from "@/components/tools/WeeklyCashFlowTracker";
import EmergencyFundCalculator from "@/components/tools/EmergencyFundCalculator";
import DebtControlPlanner from "@/components/tools/DebtControlPlanner";
import InflationImpactTool from "@/components/tools/InflationImpactTool";
import SavingsGoalPlanner from "@/components/tools/SavingsGoalPlanner";

type ActiveTool = null | "budget" | "cashflow" | "emergency" | "debt" | "inflation" | "savings";
type ToolCategory = "all" | "budgeting" | "savings" | "debt";

interface ToolInfo {
  id: ActiveTool & string;
  title: string;
  desc: string;
  icon: any;
  category: ToolCategory;
  time: string;
  outputs: string[];
}

const TOOL_META: ToolInfo[] = [
  {
    id: "budget", title: "Smart Budget Builder",
    desc: "Drag sliders to allocate your monthly income and instantly see if your budget follows the 50/30/20 rule.",
    icon: Calculator, category: "budgeting", time: "~5 min",
    outputs: ["📊 Budget Chart", "🎯 Health Score", "💡 Expert Tips"],
  },
  {
    id: "cashflow", title: "Weekly Cash Flow Tracker",
    desc: "Log your weekly income and spending by category and see where your money is actually going.",
    icon: CalendarClock, category: "budgeting", time: "~5 min",
    outputs: ["📈 Weekly Trend", "📊 Category Split", "🎯 Targets"],
  },
  {
    id: "emergency", title: "Emergency Fund Calculator",
    desc: "Enter your monthly expenses and see exactly how many months of savings you need and how long it'll take.",
    icon: ShieldCheck, category: "savings", time: "~3 min",
    outputs: ["🛡️ Fund Target", "📅 Timeline", "💡 Milestones"],
  },
  {
    id: "debt", title: "Debt Control Planner",
    desc: "Enter your debts and compare minimum payments vs. aggressive payoff — see how much interest you save.",
    icon: CreditCard, category: "debt", time: "~5 min",
    outputs: ["📈 Payoff Timeline", "💰 Interest Saved", "📊 Comparison"],
  },
  {
    id: "inflation", title: "Inflation Impact Tool",
    desc: "See how Rs 100,000 today loses value over 10 years and what you should do instead.",
    icon: TrendingDown, category: "savings", time: "~3 min",
    outputs: ["📉 Erosion Chart", "💡 Investment Tips", "📊 Comparison"],
  },
  {
    id: "savings", title: "Savings Goal Planner",
    desc: "Set a savings goal in PKR and get a month-by-month plan to reach it based on your income.",
    icon: Target, category: "savings", time: "~4 min",
    outputs: ["📅 Monthly Plan", "🎯 Feasibility", "📈 Progress Chart"],
  },
];

const TOOL_XP_NAMES: Record<string, string> = {
  budget: "Smart Budget Builder",
  cashflow: "Weekly Cash Flow",
  emergency: "Emergency Fund",
  debt: "Debt Control",
  inflation: "Inflation Impact",
  savings: "Savings Goal",
};

export default function Tools() {
  usePageTitle("Tools");
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [category, setCategory] = useState<ToolCategory>("all");
  const [usedTools, setUsedTools] = useState<Record<string, { date: string; summary?: string }>>({});
  const [toolsXP, setToolsXP] = useState(0);

  useEffect(() => {
    if (user) loadToolResults();
  }, [user]);

  async function loadToolResults() {
    if (!user) return;
    const { data } = await supabase
      .from("tool_results")
      .select("tool_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const used: Record<string, { date: string }> = {};
    const toolNameMap: Record<string, string> = {
      "Smart Budget Builder": "budget", "Weekly Cash Flow": "cashflow",
      "Emergency Fund": "emergency", "Debt Control": "debt",
      "Inflation Impact": "inflation", "Savings Goal": "savings",
    };
    (data ?? []).forEach((r: any) => {
      const key = toolNameMap[r.tool_name];
      if (key && !used[key]) {
        used[key] = { date: new Date(r.created_at).toLocaleDateString() };
      }
    });
    setUsedTools(used);
    setToolsXP(Object.keys(used).length * 25);
  }

  const onXP = async (toolName: string) => {
    await awardXP("tool_use", toolName);
    toast({ title: "+25 XP!", description: "You earned XP for using a financial tool." });
    await loadToolResults();
  };

  const back = () => { setActiveTool(null); loadToolResults(); };

  if (activeTool === "budget") return <SmartBudgetBuilder userId={user?.id} onBack={back} onXP={() => onXP("Smart Budget Builder")} />;
  if (activeTool === "cashflow") return <WeeklyCashFlowTracker userId={user?.id} onBack={back} onXP={() => onXP("Weekly Cash Flow")} />;
  if (activeTool === "emergency") return <EmergencyFundCalculator userId={user?.id} onBack={back} onXP={() => onXP("Emergency Fund")} />;
  if (activeTool === "debt") return <DebtControlPlanner userId={user?.id} onBack={back} onXP={() => onXP("Debt Control")} />;
  if (activeTool === "inflation") return <InflationImpactTool userId={user?.id} onBack={back} onXP={() => onXP("Inflation Impact")} />;
  if (activeTool === "savings") return <SavingsGoalPlanner userId={user?.id} onBack={back} onXP={() => onXP("Savings Goal")} />;

  const usedCount = Object.keys(usedTools).length;
  const filteredTools = TOOL_META.filter(t => category === "all" || t.category === category);

  // Pick recommended tool — first unused tool
  const recommendedTool = TOOL_META.find(t => !usedTools[t.id]) || TOOL_META[0];

  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 p-6 md:p-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold">Financial Tools</h1>
              <p className="text-muted-foreground mt-1">Professional calculators built for Pakistan's economy — in PKR.</p>
            </div>
            <div className="flex items-center gap-6 p-6 md:p-8 md:border-l border-t md:border-t-0 border-border/50 bg-secondary/30">
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-primary font-display font-bold text-xl">
                  <Zap className="h-5 w-5" /> {toolsXP}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">XP from tools</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1.5">
                  {TOOL_META.map(t => (
                    <div
                      key={t.id}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${usedTools[t.id] ? "bg-primary" : "bg-secondary border border-border/50"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{usedCount} of 6 explored</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== FIRST VISIT BANNER ===== */}
      {usedCount === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm flex-1">
            <span className="font-semibold">New here?</span> Start with the Smart Budget Builder — it takes 5 minutes and gives you an instant financial health snapshot.
          </p>
          <Button size="sm" className="gap-1 shrink-0" onClick={() => setActiveTool("budget")}>
            Start Now <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* ===== RECOMMENDED TOOL BANNER ===== */}
      {usedCount > 0 && usedCount < 6 && (
        <Card className="border-l-4 border-l-primary border-border/50 card-hover cursor-pointer overflow-hidden" onClick={() => setActiveTool(recommendedTool.id as ActiveTool)}>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="flex-1 p-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
                  <Star className="h-3 w-3 mr-1" /> Recommended for You
                </Badge>
                <h3 className="font-display text-xl font-bold">{recommendedTool.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{recommendedTool.desc}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {recommendedTool.time}
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    <Zap className="h-3 w-3 mr-1" /> +25 XP
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 md:border-l border-t md:border-t-0 border-border/50 bg-secondary/20 md:w-56">
                <Button className="gap-2">
                  Open Tool <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== CATEGORY TABS ===== */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "all", label: "All Tools" },
          { key: "budgeting", label: "Budgeting" },
          { key: "savings", label: "Savings" },
          { key: "debt", label: "Debt" },
        ] as const).map(c => (
          <Button
            key={c.key}
            variant={category === c.key ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(c.key)}
            className="text-xs"
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* ===== TOOLS GRID ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map(tool => {
          const used = usedTools[tool.id];
          return (
            <Card
              key={tool.id}
              className="border-border/50 card-hover cursor-pointer group flex flex-col"
              onClick={() => setActiveTool(tool.id as ActiveTool)}
            >
              <CardContent className="p-5 flex-1 flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      <Zap className="h-3 w-3 mr-0.5" /> +25 XP
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {tool.time}
                    </span>
                  </div>
                </div>

                {/* Title & description */}
                <h3 className="font-display font-bold text-base mb-1.5">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>

                {/* Output pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tool.outputs.map((output, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground bg-secondary/50">
                      {output}
                    </span>
                  ))}
                </div>

                {/* Bottom */}
                <div className="mt-auto pt-4">
                  {used ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                          <RefreshCw className="h-3 w-3" /> Redo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                          View Results
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Last used: {used.date}
                      </p>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full gap-1.5">
                      Start Tool <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ===== TOOLS PROGRESS / COMPLETION ===== */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              {TOOL_META.map(t => (
                <div
                  key={t.id}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    usedTools[t.id]
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-secondary border border-border/50"
                  }`}
                >
                  <t.icon className={`h-5 w-5 ${usedTools[t.id] ? "text-primary" : "text-muted-foreground/50"}`} />
                </div>
              ))}
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="font-display font-semibold text-sm">
                {usedCount === 6 ? (
                  <span className="text-primary">🎉 All tools explored! Financial Toolkit Master unlocked!</span>
                ) : (
                  <>Use all 6 tools to unlock the <span className="text-primary">Financial Toolkit Master</span> badge</>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {usedCount === 6 ? "+100 bonus XP earned" : `${usedCount}/6 complete · +100 bonus XP on completion`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border/50 flex items-center justify-center shrink-0">
              {usedCount === 6 ? (
                <Star className="h-5 w-5 text-amber-400" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
