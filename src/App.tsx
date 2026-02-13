import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Assessments from "@/pages/Assessments";
import Simulations from "@/pages/Simulations";
import Tools from "@/pages/Tools";
import Learn from "@/pages/Learn";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import ExpertContent from "@/pages/ExpertContent";
import AdminUsers from "@/pages/AdminUsers";
import AdminModeration from "@/pages/AdminModeration";
import BudgetSimulator from "@/pages/BudgetSimulator";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/simulations" element={<Simulations />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/budget-simulator" element={<BudgetSimulator />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/expert/content" element={<ProtectedRoute requiredRoles={["expert", "admin"]}><ExpertContent /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/moderation" element={<ProtectedRoute requiredRoles={["admin"]}><AdminModeration /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
