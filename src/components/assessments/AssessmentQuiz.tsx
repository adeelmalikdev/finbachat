import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string | null;
  order_index: number;
  category_id: string | null;
}

interface AssessmentQuizProps {
  assessmentType: "baseline" | "post";
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  submitting: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function AssessmentQuiz({
  assessmentType,
  questions,
  currentIndex,
  answers,
  submitting,
  onAnswer,
  onPrev,
  onNext,
  onSubmit,
  onBack,
}: AssessmentQuizProps) {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = questions.every((q) => answers[q.id]);

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold capitalize">{assessmentType} Assessment</h1>
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg leading-relaxed">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] ?? ""}
            onValueChange={(val) => onAnswer(currentQuestion.id, val)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, i) => (
              <label
                key={i}
                htmlFor={`opt-${currentQuestion.id}-${i}`}
                className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors cursor-pointer ${
                  answers[currentQuestion.id] === option
                    ? "border-primary bg-primary/10"
                    : "hover:bg-secondary/50"
                }`}
              >
                <RadioGroupItem value={option} id={`opt-${currentQuestion.id}-${i}`} />
                <span className="flex-1 text-sm">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={onNext}
              disabled={!answers[currentQuestion.id]}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!allAnswered || submitting}
              className="gap-1"
            >
              {submitting ? "Submitting..." : "Submit Assessment"} <Trophy className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
        ← Back to Assessments
      </Button>
    </div>
  );
}
