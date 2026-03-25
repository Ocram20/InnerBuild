import { 
  Clock, 
  TrendingDown, 
  Calendar, 
  Sparkles,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HabitAdaptation } from "@/hooks/useHabitAdaptations";
import { cn } from "@/lib/utils";

interface HabitAdaptationBadgeProps {
  adaptation: HabitAdaptation;
  size?: "sm" | "md";
}

const typeIcons: Record<string, React.ElementType> = {
  timing: Clock,
  difficulty: TrendingDown,
  frequency: Calendar,
  alternative: Sparkles,
};

export default function HabitAdaptationBadge({ 
  adaptation, 
  size = "sm" 
}: HabitAdaptationBadgeProps) {
  const Icon = typeIcons[adaptation.adaptation_type] || Sparkles;

  const formatValue = (type: string, value: string | null) => {
    if (!value) return "Not set";
    if (type === "timing") {
      const hour = parseInt(value.split(":")[0]);
      if (hour === 0) return "12 AM";
      if (hour === 12) return "12 PM";
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    }
    return value;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary cursor-help",
              size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
            )}
          >
            <Sparkles className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="font-medium">AI</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon className="h-4 w-4 text-primary" />
              Suggested change
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground line-through">
                {formatValue(adaptation.adaptation_type, adaptation.original_value)}
              </span>
              <span>→</span>
              <span className="font-medium text-primary">
                {formatValue(adaptation.adaptation_type, adaptation.suggested_value)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {adaptation.reason}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
