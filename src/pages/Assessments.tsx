import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import type { Json } from "@/integrations/supabase/types";

import { AssessmentHeroBanner } from "@/components/assessments/AssessmentHeroBanner";
import { AssessmentValueStrip } from "@/components/assessments/AssessmentValueStrip";
import { AssessmentModeCard } from "@/components/assessments/AssessmentModeCard";
import { AssessmentHistory } from "@/components/assessments/AssessmentHistory";
import { AssessmentQuiz } from "@/components/assessments/AssessmentQuiz";
import { AssessmentResults } from "@/components/assessments/AssessmentResults";

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

type ViewState = "landing" | "quiz" | "results";
type Difficulty = "easy" | "medium" | "hard" | "mixed";

const QUESTIONS_PER_ASSESSMENT = 15;

export default function Assessments() {
  usePageTitle("Assessments");
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [view, setView] = useState<ViewState>("landing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentType, setAssessmentType] = useState<"baseline" | "post">("baseline");
  const [baselineDifficulty, setBaselineDifficulty] = useState<Difficulty>("mixed");
  const [postDifficulty, setPostDifficulty] = useState<Difficulty>("mixed");
  const [pastAssessments, setPastAssessments] = useState<Assessment[]>([]);
  const [latestResult, setLatestResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

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

  async function startAssessment(type: "baseline" | "post", diff: Difficulty) {
    setAssessmentType(type);
    let query = supabase
      .from("questions")
      .select("id, question_text, options, correct_answer, order_index, category_id")
      .eq("assessment_type", type);

    if (diff !== "mixed") {
      query = query.eq("difficulty", diff);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      toast({ title: "No questions available", description: "Please check back later.", variant: "destructive" });
      return;
    }

    const shuffled = data.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, QUESTIONS_PER_ASSESSMENT);

    const parsed = selected.map((q, idx) => ({
      ...q,
      order_index: idx + 1,
      options: typeof q.options === "string" ? JSON.parse(q.options) : (q.options as string[]),
    }));

    setQuestions(parsed);
    setAnswers({});
    setCurrentIndex(0);
    setView("quiz");
  }

  function scoreAssessment(): { knowledge: number; behavior: number; confidence: number; overall: number } {
    const budgetingId = "27baf23a-a7b8-468a-bdb5-7bfd34d5c77c";
    const savingId = "63f6864a-2c43-47f4-af52-447a2d55cfa5";
    const debtId = "f13b8b24-09ed-4d17-8012-c17a816fe69d";
    const planningId = "0fc67d5e-b76a-44a4-ab3e-4a1e13c098ba";

    let knowledgeCorrect = 0, knowledgeTotal = 0;
    let behaviorCorrect = 0, behaviorTotal = 0;
    let confidenceCorrect = 0, confidenceTotal = 0;

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correct_answer;
      if (q.category_id === budgetingId || q.category_id === savingId) {
        knowledgeTotal++;
        if (isCorrect) knowledgeCorrect++;
      } else if (q.category_id === debtId) {
        behaviorTotal++;
        if (isCorrect) behaviorCorrect++;
      } else if (q.category_id === planningId) {
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
      console.error("Assessment save failed:", error);
      toast({ title: "Error saving assessment", description: getSafeErrorMessage(error), variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setLatestResult(data as Assessment);
    setView("results");
    setSubmitting(false);
    await awardXP("assessment_complete", `${assessmentType} assessment (Score: ${scores.overall}%)`);
    toast({ title: "+100 XP!", description: "You earned XP for completing an assessment." });
    await loadAssessments();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // --- Quiz ---
  if (view === "quiz") {
    return (
      <AssessmentQuiz
        assessmentType={assessmentType}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        submitting={submitting}
        onAnswer={(qId, val) => setAnswers((prev) => ({ ...prev, [qId]: val }))}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentIndex((i) => i + 1)}
        onSubmit={submitAssessment}
        onBack={() => setView("landing")}
      />
    );
  }

  // --- Results ---
  if (view === "results" && latestResult) {
    return (
      <AssessmentResults
        result={latestResult}
        onBack={() => setView("landing")}
      />
    );
  }

  // --- Landing ---
  const hasBaseline = pastAssessments.some((a) => a.assessment_type === "baseline");
  const hasPost = pastAssessments.some((a) => a.assessment_type === "post");
  const latestBaselineScore = pastAssessments.find((a) => a.assessment_type === "baseline")?.overall_score ?? null;

  return (
    <div className="space-y-8">
      <AssessmentHeroBanner hasBaseline={hasBaseline} latestOverallScore={latestBaselineScore} />

      <AssessmentValueStrip />

      <div ref={cardsRef} className="grid gap-6 md:grid-cols-2">
        <AssessmentModeCard
          type="baseline"
          completed={hasBaseline}
          difficulty={baselineDifficulty}
          onDifficultyChange={setBaselineDifficulty}
          onStart={() => startAssessment("baseline", baselineDifficulty)}
        />
        <AssessmentModeCard
          type="post"
          completed={hasPost}
          locked={!hasBaseline}
          difficulty={postDifficulty}
          onDifficultyChange={setPostDifficulty}
          onStart={() => startAssessment("post", postDifficulty)}
        />
      </div>

      <AssessmentHistory
        assessments={pastAssessments}
        onScrollToCards={() => cardsRef.current?.scrollIntoView({ behavior: "smooth" })}
      />
    </div>
  );
}
