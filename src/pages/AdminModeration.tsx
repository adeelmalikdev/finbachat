import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle2, XCircle, Eye, Clock, User, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorHandler";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  category: string | null;
  status: "draft" | "pending_review" | "approved" | "rejected";
  author_id: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_review: "outline",
  approved: "default",
  rejected: "destructive",
};

export default function AdminModeration() {
  usePageTitle("Moderation");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("pending_review");

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    setLoading(true);
    const { data } = await supabase
      .from("expert_content")
      .select("*")
      .in("status", ["pending_review", "approved", "rejected"])
      .order("updated_at", { ascending: false });
    const items = (data ?? []) as ContentItem[];
    setContent(items);
    setLoading(false);

    const authorIds = [...new Set(items.map((i) => i.author_id))];
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", authorIds);
      const names: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { names[p.id] = p.display_name || "Unknown"; });
      setAuthorNames(names);
    }
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("expert_content").update({ status }).eq("id", id);
    if (error) { console.error("Update status failed:", error); toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" }); return; }
    toast({ title: status === "approved" ? "Content approved!" : "Content rejected" });
    setPreviewItem(null);
    await loadContent();
  }

  const filtered = content.filter((c) => c.status === tab);
  const pendingCount = content.filter((c) => c.status === "pending_review").length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and approve expert content submissions.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending_review" className="gap-1">
            Pending {pendingCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No {tab.replace("_", " ")} content.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold truncate">{item.title}</h3>
                          <Badge variant={STATUS_COLORS[item.status]}>{item.status.replace("_", " ")}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {authorNames[item.author_id] || "Unknown"}</span>
                          {item.category && <span>{item.category}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.updated_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewItem(item)}><Eye className="h-4 w-4" /></Button>
                        {item.status === "pending_review" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => updateStatus(item.id, "approved")}><CheckCircle2 className="h-4 w-4 text-green-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => updateStatus(item.id, "rejected")}><XCircle className="h-4 w-4 text-destructive" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        {previewItem && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {previewItem.category && <Badge variant="secondary">{previewItem.category}</Badge>}
                <Badge variant={STATUS_COLORS[previewItem.status]}>{previewItem.status.replace("_", " ")}</Badge>
              </div>
              <DialogTitle className="font-display text-xl">{previewItem.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <User className="h-3 w-3" /> {authorNames[previewItem.author_id] || "Unknown"}
                <span>·</span>
                {new Date(previewItem.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              {previewItem.body.split("\n").map((p, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
              ))}
            </div>
            {previewItem.status === "pending_review" && (
              <DialogFooter className="gap-2">
                <Button variant="destructive" onClick={() => updateStatus(previewItem.id, "rejected")} className="gap-1">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button onClick={() => updateStatus(previewItem.id, "approved")} className="gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
