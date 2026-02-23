import { MapPin, Map, TrendingUp } from "lucide-react";

const values = [
  { icon: MapPin, title: "Find Your Baseline", description: "Know exactly where your financial knowledge stands today" },
  { icon: Map, title: "Get Your Roadmap", description: "Receive a personalized learning path based on your results" },
  { icon: TrendingUp, title: "Track Your Growth", description: "Retake later to see how much you've improved" },
];

export function AssessmentValueStrip() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
      {values.map((v) => (
        <div key={v.title} className="flex items-start gap-3 px-6 py-5 md:first:pl-0 md:last:pr-0">
          <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
            <v.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">{v.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
