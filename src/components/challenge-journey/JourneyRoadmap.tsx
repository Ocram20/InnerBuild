import { useMemo } from "react";
import { Flame, Shield, Sparkles, Crown, Flag } from "lucide-react";

interface DailyEntry {
  day_number: number;
  checkin_response: string | null;
  is_failure: boolean;
  phase_name: string | null;
}

interface JourneyRoadmapProps {
  totalDays: number;
  currentDay: number;
  progressOffset: number;
  entries: DailyEntry[];
  onDayClick: (day: number) => void;
  isExtended?: boolean;
}

const PHASES = [
  { id: "acute", name: "Acute Phase", startDay: 1, endDay: 14, color: "rgb(244, 63, 94)", icon: Flame },
  { id: "stabilization", name: "Stabilization", startDay: 15, endDay: 45, color: "rgb(245, 158, 11)", icon: Shield },
  { id: "reconstruction", name: "Reconstruction", startDay: 46, endDay: 90, color: "rgb(16, 185, 129)", icon: Sparkles },
  { id: "consolidation", name: "Consolidation", startDay: 91, endDay: 999, color: "rgb(99, 102, 241)", icon: Crown },
];

const MAX_DISPLAY_DAYS = 90;

function getPhaseForDay(day: number) {
  return PHASES.find(p => day >= p.startDay && day <= p.endDay) || PHASES[PHASES.length - 1];
}

export default function JourneyRoadmap({ totalDays, currentDay, progressOffset, entries, onDayClick, isExtended }: JourneyRoadmapProps) {
  // Day is purely check-in based, progressOffset is ignored
  const effectiveDay = Math.max(1, currentDay);
  const displayDays = isExtended ? MAX_DISPLAY_DAYS : Math.max(totalDays, Math.min(currentDay, MAX_DISPLAY_DAYS));
  const originalEndDay = totalDays;

  // Group days into phases relevant to this challenge
  const phaseGroups = useMemo(() => {
    const groups: { phase: typeof PHASES[0]; days: number[] }[] = [];
    let currentPhase: typeof PHASES[0] | null = null;

    for (let d = 1; d <= displayDays; d++) {
      const phase = getPhaseForDay(d);
      if (!currentPhase || currentPhase.id !== phase.id) {
        currentPhase = phase;
        groups.push({ phase, days: [] });
      }
      groups[groups.length - 1].days.push(d);
    }
    return groups;
  }, [displayDays]);

  const entryMap = useMemo(() => {
    const map = new Map<number, DailyEntry>();
    entries.forEach(e => map.set(e.day_number, e));
    return map;
  }, [entries]);

  // Determine milestone days (show label every N days)
  const milestoneInterval = displayDays <= 14 ? 1 : displayDays <= 30 ? 3 : 7;

  return (
    <div className="relative py-4">
      {phaseGroups.map((group) => {
        const PhaseIcon = group.phase.icon;
        // If not extended, grey out days beyond the original end
        const isExtensionPhase = !isExtended && group.days[0] > originalEndDay;
        
        return (
          <div key={group.phase.id} className={`mb-6 last:mb-0 ${isExtensionPhase ? "opacity-30" : ""}`}>
            {/* Phase header */}
            <div className="flex items-center gap-2 mb-3 px-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${group.phase.color}20` }}
              >
                <PhaseIcon className="h-4 w-4" style={{ color: group.phase.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{group.phase.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  Day {group.days[0]} – {group.days[group.days.length - 1]}
                </p>
              </div>
            </div>

            {/* Journey path */}
            <div className="relative ml-5 pl-6 border-l-2" style={{ borderColor: `${group.phase.color}30` }}>
              <div className="flex flex-wrap gap-2 pb-2">
                {group.days.map((day) => {
                  const entry = entryMap.get(day);
                  const isPast = day < effectiveDay;
                  const isCurrent = day === effectiveDay;
                  const isFuture = day > effectiveDay;
                  const isFailure = entry?.is_failure;
                  const isCheckedIn = !!entry?.checkin_response;
                  const isMilestone = day === 1 || day === displayDays || day % milestoneInterval === 0;
                  const isOriginalEnd = day === originalEndDay && originalEndDay < MAX_DISPLAY_DAYS;
                  const isBeyondOriginal = day > originalEndDay && !isExtended;

                  return (
                    <button
                      key={day}
                      onClick={() => day <= effectiveDay ? onDayClick(day) : undefined}
                      disabled={isFuture}
                      className="relative group"
                    >
                      {/* Node */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ${
                          isCurrent
                            ? "ring-2 ring-offset-2 ring-offset-background shadow-lg animate-pulse"
                            : isPast && isFailure
                            ? "opacity-70"
                            : isPast
                            ? "opacity-100"
                            : isBeyondOriginal
                            ? "opacity-15 blur-[1px]"
                            : "opacity-30 blur-[0.5px]"
                        }`}
                        style={{
                          backgroundColor: isCurrent
                            ? group.phase.color
                            : isPast && isCheckedIn
                            ? `${group.phase.color}cc`
                            : isPast && isFailure
                            ? "hsl(var(--destructive))"
                            : isPast
                            ? `${group.phase.color}80`
                            : "hsl(var(--muted))",
                          color: isPast || isCurrent ? "white" : "hsl(var(--muted-foreground))",
                          ...(isCurrent ? { '--tw-ring-color': group.phase.color } as React.CSSProperties : {}),
                        }}
                      >
                        {isOriginalEnd ? <Flag className="h-3.5 w-3.5" /> : day}
                      </div>

                      {/* Original end marker */}
                      {isOriginalEnd && (
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-accent font-semibold whitespace-nowrap">
                          🏁 Goal
                        </span>
                      )}

                      {/* Milestone label */}
                      {!isOriginalEnd && isMilestone && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap">
                          D{day}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
