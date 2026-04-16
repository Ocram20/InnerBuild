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
    stroke: "#34d399",
    track: "rgba(52, 211, 153, 0.18)",
    dashArray: "276",
    dashOffset: "0",
    pulseClass: "animate-pulse",
  },
  trigger: {
    stroke: "#b68b2d",
    track: "rgba(182, 139, 45, 0.18)",
    dashArray: "276",
    dashOffset: "0",
    pulseClass: "",
  },
  broken: {
    stroke: "#7f1d1d",
    track: "rgba(127, 29, 29, 0.18)",
    dashArray: "186 90",
    dashOffset: "22",
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
    <div className={cn("relative mx-auto flex h-40 w-40 items-center justify-center", className)}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="44" fill="none" stroke={style.track} strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke={style.stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={style.dashArray}
          strokeDashoffset={style.dashOffset}
          className={style.pulseClass}
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-semibold text-foreground">{primaryLabel}</span>
        <span className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">{secondaryLabel}</span>
        {caption ? <span className="mt-2 max-w-[110px] text-[11px] text-muted-foreground">{caption}</span> : null}
      </div>
    </div>
  );
}
