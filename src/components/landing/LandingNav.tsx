import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-accent-foreground">
            FB
          </div>
          <span className="font-display text-xl font-bold text-sidebar-primary-foreground">FinBachat</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Leaderboard", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-sidebar-foreground hover:text-accent transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:text-accent" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-display" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
