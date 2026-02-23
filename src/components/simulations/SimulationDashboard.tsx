import { Card, CardContent } from "@/components/ui/card";
import { Zap, Heart, TrendingUp } from "lucide-react";

interface FinancialDashboardProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  healthScore: number; // 0-100
  currentStep: number;
  totalSteps: number;
  xpEarned: number;
  label?: string; // e.g. "Decision 1 of 3"
}

function formatRs(amount: number): string {
  const abs = Math.abs(amount);
  return `${amount < 0 ? "-" : ""}Rs ${abs.toLocaleString()}`;
}

export function SimulationDashboard({
  balance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  healthScore,
  currentStep,
  totalSteps,
  xpEarned,
  label,
}: FinancialDashboardProps) {
  const healthColor = healthScore >= 70 ? "bg-primary" : healthScore >= 40 ? "bg-[hsl(var(--warning))]" : "bg-destructive";

  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <CardContent className="py-4 px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Balance */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bank Balance</p>
              <p className={`font-display text-2xl font-bold tabular-nums ${balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                {formatRs(balance)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                <TrendingUp className="h-2.5 w-2.5" /> {formatRs(monthlyIncome)}/mo
              </span>
              {monthlyExpenses > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  −{formatRs(monthlyExpenses)}/mo
                </span>
              )}
            </div>
          </div>

          {/* Health + Savings */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Savings Rate</p>
              <p className="font-display font-bold text-sm">{savingsRate}%</p>
            </div>
            <div className="w-28">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Heart className="h-2.5 w-2.5" /> Financial Health
              </p>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${healthColor}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step + XP */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label ?? "Progress"}</p>
              <p className="font-display font-bold text-sm">{currentStep} of {totalSteps}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3 w-3" /> {xpEarned} XP
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
