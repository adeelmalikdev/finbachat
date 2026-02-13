import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function ExpertContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Content</h1>
        <p className="text-muted-foreground">Create and manage your educational articles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Content Authoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Expert content authoring coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
