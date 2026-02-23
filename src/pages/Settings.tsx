import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import {
  Camera, User, Flame, Award, Calendar, Shield, Trash2, LogOut,
  Check, X, Loader2, Briefcase, Target, BookOpen, Bell, Eye,
  Lock, ChevronRight, Sparkles, Star,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Types ──
interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string | null;
  username: string;
  city: string;
  age_range: string;
  gender: string;
  employment_status: string;
  income_range: string;
  financial_goals: string[];
  experience_level: string;
  content_preference: string;
  daily_goal_minutes: number;
  preferred_difficulty: string;
  notify_streak: boolean;
  notify_weekly: boolean;
  notify_content: boolean;
  notify_badges: boolean;
  notify_leaderboard: boolean;
}

interface ProgressData {
  xp: number;
  level: number;
  badges_earned: string[] | null;
}

interface BadgeInfo {
  id: string;
  name: string;
  icon: string | null;
  xp_required: number;
}

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan", "Faisalabad", "Other"];
const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45+"];
const GENDERS = ["Male", "Female", "Prefer not to say"];
const EMPLOYMENT = ["Student", "Employed", "Self-employed", "Freelancer", "Unemployed"];
const INCOME_RANGES = ["Under 30,000", "30,000–60,000", "60,000–100,000", "100,000–200,000", "200,000+"];
const FINANCIAL_GOALS = [
  "Build Emergency Fund", "Pay Off Debt", "Start Investing",
  "Buy a Home", "Save for Education", "Grow Business", "Retirement Planning",
];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const CONTENT_PREFS = ["Videos", "Articles", "Both"];
const DAILY_GOALS = [5, 10, 15, 30];
const DIFFICULTY_OPTS = ["Beginner", "Mixed", "Advanced"];

const defaultProfile: ProfileData = {
  display_name: "", bio: "", avatar_url: null, username: "",
  city: "", age_range: "", gender: "",
  employment_status: "", income_range: "",
  financial_goals: [], experience_level: "",
  content_preference: "both", daily_goal_minutes: 10, preferred_difficulty: "mixed",
  notify_streak: true, notify_weekly: true, notify_content: true,
  notify_badges: true, notify_leaderboard: false,
};

