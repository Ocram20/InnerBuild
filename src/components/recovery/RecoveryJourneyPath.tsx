import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { RECOVERY_PHASES, type PhaseProgress } from "@/hooks/useRecoveryPhase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
interface Props {
  progress: PhaseProgress;
}

const AI_INSIGHT_STORAGE_KEY = "recovery_ai_insight_cache";

interface CachedInsight {
  date: string;
  insight: string;
}

export function RecoveryJourneyPath({ progress }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [alreadyUsedToday, setAlreadyUsedToday] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  // Load cached insight on mount
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(`${AI_INSIGHT_STORAGE_KEY}_${user.id}`);
      if (raw) {
        const cached: CachedInsight = JSON.parse(raw);
        if (cached.date === today) {
          setAiInsight(cached.insight);
          setAlreadyUsedToday(true);
        }
      }
    } catch {}
  }, [user, today]);

  const fetchAIInsight = async () => {
    if (alreadyUsedToday && aiInsight) {
      setExpanded(!expanded);
      return;
    }
    if (!user) return;

    setExpanded(true);
    setAiLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recovery-phase-insight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phase_id: progress.currentPhase.id,
            phase_name: progress.currentPhase.name,
            effective_days: progress.effectiveDays,
            success_count: progress.successCount,
            failure_count: progress.failureCount,
            debrief_count: progress.debriefCount,
            recent_consecutive_failures: progress.recentConsecutiveFailures,
            progress_in_phase: Math.round(progress.progressInPhase * 100),
            language: i18n.resolvedLanguage || i18n.language,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.insight);
        setAlreadyUsedToday(true);
        localStorage.setItem(
          `${AI_INSIGHT_STORAGE_KEY}_${user.id}`,
          JSON.stringify({ date: today, insight: data.insight })
        );
      }
    } catch (e) {
      console.error("Error fetching AI insight:", e);
    } finally {
      setAiLoading(false);
    }
  };

  // SVG curved path parameters
  const pathWidth = 300;
  const phaseHeight = 80;
  const totalHeight = RECOVERY_PHASES.length * phaseHeight + 40;
  const nodeRadius = 18;

  const getNodePosition = (index: number) => {
    const y = 30 + index * phaseHeight;
    const x = index % 2 === 0 ? 80 : pathWidth - 80;
    return { x, y };
  };

  const buildPath = () => {
    const points = RECOVERY_PHASES.map((_, i) => getNodePosition(i));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const svgPath = buildPath();

  const getProgressLength = () => {
    const segmentRatio = 1 / (RECOVERY_PHASES.length - 1);
    const baseProgress = progress.phaseIndex * segmentRatio;
    const inPhaseProgress = progress.progressInPhase * segmentRatio;
    return Math.min(1, baseProgress + inPhaseProgress);
  };

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("recovery_journey.title")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("recovery_journey.day_phase", { day: progress.successCount, phase: t(`recovery_journey.phases.${progress.currentPhase.id}.name`) })}
            </p>
          </div>
          <span className="text-2xl">{progress.currentPhase.icon}</span>
        </div>

        {/* Phase description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t(`recovery_journey.phases.${progress.currentPhase.id}.description`)}
        </p>

        {/* SVG Roadmap */}
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${pathWidth} ${totalHeight}`}
            className="w-full max-w-[280px]"
            style={{ height: totalHeight }}
          >
            <path
              d={svgPath}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 6"
            />
            <path
              d={svgPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${getProgressLength() * 400} 999`}
              className="transition-all duration-1000"
            />
            {RECOVERY_PHASES.map((phase, i) => {
              const pos = getNodePosition(i);
              const isActive = i === progress.phaseIndex;
              const isPast = i < progress.phaseIndex;
              const isFuture = i > progress.phaseIndex;
              return (
                <g key={phase.id}>
                  {isActive && (
                    <circle cx={pos.x} cy={pos.y} r={nodeRadius + 6} fill="none" stroke={phase.color} strokeWidth="2" opacity="0.3" className="animate-pulse" />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={nodeRadius} fill={isPast || isActive ? phase.color : "hsl(var(--muted))"} opacity={isFuture ? 0.4 : 1} stroke={isActive ? phase.color : "none"} strokeWidth={isActive ? 3 : 0} />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="14" className={isFuture ? "opacity-40" : ""}>{phase.icon}</text>
                  <text x={i % 2 === 0 ? pos.x + nodeRadius + 10 : pos.x - nodeRadius - 10} y={pos.y - 8} textAnchor={i % 2 === 0 ? "start" : "end"} className="fill-foreground" fontSize="11" fontWeight={isActive ? "600" : "400"} opacity={isFuture ? 0.4 : 1}>{t(`recovery_journey.phases.${phase.id}.name`)}</text>
                  <text x={i % 2 === 0 ? pos.x + nodeRadius + 10 : pos.x - nodeRadius - 10} y={pos.y + 8} textAnchor={i % 2 === 0 ? "start" : "end"} className="fill-muted-foreground" fontSize="9" opacity={isFuture ? 0.3 : 0.7}>
                    {phase.maxDays < 999 ? `${t("recovery_journey.day_label")} ${phase.minDays}–${phase.maxDays}` : `${t("recovery_journey.day_label")} ${phase.minDays}+`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs font-semibold text-foreground">{progress.successCount}</p>
            <p className="text-[10px] text-muted-foreground">{t("recovery_journey.clean_days")}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs font-semibold text-foreground">{progress.failureCount}</p>
            <p className="text-[10px] text-muted-foreground">{t("recovery_journey.setbacks")}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs font-semibold text-foreground">{progress.debriefCount}</p>
            <p className="text-[10px] text-muted-foreground">{t("recovery_journey.debriefs", "Debrief")}</p>
          </div>
        </div>

        {/* AI Insight toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAIInsight}
          className="w-full gap-2 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {alreadyUsedToday ? t("recovery_journey.view_insight") : t("recovery_journey.ai_insight")}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {expanded && (
          <div className="rounded-xl bg-muted/40 p-3 animate-fade-in">
            {aiLoading ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{t("recovery_journey.analyzing")}</span>
              </div>
            ) : aiInsight ? (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{aiInsight}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("recovery_journey.insight_error")}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
