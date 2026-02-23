import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="border-t border-sidebar-border bg-sidebar">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-xs font-bold text-accent-foreground">
              FB
            </div>
            <span className="font-display text-lg font-bold text-sidebar-primary-foreground">FinBachat</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-6 text-sm text-sidebar-foreground/60">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a>
            <a href="#leaderboard" className="hover:text-accent transition-colors">Leaderboard</a>
            <a href="#testimonials" className="hover:text-accent transition-colors">Testimonials</a>
            <Link to="/auth" className="hover:text-accent transition-colors">Sign In</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-sidebar-border text-center text-xs text-sidebar-foreground/30">
          © {new Date().getFullYear()} FinBachat. Built with ❤️ in Pakistan.
        </div>
      </div>
    </footer>
  );
}
