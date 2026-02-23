import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, Clock, Target, RotateCcw, ArrowRight } from "lucide-react";
import type { Scenario } from "@/data/scenarios";

interface SessionRecord {
  id: string;
  simulation_type: string;
  status: string;
  total_score: number | null;
}

interface ScenarioCardProps {
  scenario: Scenario;
  sessions: SessionRecord[];
  onStart: () => void;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-primary/10 text-primary border-primary/20",
  Intermediate: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatRs(amount: number): string {
  return `Rs ${amount.toLocaleString()}`;
}

export function ScenarioCard({ scenario, sessions, onStart }: ScenarioCardProps) {
  const Icon = scenario.icon;
  const completed = sessions.filter(s => s.simulation_type === scenario.id && s.status === "completed");
  const bestScore = completed.reduce((best, s) => Math.max(best, s.total_score ?? 0), 0);
  const isCompleted = completed.length > 0;

  return (
    <Card className={`relative overflow-hidden card-hover flex flex-col ${isCompleted ? "" : "border-primary/10"}`}>
      {/* Decorative header */}
      <div className="h-28 relative overflow-hidden bg-secondary/40">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute w-16 h-16 border border-primary/20 rounded-lg rotate-12 -top-2 left-6" />
          <div className="absolute w-12 h-12 border border-primary/10 rounded-lg -rotate-6 top-4 right-8" />
          <div className="absolute w-8 h-8 border border-primary/15 rounded-lg rotate-45 bottom-1 left-1/3" />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={`text-[10px] ${difficultyColors[scenario.difficulty]}`}>
            {scenario.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {scenario.lifeStage}
          </Badge>
        </div>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Zap className="h-2.5 w-2.5" /> +75 XP
        </span>
        {isCompleted && (
          <div className="absolute bottom-3 right-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <div className="rounded-lg bg-card/80 backdrop-blur-sm p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <CardContent className="flex flex-col flex-1 pt-4 space-y-3">
        <div>
          <h3 className="font-display text-base font-bold">{scenario.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scenario.description}</p>
        </div>

        {/* Financial snapshot */}
        <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 space-y-0.5">
          <p>Starting Balance: <span className="text-foreground font-medium">{formatRs(scenario.startingBalance)}</span></p>
          <p>Monthly Income: <span className="text-foreground font-medium">{formatRs(scenario.monthlyIncome)}</span></p>
          <p>Duration: <span className="text-foreground font-medium">{scenario.steps.length} decisions</span></p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {scenario.skills.map(s => (
            <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        {/* Completion state / best score */}
        {isCompleted && (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - bestScore / 100)}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{bestScore}%</span>
            </div>
            <div>
              <p className="text-xs font-medium">Best Score</p>
              <p className="text-[10px] text-muted-foreground">Completed {completed.length}x</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {scenario.estimatedTime}
          <Target className="h-3 w-3 ml-2" /> {scenario.steps.length} decisions
        </div>

        <div className="mt-auto pt-2">
          <Button onClick={onStart} className="w-full gap-2" variant={isCompleted ? "outline" : "default"}>
            {isCompleted ? (
              <><RotateCcw className="h-3.5 w-3.5" /> Replay to Beat Your Score</>
            ) : (
              <>Start Scenario <ArrowRight className="h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
