import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { BookOpen, Eye, Heart, Clock, Search, User, Play, Video } from "lucide-react";

// --- Video Lessons Data ---
interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const VIDEO_LESSONS: VideoLesson[] = [
  // Budgeting
  { id: "v1", title: "Budgeting Basics for Beginners", description: "Learn the fundamentals of creating and maintaining a personal budget that works.", youtubeId: "sVKQn2I4HDM", category: "Budgeting", duration: "12 min", difficulty: "Beginner" },
  { id: "v2", title: "The 50/30/20 Budget Rule Explained", description: "Master the popular 50/30/20 budgeting framework to manage your money effectively.", youtubeId: "HQzoZfc3GwQ", category: "Budgeting", duration: "8 min", difficulty: "Beginner" },
  { id: "v3", title: "Zero-Based Budgeting Tutorial", description: "Give every rupee a job with zero-based budgeting - a powerful method for financial control.", youtubeId: "cRV0eFf4TZA", category: "Budgeting", duration: "15 min", difficulty: "Intermediate" },
  { id: "v4", title: "How to Track Your Expenses", description: "Practical tips for tracking daily expenses and identifying spending patterns.", youtubeId: "rJFOCLQdjTM", category: "Budgeting", duration: "10 min", difficulty: "Beginner" },
  // Saving & Investing
  { id: "v5", title: "How to Start Investing for Beginners", description: "A complete beginner's guide to investing in stocks, bonds, and mutual funds.", youtubeId: "gFQNPmLKj1k", category: "Saving & Investing", duration: "20 min", difficulty: "Beginner" },
  { id: "v6", title: "Compound Interest - The 8th Wonder", description: "Understand how compound interest works and why starting early matters so much.", youtubeId: "wf91rEGw88Q", category: "Saving & Investing", duration: "10 min", difficulty: "Beginner" },
  { id: "v7", title: "Index Funds vs Mutual Funds", description: "Compare index funds and actively managed mutual funds to make smarter investment choices.", youtubeId: "fwe-PjrX23o", category: "Saving & Investing", duration: "14 min", difficulty: "Intermediate" },
  { id: "v8", title: "Building an Emergency Fund", description: "Step-by-step guide to building a 3-6 month emergency fund for financial security.", youtubeId: "vftPsZRAJBU", category: "Saving & Investing", duration: "11 min", difficulty: "Beginner" },
  { id: "v9", title: "Diversification Strategy Explained", description: "Learn why diversification is key to reducing risk in your investment portfolio.", youtubeId: "KFmGJGFVpWc", category: "Saving & Investing", duration: "13 min", difficulty: "Intermediate" },
  { id: "v10", title: "Dollar Cost Averaging (SIP) Explained", description: "How systematic investing reduces risk and builds wealth over time.", youtubeId: "TlnFkC-eaXo", category: "Saving & Investing", duration: "9 min", difficulty: "Intermediate" },
  // Debt Management
  { id: "v11", title: "How to Get Out of Debt Fast", description: "Proven strategies to pay off debt quickly using snowball and avalanche methods.", youtubeId: "YsJ0m_4nNnE", category: "Debt Management", duration: "16 min", difficulty: "Beginner" },
  { id: "v12", title: "Understanding Credit Scores", description: "What makes up your credit score and how to improve it over time.", youtubeId: "01AqFE_we8Y", category: "Debt Management", duration: "12 min", difficulty: "Beginner" },
  { id: "v13", title: "Good Debt vs Bad Debt", description: "Not all debt is created equal. Learn to distinguish between debt that builds wealth and debt that destroys it.", youtubeId: "Yznk1m9bciM", category: "Debt Management", duration: "10 min", difficulty: "Beginner" },
  { id: "v14", title: "Credit Card Mistakes to Avoid", description: "Common credit card traps and how to use credit cards wisely to your advantage.", youtubeId: "nPBPE_b22Yg", category: "Debt Management", duration: "11 min", difficulty: "Intermediate" },
  // Financial Planning
  { id: "v15", title: "Financial Planning 101", description: "Create a comprehensive financial plan covering goals, insurance, investments, and retirement.", youtubeId: "4j2emMn7UaI", category: "Financial Planning", duration: "18 min", difficulty: "Beginner" },
  { id: "v16", title: "Retirement Planning for Young Adults", description: "Why starting retirement planning in your 20s can make you a millionaire.", youtubeId: "bnGK-tBp3Kk", category: "Financial Planning", duration: "14 min", difficulty: "Intermediate" },
  { id: "v17", title: "Understanding Insurance Basics", description: "Health, life, and property insurance explained simply for better financial protection.", youtubeId: "ReFktTqjMlU", category: "Financial Planning", duration: "15 min", difficulty: "Beginner" },
  { id: "v18", title: "Setting SMART Financial Goals", description: "How to set Specific, Measurable, Achievable, Relevant, and Time-bound financial goals.", youtubeId: "i0QfCZjASX8", category: "Financial Planning", duration: "9 min", difficulty: "Beginner" },
  { id: "v19", title: "Islamic Finance Basics", description: "Understanding Shariah-compliant finance including sukuk, takaful, and profit-sharing models.", youtubeId: "TcNtdVOegHY", category: "Financial Planning", duration: "17 min", difficulty: "Intermediate" },
  { id: "v20", title: "Tax Planning Strategies", description: "Legal ways to minimize your tax liability and keep more of your hard-earned money.", youtubeId: "JdTmRsEDJH0", category: "Financial Planning", duration: "13 min", difficulty: "Advanced" },
];

