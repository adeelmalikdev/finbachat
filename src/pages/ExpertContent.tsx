import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { BookOpen, Plus, Pencil, Trash2, Eye, Heart, Clock, Send, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  category: string | null;
  status: "draft" | "pending_review" | "approved" | "rejected";
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ["Budgeting", "Saving & Investing", "Debt Management", "Financial Planning", "Insurance", "Retirement", "Tax Planning", "General"];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  pending_review: "outline",
  approved: "default",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ExpertContent() {
  usePageTitle("Expert Content");
  const { user } = useAuth();
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadArticles();
  }, [user]);

  async function loadArticles() {
    setLoading(true);
    const { data } = await supabase
      .from("expert_content")
      .select("*")
      .eq("author_id", user!.id)
      .order("updated_at", { ascending: false });
    setArticles((data ?? []) as ContentItem[]);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setTitle("");
    setBody("");
    setCategory("");
    setDialogOpen(true);
  }

  function openEdit(item: ContentItem) {
    setEditing(item);
    setTitle(item.title);
    setBody(item.body);
    setCategory(item.category ?? "");
    setDialogOpen(true);
  }

  async function saveArticle(status: "draft" | "pending_review") {
    if (!user || !title.trim() || !body.trim()) return;
    setSubmitting(true);

    if (editing) {
      const { error } = await supabase
        .from("expert_content")
        .update({ title, body, category: category || null, status })
        .eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: status === "pending_review" ? "Submitted for review!" : "Draft saved!" }); }
    } else {
      const { error } = await supabase
        .from("expert_content")
        .insert({ author_id: user.id, title, body, category: category || null, status });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: status === "pending_review" ? "Submitted for review!" : "Draft saved!" }); }
    }

    setDialogOpen(false);
    setSubmitting(false);
    await loadArticles();
  }

  async function deleteArticle() {
    if (!deleteId) return;
    await supabase.from("expert_content").delete().eq("id", deleteId);
    setDeleteId(null);
    toast({ title: "Article deleted" });
    await loadArticles();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Content</h1>
          <p className="text-muted-foreground">Create and manage your educational articles.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New Article</Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No articles yet. Create your first one!</p>
            <Button onClick={openNew} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Create Article</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((item) => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold truncate">{item.title}</h3>
                      <Badge variant={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                    </div>
                    {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.body}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views_count}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {item.likes_count}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Article" : "New Article"}</DialogTitle>
            <DialogDescription>Write educational content for the community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your article..." rows={10} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => saveArticle("draft")} disabled={submitting || !title.trim() || !body.trim()}>
              Save as Draft
            </Button>
            <Button onClick={() => saveArticle("pending_review")} disabled={submitting || !title.trim() || !body.trim()} className="gap-2">
              <Send className="h-4 w-4" /> Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteArticle}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