export default function Settings() {
  usePageTitle("Profile & Settings");
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<ProfileData>({ ...defaultProfile });
  const [progress, setProgress] = useState<ProgressData>({ xp: 0, level: 1, badges_earned: null });
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Section saving states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Load data ──
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, progressRes, badgesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_progress").select("xp, level, badges_earned").eq("user_id", user.id).maybeSingle(),
        supabase.from("badges").select("id, name, icon, xp_required").order("xp_required"),
      ]);
      if (profileRes.data) {
        const d = profileRes.data as any;
        setProfile({
          display_name: d.display_name ?? "",
          bio: d.bio ?? "",
          avatar_url: d.avatar_url ?? null,
          username: d.username ?? "",
          city: d.city ?? "",
          age_range: d.age_range ?? "",
          gender: d.gender ?? "",
          employment_status: d.employment_status ?? "",
          income_range: d.income_range ?? "",
          financial_goals: d.financial_goals ?? [],
          experience_level: d.experience_level ?? "",
          content_preference: d.content_preference ?? "both",
          daily_goal_minutes: d.daily_goal_minutes ?? 10,
          preferred_difficulty: d.preferred_difficulty ?? "mixed",
          notify_streak: d.notify_streak ?? true,
          notify_weekly: d.notify_weekly ?? true,
          notify_content: d.notify_content ?? true,
          notify_badges: d.notify_badges ?? true,
          notify_leaderboard: d.notify_leaderboard ?? false,
        });
      }
      if (progressRes.data) setProgress(progressRes.data as ProgressData);
      if (badgesRes.data) setBadges(badgesRes.data as BadgeInfo[]);
      setLoading(false);
    };
    load();
  }, [user]);

  // ── Username check ──
  const checkUsername = useCallback((val: string) => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (!val || val.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", val.toLowerCase()).neq("id", user?.id ?? "").limit(1);
      setUsernameStatus(data && data.length > 0 ? "taken" : "available");
    }, 500);
  }, [user]);

  // ── Update helpers ──
  const updateFields = async (fields: Record<string, any>) => {
    if (!user) return false;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...fields }).eq("id", user.id);
    if (error) { toast.error(getSafeErrorMessage(error)); return false; }
    return true;
  };

  // ── Save handlers ──
  const savePersonal = async () => {
    if (!profile.display_name.trim()) { toast.error("Display name is required"); return; }
    if (usernameStatus === "taken") { toast.error("Username is already taken"); return; }
    setSavingProfile(true);
    const ok = await updateFields({
      display_name: profile.display_name, bio: profile.bio,
      username: profile.username.toLowerCase() || null,
      city: profile.city || null, age_range: profile.age_range || null,
      gender: profile.gender || null,
    });
    if (ok) toast.success("Profile updated ✓");
    setSavingProfile(false);
  };

  const saveFinancial = async () => {
    setSavingFinancial(true);
    const ok = await updateFields({
      employment_status: profile.employment_status || null,
      income_range: profile.income_range || null,
      financial_goals: profile.financial_goals,
      experience_level: profile.experience_level || null,
    });
    if (ok) toast.success("Financial profile saved ✓");
    setSavingFinancial(false);
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    const ok = await updateFields({
      content_preference: profile.content_preference,
      daily_goal_minutes: profile.daily_goal_minutes,
      preferred_difficulty: profile.preferred_difficulty,
    });
    if (ok) toast.success("Preferences saved ✓");
    setSavingPrefs(false);
  };

  const toggleNotification = async (key: keyof ProfileData, value: boolean) => {
    setProfile(p => ({ ...p, [key]: value }));
    await updateFields({ [key]: value });
  };

  // ── Avatar upload ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(getSafeErrorMessage(uploadError)); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateFields({ avatar_url: url });
    setProfile(p => ({ ...p, avatar_url: url }));
    toast.success("Avatar updated!");
    setUploadingAvatar(false);
  };

  // ── Password change ──
  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(getSafeErrorMessage(error));
    else { toast.success("Password updated!"); setNewPassword(""); }
    setChangingPassword(false);
  };

  // ── Financial goals toggle ──
  const toggleGoal = (goal: string) => {
    setProfile(p => {
      const goals = p.financial_goals.includes(goal)
        ? p.financial_goals.filter(g => g !== goal)
        : p.financial_goals.length < 3 ? [...p.financial_goals, goal] : p.financial_goals;
      return { ...p, financial_goals: goals };
    });
  };

  // ── Derived ──
  const initials = profile.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const earnedBadgeIds = progress.badges_earned ?? [];
  const recentBadges = badges.filter(b => earnedBadgeIds.includes(b.id)).slice(-3);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" })
    : "";

  const xpPerLevel = 500;
  const xpInLevel = progress.xp % xpPerLevel;
  const xpToNext = xpPerLevel - xpInLevel;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your identity, financial profile, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══════ LEFT COLUMN — Profile Identity Card ═══════ */}
        <div className="w-full lg:w-[35%] lg:shrink-0">
          <Card className="border-border/50 sticky top-6">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 flex items-center justify-center bg-primary/15">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5"
                onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                <Camera className="h-3.5 w-3.5" /> Upload Photo
              </Button>

              {/* Name */}
              <div>
                <p className="text-lg font-display font-bold">{profile.display_name || "Set your name"}</p>
                {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
              </div>

              {/* Level & XP */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Star className="h-3 w-3 text-primary" /> Level {progress.level}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3 text-primary" /> {progress.xp} XP
                </Badge>
              </div>

              {/* Streak & member since */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><Flame className="inline h-3.5 w-3.5 text-amber-500 mr-1" />5-day streak</p>
                <p><Calendar className="inline h-3.5 w-3.5 mr-1" />Member since {memberSince}</p>
              </div>

              <Separator className="my-1" />

              {/* Recent badges */}
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-2">Recent Badges</p>
                {recentBadges.length > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    {recentBadges.map(b => (
                      <div key={b.id} className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-lg" title={b.name}>
                        {b.icon || "🏅"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No badges yet</p>
                )}
                <Link to="/dashboard" className="text-xs text-primary mt-2 inline-flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══════ RIGHT COLUMN — Settings Sections ═══════ */}
        <div className="flex-1 space-y-6">

          {/* ── Section 1: Personal Profile ── */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      value={profile.username}
                      onChange={e => {
                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                        setProfile(p => ({ ...p, username: v }));
                        checkUsername(v);
                      }}
                      className="pl-8"
                      placeholder="username"
                    />
                    {usernameStatus === "checking" && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                    {usernameStatus === "available" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
                    {usernameStatus === "taken" && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
                  </div>
                  {usernameStatus === "taken" && <p className="text-xs text-destructive">Username is taken</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={profile.city} onValueChange={v => setProfile(p => ({ ...p, city: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select value={profile.age_range} onValueChange={v => setProfile(p => ({ ...p, age_range: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{AGE_RANGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={profile.gender} onValueChange={v => setProfile(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={savePersonal} disabled={savingProfile}
                className="shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow">
                {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* ── Section 2: Financial Profile ── */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Financial Profile
              </CardTitle>
              <CardDescription>Help us personalize your learning experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={profile.employment_status} onValueChange={v => setProfile(p => ({ ...p, employment_status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{EMPLOYMENT.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Income Range (PKR)</Label>
                  <Select value={profile.income_range} onValueChange={v => setProfile(p => ({ ...p, income_range: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{INCOME_RANGES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Financial Goals <span className="text-muted-foreground text-xs">(pick up to 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {FINANCIAL_GOALS.map(g => {
                    const selected = profile.financial_goals.includes(g);
                    return (
                      <button key={g} onClick={() => toggleGoal(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Financial Experience Level</Label>
                <div className="flex gap-2">
                  {EXPERIENCE_LEVELS.map(lvl => (
                    <button key={lvl} onClick={() => setProfile(p => ({ ...p, experience_level: lvl.toLowerCase() }))}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        profile.experience_level === lvl.toLowerCase()
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={saveFinancial} disabled={savingFinancial}
                className="shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow">
                {savingFinancial ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save Financial Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* ── Section 3: Notifications ── */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {([
                { key: "notify_streak" as const, label: "Daily streak reminder", desc: "Remind me to maintain my streak" },
                { key: "notify_weekly" as const, label: "Weekly progress report", desc: "Send me a weekly summary of my XP and progress" },
                { key: "notify_content" as const, label: "New content alerts", desc: "Notify me when new videos or articles are added" },
                { key: "notify_badges" as const, label: "Badge earned notifications", desc: "Celebrate when I unlock a new badge" },
                { key: "notify_leaderboard" as const, label: "Leaderboard updates", desc: "Notify me when my rank changes" },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={profile[key] as boolean} onCheckedChange={v => toggleNotification(key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Section 4: Learning Preferences ── */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Preferred Content Type</Label>
                <div className="flex gap-2">
                  {CONTENT_PREFS.map(cp => (
                    <button key={cp} onClick={() => setProfile(p => ({ ...p, content_preference: cp.toLowerCase() }))}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        profile.content_preference === cp.toLowerCase()
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                      {cp}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Daily Learning Goal</Label>
                <div className="flex gap-2">
                  {DAILY_GOALS.map(m => (
                    <button key={m} onClick={() => setProfile(p => ({ ...p, daily_goal_minutes: m }))}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        profile.daily_goal_minutes === m
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preferred Difficulty</Label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTS.map(d => (
                    <button key={d} onClick={() => setProfile(p => ({ ...p, preferred_difficulty: d.toLowerCase() }))}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        profile.preferred_difficulty === d.toLowerCase()
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={savePreferences} disabled={savingPrefs}
                className="shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow">
                {savingPrefs ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>

          {/* ── Section 5: Account & Security ── */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Account & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">Cannot be changed</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Change Password</Label>
                <div className="flex gap-2">
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)" className="flex-1" />
                  <Button variant="outline" size="sm" onClick={handleChangePassword} disabled={changingPassword || !newPassword}>
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                <p className="text-sm font-medium text-destructive">Danger Zone</p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out?</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to sign out?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={signOut}>Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs text-destructive/60 hover:text-destructive flex items-center gap-1 transition-colors">
                      <Trash2 className="h-3 w-3" /> Delete Account
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent. All your data, progress, and badges will be permanently deleted.
                        Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE"' className="my-2" />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                      <AlertDialogAction disabled={deleteConfirm !== "DELETE"}
                        onClick={async () => {
                          toast.info("Account deletion requested. Contact support to complete this process.");
                          setDeleteConfirm("");
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
