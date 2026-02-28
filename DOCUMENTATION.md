# FinBachat — Complete Platform Documentation

> **FinBachat** is a gamified financial literacy and behavioral learning web application designed for the Pakistani audience. It provides assessments, simulations, financial tools, expert content, and a progress system with XP, levels, and badges.

**Live URL:** [https://finbachat.lovable.app](https://finbachat.lovable.app)

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Database Schema](#4-database-schema)
5. [Pages & Features](#5-pages--features)
6. [Gamification System](#6-gamification-system)
7. [Role-Based Access Control](#7-role-based-access-control)
8. [Component Architecture](#8-component-architecture)
9. [Design System](#9-design-system)
10. [API & Data Flow](#10-api--data-flow)
11. [Deployment](#11-deployment)

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | React Query (TanStack) + React Context |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth (email/password) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner + shadcn Toast |

---

## 2. Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── landing/               # Landing page sections (Hero, Features, CTA, etc.)
│   ├── assessments/           # Assessment module components
│   ├── simulations/           # Simulation module components
│   ├── tools/                 # Financial tool components (6 tools)
│   ├── AppLayout.tsx          # Authenticated app shell with sidebar
│   ├── AppSidebar.tsx         # Navigation sidebar (role-aware)
│   ├── ProtectedRoute.tsx     # Role-based route guard
│   ├── BaselineNudgeBar.tsx   # Nudge bar for new users
│   └── NavLink.tsx            # Navigation link component
├── pages/
│   ├── Landing.tsx            # Public landing page
│   ├── Auth.tsx               # Login / Register / Forgot Password
│   ├── ResetPassword.tsx      # Password reset page
│   ├── Dashboard.tsx          # User dashboard (XP, badges, activity)
│   ├── Assessments.tsx        # Financial assessments module
│   ├── Simulations.tsx        # Decision-based simulations
│   ├── BudgetSimulator.tsx    # 12-month budget simulator
│   ├── Tools.tsx              # Financial tools hub
│   ├── Learn.tsx              # Video lessons + articles feed
│   ├── Notifications.tsx      # In-app notifications
│   ├── Settings.tsx           # Profile & settings management
│   ├── ExpertContent.tsx      # Expert content authoring (expert/admin)
│   ├── AdminUsers.tsx         # User management (admin only)
│   ├── AdminModeration.tsx    # Content moderation (admin only)
│   └── NotFound.tsx           # 404 page
├── hooks/
│   ├── useAuth.tsx            # Auth context provider & hook
│   ├── useUserRole.tsx        # Role fetching hook
│   ├── useXP.tsx              # XP awarding logic
│   ├── usePageTitle.ts        # Document title hook
│   ├── use-toast.ts           # Toast notification hook
│   └── use-mobile.tsx         # Mobile breakpoint detection
├── data/
│   └── scenarios.ts           # Simulation scenario definitions
├── integrations/supabase/
│   ├── client.ts              # Supabase client (auto-generated)
│   └── types.ts               # Database types (auto-generated)
├── lib/
│   ├── utils.ts               # Utility functions (cn, etc.)
│   └── errorHandler.ts        # Safe error message extraction
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
└── index.css                  # Global styles & design tokens
```

---

## 3. Authentication & Authorization

### Auth Flow
- **Registration:** Email + password + display name → email confirmation required
- **Login:** Email + password → redirects to `/dashboard`
- **Forgot Password:** Sends reset link via email → `/reset-password` page
- **Session:** Persisted in `localStorage`, auto-refreshed via Supabase Auth

### Auth Provider (`useAuth`)
```tsx
// Available methods:
const { user, session, loading, signUp, signIn, signOut } = useAuth();
```

### Route Protection
- **Public routes:** `/`, `/auth`, `/reset-password`
- **Authenticated routes:** All routes inside `<AppLayout>` require a logged-in user
- **Role-protected routes:** `<ProtectedRoute requiredRoles={["admin"]}>` guards admin/expert pages

---

## 4. Database Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profile data | `id` (FK to auth.users), `display_name`, `username`, `avatar_url`, `bio`, `city`, `age_range`, `gender`, `employment_status`, `income_range`, `financial_goals[]`, `experience_level`, `preferred_difficulty`, `content_preference`, `daily_goal_minutes`, notification toggles |
| `user_progress` | XP, level, badges | `user_id`, `xp`, `level`, `badges_earned[]`, `financial_health_score`, `behavior_type` |
| `user_roles` | RBAC roles | `user_id`, `role` (enum: `user`, `expert`, `admin`) |
| `assessments` | Completed assessments | `user_id`, `assessment_type` (baseline/post), `overall_score`, `knowledge_score`, `behavior_score`, `confidence_score`, `answers` (JSON) |
| `questions` | Assessment questions | `question_text`, `options` (JSON), `correct_answer`, `assessment_type`, `category_id`, `difficulty`, `score_weight` |
| `categories` | Question categories | `name`, `description` |
| `simulation_sessions` | Simulation results | `user_id`, `simulation_type`, `status`, `total_score`, `insights`, `decisions` (JSON) |
| `budget_sim_sessions` | Budget simulator sessions | `user_id`, `monthly_income`, `current_month`, `status`, `total_xp_earned`, `behavior_type` |
| `budget_sim_months` | Monthly budget data | `session_id`, `month_number`, `allocations` (JSON), `life_event` (JSON), `balance_before`, `balance_after`, `savings_total`, `xp_earned` |
| `tool_results` | Financial tool usage | `user_id`, `tool_name`, `inputs` (JSON), `outputs` (JSON) |
| `expert_content` | Educational articles | `author_id`, `title`, `body`, `category`, `status` (draft/pending_review/approved/rejected), `views_count`, `likes_count` |
| `content_likes` | Article likes | `user_id`, `content_id` |
| `video_lessons` | YouTube video lessons | `title`, `youtube_id`, `youtube_url`, `category`, `difficulty`, `duration`, `added_by` |
| `notifications` | In-app notifications | `user_id`, `title`, `message`, `type`, `is_read` |
| `badges` | Badge definitions | `name`, `description`, `icon`, `xp_required` |

### Enums
- `app_role`: `user` | `expert` | `admin`
- `assessment_type`: `baseline` | `post`
- `content_status`: `draft` | `pending_review` | `approved` | `rejected`

### Security
- All tables secured with **Row-Level Security (RLS)** scoped to `auth.uid()`
- `has_role()` — security definer function for admin/expert access checks
- `increment_views()`, `increment_likes()`, `decrement_likes()` — atomic RPC functions for content metrics

---

## 5. Pages & Features

### 5.1 Landing Page (`/`)
**File:** `src/pages/Landing.tsx`

Public marketing page with six sections:
- **LandingNav** — Logo + Sign In / Get Started buttons
- **HeroSection** — Main headline + CTA
- **FeaturesSection** — Key feature highlights
- **HowItWorksSection** — Step-by-step explanation
- **SocialProofSection** — Testimonials / stats
- **CTASection** — Final call-to-action
- **LandingFooter** — Links + copyright

---

### 5.2 Authentication (`/auth`)
**File:** `src/pages/Auth.tsx`

Split-screen layout:
- **Left panel:** Branding + feature highlights (desktop only)
- **Right panel:** Tabbed Sign In / Sign Up forms
- **Features:** Password visibility toggle, Forgot Password flow, email confirmation on signup
- Auto-redirects to `/dashboard` if already authenticated

---

### 5.3 Dashboard (`/dashboard`)
**File:** `src/pages/Dashboard.tsx`

The main hub showing:
- **Greeting header** with display name (or "Set your name" link)
- **Streak calendar** — 7-day visual streak tracker with animated circles
- **XP progress bar** — Current XP, level, progress to next level
- **Stat cards:**
  - Financial Health Score (ring chart)
  - Badges earned (count + next badge)
  - Next badge progress
- **Daily Mission** — One-click mission completion
- **Continue Learning** — Personalized quick action cards (context-aware based on completed activities)
- **Recent Activity** — Latest assessments, simulations, and tool usage
- **Animated counters** — XP, health score, and badge count animate on load

---

### 5.4 Assessments (`/assessments`)
**File:** `src/pages/Assessments.tsx`

Two assessment modes:
- **Baseline Assessment** — First-time financial knowledge test
- **Post Assessment** — Unlocked after completing baseline; measures improvement

**Flow:**
1. Landing page with hero banner, value strip, and mode cards
2. Difficulty selector (Easy / Medium / Hard / Mixed)
3. Quiz interface with 15 randomized questions
4. Progress indicator and navigation (prev/next)
5. Results screen showing 4 scores: Overall, Knowledge, Behavior, Confidence
6. Assessment history with past scores

**Scoring Engine:**
- Questions categorized by `category_id` (Budgeting/Saving → Knowledge, Debt → Behavior, Planning → Confidence)
- Correct answers tallied per category
- Percentages calculated for each dimension + overall

**XP Reward:** +100 XP per completed assessment

---

### 5.5 Simulations (`/simulations`)
**File:** `src/pages/Simulations.tsx`

Two simulation types via tabs:

#### Scenario Simulations
Pre-defined financial scenarios with multi-step decision trees:

| Scenario | Difficulty | Topic |
|----------|-----------|-------|
| Emergency Fund Crisis | Beginner | Emergency savings |
| Your First Budget | Beginner | Budgeting basics |
| Investment Starter | Intermediate | Investing |
| Rent vs. Buy | Advanced | Property decisions |
| Eid is Coming | Beginner | Cultural expense planning |
| Side Hustle Launch | Intermediate | Freelance finance |
| Family Health Emergency | Advanced | Medical finance |
| Inflation Survival | Intermediate | Inflation management |

**Each scenario includes:**
- Starting balance + monthly income context
- 3-4 decision steps with narrative
- Each step has 4 choices with scores (0-10), feedback, financial impact, and risk level
- Real-time dashboard showing balance, savings rate, health score, XP
- Results page with score percentage and insights

**XP Reward:** +75 XP per completed simulation

#### Budget Simulator
12-month budget allocation game:
- Set monthly income (PKR)
- Allocate across 5 categories: Needs, Wants, Savings, Investments, Donations
- Slider-based allocation with 50/30/20 benchmarks
- Random life events each month (car repair, bonus, utility spike, etc.)
- Running balance, savings total, and per-month XP
- Behavior classification at end: Conservative Saver, Aggressive Investor, Impulsive Spender, or Balanced Planner

---

### 5.6 Financial Tools (`/tools`)
**File:** `src/pages/Tools.tsx`

Six interactive calculators (all in PKR):

| Tool | Category | Time | Description |
|------|----------|------|-------------|
| Smart Budget Builder | Budgeting | ~5 min | Slider-based 50/30/20 budget allocation |
| Weekly Cash Flow Tracker | Budgeting | ~5 min | Weekly income/expense logging by category |
| Emergency Fund Calculator | Savings | ~3 min | Calculates months of savings needed |
| Debt Control Planner | Debt | ~5 min | Minimum vs aggressive payoff comparison |
| Inflation Impact Tool | Savings | ~3 min | Shows Rs 100,000 erosion over 10 years |
| Savings Goal Planner | Savings | ~4 min | Month-by-month plan to reach a savings goal |

**Features:**
- Category filtering (All / Budgeting / Savings / Debt)
- Tool usage tracking with "last used" dates
- Recommended tool banner for unused tools
- Completion tracker (6/6 → Financial Toolkit Master badge)
- Results saved to `tool_results` table

**XP Reward:** +25 XP per tool used

---

### 5.7 Learn (`/learn`)
**File:** `src/pages/Learn.tsx`

Combined learning hub with:
- **Video Lessons** — YouTube embedded player with default + user-added videos
- **Articles** — Approved expert content feed
- **Learning Paths** — Structured paths (Budgeting, Investing, Debt, Planning)

**Features:**
- Search across videos and articles
- Category + difficulty + sort filters
- Content type toggle (All / Videos / Articles)
- Bookmark videos and articles (local state)
- "Saved" tab for bookmarked content
- Claim XP for watching videos (+15 XP) or reading articles (+10 XP)
- Like/unlike articles (with atomic RPC)
- Admins/experts can add new YouTube videos via dialog
- Admins can remove any video; experts can remove their own

---

### 5.8 Notifications (`/notifications`)
**File:** `src/pages/Notifications.tsx`

- Lists last 50 notifications ordered by date
- Type icons: XP (⚡), Badge (🏅), Level Up (📈), Info (ℹ️)
- "New" badge on unread notifications
- Mark individual as read or "Mark all read"
- Empty state with guidance

**Notification triggers:**
- XP earned (any activity)
- Level up
- Badge unlocked

---

### 5.9 Settings (`/settings`)
**File:** `src/pages/Settings.tsx`

Two-column layout:
- **Left: Profile Identity Card** — Avatar (with upload), display name, username (with availability check), Level/XP badges, recent badges
- **Right: Settings Sections:**
  - Personal Profile (city, age range, gender, bio)
  - Financial Profile (employment, income range, financial goals, experience level)
  - Notification Preferences (5 toggle switches)
  - Learning Preferences (difficulty, content type, daily goal)
  - Account & Security (sign out, delete account with confirmation)

All sections use `upsert` for persistence.

---

### 5.10 Expert Content (`/expert/content`)
**File:** `src/pages/ExpertContent.tsx`
**Access:** Expert + Admin roles only

Content authoring interface:
- List of author's articles with status badges (Draft, Pending Review, Approved, Rejected)
- Create/Edit dialog with title, category selector, and rich text body
- Save as Draft or Submit for Review
- Delete articles with confirmation
- View/like/time metrics

---

### 5.11 Admin: User Management (`/admin/users`)
**File:** `src/pages/AdminUsers.tsx`
**Access:** Admin role only

- User list with search
- Stats: Total Users, Admins, Experts
- Click user → dialog showing roles
- Add/remove roles (user, expert, admin)
- Cannot remove your own admin role or the last remaining role

---

### 5.12 Admin: Content Moderation (`/admin/moderation`)
**File:** `src/pages/AdminModeration.tsx`
**Access:** Admin role only

- Tabbed view: Pending / Approved / Rejected
- Pending count badge
- Preview article in full dialog
- One-click Approve / Reject
- Author names resolved from profiles

---

## 6. Gamification System

### XP Rewards
| Activity | XP |
|----------|----|
| Complete Assessment | +100 |
| Complete Simulation | +75 |
| Use Financial Tool | +25 |
| Watch Video | +15 |
| Read Article | +10 |

### Leveling
- **XP per level:** 500
- **Level formula:** `Math.floor(totalXP / 500) + 1`
- Level-up triggers a notification

### Badges
- Stored in `badges` table with `xp_required` threshold
- Automatically awarded when XP crosses threshold
- Badge unlock triggers a notification
- Displayed on Dashboard and Settings profile card

### Financial Health Score
Composite score (0-100) calculated from:
- XP progress (40% weight, capped at 2000 XP)
- Level (30% weight, 5 points per level)
- Badge completion (30% weight, % of badges earned)

### Behavior Type
Classified after Budget Simulator completion:
- **Conservative Saver** — High savings ratio, low wants
- **Aggressive Investor** — High investment ratio
- **Impulsive Spender** — High wants ratio (40%+)
- **Balanced Planner** — Everything else

---

## 7. Role-Based Access Control

### Roles
| Role | Permissions |
|------|------------|
| `user` | Dashboard, Assessments, Simulations, Tools, Learn, Notifications, Settings |
| `expert` | All user permissions + Expert Content authoring + Add/remove own videos |
| `admin` | All permissions + User Management + Content Moderation + Remove any video |

### Implementation
- **`useUserRole()` hook** — Fetches roles from `user_roles` table
- **`<ProtectedRoute>`** — Wraps routes, checks if user has any of `requiredRoles`
- **`AppSidebar`** — Conditionally shows Expert and Admin menu sections
- **Database RLS** — `has_role()` function used in policies for server-side enforcement

---

## 8. Component Architecture

### Layout Components
- **`AppLayout`** — Wraps authenticated pages with sidebar + main content area
- **`AppSidebar`** — Role-aware navigation with unread notification count
- **`BaselineNudgeBar`** — Prompts new users to take baseline assessment

### Assessment Components
- `AssessmentHeroBanner` — Dynamic banner based on assessment status
- `AssessmentValueStrip` — Value proposition strip
- `AssessmentModeCard` — Baseline/Post mode selector with difficulty picker
- `AssessmentQuiz` — Quiz interface with progress and navigation
- `AssessmentResults` — Score display with 4 dimensions
- `AssessmentHistory` — Past assessment list

### Simulation Components
- `ScenarioCard` — Scenario preview card with metadata
- `SimulationDashboard` — Persistent stats bar during simulations
- `SimulationResults` — End-of-simulation summary

### Financial Tool Components
- `SmartBudgetBuilder` — 50/30/20 budget builder
- `WeeklyCashFlowTracker` — Weekly income/expense tracker
- `EmergencyFundCalculator` — Emergency fund calculator
- `DebtControlPlanner` — Debt payoff comparison
- `InflationImpactTool` — Inflation erosion visualizer
- `SavingsGoalPlanner` — Savings goal timeline

---

## 9. Design System

### Aesthetic
- Clean, professional finance aesthetic
- Card-based layouts with subtle shadows
- Neutral color palette with accent colors for progress/achievements
- Dark mode compatible via CSS variables

### Typography
- **Display font** (`font-display`): Used for headings and numbers
- **Body font**: Default system/sans-serif

### Color Tokens (HSL)
- `--primary` — Main accent (buttons, links, progress)
- `--destructive` — Error/danger states
- `--warning` — Caution states (amber)
- `--info` — Informational highlights
- `--chart-1` through `--chart-5` — Chart colors

### Component Library
Built on **shadcn/ui** with customized variants:
- Button, Card, Badge, Dialog, Tabs, Progress, Select, Input, Slider, etc.
- Custom `card-hover` class for interactive cards
- Custom `animate-pulse-glow` for streak indicator

---

## 10. API & Data Flow

### Data Fetching Pattern
All data fetching uses the Supabase JS client directly:
```tsx
import { supabase } from "@/integrations/supabase/client";

// Fetch
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("user_id", user.id);

// Insert
await supabase.from("table_name").insert({ ... });

// Update
await supabase.from("table_name").update({ ... }).eq("id", id);

// Upsert
await supabase.from("table_name").upsert({ id: user.id, ...fields });

// RPC
await supabase.rpc("increment_views", { _content_id: id });
```

### Error Handling
- `getSafeErrorMessage(error)` — Extracts user-friendly message from Supabase errors
- All mutations wrapped in try/catch with toast notifications
- Console errors logged for debugging

### State Management
- **Auth state:** React Context via `AuthProvider`
- **Server data:** Fetched on mount via `useEffect`, stored in local `useState`
- **React Query:** Available but primarily used for caching setup
- **Form state:** Local `useState` per form

---

## 11. Deployment

### Frontend
- Built with Vite → static output
- Deployed via Lovable's built-in publish system
- Published at: `https://finbachat.lovable.app`
- Custom domain supported via Settings → Domains

### Backend
- Lovable Cloud (Supabase) — auto-provisioned
- Database migrations in `supabase/migrations/`
- Edge functions auto-deployed
- Backend changes deploy immediately; frontend requires "Update" click

### Environment Variables (auto-managed)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Currency & Locale

All financial values are in **Pakistani Rupees (PKR / Rs)**. The platform is designed with Pakistan-specific scenarios, cultural references (Eid, local expenses), and relevant income ranges.

---

## Key Hooks Reference

| Hook | Purpose |
|------|---------|
| `useAuth()` | Current user, session, auth methods |
| `useUserRole()` | User roles, `isAdmin`, `isExpert`, `isUser` |
| `useXP()` | `awardXP(activity, label)` — awards XP + checks badges + creates notifications |
| `usePageTitle(title)` | Sets document title |
| `useMobile()` | Returns boolean for mobile breakpoint |

---

*Documentation generated on 2026-02-28*
