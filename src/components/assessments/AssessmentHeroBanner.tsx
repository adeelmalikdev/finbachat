import { Zap, Award, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssessmentHeroBannerProps {
  hasBaseline: boolean;
  latestOverallScore: number | null;
}

export function AssessmentHeroBanner({ hasBaseline, latestOverallScore }: AssessmentHeroBannerProps) {
  const displayScore = hasBaseline && latestOverallScore != null ? latestOverallScore : null;

  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <CardContent className="relative flex flex-col md:flex-row items-center gap-8 p-8">
        {/* Left: Text */}
        <div className="flex-1 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ⭐ Start Here — Recommended
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Know Where You Stand
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Take a 5-minute assessment to discover your Financial Health Score and get a personalized learning path built around your gaps.
          </p>
          {/* Reward pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            <RewardPill icon={<Zap className="h-3 w-3" />} label="+100 XP" />
            <RewardPill icon={<Award className="h-3 w-3" />} label="Badge Unlocked" />
            <RewardPill icon={<BarChart3 className="h-3 w-3" />} label="Personalized Path" />
          </div>
        </div>

        {/* Right: Score Ring */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-36 w-36">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="62" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 62}`}
                strokeDashoffset={`${2 * Math.PI * 62 * (1 - (displayScore ?? 0) / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold">
                {displayScore != null ? `${displayScore}%` : "??"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[160px]">
            {displayScore != null
              ? "Your Financial Health Score"
              : "Complete assessment to unlock your score"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RewardPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {icon} {label}
    </span>
  );
}
