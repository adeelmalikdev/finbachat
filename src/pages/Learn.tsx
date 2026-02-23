import { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  BookOpen, Eye, Heart, Clock, Search, User, Play, Video, Plus, Trash2, Link,
  Zap, Bookmark, BookmarkCheck, Filter, CheckCircle2, Lock, ArrowRight,
  GraduationCap, TrendingUp, Target, ChevronRight, Star, X
} from "lucide-react";
import { useXP } from "@/hooks/useXP";
import { toast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorHandler";

// --- Types ---
interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  category: string;
  duration: string;
  difficulty: string;
  added_by?: string;
  isDefault?: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  category: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
  author_id: string;
}

// Default videos
const DEFAULT_VIDEOS: VideoLesson[] = [
  { id: "d1", title: "Budgeting Basics for Beginners", description: "Learn the fundamentals of creating and maintaining a personal budget.", youtube_id: "sVKQn2I4HDM", category: "Budgeting", duration: "12 min", difficulty: "Beginner", isDefault: true },
  { id: "d2", title: "The 50/30/20 Budget Rule Explained", description: "Master the popular 50/30/20 budgeting framework.", youtube_id: "HQzoZfc3GwQ", category: "Budgeting", duration: "8 min", difficulty: "Beginner", isDefault: true },
  { id: "d3", title: "How to Start Investing for Beginners", description: "A complete beginner's guide to investing.", youtube_id: "gFQNPmLKj1k", category: "Saving & Investing", duration: "20 min", difficulty: "Beginner", isDefault: true },
  { id: "d4", title: "Compound Interest - The 8th Wonder", description: "Understand how compound interest works.", youtube_id: "wf91rEGw88Q", category: "Saving & Investing", duration: "10 min", difficulty: "Beginner", isDefault: true },
  { id: "d7", title: "Financial Planning 101", description: "Create a comprehensive financial plan.", youtube_id: "4j2emMn7UaI", category: "Financial Planning", duration: "18 min", difficulty: "Beginner", isDefault: true },
];

// Learning paths (static structure referencing video/article categories)
const LEARNING_PATHS = [
  { id: "lp1", title: "Budgeting Fundamentals", description: "Master your monthly budget", category: "Budgeting", videoCount: 2, articleCount: 2, time: "~30 min", xp: 200, badge: "Budget Master" },
  { id: "lp2", title: "Investing for Beginners", description: "Start your investment journey", category: "Saving & Investing", videoCount: 2, articleCount: 2, time: "~45 min", xp: 250, badge: "Investor" },
  { id: "lp3", title: "Debt Management", description: "Take control of your debt", category: "Debt Management", videoCount: 2, articleCount: 2, time: "~35 min", xp: 200, badge: "Debt Free" },
  { id: "lp4", title: "Financial Planning 101", description: "Build your financial roadmap", category: "Financial Planning", videoCount: 2, articleCount: 2, time: "~50 min", xp: 300, badge: "Planner" },
];

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

type ContentType = "all" | "videos" | "articles";
type SortOption = "recommended" | "newest" | "popular" | "shortest";

