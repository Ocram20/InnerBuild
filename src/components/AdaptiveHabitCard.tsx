import { useState } from "react";
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitAdaptation } from "@/hooks/useHabitAdaptations";
import { cn } from "@/lib/utils";

interface AdaptiveHabitCardProps {
  adaptations: HabitAdaptation[];
  analyzing: boolean;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  timing: Clock,
  difficulty: TrendingDown,
  frequency: Calendar,
  alternative: Sparkles,
};

const typeLabels: Record<string, string> = {
  timing: "Timing",
  difficulty: "Difficulty",
  frequency: "Frequency",
  alternative: "Alternative",
};

function AdaptationItem({
  adaptation,
  onAccept,
  onDismiss,
}: {
  adaptation: HabitAdaptation;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[adaptation.adaptation_type] || Sparkles;

  const formatValue = (type: string, value: string | null) => {
    if (!value) return "Not set";
    if (type === "timing") {
      const hour = parseInt(value.split(":")[0]);
      if (hour === 0) return "00:00";
      return `${hour.toString().padStart(2, "0")}:00`;
    }
    // For difficulty type, show the actual title
    return value;
  };

  // Get a short label for the change type
  const getChangeLabel = () => {
    switch (adaptation.adaptation_type) {
      case "timing":
        return "Timing";
      case "difficulty":
        return "Simplified version";
      case "frequency":
        return "Frequency";
      default:
        return "Change";
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground">
              {adaptation.habits?.title || "Habit"}
            </h4>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wide">
              {typeLabels[adaptation.adaptation_type]}
            </span>
          </div>
          
          {/* Change visualization */}
          <div className="bg-muted/30 rounded-lg p-2.5 mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              {getChangeLabel()}
            </p>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground line-through">
                {formatValue(adaptation.adaptation_type, adaptation.original_value)}
              </span>
              <ArrowRight className="h-3 w-3 text-primary shrink-0" />
              <span className="font-semibold text-primary">
                {formatValue(adaptation.adaptation_type, adaptation.suggested_value)}
              </span>
            </div>
          </div>

          {/* Reason - always visible but collapsed */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="h-3 w-3" />
            Why this change?
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          
          {expanded && (
            <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
              {adaptation.reason}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              className="h-8 px-4"
              onClick={onAccept}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-muted-foreground"
              onClick={onDismiss}
            >
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdaptiveHabitCard({ 
  adaptations, 
  analyzing,
  onAccept, 
  onDismiss 
}: AdaptiveHabitCardProps) {
  // Always show the card - even when empty
  const hasContent = adaptations.length > 0 || analyzing;
  
  return (
    <Card className="glass rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">AI Suggestions</CardTitle>
            <p className="text-xs text-muted-foreground">
              {analyzing 
                ? "Analyzing your patterns..." 
                : hasContent 
                  ? `${adaptations.length} suggestion${adaptations.length !== 1 ? "s" : ""} for you`
                  : "No suggestions right now"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {analyzing ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-spin" />
              Analyzing your habits...
            </div>
          </div>
        ) : hasContent ? (
          adaptations.map((adaptation) => (
            <AdaptationItem
              key={adaptation.id}
              adaptation={adaptation}
              onAccept={() => onAccept(adaptation.id)}
              onDismiss={() => onDismiss(adaptation.id)}
            />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Keep tracking your habits and we'll suggest improvements based on your patterns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
