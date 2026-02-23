import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-sidebar relative overflow-hidden">
      {/* Geometric accent shape */}
      <div className="absolute -right-20 top-0 bottom-0 w-[60%] bg-accent/[0.04] -skew-x-12 pointer-events-none" />
      <div className="absolute -right-40 top-0 bottom-0 w-[30%] bg-accent/[0.03] -skew-x-12 pointer-events-none" />

      <div className="container relative py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-sidebar-primary-foreground leading-tight">
            Your financial journey{" "}
            <span className="text-accent">starts today.</span>
          </h2>
          <p className="text-sidebar-foreground mt-4 text-lg max-w-md leading-relaxed">
            Join thousands of Pakistanis who are building better financial habits with FinBachat.
          </p>

          <Button
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-display gap-2 h-14 px-10 text-lg shadow-[0_0_40px_hsl(var(--accent)/0.3)] hover:shadow-[0_0_60px_hsl(var(--accent)/0.4)] transition-all animate-pulse-glow"
            asChild
          >
            <Link to="/auth">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <p className="text-sm text-sidebar-foreground/40 mt-4">
            Join 10,000+ Pakistanis already learning — it's free.
          </p>
        </div>
      </div>
    </section>
  );
}
