import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, ArrowUp, ChevronRight } from "lucide-react";

interface Assessment {
  id: string;
  assessment_type: "baseline" | "post";
  overall_score: number | null;
  knowledge_score: number | null;
  behavior_score: number | null;
  confidence_score: number | null;
  completed_at: string;
}

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onScrollToCards: () => void;
}

const scoreColor = (v: number | null) =>
  v == null ? "text-muted-foreground" : v >= 70 ? "text-primary" : v >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive";

export function AssessmentHistory({ assessments, onScrollToCards }: AssessmentHistoryProps) {
  if (assessments.length === 0) {
    return (
      <Card className="border-dashed border-border/50">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-secondary p-4">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            No assessments yet — your results will appear here after your first attempt
          </p>
          <Button onClick={onScrollToCards} className="gap-2 mt-2">
            Take Your First Assessment <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check for improvement
  const baselines = assessments.filter((a) => a.assessment_type === "baseline");
  const posts = assessments.filter((a) => a.assessment_type === "post");
  const latestBaseline = baselines[0];
  const latestPost = posts[0];
  const improvement =
    latestBaseline && latestPost && latestBaseline.overall_score != null && latestPost.overall_score != null
      ? latestPost.overall_score - latestBaseline.overall_score
      : null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">Assessment History</h2>

      {improvement != null && improvement > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <ArrowUp className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">
              You improved <span className="text-primary font-bold">{improvement}%</span> since your Baseline!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {assessments.map((a) => (
          <Card key={a.id} className="card-hover">
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-5">
              {/* Type + Date */}
              <div className="flex items-center gap-3 sm:w-40 shrink-0">
                <Badge
                  variant={a.assessment_type === "baseline" ? "default" : "secondary"}
                  className={a.assessment_type === "baseline" ? "" : "bg-[hsl(var(--info))] text-white border-transparent"}
                >
                  {a.assessment_type === "baseline" ? "Baseline" : "Post"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.completed_at).toLocaleDateString()}
                </span>
              </div>

              {/* Score bars */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniScoreBar label="Overall" value={a.overall_score} />
                <MiniScoreBar label="Knowledge" value={a.knowledge_score} />
                <MiniScoreBar label="Behavior" value={a.behavior_score} />
                <MiniScoreBar label="Confidence" value={a.confidence_score} />
              </div>

              {/* Overall big score */}
              <div className="text-center sm:text-right sm:w-20 shrink-0">
                <p className={`font-display text-2xl font-bold ${scoreColor(a.overall_score)}`}>
                  {a.overall_score ?? 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nudge for post if only baselines exist */}
      {baselines.length > 0 && posts.length === 0 && (
        <Card className="border-dashed border-border/50">
          <CardContent className="flex items-center justify-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Complete Post Assessment to see your growth comparison →
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MiniScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value ?? 0}%</span>
      </div>
      <Progress value={value ?? 0} className="h-1.5" />
    </div>
  );
}
