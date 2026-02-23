import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function BaselineNudgeBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || dismissed) return;
    // Don't show on assessments page or landing/auth
    if (location.pathname === "/assessments" || location.pathname === "/" || location.pathname === "/auth") {
      setVisible(false);
      return;
    }

    const check = async () => {
      const { count } = await supabase
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("assessment_type", "baseline");

      setVisible((count ?? 0) === 0);
    };
    check();
  }, [user, location.pathname, dismissed]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 pb-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md px-4 py-3 shadow-[0_8px_30px_hsl(var(--primary)/0.1)]">
        <BarChart3 className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm">
          📊 You haven't taken your Baseline Assessment yet —{" "}
          <Link to="/assessments" className="text-primary font-semibold hover:underline">
            Start Now →
          </Link>
        </p>
        <button onClick={() => setDismissed(true)} className="ml-2 p-1 rounded hover:bg-secondary transition-colors">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
