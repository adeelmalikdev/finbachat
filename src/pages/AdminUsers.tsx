import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users and roles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> User Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">User management panel coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
