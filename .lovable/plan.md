
# FinLit Platform — Full Build Plan

## Overview
A gamified financial literacy web app with assessments, simulations, financial tools, expert content, and role-based access (user, expert, admin). Clean & professional design. Powered by Lovable Cloud (Supabase).

---

## Phase 1: Foundation & Authentication
- **Lovable Cloud setup** — spin up Supabase backend
- **Database schema** — Create all core tables: `profiles`, `user_progress`, `user_roles`, `assessments`, `simulation_sessions`, `tool_results`, `expert_content`, `notifications`, `badges`, `questions`, `categories`
- **RLS policies** — Secure all tables with row-level security scoped to `auth.uid()`. Use `has_role()` security definer function for admin/expert access patterns
- **Auth pages** — Registration, login, logout with email/password
- **Profile management** — Auto-create profile on signup via trigger, editable profile page

## Phase 2: Dashboard & Navigation
- **App layout** — Responsive sidebar/nav with role-aware menu items (user sees tools/assessments, expert sees content authoring, admin sees management)
- **User dashboard** — XP progress bar, level indicator, badges earned, financial health score overview, recent activity summary
- **Clean, professional design system** — Neutral color palette, clear typography, card-based layouts

## Phase 3: Assessment Module
- **Baseline & post assessment flow** — Multi-step questionnaire with progress indicator
- **Scoring engine** — Calculate knowledge, behavior, confidence, and overall scores
- **Results storage** — Save to `assessments` table, display historical results
- **Smart routing** — Show baseline assessment for new users, post-assessment for returning users

## Phase 4: Simulations
- **Simulation session flow** — Step-by-step decision-making scenarios with choices and consequences
- **Scoring & insights** — Track decisions per step, calculate total score, generate insights
- **Session history** — View completed simulations with scores and takeaways

## Phase 5: Financial Tools
- **Budget Planner** — Income/expense breakdown with visual summary
- **Savings Calculator** — Goal-based savings projections
- **Emergency Fund Calculator** — Recommended fund size based on expenses
- **Risk Profile Assessment** — Questionnaire-based risk tolerance score
- **Persistent results** — Save and retrieve latest results per tool from `tool_results`

## Phase 6: Expert Content & Moderation
- **Content authoring** (expert role) — Create and submit educational articles/tips
- **Content feed** (users) — Browse approved content with view/like tracking
- **Admin moderation** — Approve/reject pending content submissions

## Phase 7: Achievements & Notifications
- **XP & badge system** — Award XP for completing assessments, simulations, and tool usage; unlock badges at milestones
- **Notifications** — In-app notifications for achievements, content approvals, and key events with read/unread status

## Phase 8: Admin Panel
- **User management** — View all users, update roles (user/expert/admin), delete users
- **Content moderation dashboard** — Review and approve/reject expert submissions
- **Role-based route protection** — Restrict admin and expert pages to authorized roles only

## Design Direction
- Clean, professional aesthetic with a trustworthy finance feel
- Card-based layouts, subtle shadows, neutral color palette with accent colors for progress/achievements
- Clear data visualization for scores, progress bars, and financial tool outputs
- Mobile-responsive throughout
