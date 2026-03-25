import { Flame, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StreakTracker() {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">0 days</p>
              <p className="text-sm text-muted-foreground">Current streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Start tracking</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
