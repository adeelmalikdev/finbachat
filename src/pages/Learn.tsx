import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { BookOpen, Eye, Heart, Clock, Search, ArrowLeft, User } from "lucide-react";

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

    // Load author names
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
    // Increment view count
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
        <p className="text-muted-foreground">Expert articles and financial tips to boost your knowledge.</p>
      </div>

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
