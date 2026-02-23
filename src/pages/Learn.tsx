import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { BookOpen, Eye, Heart, Clock, Search, User, Play, Video, Plus, Trash2, Link, Zap } from "lucide-react";
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

// Default videos (shown when DB has none or as fallback)
const DEFAULT_VIDEOS: VideoLesson[] = [
  { id: "d1", title: "Budgeting Basics for Beginners", description: "Learn the fundamentals of creating and maintaining a personal budget.", youtube_id: "sVKQn2I4HDM", category: "Budgeting", duration: "12 min", difficulty: "Beginner", isDefault: true },
  { id: "d2", title: "The 50/30/20 Budget Rule Explained", description: "Master the popular 50/30/20 budgeting framework.", youtube_id: "HQzoZfc3GwQ", category: "Budgeting", duration: "8 min", difficulty: "Beginner", isDefault: true },
  { id: "d3", title: "How to Start Investing for Beginners", description: "A complete beginner's guide to investing.", youtube_id: "gFQNPmLKj1k", category: "Saving & Investing", duration: "20 min", difficulty: "Beginner", isDefault: true },
  { id: "d4", title: "Compound Interest - The 8th Wonder", description: "Understand how compound interest works.", youtube_id: "wf91rEGw88Q", category: "Saving & Investing", duration: "10 min", difficulty: "Beginner", isDefault: true },
  { id: "d7", title: "Financial Planning 101", description: "Create a comprehensive financial plan.", youtube_id: "4j2emMn7UaI", category: "Financial Planning", duration: "18 min", difficulty: "Beginner", isDefault: true },
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

  // Video state
  const [dbVideos, setDbVideos] = useState<VideoLesson[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [videoCategory, setVideoCategory] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Add video form
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Budgeting");
  const [newDuration, setNewDuration] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Beginner");
  const [parsedId, setParsedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
    loadVideos();
    if (user) loadLikes();
  }, [user]);

  // Auto-parse YouTube URL
  useEffect(() => {
    const id = extractYouTubeId(newUrl);
    setParsedId(id);
  }, [newUrl]);

  async function loadVideos() {
    const { data } = await supabase
      .from("video_lessons")
      .select("*")
      .order("created_at", { ascending: false });
    const vids = (data ?? []).map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtube_id: v.youtube_id,
      category: v.category,
      duration: v.duration,
      difficulty: v.difficulty,
      added_by: v.added_by,
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
      title: newTitle.trim(),
      description: newDesc.trim(),
      youtube_url: newUrl.trim(),
      youtube_id: parsedId,
      category: newCategory,
      duration: newDuration.trim() || "",
      difficulty: newDifficulty,
      added_by: user.id,
    });

    if (error) {
      console.error("Add video failed:", error);
      toast({ title: "Error adding video", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Video added!", description: "The video lesson has been added successfully." });
      resetForm();
      setShowAddDialog(false);
      await loadVideos();
    }
    setSaving(false);
  }

  async function handleDeleteVideo(video: VideoLesson) {
    if (video.isDefault) {
      // Default videos aren't in DB, just hide them locally
      setHiddenDefaults((prev) => new Set(prev).add(video.id));
      setSelectedVideo(null);
      toast({ title: "Video removed" });
      return;
    }
    const { error } = await supabase.from("video_lessons").delete().eq("id", video.id);
    if (error) {
      console.error("Delete video failed:", error);
      toast({ title: "Error deleting video", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Video removed" });
      setSelectedVideo(null);
      await loadVideos();
    }
  }

  function resetForm() {
    setNewUrl("");
    setNewTitle("");
    setNewDesc("");
    setNewCategory("Budgeting");
    setNewDuration("");
    setNewDifficulty("Beginner");
    setParsedId(null);
  }

  // Combine DB videos with defaults (DB videos first), filter out hidden defaults
  const allVideos: VideoLesson[] = [...dbVideos, ...DEFAULT_VIDEOS.filter((v) => !hiddenDefaults.has(v.id))];
  const videoCategories = [...new Set(allVideos.map((v) => v.category))];
  const filteredVideos = allVideos.filter((v) => !videoCategory || v.category === videoCategory);

  const categories = [...new Set(content.map((c) => c.category).filter(Boolean))] as string[];
  const filtered = content.filter((item) => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.body.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Learn</h1>
        <p className="text-muted-foreground">Video lessons and expert articles to boost your financial knowledge.</p>
      </div>

      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos" className="gap-1.5"><Video className="h-4 w-4" /> Video Lessons</TabsTrigger>
          <TabsTrigger value="articles" className="gap-1.5"><BookOpen className="h-4 w-4" /> Articles</TabsTrigger>
        </TabsList>

        {/* --- Video Lessons Tab --- */}
        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Button variant={videoCategory === null ? "default" : "outline"} size="sm" onClick={() => setVideoCategory(null)}>All</Button>
              {videoCategories.map((cat) => (
                <Button key={cat} variant={videoCategory === cat ? "default" : "outline"} size="sm" onClick={() => setVideoCategory(cat)}>{cat}</Button>
              ))}
            </div>
            {canManage && (
              <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Video
              </Button>
            )}
          </div>

          {selectedVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)} className="text-muted-foreground gap-1">
                  ← Back to Videos
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
              <Card>
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
                        <Badge variant="outline" className="gap-1 text-green-600 shrink-0">
                          <Zap className="h-3 w-3" /> XP Claimed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow group relative" onClick={() => setSelectedVideo(video)}>
                  {(isAdmin || (!video.isDefault && isExpert && video.added_by === user?.id)) && (
                    <button
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video); }}
                      title="Remove video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <CardContent className="pt-4">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      {video.duration && video.duration !== "Unknown" && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                        <Badge variant="outline" className="text-xs">{video.difficulty}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- Articles Tab --- */}
        <TabsContent value="articles" className="space-y-4">
          {content.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>All</Button>
                {categories.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">{content.length === 0 ? "No articles yet. Check back soon!" : "No articles match your search."}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openArticle(item)}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-display text-base leading-tight">{item.title}</CardTitle>
                      {item.category && <Badge variant="secondary" className="shrink-0 text-xs">{item.category}</Badge>}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3" /> {authorNames[item.author_id] || "Expert"}
                      <span>·</span>
                      <Clock className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.body}</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views_count}</span>
                      <span className={`flex items-center gap-1 ${likedIds.has(item.id) ? "text-red-500" : ""}`}><Heart className={`h-3 w-3 ${likedIds.has(item.id) ? "fill-current" : ""}`} /> {item.likes_count}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {selectedArticle.category && <Badge variant="secondary">{selectedArticle.category}</Badge>}
              </div>
              <DialogTitle className="font-display text-xl">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <User className="h-3 w-3" /> {authorNames[selectedArticle.author_id] || "Expert"}
                <span>·</span>
                {new Date(selectedArticle.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              {selectedArticle.body.split("\n").map((p, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {selectedArticle.views_count} views</span>
                <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {selectedArticle.likes_count} likes</span>
              </div>
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
          </DialogContent>
        )}
      </Dialog>

      {/* Add Video Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { resetForm(); } setShowAddDialog(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add Video Lesson</DialogTitle>
            <DialogDescription>Paste a YouTube URL and fill in the details. The video will be embedded automatically.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="yt-url">YouTube URL *</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="yt-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="pl-9"
                />
              </div>
              {newUrl && !parsedId && (
                <p className="text-xs text-destructive">Could not extract YouTube video ID. Please check the URL.</p>
              )}
              {parsedId && (
                <div className="aspect-video w-full max-w-[300px] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={`https://img.youtube.com/vi/${parsedId}/mqdefault.jpg`}
                    alt="Video preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="v-title">Title *</Label>
              <Input id="v-title" placeholder="Video title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={200} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="v-desc">Description</Label>
              <Textarea id="v-desc" placeholder="Brief description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={500} rows={2} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Category */}
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

              {/* Difficulty */}
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

              {/* Duration */}
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
