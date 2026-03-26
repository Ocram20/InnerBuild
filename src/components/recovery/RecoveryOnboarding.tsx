import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight, X } from "lucide-react";
interface RecoveryOnboardingProps {
  onStart: () => void;
  onDecline: () => void;
}

export function RecoveryOnboarding({ onStart, onDecline }: RecoveryOnboardingProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{"Sfida Recovery"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{"Vuoi iniziare la Sfida di Porn Recovery? Potrai monitorare i tuoi progressi giornalieri e costruire serie di successi."}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {"Segna ogni giorno come \"Successo\" o \"Fallimento\""}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {"Monitora la tua serie attuale e la più lunga"}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {"Ricomincia da zero quando vuoi"}
          </li>
        </ul>
        <div className="flex gap-3 pt-2">
          <Button onClick={onStart} className="flex-1">
            {"Inizia Sfida"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={onDecline}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
