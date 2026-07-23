import { cn } from "@/lib/utils";

type RingState = "stable" | "trigger" | "broken";

interface HomeostasisRingProps {
  state: RingState;
  primaryLabel: string;
  secondaryLabel: string;
  caption?: string;
  className?: string;
}

const STATE_STYLE: Record<
  RingState,
  { stroke: string; track: string; dashArray: string; dashOffset: string; pulseClass: string }
> = {
  stable: {
    stroke: "#5EC396",
    track: "rgba(94, 195, 150, 0.2)",
    dashArray: "251",
    dashOffset: "0",
    pulseClass: "animate-pulse",
  },
  trigger: {
    stroke: "#4D87D9",
    track: "rgba(77, 135, 217, 0.2)",
    dashArray: "251",
    dashOffset: "0",
    pulseClass: "",
  },
  broken: {
    stroke: "#EF4444",
    track: "rgba(239, 68, 68, 0.2)",
    dashArray: "170 81",
    dashOffset: "20",
    pulseClass: "",
  },
};

export function HomeostasisRing({
  state,
  primaryLabel,
  secondaryLabel,
  caption,
  className,
}: HomeostasisRingProps) {
  const style = STATE_STYLE[state];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Ring container — uses a bigger box so the circle doesn't crowd the text */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 w-full h-full -rotate-90"
        >
          {/* r=40 instead of 48 → leaves ~33% interior diameter for text */}
          <circle cx="60" cy="60" r="40" fill="none" stroke={style.track} strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke={style.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={style.dashArray}
            strokeDashoffset={style.dashOffset}
            className={style.pulseClass}
          />
        </svg>

        {/* Text overlay — perfectly centered inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-foreground leading-none">
            {primaryLabel}
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.2em] font-medium text-muted-foreground/80 leading-tight max-w-[60px]">
            {secondaryLabel}
          </span>
        </div>
      </div>

      {caption && (
        <p className="max-w-[200px] text-[11px] leading-snug text-muted-foreground italic font-medium text-center">
          {caption}
        </p>
      )}
    </div>
  );
}
