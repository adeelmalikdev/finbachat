import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Brain, Heart, Shield } from "lucide-react";

interface Assessment {
  assessment_type: "baseline" | "post";
  overall_score: number | null;
  knowledge_score: number | null;
  behavior_score: number | null;
  confidence_score: number | null;
}

interface AssessmentResultsProps {
  result: Assessment;
  onBack: () => void;
}

export function AssessmentResults({ result, onBack }: AssessmentResultsProps) {
  const scores = [
    { label: "Overall", value: result.overall_score, icon: Trophy, color: "text-primary" },
    { label: "Knowledge", value: result.knowledge_score, icon: Brain, color: "text-[hsl(var(--info))]" },
    { label: "Behavior", value: result.behavior_score, icon: Heart, color: "text-primary" },
    { label: "Confidence", value: result.confidence_score, icon: Shield, color: "text-[hsl(var(--warning))]" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mx-auto">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold">Assessment Complete!</h1>
        <p className="text-muted-foreground">
          Here's how you scored on your {result.assessment_type} assessment.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scores.map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="pt-6 text-center">
              <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
              <div className="text-3xl font-bold font-display">{s.value ?? 0}%</div>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              <Progress value={s.value ?? 0} className="mt-3 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={onBack} variant="outline">View All Assessments</Button>
        <Button onClick={onBack}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