// --- Article types ---
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

export default function Learn() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [videoCategory, setVideoCategory] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
    if (user) loadLikes();
  }, [user]);

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
    await supabase.from("expert_content").update({ views_count: item.views_count + 1 }).eq("id", item.id);
    setContent((prev) => prev.map((c) => c.id === item.id ? { ...c, views_count: c.views_count + 1 } : c));
  }

  async function toggleLike(articleId: string) {
    if (!user) return;
    const isLiked = likedIds.has(articleId);

    if (isLiked) {
      await supabase.from("content_likes").delete().eq("user_id", user.id).eq("content_id", articleId);
      setLikedIds((prev) => { const s = new Set(prev); s.delete(articleId); return s; });
      await supabase.from("expert_content").update({ likes_count: Math.max(0, (content.find((c) => c.id === articleId)?.likes_count ?? 1) - 1) }).eq("id", articleId);
      setContent((prev) => prev.map((c) => c.id === articleId ? { ...c, likes_count: Math.max(0, c.likes_count - 1) } : c));
    } else {
      await supabase.from("content_likes").insert({ user_id: user.id, content_id: articleId });
      setLikedIds((prev) => new Set(prev).add(articleId));
      await supabase.from("expert_content").update({ likes_count: (content.find((c) => c.id === articleId)?.likes_count ?? 0) + 1 }).eq("id", articleId);
      setContent((prev) => prev.map((c) => c.id === articleId ? { ...c, likes_count: c.likes_count + 1 } : c));
    }
  }

  const categories = [...new Set(content.map((c) => c.category).filter(Boolean))] as string[];
  const videoCategories = [...new Set(VIDEO_LESSONS.map((v) => v.category))];

  const filtered = content.filter((item) => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.body.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = VIDEO_LESSONS.filter((v) => !videoCategory || v.category === videoCategory);

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
          <div className="flex gap-2 flex-wrap">
            <Button variant={videoCategory === null ? "default" : "outline"} size="sm" onClick={() => setVideoCategory(null)}>All</Button>
            {videoCategories.map((cat) => (
              <Button key={cat} variant={videoCategory === cat ? "default" : "outline"} size="sm" onClick={() => setVideoCategory(cat)}>{cat}</Button>
            ))}
          </div>

          {selectedVideo ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)} className="text-muted-foreground gap-1">
                ← Back to Videos
              </Button>
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0`}
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
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedVideo.duration}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold">{selectedVideo.title}</h2>
                    <p className="text-muted-foreground mt-1">{selectedVideo.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => setSelectedVideo(video)}>
                  <CardContent className="pt-4">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {video.duration}
                      </div>
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
    </div>
  );
}
