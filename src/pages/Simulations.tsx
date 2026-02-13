import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

export default function Simulations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Simulations</h1>
        <p className="text-muted-foreground">Practice real-world financial decisions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" /> Decision Simulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Simulation module coming soon. You'll navigate financial scenarios and see the impact of your choices.</p>
        </CardContent>
      </Card>
    </div>
  );
}
