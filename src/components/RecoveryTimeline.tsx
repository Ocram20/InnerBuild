import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Shield,
  Sparkles,
  Crown,
  Circle,
} from "lucide-react";
interface PhaseMeta {
  id: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const phaseMeta: PhaseMeta[] = [
  { id: "acute", icon: <Flame className="h-5 w-5" />, color: "text-rose-500", bgColor: "bg-rose-500" },
  { id: "stabilization", icon: <Shield className="h-5 w-5" />, color: "text-amber-500", bgColor: "bg-amber-500" },
  { id: "reconstruction", icon: <Sparkles className="h-5 w-5" />, color: "text-emerald-500", bgColor: "bg-emerald-500" },
  { id: "consolidation", icon: <Crown className="h-5 w-5" />, color: "text-primary", bgColor: "bg-primary" },
];

export function RecoveryTimeline() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        <div className="space-y-4">
          {phaseMeta.map((phase) => {
            const name = t(`learn_content.timeline.${phase.id}.name`);
            const dayRange = t(`learn_content.timeline.${phase.id}.day_range`);
            const description = t(`learn_content.timeline.${phase.id}.description`);
            const symptoms = t(`learn_content.timeline.${phase.id}.symptoms`, { returnObjects: true }) as string[];
            const tips = t(`learn_content.timeline.${phase.id}.tips`, { returnObjects: true }) as string[];

            return (
              <Card 
                key={phase.id}
                className="ml-12 transition-all duration-300"
              >
                <div className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${phase.bgColor} border-current ${phase.color}`} style={{ marginTop: "1.5rem" }}>
                  <Circle className="h-2 w-2 fill-current text-white" />
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={phase.color}>{phase.icon}</span>
                      <CardTitle className="text-base">{name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {dayRange}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">{description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {"Cosa Aspettarsi"}
                      </p>
                      <ul className="space-y-1">
                        {Array.isArray(symptoms) && symptoms.map((symptom, i) => (
                          <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                            <span className={`mt-1 ${phase.color}`}>•</span>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {"Consigli per il Successo"}
                      </p>
                      <ul className="space-y-1">
                        {Array.isArray(tips) && tips.map((tip, i) => (
                          <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                            <span className="text-primary mt-1">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
