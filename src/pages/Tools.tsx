import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";

const tools = [
  { title: "Budget Planner", desc: "Track income and expenses", icon: Calculator },
  { title: "Savings Calculator", desc: "Plan your savings goals", icon: PiggyBank },
  { title: "Emergency Fund", desc: "Calculate your safety net", icon: ShieldCheck },
  { title: "Risk Profile", desc: "Assess your risk tolerance", icon: TrendingUp },
];

export default function Tools() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Financial Tools</h1>
        <p className="text-muted-foreground">Practical calculators and planners.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.title} className="cursor-pointer transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <tool.icon className="h-5 w-5 text-primary" /> {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tool.desc} — coming soon.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
