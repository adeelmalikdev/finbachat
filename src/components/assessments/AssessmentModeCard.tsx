import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Lock, Zap } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard" | "mixed";

interface AssessmentModeCardProps {
  type: "baseline" | "post";
  completed: boolean;
  locked?: boolean;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
}

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Beginner" },
  { value: "mixed", label: "Mixed" },
  { value: "hard", label: "Advanced" },
];

const config = {
  baseline: {
    title: "Baseline Assessment",
    subtitle: "Discover your starting level",
    xp: 100,
    bullets: [
      "15 randomized questions",
      "Covers budgeting, saving, debt & planning",
      "Unlocks your Financial Health Score",
    ],
    startLabel: "Start Baseline Assessment",
    retakeLabel: "Retake Assessment",
  },
  post: {
    title: "Post Assessment",
    subtitle: "Measure your growth",
    xp: 100,
    bullets: [
      "See how much you've improved",
      "Compare against your Baseline score",
      "Track knowledge gains over time",
    ],
    startLabel: "Start Post Assessment",
    retakeLabel: "Retake Post Assessment",
  },
};

export function AssessmentModeCard({ type, completed, locked, difficulty, onDifficultyChange, onStart }: AssessmentModeCardProps) {
  const c = config[type];
  const isBaseline = type === "baseline";

  return (
    <Card className={`relative overflow-hidden card-hover flex flex-col ${isBaseline && !completed ? "border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.06)]" : ""}`}>
      {/* Decorative header area */}
      <div className={`h-28 relative overflow-hidden ${isBaseline ? "bg-primary/5" : "bg-secondary/50"}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-20 h-20 border border-primary/20 rounded-lg rotate-12 -top-4 left-8" />
          <div className="absolute w-14 h-14 border border-primary/10 rounded-lg -rotate-6 top-6 right-12" />
          <div className="absolute w-10 h-10 border border-primary/15 rounded-lg rotate-45 bottom-2 left-1/3" />
        </div>
        {locked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Complete Baseline First to Unlock</p>
            </div>
          </div>
        )}
        {/* XP pill */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Zap className="h-3 w-3" /> +{c.xp} XP
        </span>
        {completed && (
          <Badge className="absolute top-3 left-3 bg-primary/20 text-primary border-primary/30 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-col flex-1 pt-5 space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold">{c.title}</h3>
          <p className="text-sm text-muted-foreground">{c.subtitle}</p>
        </div>

        <ul className="space-y-2">
          {c.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{b}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">⏱ ~5 minutes</p>

        {/* Difficulty Selector */}
        {!locked && (
          <div className="flex rounded-lg border border-border overflow-hidden">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDifficultyChange(opt.value)}
                className={`flex-1 text-xs font-medium py-2 transition-colors ${
                  difficulty === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          {locked ? (
            <Button disabled className="w-full gap-2" variant="outline">
              <Lock className="h-4 w-4" /> Locked
            </Button>
          ) : (
            <Button
              onClick={onStart}
              className={`w-full gap-2 ${completed ? "" : "animate-pulse-glow"}`}
              variant={completed ? "outline" : "default"}
            >
              {completed ? c.retakeLabel : c.startLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
