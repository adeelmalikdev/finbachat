import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  category: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export default function Learn() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    supabase
      .from("expert_content")
      .select("id, title, body, category, views_count, likes_count, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setContent(data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Learn</h1>
        <p className="text-muted-foreground">Expert articles and financial tips.</p>
      </div>
      {content.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No articles yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {content.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="font-display text-base">{item.title}</CardTitle>
                {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.body}</p>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>{item.views_count} views</span>
                  <span>{item.likes_count} likes</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