export default function Learn() {
  usePageTitle("Learn");
  const { user } = useAuth();
  const { isAdmin, isExpert } = useUserRole();
  const { awardXP } = useXP();
  const canManage = isAdmin || isExpert;

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [contentType, setContentType] = useState<ContentType>("all");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [activeTab, setActiveTab] = useState<"browse" | "saved">("browse");

  // Video state
  const [dbVideos, setDbVideos] = useState<VideoLesson[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [articleReadIds, setArticleReadIds] = useState<Set<string>>(new Set());

  // Add video form
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Budgeting");
  const [newDuration, setNewDuration] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Beginner");
  const [parsedId, setParsedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    loadContent();
    loadVideos();
    if (user) {
      loadLikes();
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    const id = extractYouTubeId(newUrl);
    setParsedId(id);
  }, [newUrl]);

  async function loadProfile() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    if (data?.display_name) setDisplayName(data.display_name);
  }

  async function loadVideos() {
    const { data } = await supabase
      .from("video_lessons")
      .select("*")
      .order("created_at", { ascending: false });
    const vids = (data ?? []).map((v: any) => ({
      id: v.id, title: v.title, description: v.description, youtube_id: v.youtube_id,
      category: v.category, duration: v.duration, difficulty: v.difficulty, added_by: v.added_by,
    }));
    setDbVideos(vids);
  }

  async function loadContent() {
    setLoading(true);
    const { data } = await supabase
      .from("expert_content")
      .select("id, title, body, category, views_count, likes_count, created_at, author_id")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    const items = (data ?? []) as ContentItem[];
    setContent(items);
    setLoading(false);

    const authorIds = [...new Set(items.map((i) => i.author_id))];
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", authorIds);
      const names: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { names[p.id] = p.display_name || "Expert"; });
      setAuthorNames(names);
    }
  }

  async function loadLikes() {
    if (!user) return;
    const { data } = await supabase.from("content_likes").select("content_id").eq("user_id", user.id);
    setLikedIds(new Set((data ?? []).map((l: any) => l.content_id)));
  }

  async function openArticle(item: ContentItem) {
    setSelectedArticle(item);
    await supabase.rpc("increment_views", { _content_id: item.id });
    setContent((prev) => prev.map((c) => c.id === item.id ? { ...c, views_count: c.views_count + 1 } : c));
  }

  async function toggleLike(articleId: string) {
    if (!user) return;
    const isLiked = likedIds.has(articleId);
    if (isLiked) {
      await supabase.from("content_likes").delete().eq("user_id", user.id).eq("content_id", articleId);
      setLikedIds((prev) => { const s = new Set(prev); s.delete(articleId); return s; });
      await supabase.rpc("decrement_likes", { _content_id: articleId });
      setContent((prev) => prev.map((c) => c.id === articleId ? { ...c, likes_count: Math.max(0, c.likes_count - 1) } : c));
    } else {
      await supabase.from("content_likes").insert({ user_id: user.id, content_id: articleId });
      setLikedIds((prev) => new Set(prev).add(articleId));
      await supabase.rpc("increment_likes", { _content_id: articleId });
      setContent((prev) => prev.map((c) => c.id === articleId ? { ...c, likes_count: c.likes_count + 1 } : c));
    }
  }

  async function handleAddVideo() {
    if (!parsedId || !newTitle.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("video_lessons").insert({
      title: newTitle.trim(), description: newDesc.trim(), youtube_url: newUrl.trim(),
      youtube_id: parsedId, category: newCategory, duration: newDuration.trim() || "",
      difficulty: newDifficulty, added_by: user.id,
    });
    if (error) {
      toast({ title: "Error adding video", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Video added!" });
      resetForm();
      setShowAddDialog(false);
      await loadVideos();
    }
    setSaving(false);
  }

  async function handleDeleteVideo(video: VideoLesson) {
    if (video.isDefault) {
      setHiddenDefaults((prev) => new Set(prev).add(video.id));
      setSelectedVideo(null);
      toast({ title: "Video removed" });
      return;
    }
    const { error } = await supabase.from("video_lessons").delete().eq("id", video.id);
    if (error) {
      toast({ title: "Error deleting video", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Video removed" });
      setSelectedVideo(null);
      await loadVideos();
    }
  }

  function resetForm() {
    setNewUrl(""); setNewTitle(""); setNewDesc(""); setNewCategory("Budgeting");
    setNewDuration(""); setNewDifficulty("Beginner"); setParsedId(null);
  }

  function toggleBookmarkVideo(id: string) {
    setBookmarkedVideos(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  function toggleBookmarkArticle(id: string) {
    setBookmarkedArticles(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  // Combine DB videos with defaults
  const allVideos: VideoLesson[] = [...dbVideos, ...DEFAULT_VIDEOS.filter((v) => !hiddenDefaults.has(v.id))];
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allVideos.forEach(v => cats.add(v.category));
    content.forEach(c => { if (c.category) cats.add(c.category); });
    return [...cats];
  }, [allVideos, content]);

  // Filtering
  const filteredVideos = useMemo(() => {
    let vids = allVideos.filter(v => {
      if (selectedCategory && v.category !== selectedCategory) return false;
      if (difficulty && v.difficulty !== difficulty) return false;
      if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === "newest") vids = [...vids].reverse();
    if (sortBy === "shortest") vids = [...vids].sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    return vids;
  }, [allVideos, selectedCategory, difficulty, search, sortBy]);

  const filteredArticles = useMemo(() => {
    let arts = content.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.body.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === "popular") arts = [...arts].sort((a, b) => b.views_count - a.views_count);
    return arts;
  }, [content, selectedCategory, search, sortBy]);

  const savedVideos = allVideos.filter(v => bookmarkedVideos.has(v.id));
  const savedArticles = content.filter(a => bookmarkedArticles.has(a.id));

  const videosWatchedCount = watchedIds.size;
  const articlesReadCount = articleReadIds.size;
  const totalLearnXP = videosWatchedCount * 15 + articlesReadCount * 10;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  // --- VIDEO DETAIL VIEW ---
  if (selectedVideo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)} className="text-muted-foreground gap-1">
            ← Back to Learn
          </Button>
          {(isAdmin || (!selectedVideo.isDefault && isExpert && selectedVideo.added_by === user?.id)) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4" /> Remove</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this video?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently remove "{selectedVideo.title}" from the video lessons.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteVideo(selectedVideo)}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{selectedVideo.category}</Badge>
                <Badge variant="outline">{selectedVideo.difficulty}</Badge>
                {selectedVideo.duration && selectedVideo.duration !== "Unknown" && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedVideo.duration}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">{selectedVideo.title}</h2>
                  <p className="text-muted-foreground mt-1">{selectedVideo.description}</p>
                </div>
                {user && !watchedIds.has(selectedVideo.id) && (
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={async () => {
                      const result = await awardXP("video_watch", `Watched: ${selectedVideo!.title}`);
                      if (result) {
                        setWatchedIds((prev) => new Set(prev).add(selectedVideo!.id));
                        toast({ title: `+${result.xpAmount} XP!`, description: `Earned for watching a video lesson.` });
                      }
                    }}
                  >
                    <Zap className="h-4 w-4" /> Claim 15 XP
                  </Button>
                )}
                {watchedIds.has(selectedVideo.id) && (
                  <Badge className="gap-1 bg-primary/20 text-primary border-primary/30 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Watched
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Up Next suggestion */}
        {(() => {
          const idx = allVideos.findIndex(v => v.id === selectedVideo.id);
          const next = allVideos[idx + 1] || allVideos[0];
          if (next && next.id !== selectedVideo.id) {
            return (
              <Card className="border-border/50 card-hover cursor-pointer" onClick={() => setSelectedVideo(next)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <img src={`https://img.youtube.com/vi/${next.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Up Next</p>
                    <p className="font-display font-semibold text-sm truncate">{next.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{next.category}</Badge>
                      {next.duration && <span className="text-xs text-muted-foreground">{next.duration}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}
      </div>
    );
  }

  // --- MAIN LEARN VIEW ---
  return (
    <div className="space-y-8">
      {/* ===== PERSONALIZED HEADER ===== */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 p-6 md:p-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Continue Learning{displayName ? `, ${displayName}` : ""}
              </h1>
              <p className="text-muted-foreground mt-2">Pick up where you left off or explore new topics.</p>

              {/* Resume card - show first unwatched video */}
              {(() => {
                const unwatched = allVideos.find(v => !watchedIds.has(v.id));
                if (!unwatched) return null;
                return (
                  <div className="mt-5 flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                      <img src={`https://img.youtube.com/vi/${unwatched.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Resume watching</p>
                      <p className="font-display font-semibold text-sm truncate">{unwatched.title}</p>
                    </div>
                    <Button size="sm" className="gap-1 shrink-0" onClick={() => setSelectedVideo(unwatched)}>
                      Resume <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* Stats */}
            <div className="flex md:flex-col justify-around gap-4 p-6 md:p-8 md:border-l border-t md:border-t-0 border-border/50 bg-secondary/30 md:w-64">
              <div className="text-center md:text-left">
                <p className="text-2xl font-display font-bold text-primary">{videosWatchedCount}</p>
                <p className="text-xs text-muted-foreground">Videos Watched</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-display font-bold text-primary">{articlesReadCount}</p>
                <p className="text-xs text-muted-foreground">Articles Read</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-display font-bold text-primary">{totalLearnXP}</p>
                <p className="text-xs text-muted-foreground">Learn XP Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== SEARCH BAR ===== */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search videos, articles, topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-border/50 focus-visible:ring-primary"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ===== LEARNING PATHS ===== */}
      {!search && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Learning Paths
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {LEARNING_PATHS.map(path => {
              const pathVideos = allVideos.filter(v => v.category === path.category);
              const watchedInPath = pathVideos.filter(v => watchedIds.has(v.id)).length;
              const totalInPath = path.videoCount + path.articleCount;
              const progress = totalInPath > 0 ? Math.round((watchedInPath / totalInPath) * 100) : 0;

              return (
                <Card key={path.id} className="border-border/50 card-hover min-w-[280px] md:min-w-[300px] shrink-0 flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        <Zap className="h-3 w-3 mr-1" /> +{path.xp} XP
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-base">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{path.description}</p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{path.videoCount} videos · {path.articleCount} articles</span>
                      <span>{path.time}</span>
                    </div>

                    <div className="mt-auto pt-4">
                      {progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{watchedInPath} of {totalInPath} complete</span>
                            <span className="text-primary font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                            {progress === 100 ? <Star className="h-3 w-3 text-amber-400" /> : <Lock className="h-3 w-3" />}
                          </div>
                          <span>{path.badge}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={progress > 0 ? "default" : "outline"}
                          className="ml-auto gap-1 text-xs"
                          onClick={() => {
                            const firstVideo = allVideos.find(v => v.category === path.category);
                            if (firstVideo) setSelectedVideo(firstVideo);
                          }}
                        >
                          {progress > 0 ? "Continue" : "Start Path"} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== FILTER BAR ===== */}
      <div className="space-y-3">
        {/* Tabs: Browse / Saved */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "browse" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Bookmark className="h-3.5 w-3.5" /> Saved
              {(bookmarkedVideos.size + bookmarkedArticles.size) > 0 && (
                <span className="ml-1 text-xs">{bookmarkedVideos.size + bookmarkedArticles.size}</span>
              )}
            </button>
          </div>

          {canManage && (
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Video
            </Button>
          )}
        </div>

        {activeTab === "browse" && (
          <>
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} className="text-xs">All</Button>
              {allCategories.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs">{cat}</Button>
              ))}
            </div>

            {/* Content type + difficulty + sort */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Content type segmented */}
              <div className="flex gap-0.5 p-0.5 bg-secondary/50 rounded-lg">
                {(["all", "videos", "articles"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setContentType(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${contentType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t === "all" ? "Both" : t}
                  </button>
                ))}
              </div>

              {/* Difficulty */}
              <div className="flex gap-0.5 p-0.5 bg-secondary/50 rounded-lg">
                {[null, "Beginner", "Intermediate", "Advanced"].map(d => (
                  <button
                    key={d ?? "all"}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${difficulty === d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {d ?? "All Levels"}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[150px] h-8 text-xs bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="shortest">Shortest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* ===== SAVED TAB ===== */}
      {activeTab === "saved" && (
        <div>
          {savedVideos.length === 0 && savedArticles.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No saved content yet — bookmark videos and articles to find them here easily.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedVideos.map(video => (
                <VideoCard
                  key={video.id} video={video} isWatched={watchedIds.has(video.id)}
                  isBookmarked={true} onSelect={() => setSelectedVideo(video)}
                  onToggleBookmark={() => toggleBookmarkVideo(video.id)}
                  canDelete={isAdmin || (!video.isDefault && isExpert && video.added_by === user?.id)}
                  onDelete={() => handleDeleteVideo(video)}
                />
              ))}
              {savedArticles.map(article => (
                <ArticleCard
                  key={article.id} article={article} isRead={articleReadIds.has(article.id)}
                  isBookmarked={true} isLiked={likedIds.has(article.id)}
                  authorName={authorNames[article.author_id] || "Expert"}
                  onSelect={() => openArticle(article)}
                  onToggleBookmark={() => toggleBookmarkArticle(article.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== BROWSE TAB ===== */}
      {activeTab === "browse" && (
        <div>
          {/* Featured card - first unwatched video */}
          {!search && contentType !== "articles" && (() => {
            const featured = filteredVideos.find(v => !watchedIds.has(v.id));
            if (!featured) return null;
            return (
              <Card className="border-primary/20 card-hover cursor-pointer mb-6 overflow-hidden" onClick={() => setSelectedVideo(featured)}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 aspect-video relative overflow-hidden bg-secondary">
                      <img src={`https://img.youtube.com/vi/${featured.youtube_id}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                        {featured.duration && <span className="text-white text-sm font-medium">{featured.duration}</span>}
                      </div>
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
                        <Star className="h-3 w-3 mr-1" /> Recommended for You
                      </Badge>
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{featured.category}</Badge>
                        <Badge variant="outline" className="text-xs">{featured.difficulty}</Badge>
                      </div>
                      <h3 className="font-display text-xl font-bold">{featured.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm">{featured.description}</p>
                      <Badge className="mt-3 w-fit bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        <Zap className="h-3 w-3 mr-1" /> +15 XP
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Content grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentType !== "articles" && filteredVideos.map(video => (
              <VideoCard
                key={video.id} video={video} isWatched={watchedIds.has(video.id)}
                isBookmarked={bookmarkedVideos.has(video.id)} onSelect={() => setSelectedVideo(video)}
                onToggleBookmark={() => toggleBookmarkVideo(video.id)}
                canDelete={isAdmin || (!video.isDefault && isExpert && video.added_by === user?.id)}
                onDelete={() => handleDeleteVideo(video)}
              />
            ))}
            {contentType !== "videos" && filteredArticles.map(article => (
              <ArticleCard
                key={article.id} article={article} isRead={articleReadIds.has(article.id)}
                isBookmarked={bookmarkedArticles.has(article.id)} isLiked={likedIds.has(article.id)}
                authorName={authorNames[article.author_id] || "Expert"}
                onSelect={() => openArticle(article)}
                onToggleBookmark={() => toggleBookmarkArticle(article.id)}
              />
            ))}
          </div>

          {/* Empty state */}
          {((contentType !== "articles" && filteredVideos.length === 0) && (contentType !== "videos" && filteredArticles.length === 0)) && (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Filter className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No content found for this filter.</p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory(null); setDifficulty(null); setContentType("all"); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
          {contentType === "articles" && filteredArticles.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">{content.length === 0 ? "No articles yet. Check back soon!" : "No articles match your filters."}</p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory(null); }}>Clear Filters</Button>
              </CardContent>
            </Card>
          )}
          {contentType === "videos" && filteredVideos.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Video className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No videos match your filters.</p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory(null); setDifficulty(null); }}>Clear Filters</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ===== ARTICLE DETAIL DIALOG ===== */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {selectedArticle.category && <Badge variant="secondary">{selectedArticle.category}</Badge>}
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs"><Zap className="h-3 w-3 mr-1" /> +10 XP</Badge>
              </div>
              <DialogTitle className="font-display text-xl">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <User className="h-3 w-3" /> {authorNames[selectedArticle.author_id] || "Expert"}
                <span>·</span>
                {new Date(selectedArticle.created_at).toLocaleDateString()}
                <span>·</span>
                <Clock className="h-3 w-3" /> {Math.max(1, Math.ceil(selectedArticle.body.split(" ").length / 200))} min read
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              {selectedArticle.body.split("\n").map((p, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {selectedArticle.views_count}</span>
                <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {selectedArticle.likes_count}</span>
              </div>
              <div className="flex gap-2">
                {user && !articleReadIds.has(selectedArticle.id) && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={async () => {
                      const result = await awardXP("article_read", `Read: ${selectedArticle!.title}`);
                      if (result) {
                        setArticleReadIds((prev) => new Set(prev).add(selectedArticle!.id));
                        toast({ title: `+${result.xpAmount} XP!`, description: `Earned for reading an article.` });
                      }
                    }}
                  >
                    <Zap className="h-4 w-4" /> Claim 10 XP
                  </Button>
                )}
                {articleReadIds.has(selectedArticle.id) && (
                  <Badge className="gap-1 bg-primary/20 text-primary border-primary/30">
                    <CheckCircle2 className="h-3 w-3" /> Read
                  </Badge>
                )}
                <Button
                  variant={likedIds.has(selectedArticle.id) ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); toggleLike(selectedArticle.id); }}
                  className="gap-1"
                >
                  <Heart className={`h-4 w-4 ${likedIds.has(selectedArticle.id) ? "fill-current" : ""}`} />
                  {likedIds.has(selectedArticle.id) ? "Liked" : "Like"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ===== ADD VIDEO DIALOG ===== */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowAddDialog(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add Video Lesson</DialogTitle>
            <DialogDescription>Paste a YouTube URL and fill in the details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yt-url">YouTube URL *</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="yt-url" placeholder="https://www.youtube.com/watch?v=..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="pl-9" />
              </div>
              {newUrl && !parsedId && <p className="text-xs text-destructive">Could not extract YouTube video ID.</p>}
              {parsedId && (
                <div className="aspect-video w-full max-w-[300px] rounded-lg overflow-hidden bg-muted">
                  <img src={`https://img.youtube.com/vi/${parsedId}/mqdefault.jpg`} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-title">Title *</Label>
              <Input id="v-title" placeholder="Video title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-desc">Description</Label>
              <Textarea id="v-desc" placeholder="Brief description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={500} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budgeting">Budgeting</SelectItem>
                    <SelectItem value="Saving & Investing">Saving & Investing</SelectItem>
                    <SelectItem value="Debt Management">Debt Management</SelectItem>
                    <SelectItem value="Financial Planning">Financial Planning</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-dur">Duration</Label>
                <Input id="v-dur" placeholder="e.g. 15 min" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} maxLength={20} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowAddDialog(false); }}>Cancel</Button>
            <Button onClick={handleAddVideo} disabled={!parsedId || !newTitle.trim() || saving}>
              {saving ? "Adding..." : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== VIDEO CARD COMPONENT =====
function VideoCard({ video, isWatched, isBookmarked, onSelect, onToggleBookmark, canDelete, onDelete }: {
  video: VideoLesson; isWatched: boolean; isBookmarked: boolean;
  onSelect: () => void; onToggleBookmark: () => void;
  canDelete: boolean; onDelete: () => void;
}) {
  return (
    <Card className="border-border/50 card-hover cursor-pointer group relative overflow-hidden" onClick={onSelect}>
      {canDelete && (
        <button
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Remove video"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <CardContent className="p-0">
        <div className="aspect-video w-full relative overflow-hidden bg-secondary">
          <img
            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
            </div>
          </div>
          {/* Duration badge */}
          {video.duration && video.duration !== "Unknown" && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">{video.duration}</div>
          )}
          {/* XP or Watched badge */}
          {isWatched ? (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="h-3 w-3" /> Watched
            </div>
          ) : (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              <Zap className="h-3 w-3" /> +15 XP
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">{video.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.description}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{video.category}</Badge>
            <Badge variant="outline" className="text-xs">{video.difficulty}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== ARTICLE CARD COMPONENT =====
function ArticleCard({ article, isRead, isBookmarked, isLiked, authorName, onSelect, onToggleBookmark }: {
  article: ContentItem; isRead: boolean; isBookmarked: boolean; isLiked: boolean;
  authorName: string; onSelect: () => void; onToggleBookmark: () => void;
}) {
  const readTime = Math.max(1, Math.ceil(article.body.split(" ").length / 200));
  const categoryColors: Record<string, string> = {
    "Budgeting": "border-l-primary",
    "Saving & Investing": "border-l-blue-500",
    "Debt Management": "border-l-orange-500",
    "Financial Planning": "border-l-purple-500",
    "General": "border-l-muted-foreground",
  };
  const borderClass = categoryColors[article.category || "General"] || "border-l-primary";

  return (
    <Card className={`border-border/50 card-hover cursor-pointer group border-l-4 ${borderClass}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 mb-2">
            {isRead ? (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Read</Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs"><Zap className="h-3 w-3 mr-1" /> +10 XP</Badge>
            )}
            {article.category && <Badge variant="secondary" className="text-xs">{article.category}</Badge>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
        <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">{article.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.body}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {authorName}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readTime} min</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views_count}</span>
            <span className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}>
              <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} /> {article.likes_count}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
