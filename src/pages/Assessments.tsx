import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ChevronRight, ChevronLeft, Trophy, BarChart3, Brain, Heart, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string | null;
  order_index: number;
  category_id: string | null;
}

interface Assessment {
  id: string;
  assessment_type: "baseline" | "post";
  overall_score: number | null;
  knowledge_score: number | null;
  behavior_score: number | null;
  confidence_score: number | null;
  completed_at: string;
}

type ViewState = "landing" | "quiz" | "results" | "history";

export default function Assessments() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("landing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentType, setAssessmentType] = useState<"baseline" | "post">("baseline");
  const [pastAssessments, setPastAssessments] = useState<Assessment[]>([]);
  const [latestResult, setLatestResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadAssessments();
  }, [user]);

  async function loadAssessments() {
    setLoading(true);
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user!.id)
      .order("completed_at", { ascending: false });

    const list = (data ?? []) as Assessment[];
    setPastAssessments(list);

    const hasBaseline = list.some((a) => a.assessment_type === "baseline");
    setAssessmentType(hasBaseline ? "post" : "baseline");
    setLoading(false);
  }

  async function startAssessment() {
    const { data } = await supabase
      .from("questions")
      .select("id, question_text, options, correct_answer, order_index, category_id")
      .eq("assessment_type", assessmentType)
      .order("order_index");

    if (!data || data.length === 0) {
      toast({ title: "No questions available", description: "Please check back later.", variant: "destructive" });
      return;
    }

    const parsed = data.map((q) => ({
      ...q,
      options: typeof q.options === "string" ? JSON.parse(q.options) : (q.options as string[]),
    }));

    setQuestions(parsed);
    setAnswers({});
    setCurrentIndex(0);
    setView("quiz");
  }

  function scoreAssessment(): { knowledge: number; behavior: number; confidence: number; overall: number } {
    // Questions 1-5 = knowledge, 6-8 = behavior, 9-10 = confidence
    let knowledgeCorrect = 0, knowledgeTotal = 0;
    let behaviorCorrect = 0, behaviorTotal = 0;
    let confidenceCorrect = 0, confidenceTotal = 0;

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correct_answer;
      if (q.order_index <= 5) {
        knowledgeTotal++;
        if (isCorrect) knowledgeCorrect++;
      } else if (q.order_index <= 8) {
        behaviorTotal++;
        if (isCorrect) behaviorCorrect++;
      } else {
        confidenceTotal++;
        if (isCorrect) confidenceCorrect++;
      }
    });

    const knowledge = knowledgeTotal > 0 ? Math.round((knowledgeCorrect / knowledgeTotal) * 100) : 0;
    const behavior = behaviorTotal > 0 ? Math.round((behaviorCorrect / behaviorTotal) * 100) : 0;
    const confidence = confidenceTotal > 0 ? Math.round((confidenceCorrect / confidenceTotal) * 100) : 0;
    const totalCorrect = knowledgeCorrect + behaviorCorrect + confidenceCorrect;
    const totalQuestions = knowledgeTotal + behaviorTotal + confidenceTotal;
    const overall = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return { knowledge, behavior, confidence, overall };
  }

  async function submitAssessment() {
    setSubmitting(true);
    const scores = scoreAssessment();

    const answersJson: Json = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        user_id: user!.id,
        assessment_type: assessmentType,
        answers: answersJson,
        knowledge_score: scores.knowledge,
        behavior_score: scores.behavior,
        confidence_score: scores.confidence,
        overall_score: scores.overall,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error saving assessment", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setLatestResult(data as Assessment);
    setView("results");
    setSubmitting(false);
    await loadAssessments();
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // --- Landing ---
  if (view === "landing") {
    const hasBaseline = pastAssessments.some((a) => a.assessment_type === "baseline");
    const hasPost = pastAssessments.some((a) => a.assessment_type === "post");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Test and track your financial knowledge.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" /> Baseline Assessment
              </CardTitle>
              <CardDescription>Measure your starting financial literacy level.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">10 questions covering knowledge, behavior, and confidence across budgeting, saving, debt, and planning.</p>
              {hasBaseline ? (
                <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>
              ) : (
                <Button onClick={() => { setAssessmentType("baseline"); startAssessment(); }} className="gap-2">
                  Start Baseline <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/30 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Post Assessment
              </CardTitle>
              <CardDescription>Measure your progress after learning.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Take this after completing lessons and simulations to see how much you've grown.</p>
              {!hasBaseline ? (
                <p className="text-sm text-muted-foreground italic">Complete the baseline assessment first.</p>
              ) : (
                <Button onClick={() => { setAssessmentType("post"); startAssessment(); }} variant={hasPost ? "outline" : "default"} className="gap-2">
                  {hasPost ? "Retake Post Assessment" : "Start Post Assessment"} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {pastAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastAssessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant={a.assessment_type === "baseline" ? "default" : "secondary"}>
                        {a.assessment_type === "baseline" ? "Baseline" : "Post"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(a.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <ScorePill label="Overall" value={a.overall_score} />
                      <ScorePill label="Knowledge" value={a.knowledge_score} />
                      <ScorePill label="Behavior" value={a.behavior_score} />
                      <ScorePill label="Confidence" value={a.confidence_score} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- Quiz ---
  if (view === "quiz" && currentQuestion) {
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
              onValueChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={option} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!answers[currentQuestion.id]}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submitAssessment}
                disabled={!allAnswered || submitting}
                className="gap-1"
              >
                {submitting ? "Submitting..." : "Submit Assessment"} <Trophy className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        <Button variant="ghost" size="sm" onClick={() => setView("landing")} className="text-muted-foreground">
          ← Back to Assessments
        </Button>
      </div>
    );
  }

  // --- Results ---
  if (view === "results" && latestResult) {
    const scores = [
      { label: "Overall", value: latestResult.overall_score, icon: Trophy, color: "text-primary" },
      { label: "Knowledge", value: latestResult.knowledge_score, icon: Brain, color: "text-blue-500" },
      { label: "Behavior", value: latestResult.behavior_score, icon: Heart, color: "text-green-500" },
      { label: "Confidence", value: latestResult.confidence_score, icon: Shield, color: "text-amber-500" },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold">Assessment Complete!</h1>
          <p className="text-muted-foreground">
            Here's how you scored on your {latestResult.assessment_type} assessment.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {scores.map((s) => (
            <Card key={s.label}>
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
          <Button onClick={() => setView("landing")} variant="outline">View All Assessments</Button>
          <Button onClick={() => { setView("landing"); }}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return null;
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm">{value ?? 0}%</div>
    </div>
  );
}
