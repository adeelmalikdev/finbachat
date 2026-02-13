import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gamepad2, ArrowRight, ChevronRight, Trophy, Clock, Target,
  Wallet, Home, TrendingUp, ShieldAlert, CheckCircle2, RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import BudgetSimulator from "./BudgetSimulator";

// --- Scenario Data ---
interface Choice {
  text: string;
  score: number;
  feedback: string;
}

interface Step {
  title: string;
  narrative: string;
  choices: Choice[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  steps: Step[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "emergency-fund",
    title: "Emergency Fund Crisis",
    description: "Your car breaks down and you need Rs 600,000 for repairs. Navigate this unexpected expense.",
    icon: ShieldAlert,
    steps: [
      {
        title: "The Breakdown",
        narrative: "Your car won't start Monday morning. The mechanic says repairs will cost Rs 600,000. You need the car for work. What do you do first?",
        choices: [
          { text: "Use my emergency fund to cover it immediately", score: 10, feedback: "Excellent! This is exactly what emergency funds are for. You avoid debt and stress." },
          { text: "Put it on a credit card and pay it off over time", score: 4, feedback: "This works short-term but you'll pay interest. Credit card rates average 20%+." },
          { text: "Take out a payday loan to cover it quickly", score: 1, feedback: "Payday loans have extremely high interest rates (400%+ APR). This is very costly." },
          { text: "Ask family or friends to lend you the money", score: 6, feedback: "This avoids interest but can strain relationships. It's better than high-interest debt." },
        ],
      },
      {
        title: "Rebuilding Savings",
        narrative: "The car is fixed. Now you need to rebuild your savings. Your monthly take-home is Rs 1,050,000. How do you approach this?",
        choices: [
          { text: "Set up an automatic transfer of Rs 90,000/month to savings", score: 10, feedback: "Automating savings is the most effective strategy. You'll rebuild in about 7 months." },
          { text: "Cut all non-essential spending until fully rebuilt", score: 6, feedback: "While effective short-term, extreme restriction often leads to burnout and overspending." },
          { text: "Save whatever is left at the end of each month", score: 3, feedback: "Without a plan, leftover savings rarely materialize. Pay yourself first!" },
          { text: "Wait until you get a raise to start saving again", score: 1, feedback: "Delaying means you're unprotected longer. Start small now rather than waiting." },
        ],
      },
      {
        title: "Prevention Planning",
        narrative: "You want to be better prepared next time. What's your long-term strategy?",
        choices: [
          { text: "Build a 3-6 month emergency fund and maintain it", score: 10, feedback: "The gold standard! 3-6 months of expenses gives you a solid safety net." },
          { text: "Get better insurance coverage for your car", score: 6, feedback: "Good thinking, but insurance doesn't cover all repairs. You still need liquid savings." },
          { text: "Keep Rs 15,000 in a jar at home for emergencies", score: 3, feedback: "Rs 15,000 is a start but won't cover major expenses. Aim higher and keep it in a savings account." },
          { text: "Hope nothing bad happens again", score: 0, feedback: "Unfortunately, emergencies are inevitable. Planning is essential for financial stability." },
        ],
      },
    ],
  },
  {
    id: "first-budget",
    title: "Your First Budget",
    description: "You just landed your first full-time job earning Rs 1,200,000/month. Create a budget from scratch.",
    icon: Wallet,
    steps: [
      {
        title: "Setting Up",
        narrative: "Congratulations on your new job! Your monthly take-home is Rs 1,200,000. What's your first step in managing this income?",
        choices: [
          { text: "List all expenses and create a 50/30/20 budget", score: 10, feedback: "The 50/30/20 rule is a proven framework: 50% needs, 30% wants, 20% savings." },
          { text: "Spend freely for a month to see where money goes", score: 3, feedback: "Tracking is good, but spending without limits means you'll likely overspend first." },
          { text: "Save everything and live as cheaply as possible", score: 5, feedback: "Admirable but unsustainable. Balance is key to a budget you can maintain." },
          { text: "Focus on paying bills and figure out the rest later", score: 2, feedback: "Bills are important, but without a full plan, discretionary spending will eat your income." },
        ],
      },
      {
        title: "Housing Decision",
        narrative: "You're looking for an apartment. Rent options range from Rs 240,000-Rs 480,000/month. Your take-home is Rs 1,200,000. What do you choose?",
        choices: [
          { text: "Rs 300,000/month — comfortable but leaves room for savings", score: 10, feedback: "25% of income on housing is ideal. You have plenty left for other goals." },
          { text: "Rs 240,000/month — cheapest option, further from work", score: 7, feedback: "Great for savings, but factor in commute costs and time. Still a solid choice." },
          { text: "Rs 420,000/month — nice place, close to everything", score: 4, feedback: "35% of income on housing is high. It limits your ability to save and handle surprises." },
          { text: "Rs 480,000/month — luxury apartment with amenities", score: 1, feedback: "40% on housing is risky. One unexpected expense could put you in debt." },
        ],
      },
      {
        title: "Lifestyle Choices",
        narrative: "After covering rent (Rs 300,000) and necessities (Rs 240,000), you have Rs 660,000 left. Friends want to go out every weekend. How do you balance fun and finances?",
        choices: [
          { text: "Set a Rs 120,000 fun budget and save Rs 240,000+ each month", score: 10, feedback: "Setting a fun budget lets you enjoy life while building wealth. Smart balance!" },
          { text: "Go out every weekend — you only live once", score: 2, feedback: "YOLO spending feels good now but leaves you vulnerable and delays financial goals." },
          { text: "Never go out — save every penny", score: 4, feedback: "While financially aggressive, social isolation isn't sustainable. Budget for fun." },
          { text: "Alternate — go out every other weekend", score: 7, feedback: "Good compromise! You're still spending less while maintaining a social life." },
        ],
      },
      {
        title: "Unexpected Windfall",
        narrative: "You receive a Rs 600,000 tax refund! What do you do with it?",
        choices: [
          { text: "Split it: 50% emergency fund, 30% debt, 20% treat", score: 10, feedback: "Balanced approach! You strengthen finances while rewarding yourself." },
          { text: "Put it all in savings", score: 7, feedback: "Financially sound but allowing yourself a small reward helps maintain motivation." },
          { text: "Spend it on a vacation — you've earned it", score: 3, feedback: "A vacation is nice, but early in your career, building savings is more impactful." },
          { text: "Invest it all in cryptocurrency", score: 1, feedback: "High-risk investments with money you may need is gambling, not investing." },
        ],
      },
    ],
  },
  {
    id: "investment-journey",
    title: "Investment Starter",
    description: "You have Rs 1,500,000 to invest for the first time. Navigate the world of investing.",
    icon: TrendingUp,
    steps: [
      {
        title: "Getting Started",
        narrative: "You've saved Rs 1,500,000 and want to start investing. But first, what should you check?",
        choices: [
          { text: "Ensure I have an emergency fund and no high-interest debt", score: 10, feedback: "Perfect! Investing before having a safety net or while paying 20%+ interest is risky." },
          { text: "Research which stocks are trending right now", score: 3, feedback: "Chasing trends is speculative, not investing. Fundamentals matter more." },
          { text: "Ask friends what they're investing in", score: 2, feedback: "Friends' situations differ from yours. What works for them may not work for you." },
          { text: "Put it all in immediately to avoid missing gains", score: 1, feedback: "FOMO-driven investing often leads to buying high. Preparation prevents costly mistakes." },
        ],
      },
      {
        title: "Choosing Your Approach",
        narrative: "You're ready to invest. You're 25 and won't need this money for 20+ years. What strategy do you choose?",
        choices: [
          { text: "Diversified index funds with low fees", score: 10, feedback: "Index funds offer broad market exposure with minimal fees. Warren Buffett's top recommendation!" },
          { text: "Pick individual stocks of companies I like", score: 4, feedback: "Stock picking is risky and most professionals can't beat the market consistently." },
          { text: "All in on one high-growth tech stock", score: 1, feedback: "Concentrating in one stock is extremely risky. If it drops 50%, you lose half your money." },
          { text: "Keep it all in a savings account — investing is too risky", score: 3, feedback: "Savings accounts lose value to inflation over time. Some investment risk is necessary for growth." },
        ],
      },
      {
        title: "Market Downturn",
        narrative: "Three months later, the market drops 15% and your Rs 1,500,000 is now worth Rs 1,275,000. What do you do?",
        choices: [
          { text: "Stay the course — downturns are normal over 20 years", score: 10, feedback: "Markets have always recovered over long periods. Staying invested is key to long-term growth." },
          { text: "Sell everything to prevent further losses", score: 1, feedback: "Selling during a downturn locks in your losses. You'd miss the recovery." },
          { text: "Invest more while prices are lower", score: 8, feedback: "Buying the dip is smart if you have the funds! You're getting more shares at a discount." },
          { text: "Move everything to bonds for safety", score: 3, feedback: "At 25 with a 20-year horizon, you have time to recover. Bonds won't grow enough." },
        ],
      },
    ],
  },
  {
    id: "housing-decision",
    title: "Rent vs. Buy",
    description: "You're considering buying your first home. Make smart decisions about this major purchase.",
    icon: Home,
    steps: [
      {
        title: "The Big Question",
        narrative: "You earn Rs 1,800,000/month and have Rs 9,000,000 saved. Rent is Rs 450,000/month. A house you like costs Rs 75,000,000. What's your first consideration?",
        choices: [
          { text: "Calculate total costs of ownership vs renting long-term", score: 10, feedback: "Smart! Owning includes mortgage, taxes, insurance, maintenance. Compare the full picture." },
          { text: "Buy immediately — renting is throwing money away", score: 2, feedback: "Rent isn't wasted — it buys flexibility and zero maintenance costs. Buying isn't always better." },
          { text: "Keep renting — buying is too much responsibility", score: 5, feedback: "Renting can be smart, but dismissing ownership entirely means missing potential benefits." },
          { text: "Buy the most expensive house I can get approved for", score: 1, feedback: "Banks approve more than you can comfortably afford. Being house-poor is stressful." },
        ],
      },
      {
        title: "Down Payment Strategy",
        narrative: "You decide to work toward buying. You have Rs 9,000,000 saved. The recommended down payment is 20% (Rs 15,000,000). What's your plan?",
        choices: [
          { text: "Save more until I have 20% plus an emergency fund", score: 10, feedback: "20% down avoids PMI and keeps you financially safe." },
          { text: "Put down 10% now and pay PMI", score: 6, feedback: "Viable if the market is right, but PMI adds cost. Make sure you can still save." },
          { text: "Use all Rs 9,000,000 as down payment with a smaller loan", score: 3, feedback: "Using all savings for a down payment leaves you with no emergency buffer. Risky!" },
          { text: "Borrow from my retirement account for the down payment", score: 2, feedback: "Raiding retirement has penalties and taxes, plus you lose years of compound growth." },
        ],
      },
      {
        title: "Making an Offer",
        narrative: "You've saved enough. In a competitive market, a seller has multiple offers on a Rs 75,000,000 home. What's your approach?",
        choices: [
          { text: "Offer asking price with a home inspection contingency", score: 10, feedback: "Fair price with protection. Never skip the inspection — hidden issues can cost thousands." },
          { text: "Offer Rs 84,000,000 to guarantee you win the bid", score: 2, feedback: "Overbidding 12% means you start with negative equity. Patience finds better deals." },
          { text: "Waive all contingencies to make your offer attractive", score: 1, feedback: "Waiving inspection is extremely risky. You could inherit huge hidden problems." },
          { text: "Offer below asking and be prepared to walk away", score: 7, feedback: "In a hot market this may not work, but knowing your limit is financially disciplined." },
        ],
      },
    ],
  },
];

interface SessionRecord {
  id: string;
  simulation_type: string;
  status: string;
  total_score: number | null;
  insights: string | null;
  completed_at: string | null;
  started_at: string;
  decisions: Json;
}

type ViewState = "catalog" | "playing" | "result";

export default function Simulations() {
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [view, setView] = useState<ViewState>("catalog");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [decisions, setDecisions] = useState<{ stepIndex: number; choiceIndex: number; score: number }[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pastSessions, setPastSessions] = useState<SessionRecord[]>([]);
  const [latestResult, setLatestResult] = useState<{ score: number; total: number; insights: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  async function loadSessions() {
    const { data } = await supabase
      .from("simulation_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false });
    setPastSessions((data ?? []) as SessionRecord[]);
  }

  function startScenario(scenario: Scenario) {
    setActiveScenario(scenario);
    setStepIndex(0);
    setDecisions([]);
    setSelectedChoice(null);
    setShowFeedback(false);
    setView("playing");
  }

  function confirmChoice() {
    if (selectedChoice === null || !activeScenario) return;
    const step = activeScenario.steps[stepIndex];
    const choice = step.choices[selectedChoice];
    setDecisions((prev) => [...prev, { stepIndex, choiceIndex: selectedChoice, score: choice.score }]);
    setShowFeedback(true);
  }

  function nextStep() {
    if (!activeScenario) return;
    if (stepIndex < activeScenario.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      finishSimulation();
    }
  }

  async function finishSimulation() {
    if (!activeScenario || !user) return;
    setSubmitting(true);

    const totalScore = decisions.reduce((sum, d) => sum + d.score, 0);
    const maxScore = activeScenario.steps.length * 10;
    const pct = Math.round((totalScore / maxScore) * 100);

    let insights: string;
    if (pct >= 80) insights = "Excellent decision-making! You demonstrated strong financial judgment across all scenarios.";
    else if (pct >= 60) insights = "Good job! You made mostly sound decisions. Review the areas where you could improve.";
    else if (pct >= 40) insights = "You're on the right track but some decisions could be improved. Consider revisiting the learning materials.";
    else insights = "There's room for improvement. Focus on building foundational financial knowledge before retaking this simulation.";

    const decisionsJson: Json = decisions.map((d) => ({
      stepIndex: d.stepIndex,
      choiceIndex: d.choiceIndex,
      score: d.score,
    }));

    await supabase.from("simulation_sessions").insert({
      user_id: user.id,
      simulation_type: activeScenario.id,
      status: "completed",
      total_score: pct,
      insights,
      decisions: decisionsJson,
      completed_at: new Date().toISOString(),
    });

    setLatestResult({ score: pct, total: maxScore, insights });
    setView("result");
    setSubmitting(false);
    await awardXP("simulation_complete", `${activeScenario.title} (Score: ${pct}%)`);
    toast({ title: "+75 XP!", description: "You earned XP for completing a simulation." });
    await loadSessions();
  }

  // --- Catalog ---
  if (view === "catalog") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Simulations</h1>
          <p className="text-muted-foreground">Practice real-world financial decisions in risk-free scenarios.</p>
        </div>

        <Tabs defaultValue="scenarios">
          <TabsList>
            <TabsTrigger value="scenarios" className="gap-1.5">
              <Gamepad2 className="h-4 w-4" /> Scenarios
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-1.5">
              <Wallet className="h-4 w-4" /> Budget Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {SCENARIOS.map((scenario) => {
                const Icon = scenario.icon;
                const completedCount = pastSessions.filter((s) => s.simulation_type === scenario.id && s.status === "completed").length;
                const bestScore = pastSessions
                  .filter((s) => s.simulation_type === scenario.id && s.status === "completed")
                  .reduce((best, s) => Math.max(best, s.total_score ?? 0), 0);

                return (
                  <Card key={scenario.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                    <CardHeader>
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" /> {scenario.title}
                      </CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {scenario.steps.length} decisions</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~5 min</span>
                      </div>
                      {completedCount > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Completed {completedCount}x</Badge>
                          <span className="text-sm font-medium">Best: {bestScore}%</span>
                        </div>
                      )}
                      <Button onClick={() => startScenario(scenario)} className="gap-2 w-full">
                        {completedCount > 0 ? <><RotateCcw className="h-4 w-4" /> Replay</> : <>Start <ArrowRight className="h-4 w-4" /></>}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {pastSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Session History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastSessions.slice(0, 10).map((s) => {
                      const scenario = SCENARIOS.find((sc) => sc.id === s.simulation_type);
                      return (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant={s.status === "completed" ? "default" : "secondary"}>{s.status}</Badge>
                            <span className="text-sm font-medium">{scenario?.title ?? s.simulation_type}</span>
                            <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                          </div>
                          <span className="font-semibold text-sm">{s.total_score ?? 0}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            <BudgetSimulator />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // --- Playing ---
  if (view === "playing" && activeScenario) {
    const step = activeScenario.steps[stepIndex];
    const progress = ((stepIndex + 1) / activeScenario.steps.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">{activeScenario.title}</h1>
          <span className="text-sm text-muted-foreground">Step {stepIndex + 1} of {activeScenario.steps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{step.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{step.narrative}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {step.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => !showFeedback && setSelectedChoice(i)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border transition-colors text-sm ${
                  selectedChoice === i
                    ? showFeedback
                      ? choice.score >= 8
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : choice.score >= 5
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                        : "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : "border-primary bg-primary/5"
                    : "hover:bg-muted/50 disabled:opacity-70"
                }`}
              >
                {choice.text}
                {showFeedback && selectedChoice === i && (
                  <p className="mt-2 text-xs text-muted-foreground italic">{choice.feedback}</p>
                )}
              </button>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setView("catalog")} className="text-muted-foreground">
              ← Exit
            </Button>
            {!showFeedback ? (
              <Button onClick={confirmChoice} disabled={selectedChoice === null}>
                Confirm Choice <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={submitting}>
                {stepIndex < activeScenario.steps.length - 1 ? (
                  <>Next Step <ChevronRight className="h-4 w-4 ml-1" /></>
                ) : (
                  <>{submitting ? "Saving..." : "See Results"} <Trophy className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- Result ---
  if (view === "result" && latestResult && activeScenario) {
    const scoreColor = latestResult.score >= 80 ? "text-green-600" : latestResult.score >= 50 ? "text-amber-600" : "text-red-600";

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold">Simulation Complete!</h1>
          <p className="text-muted-foreground">{activeScenario.title}</p>
        </div>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className={`text-5xl font-bold font-display ${scoreColor}`}>{latestResult.score}%</div>
            <Progress value={latestResult.score} className="h-3 max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{latestResult.insights}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Your Decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {decisions.map((d, i) => {
              const step = activeScenario.steps[d.stepIndex];
              const choice = step.choices[d.choiceIndex];
              return (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{step.title}</span>
                    <Badge variant={d.score >= 8 ? "default" : d.score >= 5 ? "secondary" : "destructive"}>
                      {d.score}/10
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{choice.text}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => startScenario(activeScenario)}>
            <RotateCcw className="h-4 w-4 mr-2" /> Replay
          </Button>
          <Button onClick={() => setView("catalog")}>All Simulations</Button>
        </div>
      </div>
    );
  }

  return null;
}
