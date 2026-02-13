import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function Assessments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Assessments</h1>
        <p className="text-muted-foreground">Test and track your financial knowledge.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Financial Literacy Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Assessment module coming soon. You'll be able to take baseline and follow-up assessments to measure your progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
